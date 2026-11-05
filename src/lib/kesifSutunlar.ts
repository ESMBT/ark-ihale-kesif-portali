import type { SpreadsheetColumn } from '@ark/ui-kit'
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
  { key: 'level', title: 'Level', width: 76, align: 'center' },
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
export function kesifSutunlari(ek: KesifEkSutun[] = []): SpreadsheetColumn[] {
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
      formulaHint: birimFiyatAciklamasi(ek),
    },
    {
      key: 'toplam',
      title: 'Toplam Tutar',
      width: 144,
      align: 'right',
      format: 'number',
      readOnly: true,
      formulaHint: 'Miktar × Birim Fiyat',
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
export function disaAktarimIstegi(satirlar: KesifSatiri[], ek: KesifEkSutun[], baslik: string): DisaAktarimIstegi {
  const birimFiyatiOf = (s: KesifSatiri): number | undefined => {
    const maliyetVar = s.malzeme != null || s.iscilik != null || s.ggk != null || Object.keys(s.ekDegerler ?? {}).length > 0
    return maliyetVar ? birimFiyatHesapla(s, ek) : s.birimFiyat
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
        const toplam = altKalemler(satirlar, i).reduce((acc, k) => acc + (k.miktar || 0) * (birimFiyatiOf(k) ?? 0), 0)
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
        total: bf != null ? (s.miktar || 0) * bf : undefined,
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
