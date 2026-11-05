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
import { DogrulamaSeridi } from './DogrulamaSeridi'
import { DuzeltOnizlemeModal } from './DuzeltOnizlemeModal'
import { ImportWizard } from './ImportWizard'

const KESIF_SUTUNLARI: SpreadsheetColumn[] = [
  { key: 'pozNo', title: 'Poz No', width: 100, align: 'left' },
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
  { key: 'kod', title: 'Bölüm Kodu', width: 120, align: 'left' },
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

function kesifSheetsOlustur(satirlar: KesifSatiri[], goster: string): SpreadsheetSheet[] {
  const gorunen =
    goster === 'Sadece ana gruplar'
      ? satirlar.filter((s) => s.seviye === 1)
      : goster === 'Sadece kalemler'
        ? satirlar.filter((s) => s.seviye !== 1)
        : satirlar

  // Her ana grubun tüm listedeki alt kalemlerini önceden hesapla ("Sadece ana gruplar" görünümü için)
  const grupAltKalemleri = new Map<string, KesifSatiri[]>()
  let aktifGrupId: string | null = null
  for (const s of satirlar) {
    if (s.seviye === 1) {
      aktifGrupId = s.id
      grupAltKalemleri.set(s.id, [])
    } else if (aktifGrupId && !s.yorum) {
      grupAltKalemleri.get(aktifGrupId)?.push(s)
    }
  }

  const kalemAraliklari: Array<{ baslangic: number; bitis: number }> = []
  const ozetGruplari: Array<{
    id: string
    kod: string
    baslik: string
    marka: string
    grupExcelRow: number
    ilkKalemRow: number | null
    sonKalemRow: number | null
    altKalemSayisi: number
  }> = []

  const kesifRows: SpreadsheetRow[] = gorunen.map((s, idx) => {
    const excelRow = idx + 2

    if (s.seviye === 1) {
      let sonIndex = idx
      while (sonIndex + 1 < gorunen.length && gorunen[sonIndex + 1].seviye !== 1) {
        sonIndex += 1
      }
      const gorunenAltKalemSayisi = sonIndex - idx
      const ilkKalemRow = gorunenAltKalemSayisi > 0 ? idx + 3 : null
      const sonKalemRow = gorunenAltKalemSayisi > 0 ? sonIndex + 2 : null

      if (ilkKalemRow !== null && sonKalemRow !== null) {
        kalemAraliklari.push({ baslangic: ilkKalemRow, bitis: sonKalemRow })
      }

      const tumAltKalemler = grupAltKalemleri.get(s.id) ?? []
      const gizliMiktarToplam = tumAltKalemler.reduce((acc, k) => acc + (k.miktar || 0), 0)
      const gizliTutarToplam = tumAltKalemler.reduce((acc, k) => {
        const bf = k.birimFiyat ?? (k.malzeme ?? 0) + (k.iscilik ?? 0) + (k.ggk ?? 0)
        return acc + (k.miktar || 0) * bf
      }, 0)

      ozetGruplari.push({
        id: s.id,
        kod: s.pozNo,
        baslik: s.pozTanimi,
        marka: s.markaModel ?? '',
        grupExcelRow: excelRow,
        ilkKalemRow,
        sonKalemRow,
        altKalemSayisi: tumAltKalemler.length,
      })

      const cells: Record<string, SpreadsheetCellValue> = {
        pozNo: { raw: s.pozNo, bold: true },
        pozTanimi: { raw: s.pozTanimi, bold: true },
        markaModel: s.markaModel ?? '',
        birim: '',
        miktar: {
          raw:
            ilkKalemRow && sonKalemRow
              ? `=SUM(E${ilkKalemRow}:E${sonKalemRow})`
              : gizliMiktarToplam,
          bold: true,
        },
        malzeme:
          ilkKalemRow && sonKalemRow ? `=SUM(F${ilkKalemRow}:F${sonKalemRow})` : '',
        iscilik:
          ilkKalemRow && sonKalemRow ? `=SUM(G${ilkKalemRow}:G${sonKalemRow})` : '',
        ggk: ilkKalemRow && sonKalemRow ? `=SUM(H${ilkKalemRow}:H${sonKalemRow})` : '',
        birimFiyat: '',
        toplam: {
          raw:
            ilkKalemRow && sonKalemRow
              ? `=SUM(J${ilkKalemRow}:J${sonKalemRow})`
              : gizliTutarToplam,
          bold: true,
        },
        kaynakKodu: s.kaynakKodu ?? '',
      }

      return {
        id: s.id,
        kind: 'group',
        cells,
      }
    }

    // Yorum / devam satırı: numarasız metin, önceki satırın devamı gibi (soluk + italik)
    if (s.yorum) {
      return {
        id: s.id,
        kind: 'note',
        cells: {
          pozNo: '',
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
      }
    }

    const ayriBirimFiyatVar =
      s.birimFiyat != null && s.malzeme == null && s.iscilik == null && s.ggk == null

    return {
      id: s.id,
      kind: 'item',
      cells: {
        pozNo: s.pozNo,
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
    }
  })

  // Eğer hiç grup satırı yoksa (örn. "Sadece kalemler" görünümü) tüm satırları tek aralık yap
  if (kalemAraliklari.length === 0 && gorunen.length > 0) {
    kalemAraliklari.push({ baslangic: 2, bitis: gorunen.length + 1 })
  }

  const toplamFormul = (colHarf: string) => {
    if (kalemAraliklari.length === 0) return 0
    const parcalar = kalemAraliklari.map((a) => `${colHarf}${a.baslangic}:${colHarf}${a.bitis}`)
    return `=SUM(${parcalar.join(', ')})`
  }

  kesifRows.push({
    id: 'kesif-total',
    kind: 'total',
    readOnly: true,
    cells: {
      pozNo: '',
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

  const ozetRows: SpreadsheetRow[] = ozetGruplari.map((g) => ({
    id: `ozet-${g.id}`,
    kind: 'item',
    readOnly: true,
    cells: {
      kod: g.kod,
      baslik: g.baslik,
      marka: g.marka,
      kalemSayisi:
        g.ilkKalemRow && g.sonKalemRow
          ? `=COUNT('Keşif Metrajı'!E${g.ilkKalemRow}:E${g.sonKalemRow})`
          : g.altKalemSayisi,
      toplamMiktar: `='Keşif Metrajı'!E${g.grupExcelRow}`,
      toplamTutar: `='Keşif Metrajı'!J${g.grupExcelRow}`,
    },
  }))

  const sonOzetRow = ozetRows.length + 1
  ozetRows.push({
    id: 'ozet-total',
    kind: 'total',
    readOnly: true,
    cells: {
      kod: '',
      baslik: { raw: 'TOPLAM', bold: true },
      marka: '',
      kalemSayisi: ozetRows.length > 0 ? `=SUM(D2:D${sonOzetRow})` : 0,
      toplamMiktar: ozetRows.length > 0 ? `=SUM(E2:E${sonOzetRow})` : 0,
      toplamTutar: ozetRows.length > 0 ? `=SUM(F2:F${sonOzetRow})` : 0,
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
  const [satirlar, setSatirlar] = useState<KesifSatiri[]>(paket.keşif)
  const [duzenle, setDuzenle] = useState(true)
  const [tamEkran, setTamEkran] = useState(false)
  const [goster, setGoster] = useState('Tümü')
  const [versiyon, setVersiyon] = useState('#1 27.10.2026')
  const [sheets, setSheets] = useState<SpreadsheetSheet[]>(() =>
    kesifSheetsOlustur(paket.keşif, 'Tümü'),
  )
  const [kaydedildiBilgisi, setKaydedildiBilgisi] = useState(false)
  const [sihirbazAcik, setSihirbazAcik] = useState(false)
  const [odak, setOdak] = useState<{ rowId: string; columnKey?: string; token: number } | null>(null)
  // Tablodaki seçili satır (yorum satırı "seçili satırın altına" eklenir)
  const [seciliSatirId, setSeciliSatirId] = useState<string | null>(null)
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
    setSatirlar(paket.keşif)
    setSheets(kesifSheetsOlustur(paket.keşif, goster))
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
    const gruplar = satirlar.filter((s) => s.seviye === 1).length
    const kalemler = satirlar.filter((s) => s.seviye !== 1 && !s.yorum)
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
    setSheets(nextSheets)
    setKaydedildiBilgisi(false)
    setGeriAl(null) // düzeltme sonrası elle düzenleme yapıldıysa eski anlık görüntüye dönmek yanlış olur

    const kesifSheet = nextSheets.find((sh) => sh.id === 'kesif')
    if (!kesifSheet) return

    if (change.sheetId === 'kesif') {
      const rowMap = new Map(kesifSheet.rows.map((r) => [r.id, r]))
      setSatirlar((prev) =>
        prev.map((s) => {
          const r = rowMap.get(s.id)
          if (!r) return s

          const pozNo = String(hucreHamDeger(r.cells.pozNo)).trim()
          const pozTanimi = String(hucreHamDeger(r.cells.pozTanimi)).trim()
          const markaModel = String(hucreHamDeger(r.cells.markaModel)).trim()
          const kaynakKodu = String(hucreHamDeger(r.cells.kaynakKodu)).trim() || undefined

          // Yorum satırında yalnızca metin düzenlenir
          if (s.yorum) return { ...s, pozTanimi }

          if (s.seviye === 1) {
            return {
              ...s,
              pozNo: pozNo || s.pozNo,
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
            pozNo,
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
        }),
      )
    }
  }

  /** Bir satırın ardışık yorum/devam satırlarının bittiği indeks (dahil); yorum yoksa satırın kendisi */
  const yorumlarinSonu = (liste: KesifSatiri[], idx: number) => {
    let i = idx
    while (liste[i + 1]?.yorum) i += 1
    return i
  }

  const handleInsertRow = (cmd: SpreadsheetRowCommand) => {
    const yeniSatir: KesifSatiri = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      seviye: 2,
      pozNo: '',
      pozTanimi: 'Yeni İmalat Kalemi',
      birim: 'm²',
      miktar: 1,
      teklifKirilimi: 'Malzeme + İşçilik',
    }

    setSatirlar((prev) => {
      const hedefIdx = cmd.rowId ? prev.findIndex((s) => s.id === cmd.rowId) : -1
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

  /** Seçili satırın (ve mevcut devam satırlarının) altına yorum / devam satırı ekler */
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
    setSatirlar(paket.keşif)
    setSheets(kesifSheetsOlustur(paket.keşif, goster))
  }

  const iceAktarUygula = (yeniSatirlar: KesifSatiri[], mod: AktarimModu) => {
    const yeniListe = mod === 'degistir' ? yeniSatirlar : [...satirlar, ...yeniSatirlar]
    setSatirlar(yeniListe)
    setSheets(kesifSheetsOlustur(yeniListe, goster))
    onKaydet(yeniListe)
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
                onClick={() => void kesifDisaAktar(satirlar, paket.ad)}
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
                  onKaydet(satirlar)
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
                        onKaydet(satirlar)
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
