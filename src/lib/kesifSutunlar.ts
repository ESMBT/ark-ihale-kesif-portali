import { evaluateFormulaSafe, type SpreadsheetColumn } from '@ark/ui-kit'
import type { KesifEkSutun, KesifSatiri } from '../data/types'
import { baslikMi, levelDegeri } from './kesifSatir'

/**
 * Keşif tablosunun sütun düzeni. Formüller sütun HARFLERİNE değil anahtarlarına göre kurulur:
 * sütun eklenince / yer değişince harfler kayar, bu yüzden her formül buradaki `harf()` ile üretilir.
 */

/** Maliyet sütunlarının başladığı ve bittiği sütunlar arasındaki sabit anahtarlar */
export const MALIYET_SUTUNLARI = ['malzeme', 'iscilik', 'ggk'] as const

export type SabitMaliyetAnahtari = (typeof MALIYET_SUTUNLARI)[number]

/** Ön tanımlı özel sütun adları (Sütun ekle penceresinde öneri olarak sunulur) */
export const ONERILEN_EK_SUTUNLAR: Array<{ baslik: string; tur: KesifEkSutun['tur'] }> = [
  { baslik: 'Nakliye', tur: 'maliyet' },
  { baslik: 'Fittings', tur: 'katsayi' },
  { baslik: 'İşveren Kodu', tur: 'metin' },
]

const SABIT_ONCESI: SpreadsheetColumn[] = [
  { key: 'level', title: 'Level', width: 76, align: 'center', formulaHint: '1–9 · C = yorum' },
  { key: 'pozKodu', title: 'Poz Kodu', width: 120, align: 'left' },
  { key: 'pozTanimi', title: 'Poz Tanımı', width: 340, align: 'left' },
  { key: 'markaModel', title: 'Marka / Model', width: 150, align: 'left' },
  { key: 'birim', title: 'Birim', width: 84, align: 'center' },
  { key: 'miktar', title: 'Miktar', width: 116, align: 'right', format: 'number' },
]

const SABIT_MALIYET: SpreadsheetColumn[] = [
  { key: 'malzeme', title: 'Malzeme', width: 120, align: 'right', format: 'number' },
  { key: 'iscilik', title: 'İşçilik', width: 120, align: 'right', format: 'number' },
  { key: 'ggk', title: 'GGK', width: 120, align: 'right', format: 'number' },
]

/** Özel sütunları `sonra` bağlantılarına göre sıralayarak maliyet bölgesinin sütun anahtarlarını verir */
export function maliyetBolgesi(tumEk: KesifEkSutun[]): string[] {
  const ek = tumEk.filter((e) => e.tur !== 'metin')
  const sira: string[] = MALIYET_SUTUNLARI.map((k) => k)
  const bekleyen = [...ek]
  // Her özel sütun, `sonra` sütununun hemen sağına girer (birden çok sütun aynı yere eklendiyse eklenme sırasıyla)
  for (let tur = 0; tur < bekleyen.length + 1 && bekleyen.length > 0; tur += 1) {
    for (let i = 0; i < bekleyen.length; i += 1) {
      const e = bekleyen[i]
      const konum = sira.indexOf(e.sonra)
      if (konum === -1) continue
      let hedef = konum + 1
      // Aynı sütunun sağına daha önce eklenenler varsa onların da sağına
      while (hedef < sira.length && ek.some((x) => x.key === sira[hedef] && x.sonra === e.sonra)) hedef += 1
      sira.splice(hedef, 0, e.key)
      bekleyen.splice(i, 1)
      i -= 1
    }
  }
  // Bağlantısı çözülemeyenler (silinen sütuna bağlı) sona
  for (const e of bekleyen) sira.push(e.key)
  return sira
}

/** Tüm sütun listesi (Detay sayfası) */
export function kesifSutunlari(ek: KesifEkSutun[] = [], ozel: KesifSutunFormulleri = {}): SpreadsheetColumn[] {
  const tanim = new Map<string, SpreadsheetColumn>(SABIT_MALIYET.map((c) => [c.key as string, c]))
  const metinSutunlari: SpreadsheetColumn[] = ek
    .filter((e) => e.tur === 'metin')
    .map((e) => ({ key: e.key, title: e.baslik, width: 140, align: 'left', description: 'Ek metin sütunu (fiyatı etkilemez)' }))
  for (const e of ek.filter((x) => x.tur !== 'metin')) {
    tanim.set(e.key, {
      key: e.key,
      title: e.baslik,
      width: 120,
      align: 'right',
      format: 'number',
      description: e.tur === 'katsayi' ? 'Katsayı (boş = 1)' : 'Maliyet sütunu (Birim Fiyat toplamına eklenir)',
    })
  }
  const maliyet = maliyetBolgesi(ek).map((k) => tanim.get(k)).filter((c): c is SpreadsheetColumn => !!c)
  const markaKonumu = SABIT_ONCESI.findIndex((c) => c.key === 'markaModel') + 1
  return [
    ...SABIT_ONCESI.slice(0, markaKonumu),
    ...metinSutunlari,
    ...SABIT_ONCESI.slice(markaKonumu),
    ...maliyet,
    {
      key: 'birimFiyat',
      title: 'Birim Fiyat',
      width: 128,
      align: 'right',
      format: 'number',
      // Sütun formülü girildiyse hücreler hesaplanır (düzenlenemez); aksi halde elle birim fiyat girilebilir
      readOnly: Boolean(ozel.birimFiyat) || undefined,
      formulaHint: ozel.birimFiyat ? `= ${ozel.birimFiyat}` : birimFiyatAciklamasi(ek),
    },
    {
      key: 'toplam',
      title: 'Toplam Tutar',
      width: 144,
      align: 'right',
      format: 'number',
      readOnly: true,
      formulaHint: ozel.toplam ? `= ${ozel.toplam}` : 'Miktar × Birim Fiyat',
    },
  ]
}

/** Sütun anahtarından Excel harfi (A, B, …) */
export function sutunHarfleri(sutunlar: SpreadsheetColumn[]): (key: string) => string {
  const harfler = new Map<string, string>()
  sutunlar.forEach((c, i) => {
    let n = i
    let harf = ''
    do {
      harf = String.fromCharCode(65 + (n % 26)) + harf
      n = Math.floor(n / 26) - 1
    } while (n >= 0)
    harfler.set(c.key, harf)
  })
  return (key) => harfler.get(key) ?? ''
}

type Terim = { key: string; carpanlar: string[] }

/**
 * Maliyet bölgesini terimlere böler: her maliyet sütunu bir terimdir; hemen sağındaki katsayı sütunu o terimi çarpar.
 * Bölgenin SON sütunu katsayıysa, tüm maliyet toplamını çarpar (ör. Fittings, Birim Fiyat'ın solunda).
 */
function terimler(ek: KesifEkSutun[]): { terimler: Terim[]; toplamCarpanlari: string[] } {
  const bolge = maliyetBolgesi(ek)
  const tur = (k: string) => ek.find((e) => e.key === k)?.tur
  const terimListesi: Terim[] = []
  const toplamCarpanlari: string[] = []
  bolge.forEach((k, i) => {
    if (tur(k) === 'katsayi') {
      const sonMu = i === bolge.length - 1
      if (sonMu || terimListesi.length === 0) toplamCarpanlari.push(k)
      else terimListesi[terimListesi.length - 1].carpanlar.push(k)
    } else {
      terimListesi.push({ key: k, carpanlar: [] })
    }
  })
  return { terimler: terimListesi, toplamCarpanlari }
}

/** Başlıkta gösterilen okunur formül, ör. "(Malzeme + İşçilik × İşçilik Katsayısı + GGK) × Fittings" */
export function birimFiyatAciklamasi(ek: KesifEkSutun[]): string {
  const ad = (k: string) => ek.find((e) => e.key === k)?.baslik ?? { malzeme: 'Malzeme', iscilik: 'İşçilik', ggk: 'GGK' }[k] ?? k
  const t = terimler(ek)
  const toplam = t.terimler.map((x) => [ad(x.key), ...x.carpanlar.map(ad)].join(' × ')).join(' + ')
  return t.toplamCarpanlari.length > 0 ? `(${toplam}) × ${t.toplamCarpanlari.map(ad).join(' × ')}` : toplam
}

/** Satırın hücre başvurularına göre Birim Fiyat formülü (katsayı hücreleri her zaman dolu: varsayılan 1) */
export function birimFiyatFormulu(ek: KesifEkSutun[], harf: (key: string) => string, excelRow: number): string {
  const t = terimler(ek)
  const ref = (k: string) => `${harf(k)}${excelRow}`
  const toplam = t.terimler.map((x) => (x.carpanlar.length > 0 ? `${ref(x.key)}*${x.carpanlar.map(ref).join('*')}` : ref(x.key))).join('+')
  if (!toplam) return '=0'
  return t.toplamCarpanlari.length > 0 ? `=(${toplam})*${t.toplamCarpanlari.map(ref).join('*')}` : `=${toplam}`
}

/** Satırın özel sütun değeri; katsayıda boş = 1, maliyette boş = 0 */
export function ekDeger(satir: KesifSatiri, e: KesifEkSutun): number {
  if (e.tur === 'metin') return 0
  const v = satir.ekDegerler?.[e.key]
  return typeof v === 'number' && Number.isFinite(v) ? v : e.tur === 'katsayi' ? 1 : 0
}

/** Birim Fiyat (formülün statik karşılığı): kaydetme, istatistik ve gizli satırlar için */
export function birimFiyatHesapla(satir: KesifSatiri, ek: KesifEkSutun[] = []): number {
  const deger = (k: string): number => {
    if (k === 'malzeme') return satir.malzeme ?? 0
    if (k === 'iscilik') return satir.iscilik ?? 0
    if (k === 'ggk') return satir.ggk ?? 0
    const e = ek.find((x) => x.key === k)
    return e ? ekDeger(satir, e) : 0
  }
  const t = terimler(ek)
  const toplam = t.terimler.reduce((acc, x) => acc + x.carpanlar.reduce((c, k) => c * deger(k), deger(x.key)), 0)
  return toplam * t.toplamCarpanlari.reduce((c, k) => c * deger(k), 1)
}

/** Yeni özel sütun anahtarı (mevcutlarla çakışmaz) */
export function yeniEkSutunAnahtari(ek: KesifEkSutun[]): string {
  let n = ek.length + 1
  while (ek.some((e) => e.key === `ek${n}`)) n += 1
  return `ek${n}`
}

/**
 * İçe aktarılan özel sütunları mevcut sütunlarla birleştirir: aynı ad + tür varsa mevcut sütun kullanılır, yoksa
 * yeni anahtarla eklenir. `harita`: gelen anahtar → birleşik anahtar (satır değerlerini taşımak için).
 */
export function ekSutunlariBirlestir(
  mevcut: KesifEkSutun[],
  gelen: KesifEkSutun[],
): { birlesik: KesifEkSutun[]; harita: Record<string, string> } {
  const birlesik = [...mevcut]
  const harita: Record<string, string> = {}
  const ad = (x: string) => x.trim().toLocaleLowerCase('tr')
  for (const g of gelen) {
    const var_ = birlesik.find((m) => ad(m.baslik) === ad(g.baslik) && m.tur === g.tur)
    if (var_) {
      harita[g.key] = var_.key
      continue
    }
    const key = yeniEkSutunAnahtari(birlesik)
    harita[g.key] = key
    const sabit = (MALIYET_SUTUNLARI as readonly string[]).includes(g.sonra)
    birlesik.push({
      key,
      baslik: g.baslik,
      tur: g.tur,
      sonra: g.tur === 'metin' ? '' : sabit ? g.sonra : (harita[g.sonra] ?? 'ggk'),
    })
  }
  return { birlesik, harita }
}

/** Başlığın alt ağacındaki kalem satırları (kendinden sonraki, Level'ı daha büyük satırlar; yorumlar hariç) */
function altKalemler(satirlar: KesifSatiri[], idx: number): KesifSatiri[] {
  const level = levelDegeri(satirlar[idx])
  const sonuc: KesifSatiri[] = []
  for (let j = idx + 1; j < satirlar.length; j += 1) {
    const s = satirlar[j]
    if (s.yorum) continue
    if (levelDegeri(s) <= level) break
    if (!baslikMi(s)) sonuc.push(s)
  }
  return sonuc
}

/** Dışa aktarılan tablonun backend isteği (`POST /export-table`) */
export type DisaAktarimIstegi = {
  title: string
  extraColumns: Array<{ key: string; title: string; kind: 'cost' | 'factor' | 'text' }>
  rows: Array<{
    level?: number
    comment?: boolean
    code?: string
    description?: string
    brand?: string
    unit?: string
    quantity?: number
    material?: number
    labor?: number
    ggk?: number
    unitPrice?: number
    total?: number
    extras?: Record<string, number | string>
  }>
}

/** Keşif satırlarını dışa aktarım isteğine çevirir (Poz Kodu, özel sütunlar, başlık toplamları, yorum satırları) */
export function disaAktarimIstegi(
  satirlar: KesifSatiri[],
  ek: KesifEkSutun[],
  baslik: string,
  ozel: KesifSutunFormulleri = {},
): DisaAktarimIstegi {
  const birimFiyatiOf = (s: KesifSatiri): number | undefined => {
    const maliyetVar =
      Boolean(ozel.birimFiyat) ||
      s.malzeme != null ||
      s.iscilik != null ||
      s.ggk != null ||
      Object.keys(s.ekDegerler ?? {}).length > 0
    return maliyetVar ? kalemBirimFiyati(s, ek, ozel) : s.birimFiyat
  }
  const sirali = [
    ...ek.filter((e) => e.tur === 'metin'),
    ...maliyetBolgesi(ek)
      .map((k) => ek.find((e) => e.key === k))
      .filter((e): e is KesifEkSutun => !!e),
  ]
  return {
    title: baslik,
    extraColumns: sirali.map((e) => ({
      key: e.key,
      title: e.baslik,
      kind: e.tur === 'maliyet' ? 'cost' : e.tur === 'katsayi' ? 'factor' : 'text',
    })),
    rows: satirlar.map((s, i) => {
      if (s.yorum) return { comment: true, description: s.pozTanimi }
      if (baslikMi(s)) {
        const toplam = altKalemler(satirlar, i).reduce((acc, k) => acc + kalemToplami(k, ek, ozel), 0)
        return {
          level: levelDegeri(s),
          code: s.kaynakKodu,
          description: s.pozTanimi,
          brand: s.markaModel,
          total: toplam > 0 ? toplam : undefined,
        }
      }
      const bf = birimFiyatiOf(s)
      return {
        level: levelDegeri(s),
        code: s.kaynakKodu,
        description: s.pozTanimi,
        brand: s.markaModel,
        unit: s.birim,
        quantity: s.miktar,
        material: s.malzeme,
        labor: s.iscilik,
        ggk: s.ggk,
        unitPrice: bf,
        total: bf != null ? kalemToplami(s, ek, ozel) : undefined,
        extras: s.ekDegerler,
      }
    }),
  }
}

/** Dışa aktarım isteğini (backend erişilemezse yerel dosya için) başlık + satır dizisine çevirir; backend ile aynı düzen */
export function disaAktarimTablosu(istek: DisaAktarimIstegi): Array<Array<string | number>> {
  const metin = istek.extraColumns.filter((c) => c.kind === 'text')
  const sayisal = istek.extraColumns.filter((c) => c.kind !== 'text')
  const baslik = [
    'Level',
    'Poz Kodu',
    'Poz Tanımı',
    'Marka / Model',
    ...metin.map((c) => `${c.title} (metin)`),
    'Birim',
    'Miktar',
    'Malzeme',
    'İşçilik',
    'GGK',
    ...sayisal.map((c) => `${c.title} (${c.kind === 'factor' ? 'katsayı' : 'maliyet'})`),
    'Birim Fiyat',
    'Toplam Tutar',
  ]
  const deger = (v: unknown): string | number => (typeof v === 'number' || typeof v === 'string' ? v : '')
  const satirlar = istek.rows.map((r) =>
    r.comment
      ? ['C', '', r.description ?? '', ...Array(baslik.length - 3).fill('')]
      : [
          deger(r.level),
          deger(r.code),
          deger(r.description),
          deger(r.brand),
          ...metin.map((c) => deger(r.extras?.[c.key])),
          deger(r.unit),
          deger(r.quantity),
          deger(r.material),
          deger(r.labor),
          deger(r.ggk),
          ...sayisal.map((c) => deger(r.extras?.[c.key])),
          deger(r.unitPrice),
          deger(r.total),
        ],
  )
  return [baslik, ...satirlar]
}

/* ------------------------------------------------------------------ *
 * Sütun formülleri (tek yerden)
 *
 * Hesaplanan sütunların (Birim Fiyat, Toplam Tutar) formülü sütun düzeyinde bir kez girilir ve her poz satırına
 * uygulanır. Formülde başka sütunlara `[Sütun Adı]` ile başvurulur (A1 adresi değil: sütun eklenince harfler kayar);
 * `+ - * /`, parantez ve SUM, ROUND, MAX, MIN, ABS, AVERAGE kullanılabilir. Ondalık ayırıcı nokta (1.1).
 * ------------------------------------------------------------------ */

/** Sütun anahtarı → formül gövdesi (`=` olmadan) */
export type KesifSutunFormulleri = Record<string, string>

/** Formülü değiştirilebilen sütunlar */
export const FORMULLU_SUTUNLAR = ['birimFiyat', 'toplam'] as const

export type FormulluSutun = (typeof FORMULLU_SUTUNLAR)[number]

const ad = (x: string) => x.trim().toLocaleLowerCase('tr')

/** `[Sütun Adı]` başvurularını bu satırın hücre adreslerine çevirir; bilinmeyen sütunda hata döner */
export function formulCevir(
  formul: string,
  sutunlar: SpreadsheetColumn[],
  harf: (key: string) => string,
  excelRow: number,
): { formul: string; hata?: string } {
  const bilinmeyen: string[] = []
  const cevrilen = formul.replace(/\[([^\]]+)\]/g, (_, baslik: string) => {
    const sutun = sutunlar.find((c) => typeof c.title === 'string' && ad(c.title) === ad(baslik))
    if (!sutun) {
      bilinmeyen.push(baslik)
      return '0'
    }
    return `${harf(sutun.key)}${excelRow}`
  })
  return bilinmeyen.length > 0 ? { formul: cevrilen, hata: `Bilinmeyen sütun: [${bilinmeyen.join('], [')}]` } : { formul: cevrilen }
}

/** Varsayılan Birim Fiyat formülü `[Sütun Adı]` biçiminde (özel sütunlardan türetilir) */
export function varsayilanBirimFiyatFormulu(ek: KesifEkSutun[]): string {
  const t = terimler(ek)
  const baslik = (k: string) => `[${ek.find((e) => e.key === k)?.baslik ?? { malzeme: 'Malzeme', iscilik: 'İşçilik', ggk: 'GGK' }[k] ?? k}]`
  const toplam = t.terimler.map((x) => [baslik(x.key), ...x.carpanlar.map(baslik)].join('*')).join('+')
  if (!toplam) return '0'
  return t.toplamCarpanlari.length > 0 ? `(${toplam})*${t.toplamCarpanlari.map(baslik).join('*')}` : toplam
}

export const VARSAYILAN_TOPLAM_FORMULU = '[Miktar]*[Birim Fiyat]'

/** Bir sütunun geçerli formülü: girilmişse o, yoksa varsayılanı */
export function etkinFormul(key: FormulluSutun, ek: KesifEkSutun[], ozel: KesifSutunFormulleri = {}): string {
  return ozel[key] ?? (key === 'birimFiyat' ? varsayilanBirimFiyatFormulu(ek) : VARSAYILAN_TOPLAM_FORMULU)
}

type SatirDegeri = (key: string) => number | string

function degerlerOf(satir: KesifSatiri, ek: KesifEkSutun[]): SatirDegeri {
  return (key) => {
    switch (key) {
      case 'miktar':
        return satir.miktar ?? 0
      case 'malzeme':
        return satir.malzeme ?? 0
      case 'iscilik':
        return satir.iscilik ?? 0
      case 'ggk':
        return satir.ggk ?? 0
      case 'pozKodu':
        return satir.kaynakKodu ?? ''
      case 'birimFiyat':
        return satir.birimFiyat ?? birimFiyatHesapla(satir, ek)
      default: {
        const e = ek.find((x) => x.key === key)
        if (!e) return 0
        if (e.tur === 'metin') return String(satir.ekDegerler?.[key] ?? '')
        return ekDeger(satir, e)
      }
    }
  }
}

/**
 * Bir hesaplanan sütunun değerini satır için hesaplar (motorla; tablodaki hücre formülüyle aynı sonuç).
 * `degerler`: örnek/gerçek satır değerleri. Hata (bilinmeyen sütun, döngü, sözdizimi) → `{ hata }`.
 */
function formulHesapla(
  key: FormulluSutun,
  ek: KesifEkSutun[],
  ozel: KesifSutunFormulleri,
  degerler: SatirDegeri,
): { deger?: number; hata?: string } {
  const sutunlar = kesifSutunlari(ek, ozel)
  const harf = sutunHarfleri(sutunlar)
  const hesaplananlar = new Map<string, string>()
  for (const k of FORMULLU_SUTUNLAR) {
    const c = formulCevir(etkinFormul(k, ek, ozel), sutunlar, harf, 2)
    if (c.hata && k === key) return { hata: c.hata }
    hesaplananlar.set(k, c.formul)
  }
  const resolver = {
    getSheet: (name: string) => (name === 'S' ? { name } : undefined),
    getCell: (_sheet: string, row: number, col: number) => {
      if (row !== 2) return undefined
      const sutun = sutunlar[col - 1]
      if (!sutun) return undefined
      const hesap = hesaplananlar.get(sutun.key)
      // Toplam Tutar her zaman, Birim Fiyat yalnızca sütun formülü girilmişse formül hücresi gibi çözülür;
      // diğer sütunlar (ve formülsüz Birim Fiyat) verilen satır değeridir
      if (hesap !== undefined && (sutun.key === 'toplam' || (sutun.key === 'birimFiyat' && ozel.birimFiyat))) {
        return { raw: `=${hesap}` }
      }
      const v = degerler(sutun.key)
      return { raw: typeof v === 'number' ? v : String(v) }
    },
  }
  const sonuc = evaluateFormulaSafe(hesaplananlar.get(key) ?? '0', {
    sheetName: 'S',
    resolver,
    cache: new Map(),
    visiting: new Set(),
  })
  if (sonuc.error) return { hata: sonuc.error === '#CIRC!' ? 'Döngüsel başvuru (formül kendine dolaylı olarak başvuruyor)' : `Formül hesaplanamadı (${sonuc.error})` }
  return typeof sonuc.value === 'number' && Number.isFinite(sonuc.value)
    ? { deger: sonuc.value }
    : { hata: 'Formül bir sayı üretmiyor' }
}

/**
 * Formülü örnek değerlerle (her sayısal sütun 2) deneyip hata mesajı döndürür; geçerliyse `null`.
 * Kullanıcı formül girerken anlık doğrulama içindir.
 */
export function formulDogrula(key: FormulluSutun, formul: string, ek: KesifEkSutun[], ozel: KesifSutunFormulleri): string | null {
  if (!formul.trim()) return 'Formül boş olamaz.'
  if (!/^[\s\d.,+\-*/()\[\]A-Za-zÇĞİÖŞÜçğıöşü_%]+$/.test(formul)) return 'Formülde geçersiz karakter var.'
  const sonuc = formulHesapla(key, ek, { ...ozel, [key]: formul.trim() }, () => 2)
  return sonuc.hata ?? null
}

/** Satırın Birim Fiyat'ı: sütun formülü varsa onunla, yoksa özel sütun yapısına göre */
export function birimFiyatSatiri(satir: KesifSatiri, ek: KesifEkSutun[], ozel: KesifSutunFormulleri = {}): number {
  if (ozel.birimFiyat) return formulHesapla('birimFiyat', ek, ozel, degerlerOf(satir, ek)).deger ?? 0
  return birimFiyatHesapla(satir, ek)
}

/** Kalem satırının geçerli Birim Fiyat'ı: sütun formülü > elle girilen > özel sütun yapısından hesaplanan */
export function kalemBirimFiyati(satir: KesifSatiri, ek: KesifEkSutun[], ozel: KesifSutunFormulleri = {}): number {
  return ozel.birimFiyat ? birimFiyatSatiri(satir, ek, ozel) : (satir.birimFiyat ?? birimFiyatHesapla(satir, ek))
}

/** Kalem satırının geçerli Toplam Tutarı (sütun formülleri dikkate alınır) */
export function kalemToplami(satir: KesifSatiri, ek: KesifEkSutun[], ozel: KesifSutunFormulleri = {}): number {
  return toplamSatiri(satir, ek, ozel, kalemBirimFiyati(satir, ek, ozel))
}

/** Satırın Toplam Tutarı: sütun formülü varsa onunla, yoksa Miktar × Birim Fiyat */
export function toplamSatiri(satir: KesifSatiri, ek: KesifEkSutun[], ozel: KesifSutunFormulleri = {}, birimFiyati?: number): number {
  const bf = birimFiyati ?? birimFiyatSatiri(satir, ek, ozel)
  if (ozel.toplam) {
    // Toplam formülü Birim Fiyat'a başvurabilir: değeri doğrudan sağlayarak hesapla
    return formulHesapla('toplam', ek, ozel, (k) => (k === 'birimFiyat' ? bf : degerlerOf(satir, ek)(k))).deger ?? 0
  }
  return (satir.miktar || 0) * bf
}

/** Formülü gerçek bir satırla dener (Sütun formülü penceresindeki örnek sonuç) */
export function formulOrnegi(
  key: FormulluSutun,
  formul: string,
  ek: KesifEkSutun[],
  ozel: KesifSutunFormulleri,
  satir: KesifSatiri,
): { deger?: number; hata?: string } {
  return formulHesapla(key, ek, { ...ozel, [key]: formul.trim() }, degerlerOf(satir, ek))
}
