import { useEffect, useMemo, useState } from 'react'
import {
  Button as KitButton,
  Spreadsheet,
  type SpreadsheetCellValue,
  type SpreadsheetChange,
  type SpreadsheetColumn,
  type SpreadsheetRow,
  type SpreadsheetRowCommand,
  type SpreadsheetSheet,
} from '@ark/ui-kit'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { LabeledFilter } from '../../components/ui/FilterBar'
import { Icon } from '../../components/ui/Icon'
import type { IhalePaketi, KesifSatiri } from '../../data/types'
import { kesifDisaAktar, kesifSablonuIndir } from '../../lib/kesif'
import {
  duzeltmeyiUygula,
  kesifDuzelt,
  sorunlardanHucreIsaretleri,
  useKesifDogrulama,
  type DuzeltmeYaniti,
} from '../../lib/kesifDogrulama'
import type { AktarimModu } from '../../lib/kesifImport'
import {
  LEVEL_MAX,
  baslikMi,
  levelDegeri,
  levelHucresiCozumle,
  levelNumaralariniUygula,
  levelleriDoldur,
} from '../../lib/kesifSatir'
import { DogrulamaSeridi } from './DogrulamaSeridi'
import { DuzeltOnizlemeModal } from './DuzeltOnizlemeModal'
import { ImportWizard } from './ImportWizard'

const KESIF_SUTUNLARI: SpreadsheetColumn[] = [
  { key: 'level', title: 'Level', width: 76, align: 'center' },
  { key: 'pozTanimi', title: 'Poz Tanımı', width: 340, align: 'left' },
  { key: 'markaModel', title: 'Marka / Model', width: 150, align: 'left' },
  { key: 'birim', title: 'Birim', width: 84, align: 'center' },
  { key: 'miktar', title: 'Miktar', width: 116, align: 'right', format: 'number' },
  { key: 'malzeme', title: 'Malzeme', width: 120, align: 'right', format: 'number' },
  { key: 'iscilik', title: 'İşçilik', width: 120, align: 'right', format: 'number' },
  { key: 'ggk', title: 'GGK', width: 120, align: 'right', format: 'number' },
  { key: 'birimFiyat', title: 'Birim Fiyat', width: 128, align: 'right', format: 'number' },
  { key: 'toplam', title: 'Toplam Tutar', width: 144, align: 'right', format: 'number' },
  { key: 'kaynakKodu', title: 'Kaynak Kod', width: 120, align: 'left' },
]

const OZET_SUTUNLARI: SpreadsheetColumn[] = [
  { key: 'level', title: 'Level', width: 76, align: 'center' },
  { key: 'baslik', title: 'Bölüm Başlığı', width: 360, align: 'left' },
  { key: 'marka', title: 'Markalar', width: 180, align: 'left' },
  { key: 'kalemSayisi', title: 'Kalem Sayısı', width: 130, align: 'right', format: 'integer' },
  { key: 'toplamMiktar', title: 'Toplam Miktar', width: 150, align: 'right', format: 'number' },
  { key: 'toplamTutar', title: 'Bölüm Tutarı', width: 160, align: 'right', format: 'number' },
]

function hucreHamDeger(cell: SpreadsheetCellValue | undefined): string | number {
  if (cell === undefined) return ''
  if (typeof cell === 'object' && cell !== null && 'raw' in cell) {
    return cell.raw
  }
  return cell
}

/** Başlığın alt ağacının son indeksi (dahil): kendinden sonraki, Level'ı daha büyük satırlar (+ yorumlar) */
function altAgacSonu(liste: KesifSatiri[], idx: number): number {
  const level = levelDegeri(liste[idx])
  let son = idx
  while (son + 1 < liste.length && (liste[son + 1].yorum || levelDegeri(liste[son + 1]) > level)) son += 1
  return son
}

/**
 * [bas, son] aralığındaki ardışık "başlık olmayan" satır gruplarının Excel satır aralıkları.
 * Başlık satırları (kendi alt toplamlarını taşırlar) aralığa girmez; böylece üst başlıklar iç içe
 * başlıkların alt toplamını ikinci kez saymaz.
 */
function kalemAraliklari(liste: KesifSatiri[], bas: number, son: number): Array<[number, number]> {
  const araliklar: Array<[number, number]> = []
  let baslangic: number | null = null
  for (let j = bas; j <= son; j += 1) {
    if (baslikMi(liste[j])) {
      if (baslangic !== null) araliklar.push([baslangic + 2, j + 1])
      baslangic = null
    } else if (baslangic === null) {
      baslangic = j
    }
  }
  if (baslangic !== null) araliklar.push([baslangic + 2, son + 2])
  return araliklar
}

const toplamFormulu = (kolon: string, araliklar: Array<[number, number]>) =>
  `=SUM(${araliklar.map(([a, b]) => `${kolon}${a}:${kolon}${b}`).join(', ')})`

function kesifSheetsOlustur(satirlar: KesifSatiri[], goster: string): SpreadsheetSheet[] {
  const gorunen =
    goster === 'Sadece ana gruplar'
      ? satirlar.filter(baslikMi)
      : goster === 'Sadece kalemler'
        ? satirlar.filter((s) => !baslikMi(s))
        : satirlar

  const tamIndeks = new Map(satirlar.map((s, i) => [s.id, i]))

  const ozetBasliklari: Array<{
    id: string
    level: number
    baslik: string
    marka: string
    excelRow: number
    kalemSayisi: number
  }> = []

  const kesifRows: SpreadsheetRow[] = []

  gorunen.forEach((s, idx) => {
    const excelRow = idx + 2

    // Yorum / devam satırı: Level "C"; önceki satırın devamı (soluk + italik), sol şeritte numarası yok
    if (s.yorum) {
      kesifRows.push({
        id: s.id,
        kind: 'note',
        hideRowNumber: true,
        cells: {
          level: 'C',
          pozTanimi: s.pozTanimi,
          markaModel: '',
          birim: '',
          miktar: '',
          malzeme: '',
          iscilik: '',
          ggk: '',
          birimFiyat: '',
          toplam: '',
          kaynakKodu: '',
        },
      })
      return
    }

    const level = levelDegeri(s)

    if (baslikMi(s)) {
      // Alt toplam: alt ağaçtaki (her seviyedeki) kalem satırları; gizli kalemler için tüm listeden statik toplam
      const sonIdx = altAgacSonu(gorunen, idx)
      const araliklar = kalemAraliklari(gorunen, idx + 1, sonIdx)
      const tamIdx = tamIndeks.get(s.id) ?? 0
      const altKalemler = satirlar
        .slice(tamIdx + 1, altAgacSonu(satirlar, tamIdx) + 1)
        .filter((k) => !k.yorum && !baslikMi(k))
      const statikMiktar = altKalemler.reduce((acc, k) => acc + (k.miktar || 0), 0)
      const statikTutar = altKalemler.reduce((acc, k) => {
        const bf = k.birimFiyat ?? (k.malzeme ?? 0) + (k.iscilik ?? 0) + (k.ggk ?? 0)
        return acc + (k.miktar || 0) * bf
      }, 0)
      const formullu = araliklar.length > 0

      ozetBasliklari.push({
        id: s.id,
        level,
        baslik: s.pozTanimi,
        marka: s.markaModel ?? '',
        excelRow,
        kalemSayisi: altKalemler.length,
      })

      kesifRows.push({
        id: s.id,
        kind: 'group',
        level,
        cells: {
          level: { raw: level, bold: true },
          pozTanimi: { raw: s.pozTanimi, bold: true },
          markaModel: s.markaModel ?? '',
          birim: '',
          miktar: { raw: formullu ? toplamFormulu('E', araliklar) : statikMiktar, bold: true },
          malzeme: formullu ? toplamFormulu('F', araliklar) : '',
          iscilik: formullu ? toplamFormulu('G', araliklar) : '',
          ggk: formullu ? toplamFormulu('H', araliklar) : '',
          birimFiyat: '',
          toplam: { raw: formullu ? toplamFormulu('J', araliklar) : statikTutar, bold: true },
          kaynakKodu: s.kaynakKodu ?? '',
        },
      })
      return
    }

    const ayriBirimFiyatVar =
      s.birimFiyat != null && s.malzeme == null && s.iscilik == null && s.ggk == null

    kesifRows.push({
      id: s.id,
      kind: 'item',
      level,
      cells: {
        level,
        pozTanimi: s.pozTanimi,
        markaModel: s.markaModel ?? '',
        birim: s.birim,
        miktar: s.miktar,
        malzeme: s.malzeme ?? '',
        iscilik: s.iscilik ?? '',
        ggk: s.ggk ?? '',
        birimFiyat: ayriBirimFiyatVar ? s.birimFiyat! : `=F${excelRow}+G${excelRow}+H${excelRow}`,
        toplam: `=E${excelRow}*I${excelRow}`,
        kaynakKodu: s.kaynakKodu ?? '',
      },
    })
  })

  // Genel toplam: yalnızca kalem satırları (başlık alt toplamları ikinci kez sayılmaz)
  const genelAraliklar = kalemAraliklari(gorunen, 0, gorunen.length - 1)
  const toplamFormul = (kolon: string) => (genelAraliklar.length > 0 ? toplamFormulu(kolon, genelAraliklar) : 0)
  const genelToplamSatiri = gorunen.length + 2

  kesifRows.push({
    id: 'kesif-total',
    kind: 'total',
    readOnly: true,
    cells: {
      level: '',
      pozTanimi: { raw: 'GENEL TOPLAM', bold: true },
      markaModel: '',
      birim: '',
      miktar: { raw: toplamFormul('E'), bold: true },
      malzeme: { raw: toplamFormul('F'), bold: true },
      iscilik: { raw: toplamFormul('G'), bold: true },
      ggk: { raw: toplamFormul('H'), bold: true },
      birimFiyat: '',
      toplam: { raw: toplamFormul('J'), bold: true },
      kaynakKodu: '',
    },
  })

  const ozetRows: SpreadsheetRow[] = ozetBasliklari.map((g) => ({
    id: `ozet-${g.id}`,
    kind: 'item',
    readOnly: true,
    cells: {
      level: g.level,
      baslik: g.baslik,
      marka: g.marka,
      kalemSayisi: g.kalemSayisi,
      toplamMiktar: `='Keşif Metrajı'!E${g.excelRow}`,
      toplamTutar: `='Keşif Metrajı'!J${g.excelRow}`,
    },
  }))

  // Özet toplamı iç içe başlıkları tekrar saymaz: genel toplamı doğrudan alır
  ozetRows.push({
    id: 'ozet-total',
    kind: 'total',
    readOnly: true,
    cells: {
      level: '',
      baslik: { raw: 'TOPLAM', bold: true },
      marka: '',
      kalemSayisi: satirlar.filter((k) => !k.yorum && !baslikMi(k)).length,
      toplamMiktar: ozetBasliklari.length > 0 ? `='Keşif Metrajı'!E${genelToplamSatiri}` : 0,
      toplamTutar: ozetBasliklari.length > 0 ? `='Keşif Metrajı'!J${genelToplamSatiri}` : 0,
    },
  })

  return [
    {
      id: 'kesif',
      name: 'Keşif Metrajı',
      columns: KESIF_SUTUNLARI,
      rows: kesifRows,
    },
    {
      id: 'ozet',
      name: 'Bölüm Özeti',
      columns: OZET_SUTUNLARI,
      rows: ozetRows,
    },
  ]
}

function sayiCozumle(deger: string | number | null | undefined): number | undefined {
  if (deger == null || deger === '') return undefined
  if (typeof deger === 'number') return Number.isFinite(deger) ? deger : undefined
  const temiz = deger.trim().replace(',', '.')
  if (!temiz || temiz.startsWith('=')) return undefined
  const n = Number(temiz)
  return Number.isFinite(n) ? n : undefined
}

/**
 * İhale Paketi Detayı -> Keşif Sekmesi
 * `@ark/ui-kit` Spreadsheet bileşeni ve `Ark.Excel` backend entegrasyonu ile çalışır.
 */
export function TakeoffTable({
  paket,
  onKaydet,
}: {
  paket: IhalePaketi
  onKaydet: (satirlar: KesifSatiri[]) => void
}) {
  const [satirlar, setSatirlar] = useState<KesifSatiri[]>(() => levelleriDoldur(paket.keşif))
  const [duzenle, setDuzenle] = useState(true)
  const [tamEkran, setTamEkran] = useState(false)
  const [goster, setGoster] = useState('Tümü')
  const [versiyon, setVersiyon] = useState('#1 27.10.2026')
  const [sheets, setSheets] = useState<SpreadsheetSheet[]>(() =>
    kesifSheetsOlustur(levelleriDoldur(paket.keşif), 'Tümü'),
  )
  const [kaydedildiBilgisi, setKaydedildiBilgisi] = useState(false)
  const [sihirbazAcik, setSihirbazAcik] = useState(false)
  const [odak, setOdak] = useState<{ rowId: string; columnKey?: string; token: number } | null>(null)
  // Tablodaki seçili satır (yorum satırı "seçili satırın altına" eklenir)
  const [seciliSatirId, setSeciliSatirId] = useState<string | null>(null)
  // Poz No tabloda gösterilmez; kayıt ve dışa aktarımda Level'lardan ve sıradan otomatik üretilir
  const numarali = useMemo(() => levelNumaralariniUygula(satirlar), [satirlar])
  // Kurallar backend'de (Ark.Excel); satırlar değiştikçe debounce ile doğrulanır
  const dogrulama = useKesifDogrulama(satirlar)
  // F3: sorunlu hücrelerde işaret + ipucu
  const hucreIsaretleri = useMemo(
    () => sorunlardanHucreIsaretleri(dogrulama.sonuc?.issues ?? []),
    [dogrulama.sonuc],
  )
  // F4: otomatik düzeltme (önizleme → onay → uygula → geri al)
  const [duzeltiliyor, setDuzeltiliyor] = useState<string | null>(null)
  const [duzeltme, setDuzeltme] = useState<{ fixId: string; yanit: DuzeltmeYaniti } | null>(null)
  const [duzeltHatasi, setDuzeltHatasi] = useState<string | null>(null)
  const [geriAl, setGeriAl] = useState<{ baslik: string; sayi: number; onceki: KesifSatiri[] } | null>(null)

  // Paket değiştiğinde tabloyu senkronize et
  useEffect(() => {
    setSatirlar(levelleriDoldur(paket.keşif))
    setSheets(kesifSheetsOlustur(levelleriDoldur(paket.keşif), goster))
  }, [paket.id])

  // Tam ekran modunda ESC tuşu ile çıkış ve sayfa kaydırma kilidi
  useEffect(() => {
    if (!tamEkran) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sihirbazAcik && !duzeltme) {
        setTamEkran(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [tamEkran, sihirbazAcik, duzeltme])

  // Filtre değiştiğinde Spreadsheet sayfalarını yeniden oluştur
  const filtreDegistir = (yeniGoster: string) => {
    setGoster(yeniGoster)
    setSheets(kesifSheetsOlustur(satirlar, yeniGoster))
  }

  // Doğrulama sorununa tıklayınca tabloda ilgili hücreye git (filtre satırı gizliyorsa 'Tümü'ne dön)
  const satiraGit = (rowId: string, columnKey?: string) => {
    if (goster !== 'Tümü') filtreDegistir('Tümü')
    setOdak({ rowId, columnKey, token: Date.now() })
  }

  const duzeltBasligi = (fixId: string) =>
    dogrulama.referans?.fixes.find((f) => f.id === fixId)?.title ?? 'Otomatik düzeltme'

  const duzeltIste = async (fixId: string) => {
    setDuzeltiliyor(fixId)
    setDuzeltHatasi(null)
    try {
      setDuzeltme({ fixId, yanit: await kesifDuzelt(fixId, satirlar) })
    } catch (e) {
      setDuzeltHatasi(e instanceof Error ? e.message : 'Düzeltme hazırlanamadı.')
    } finally {
      setDuzeltiliyor(null)
    }
  }

  const duzeltUygula = () => {
    if (!duzeltme) return
    const yeni = duzeltmeyiUygula(satirlar, duzeltme.yanit)
    setGeriAl({
      baslik: duzeltBasligi(duzeltme.fixId),
      sayi: duzeltme.yanit.changes.length,
      onceki: satirlar,
    })
    setSatirlar(yeni)
    setSheets(kesifSheetsOlustur(yeni, goster))
    setKaydedildiBilgisi(false)
    setDuzeltme(null)
  }

  const duzeltGeriAl = () => {
    if (!geriAl) return
    setSatirlar(geriAl.onceki)
    setSheets(kesifSheetsOlustur(geriAl.onceki, goster))
    setKaydedildiBilgisi(false)
    setGeriAl(null)
  }

  const istatistik = useMemo(() => {
    const gruplar = satirlar.filter(baslikMi).length
    const kalemler = satirlar.filter((s) => !s.yorum && !baslikMi(s))
    const toplamMiktar = kalemler.reduce((acc, s) => acc + (s.miktar || 0), 0)
    const toplamTutar = kalemler.reduce((acc, s) => {
      const bf = s.birimFiyat ?? (s.malzeme ?? 0) + (s.iscilik ?? 0) + (s.ggk ?? 0)
      return acc + (s.miktar || 0) * bf
    }, 0)
    return { gruplar, kalemSayisi: kalemler.length, toplamMiktar, toplamTutar }
  }, [satirlar])

  const handleSpreadsheetChange = (
    nextSheets: SpreadsheetSheet[],
    change: SpreadsheetChange,
  ) => {
    setKaydedildiBilgisi(false)
    setGeriAl(null) // düzeltme sonrası elle düzenleme yapıldıysa eski anlık görüntüye dönmek yanlış olur

    const kesifSheet = nextSheets.find((sh) => sh.id === 'kesif')
    if (!kesifSheet || change.sheetId !== 'kesif') {
      setSheets(nextSheets)
      return
    }

    const rowMap = new Map(kesifSheet.rows.map((r) => [r.id, r]))
    // Level / tür değişirse hiyerarşi, alt toplam formülleri ve açma-kapama yeniden kurulmalıdır
    const durum = { yapiDegisti: false }

    const yeni = satirlar.map((s): KesifSatiri => {
      const r = rowMap.get(s.id)
      if (!r) return s

      const pozTanimi = String(hucreHamDeger(r.cells.pozTanimi)).trim()
      const markaModel = String(hucreHamDeger(r.cells.markaModel)).trim()
      const kaynakKodu = String(hucreHamDeger(r.cells.kaynakKodu)).trim() || undefined
      // Level hücresi: "C" → yorum satırı; 1–9 → seviye; geçersiz değer eski haline döner
      const levelHucre = levelHucresiCozumle(hucreHamDeger(r.cells.level))

      if (s.yorum) {
        if (levelHucre.tur === 'level') {
          // C → sayı: yorum satırı başlığa dönüşür (birim/miktar girilirse poz olur)
          durum.yapiDegisti = true
          return { ...s, yorum: false, seviye: 1, level: levelHucre.level, pozTanimi: pozTanimi || s.pozTanimi }
        }
        if (levelHucre.tur === 'gecersiz') durum.yapiDegisti = true
        return { ...s, pozTanimi }
      }

      if (levelHucre.tur === 'yorum') {
        durum.yapiDegisti = true
        return { ...s, yorum: true, pozTanimi: pozTanimi || s.pozTanimi }
      }

      let level = levelDegeri(s)
      if (levelHucre.tur === 'level') {
        if (levelHucre.level !== level) {
          durum.yapiDegisti = true
          level = levelHucre.level
        }
      } else {
        durum.yapiDegisti = true // geçersiz Level: hücre eski değerine döndürülür
      }

      if (s.seviye === 1) {
        // Başlığa birim yazılırsa satır poz olur
        const birimHam = String(hucreHamDeger(r.cells.birim)).trim()
        if (birimHam) {
          durum.yapiDegisti = true
          return {
            ...s,
            seviye: 2,
            level,
            pozTanimi: pozTanimi || s.pozTanimi,
            markaModel: markaModel || undefined,
            kaynakKodu,
            birim: birimHam,
            miktar: 0,
          }
        }
        return {
          ...s,
          level,
          pozTanimi: pozTanimi || s.pozTanimi,
          markaModel: markaModel || undefined,
          kaynakKodu,
        }
      }

      const birim = String(hucreHamDeger(r.cells.birim)).trim()
      const miktar = sayiCozumle(hucreHamDeger(r.cells.miktar)) ?? s.miktar
      const malzeme = sayiCozumle(hucreHamDeger(r.cells.malzeme))
      const iscilik = sayiCozumle(hucreHamDeger(r.cells.iscilik))
      const ggk = sayiCozumle(hucreHamDeger(r.cells.ggk))
      const birimFiyat = sayiCozumle(hucreHamDeger(r.cells.birimFiyat))

      return {
        ...s,
        level,
        pozTanimi,
        markaModel: markaModel || undefined,
        kaynakKodu,
        birim,
        miktar,
        malzeme,
        iscilik,
        ggk,
        birimFiyat,
      }
    })

    setSatirlar(yeni)
    setSheets(durum.yapiDegisti ? kesifSheetsOlustur(yeni, goster) : nextSheets)
  }

  /** Bir satırın ardışık yorum/devam satırlarının bittiği indeks (dahil); yorum yoksa satırın kendisi */
  const yorumlarinSonu = (liste: KesifSatiri[], idx: number) => {
    let i = idx
    while (liste[i + 1]?.yorum) i += 1
    return i
  }

  /** Yeni satırın Level'ı: başlığın altına eklenirse bir derin, pozun altına eklenirse aynı seviye */
  const varsayilanLevel = (liste: KesifSatiri[], hedefIdx: number) => {
    let i = hedefIdx
    while (i >= 0 && liste[i].yorum) i -= 1
    if (i < 0) return 2
    const hedef = liste[i]
    return baslikMi(hedef) ? Math.min(LEVEL_MAX, levelDegeri(hedef) + 1) : levelDegeri(hedef)
  }

  const handleInsertRow = (cmd: SpreadsheetRowCommand) => {
    setSatirlar((prev) => {
      const hedefIdx = cmd.rowId ? prev.findIndex((s) => s.id === cmd.rowId) : -1
      const yeniSatir: KesifSatiri = {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        seviye: 2,
        level: varsayilanLevel(prev, hedefIdx),
        pozNo: '',
        pozTanimi: 'Yeni İmalat Kalemi',
        birim: 'm²',
        miktar: 1,
        teklifKirilimi: 'Malzeme + İşçilik',
      }
      const klon = [...prev]
      if (hedefIdx === -1) {
        klon.push(yeniSatir)
      } else {
        // Yeni poz, seçili satırın yorum/devam satırlarından sonra gelir (devamları bölmez)
        klon.splice(yorumlarinSonu(prev, hedefIdx) + 1, 0, yeniSatir)
      }
      setSheets(kesifSheetsOlustur(klon, goster))
      return klon
    })
  }

  /** Seçili satırın (ve mevcut devam satırlarının) altına yorum / devam satırı (Level "C") ekler */
  const handleYorumEkle = () => {
    const yeni: KesifSatiri = {
      id: `not-new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      seviye: 2,
      yorum: true,
      pozNo: '',
      pozTanimi: '',
      birim: '',
      miktar: 0,
      teklifKirilimi: 'Malzeme + İşçilik',
    }
    // "Sadece ana gruplar" görünümünde yorum görünmez; tümünü göster
    const gosterim = goster === 'Sadece ana gruplar' ? 'Tümü' : goster
    if (gosterim !== goster) setGoster(gosterim)

    setSatirlar((prev) => {
      const hedefIdx = seciliSatirId ? prev.findIndex((s) => s.id === seciliSatirId) : -1
      const klon = [...prev]
      if (hedefIdx === -1) klon.push(yeni)
      else klon.splice(yorumlarinSonu(prev, hedefIdx) + 1, 0, yeni)
      setSheets(kesifSheetsOlustur(klon, gosterim))
      return klon
    })
    setKaydedildiBilgisi(false)
    setOdak({ rowId: yeni.id, columnKey: 'pozTanimi', token: Date.now() })
  }

  const handleDeleteRow = (cmd: SpreadsheetRowCommand) => {
    if (!cmd.rowId) return
    setSatirlar((prev) => {
      const idx = prev.findIndex((s) => s.id === cmd.rowId)
      if (idx === -1) return prev
      // Bir pozu silerken ona bağlı yorum/devam satırları da silinir
      const son = yorumlarinSonu(prev, idx)
      const klon = prev.filter((_, i) => i < idx || i > son)
      setSheets(kesifSheetsOlustur(klon, goster))
      return klon
    })
  }

  const handleReset = () => {
    setSatirlar(levelleriDoldur(paket.keşif))
    setSheets(kesifSheetsOlustur(levelleriDoldur(paket.keşif), goster))
  }

  const iceAktarUygula = (yeniSatirlar: KesifSatiri[], mod: AktarimModu) => {
    const yeniListe = mod === 'degistir' ? yeniSatirlar : [...satirlar, ...yeniSatirlar]
    setSatirlar(yeniListe)
    setSheets(kesifSheetsOlustur(yeniListe, goster))
    onKaydet(levelNumaralariniUygula(yeniListe))
    setKaydedildiBilgisi(true)
    setSihirbazAcik(false)
    setDuzenle(true)
  }

  return (
    <div
      className={
        tamEkran
          ? 'fixed inset-0 z-50 flex flex-col bg-surface overflow-hidden'
          : 'space-y-4'
      }
    >
      {/* Üst filtre ve aksiyon çubuğu (tam ekranda gizlenir) */}
      {!tamEkran && (
        <Card padded={false} className="shrink-0">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <label className="relative flex flex-col">
              <span className="mb-1 text-[12px] font-medium text-muted-foreground">Versiyon</span>
              <span className="inline-flex h-11 min-w-[190px] items-center justify-between gap-3 rounded-xl border border-line bg-white px-4">
                <span className="text-[14px] font-medium text-ink">{versiyon}</span>
                <Icon name="chevron-down" size={15} className="text-gray" />
              </span>
              <select
                value={versiyon}
                onChange={(e) => setVersiyon(e.target.value)}
                className="absolute bottom-0 left-0 h-11 w-full cursor-pointer opacity-0"
                aria-label="Versiyon"
              >
                <option>#1 27.10.2026</option>
                <option>#2 28.10.2026</option>
                <option>#3 29.10.2026</option>
              </select>
            </label>

            <LabeledFilter
              label="Göster"
              value={goster}
              options={['Tümü', 'Sadece ana gruplar', 'Sadece kalemler']}
              onChange={filtreDegistir}
            />

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="secondary" icon="upload" onClick={() => setSihirbazAcik(true)}>
                Excel İçe Aktar
              </Button>
              <Button
                variant="secondary"
                icon="download"
                onClick={() => void kesifDisaAktar(numarali, paket.ad)}
              >
                Dışa Aktar
              </Button>
              <Button
                variant="secondary"
                icon="file-spreadsheet"
                onClick={() => void kesifSablonuIndir()}
              >
                Şablon
              </Button>
              <Button
                variant={duzenle ? 'secondary' : 'ghost'}
                icon={duzenle ? 'lock' : 'edit'}
                onClick={() => setDuzenle((d) => !d)}
              >
                {duzenle ? 'Salt Okunur' : 'Düzenleme Modu'}
              </Button>
              <Button
                variant="brand"
                icon="check"
                onClick={() => {
                  onKaydet(numarali)
                  setKaydedildiBilgisi(true)
                }}
              >
                {kaydedildiBilgisi ? 'Kaydedildi' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Doğrulama şeridi: BOQ'u Kontrol Et (E01–E06, W01–W04 — backend) */}
      <div className={tamEkran ? 'shrink-0 px-3 py-2' : ''}>
        <DogrulamaSeridi
          durum={dogrulama}
          satirlar={satirlar}
          onSatiraGit={satiraGit}
          onDuzelt={(fixId) => void duzeltIste(fixId)}
          duzeltiliyor={duzeltiliyor}
          duzeltPasif={!duzenle}
        />
        {duzeltHatasi && (
          <p className="mt-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-2 text-[13px] text-danger">
            {duzeltHatasi}
          </p>
        )}
        {geriAl && (
          <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-2 text-[13px] text-success">
            <span>
              <strong className="font-bold">{geriAl.baslik}</strong> uygulandı ({geriAl.sayi} değişiklik). Kaydet’e
              basana kadar kaydedilmedi.
            </span>
            <Button variant="secondary" size="sm" icon="rotate-ccw" className="ml-auto" onClick={duzeltGeriAl}>
              Geri al
            </Button>
          </div>
        )}
      </div>

      {/* @ark/ui-kit Spreadsheet bileşeni */}
      <Card
        padded={false}
        className={
          tamEkran
            ? 'flex-1 min-h-0 flex flex-col overflow-hidden rounded-none border-0'
            : 'overflow-hidden'
        }
      >
        <div className={tamEkran ? 'h-full w-full flex-1 min-h-0' : 'h-[640px] w-full'}>
          <Spreadsheet
            sheets={sheets}
            onChange={handleSpreadsheetChange}
            readOnly={!duzenle}
            collapsibleGroups
            cellMarks={hucreIsaretleri}
            onSelectionChange={(a) => setSeciliSatirId(a && a.sheetId === 'kesif' ? a.rowId : null)}
            toolbar={
              <KitButton variant="ghost" size="sm" disabled={!duzenle} onClick={handleYorumEkle}>
                Yorum satırı ekle
              </KitButton>
            }
            focusRequest={odak ? { ...odak, sheetId: 'kesif' } : undefined}
            onInsertRow={handleInsertRow}
            onDeleteRow={handleDeleteRow}
            onReset={handleReset}
            numberFormat={{ locale: 'tr-TR', currency: 'TRY' }}
            header={
              <>
                <div className="flex min-w-0 items-center gap-2 text-[12px]">
                  <span className="font-bold text-black">{paket.ad}</span>
                  <span className="text-muted-foreground">
                    — {istatistik.gruplar} ana grup, {istatistik.kalemSayisi} poz kalemi
                  </span>
                  {tamEkran && (
                    <Badge tone="info" size="sm">
                      Tam Ekran
                    </Badge>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3 text-[12px] tabular-nums">
                  <span>
                    Toplam Miktar:{' '}
                    <strong className="font-bold text-black">
                      {istatistik.toplamMiktar.toLocaleString('tr-TR', {
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                  {istatistik.toplamTutar > 0 && (
                    <span>
                      Hesaplanan Tutar:{' '}
                      <strong className="font-bold text-black">
                        {istatistik.toplamTutar.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        ₺
                      </strong>
                    </span>
                  )}
                  {tamEkran && (
                    <Button
                      variant="brand"
                      size="sm"
                      icon="check"
                      onClick={() => {
                        onKaydet(numarali)
                        setKaydedildiBilgisi(true)
                      }}
                      title="Değişiklikleri kaydet"
                    >
                      {kaydedildiBilgisi ? 'Kaydedildi' : 'Kaydet'}
                    </Button>
                  )}
                  <Button
                    variant={tamEkran ? 'brand' : 'secondary'}
                    size="sm"
                    icon={tamEkran ? 'minimize' : 'maximize'}
                    onClick={() => setTamEkran((prev) => !prev)}
                    title={tamEkran ? 'Eski boyuta dön (Esc)' : 'Tüm ekranı kapla'}
                  >
                    {tamEkran ? 'Küçült' : 'Tam Ekran'}
                  </Button>
                </div>
              </>
            }
          />
        </div>
      </Card>

      {/* Otomatik düzeltme önizlemesi (F4) */}
      {duzeltme && (
        <DuzeltOnizlemeModal
          baslik={duzeltBasligi(duzeltme.fixId)}
          aciklama={dogrulama.referans?.fixes.find((f) => f.id === duzeltme.fixId)?.description}
          yanit={duzeltme.yanit}
          satirlar={satirlar}
          onUygula={duzeltUygula}
          onVazgec={() => setDuzeltme(null)}
        />
      )}

      {/* Excel içe aktarma sihirbazı */}
      {sihirbazAcik && (
        <ImportWizard
          mevcutSatirSayisi={satirlar.length}
          onClose={() => setSihirbazAcik(false)}
          onTamam={iceAktarUygula}
        />
      )}
    </div>
  )
}
