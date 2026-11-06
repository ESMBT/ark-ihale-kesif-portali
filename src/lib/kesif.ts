import * as XLSX from 'xlsx'
import type { KesifEkSutun, KesifSatiri } from '../data/types'
import { disaAktarimIstegi, disaAktarimTablosu } from './kesifSutunlar'

export const KESIF_SABLON_BASLIKLARI = [
  'Level',
  'Poz Tanımı',
  'Açıklama',
  'Birim',
  'Miktar',
  'Teklif Kırılımı',
  'Malzeme Fiyatı',
  'İşçilik Fiyatı',
  'GGK Fiyatı',
  'Nakliye',
  'Marka/Model',
] as const

export const KESIF_ZORUNLU_SUTUNLAR = ['Poz Tanımı', 'Birim', 'Miktar', 'Teklif Kırılımı'] as const

export const TEKLIF_KIRILIMLARI = ['Malzeme', 'İşçilik', 'GGK', 'Nakliye', 'Malzeme + İşçilik'] as const

export type SurveyNoteDto = {
  text: string
  kind?: string
  /** Notun Excel'deki 1 tabanlı satırı */
  sourceRow: number
  position?: string
}

export type SurveyWarningDto = {
  code: string
  message: string
  row?: number | null
  column?: number | null
}

export type SurveyTotalsDto = {
  row?: number | null
  materialTotalUsd?: number | null
  laborTotalTl?: number | null
  materialGgkarTotalUsd?: number | null
  laborGgkarTotalTl?: number | null
  totalUsd?: number | null
  totalTl?: number | null
}

export type SurveyItemDto = {
  sourceRow: number
  code: string
  description: string
  additionalDescription?: string | null
  brands: string
  unit?: string | null
  quantity?: number | null
  unitPrice?: number | null
  materialUnitPriceUsd?: number | null
  materialTotalUsd?: number | null
  laborUnitPriceTl?: number | null
  laborTotalTl?: number | null
  materialGgkarUnitPriceUsd?: number | null
  materialGgkarTotalUsd?: number | null
  laborGgkarUnitPriceTl?: number | null
  laborGgkarTotalTl?: number | null
  totalUsd?: number | null
  totalTl?: number | null
  heading?: string | null
  notes: SurveyNoteDto[]
  /** Dosyadaki özgün kod (otomatik numaralandırmada Code yeniden yazılırsa) */
  sourceCode?: string | null
  /** Hiyerarşi seviyesi 1–9 (numaradaki nokta sayısı + 1) */
  level?: number | null
  /** Özel sütun değerleri (anahtar = SurveyExtraColumnDto.key): maliyet / katsayı için sayı, metin için yazı */
  extras?: Record<string, number | string | null> | null
}

export type SurveySectionDto = {
  sourceRow: number
  code: string
  title: string
  brands: string
  depth: number
  heading?: string | null
  notes: SurveyNoteDto[]
  items: SurveyItemDto[]
  sourceCode?: string | null
  /** Dosyada satırı olmayan, otomatik numaralandırmada üretilen bölüm (ör. kök "01") */
  isGenerated?: boolean
  /** Hiyerarşi seviyesi 1–9 (numaradaki nokta sayısı + 1) */
  level?: number | null
}

export type SurveyDocumentDto = {
  sheetName: string
  projectName?: string | null
  documentTitle?: string | null
  disciplineTitle?: string | null
  headerRow?: number | null
  /** Dosyadaki özel sütunlar (Nakliye, Fittings, İşveren Kodu …) */
  extraColumns?: Array<{ key: string; title: string; kind: 'cost' | 'factor' | 'text' | 'number'; after: string }>
  sections: SurveySectionDto[]
  totals?: SurveyTotalsDto | null
  computedTotals: SurveyTotalsDto
  warnings: SurveyWarningDto[]
}

export type ImportHatasi = {
  satir: number
  alan: string
  mesaj: string
  tip: 'hata' | 'uyari'
}

export type ImportSonucu = {
  satirlar: KesifSatiri[]
  hatalar: ImportHatasi[]
  dosyaAdi: string
  kaynak?: 'ark-excel' | 'yerel'
  belge?: SurveyDocumentDto
}

const EXCEL_API_BASE = '/api/excel/survey'

/** Ark.Excel SurveyDocument modelini portalın KesifSatiri[] yapısına dönüştürür */
export function surveyDocumentToKesifSatirlari(doc: SurveyDocumentDto): KesifSatiri[] {
  return surveyDocumentToKaynakliSatirlar(doc).map((k) => k.satir)
}

export type KaynakliKesifSatiri = {
  satir: KesifSatiri
  /** Excel'deki 1 tabanlı kaynak satır numarası (yoksa 0) */
  kaynakSatir: number
}

/**
 * surveyDocumentToKesifSatirlari ile aynı dönüşüm; her satırın Excel kaynak satırını da döndürür.
 *
 * Numarası olmayan metin satırları (çok satırlı açıklamalar, kapsam/başlık notları) kaybolmaz: kaynak
 * dosyadaki konumlarına göre **yorum satırı** (`yorum: true`) olarak, bağlı oldukları satırın önüne/arkasına
 * eklenir; tabloda önceki satırın devamı gibi görünürler.
 */
export function surveyDocumentToKaynakliSatirlar(doc: SurveyDocumentDto): KaynakliKesifSatiri[] {
  const satirlar: KaynakliKesifSatiri[] = []
  const ts = Date.now()
  let yorumSayaci = 0

  const yorum = (metin: string, kaynakSatir: number): KaynakliKesifSatiri => ({
    kaynakSatir,
    satir: {
      id: `not-${kaynakSatir || 0}-${ts}-${yorumSayaci++}`,
      seviye: 2,
      yorum: true,
      pozNo: '',
      pozTanimi: metin.trim(),
      birim: '',
      miktar: 0,
      teklifKirilimi: 'Malzeme + İşçilik',
    },
  })
  const notlar = (liste?: SurveyNoteDto[]) =>
    [...(liste ?? [])].filter((n) => n.text?.trim()).sort((a, b) => a.sourceRow - b.sourceRow)
  const kaynakKodu = (kod: string | null | undefined, yeniKod: string) =>
    kod?.trim() && kod.trim() !== yeniKod ? kod.trim() : undefined

  doc.sections.forEach((section, secIdx) => {
    const hasSectionHeader = Boolean(section.code?.trim() || section.title?.trim())

    if (hasSectionHeader) {
      // Bölümü öncelyen grup başlığı (ör. "YANGIN DAMPERLERİ") bölüm satırının önünde yorum olarak görünür
      if (section.heading?.trim()) satirlar.push(yorum(section.heading, section.sourceRow || 0))

      const pozNo = section.code?.trim() || String(secIdx + 1).padStart(2, '0')
      satirlar.push({
        kaynakSatir: section.sourceRow || 0,
        satir: {
          id: `sec-${section.sourceRow || secIdx + 1}-${ts}-${secIdx}`,
          seviye: 1,
          pozNo,
          pozTanimi: section.title?.trim() || section.code?.trim() || 'BÖLÜM',
          birim: '',
          miktar: 0,
          teklifKirilimi: 'Malzeme + İşçilik',
          markaModel: section.brands?.trim() || undefined,
          kaynakKodu: kaynakKodu(section.sourceCode, pozNo),
          level: section.level ?? undefined,
        },
      })
      for (const n of notlar(section.notes)) satirlar.push(yorum(n.text, n.sourceRow))
    }

    section.items.forEach((item, itemIdx) => {
      const malzeme = item.materialUnitPriceUsd ?? item.materialTotalUsd ?? undefined
      const iscilik = item.laborUnitPriceTl ?? item.laborTotalTl ?? undefined
      const ggk =
        item.materialGgkarUnitPriceUsd ??
        item.laborGgkarUnitPriceTl ??
        item.materialGgkarTotalUsd ??
        item.laborGgkarTotalTl ??
        undefined

      const hesaplananBirimFiyat =
        (malzeme ?? 0) + (iscilik ?? 0) + (ggk ?? 0) > 0
          ? (malzeme ?? 0) + (iscilik ?? 0) + (ggk ?? 0)
          : undefined

      // Birim fiyat önceliği: dosyadaki birim fiyat/maliyet → bileşen toplamı → toplam ÷ miktar
      const toplamdanBirim = (toplam?: number | null) =>
        toplam != null && item.quantity ? toplam / item.quantity : undefined
      const birimFiyat =
        item.unitPrice ??
        hesaplananBirimFiyat ??
        toplamdanBirim(item.totalTl) ??
        toplamdanBirim(item.totalUsd)

      let teklifKirilimi: KesifSatiri['teklifKirilimi'] = 'Malzeme + İşçilik'
      if (malzeme != null && iscilik == null) {
        teklifKirilimi = 'Malzeme'
      } else if (iscilik != null && malzeme == null) {
        teklifKirilimi = 'İşçilik'
      } else if (ggk != null && malzeme == null && iscilik == null) {
        teklifKirilimi = 'GGK'
      }

      const pozNo =
        item.code?.trim() ||
        `${section.code?.trim() || String(secIdx + 1).padStart(2, '0')}.${String(itemIdx + 1).padStart(2, '0')}`
      const itemNotlari = notlar(item.notes)
      const once = itemNotlari.filter((n) => n.sourceRow < (item.sourceRow || 0))
      const sonra = itemNotlari.filter((n) => !once.includes(n))

      if (item.heading?.trim()) satirlar.push(yorum(item.heading, item.sourceRow || 0))
      for (const n of once) satirlar.push(yorum(n.text, n.sourceRow))

      satirlar.push({
        kaynakSatir: item.sourceRow || 0,
        satir: {
          id: `itm-${item.sourceRow || itemIdx + 1}-${ts}-${secIdx}-${itemIdx}`,
          seviye: 2,
          pozNo,
          pozTanimi: item.description?.trim() || '',
          aciklama: item.additionalDescription?.trim() || undefined,
          birim: item.unit?.trim() || '',
          miktar: item.quantity ?? 0,
          teklifKirilimi,
          malzeme,
          iscilik,
          ggk,
          birimFiyat,
          markaModel: item.brands?.trim() || undefined,
          kaynakKodu: kaynakKodu(item.sourceCode, pozNo),
          level: item.level ?? undefined,
          ekDegerler: item.extras
            ? (Object.fromEntries(Object.entries(item.extras).filter(([, v]) => v != null)) as Record<string, number | string>)
            : undefined,
        },
      })

      for (const n of sonra) satirlar.push(yorum(n.text, n.sourceRow))
    })
  })

  return satirlar
}

/** KesifSatiri[] listesini Ark.Excel SurveyDocument yapısına dönüştürür */
export function kesifSatirlariToSurveyDocument(
  satirlar: KesifSatiri[],
  projeKodu: string,
): SurveyDocumentDto {
  const sections: SurveySectionDto[] = []
  let aktifBolum: SurveySectionDto | null = null

  satirlar.forEach((s, index) => {
    const rowNo = index + 5

    // Yorum satırı: önceki kalemin (yoksa bölümün) devam/açıklama notu olarak yazılır
    if (s.yorum) {
      const not = { text: s.pozTanimi, kind: 'Specification', sourceRow: rowNo, position: 'After' }
      const sonKalem = aktifBolum?.items[aktifBolum.items.length - 1]
      if (sonKalem) sonKalem.notes.push(not)
      else if (aktifBolum) aktifBolum.notes.push(not)
      return
    }

    if (s.seviye === 1) {
      aktifBolum = {
        sourceRow: rowNo,
        code: s.pozNo || String(sections.length + 1).padStart(2, '0'),
        title: s.pozTanimi,
        brands: s.markaModel ?? '',
        depth: 1,
        heading: s.aciklama ?? null,
        notes: [],
        items: [],
      }
      sections.push(aktifBolum)
      return
    }

    if (!aktifBolum) {
      aktifBolum = {
        sourceRow: rowNo,
        code: '01',
        title: 'GENEL İMALAT KALEMLERİ',
        brands: '',
        depth: 1,
        heading: null,
        notes: [],
        items: [],
      }
      sections.push(aktifBolum)
    }

    const miktar = s.miktar ?? 0
    const malzemeBirim = s.malzeme ?? null
    const iscilikBirim = s.iscilik ?? null
    const ggkBirim = s.ggk ?? null
    const birimFiyat =
      s.birimFiyat ??
      (malzemeBirim != null || iscilikBirim != null || ggkBirim != null
        ? (malzemeBirim ?? 0) + (iscilikBirim ?? 0) + (ggkBirim ?? 0)
        : null)

    aktifBolum.items.push({
      sourceRow: rowNo,
      code: s.pozNo,
      description: s.pozTanimi,
      brands: s.markaModel ?? '',
      unit: s.birim || null,
      quantity: miktar,
      materialUnitPriceUsd: malzemeBirim,
      materialTotalUsd: malzemeBirim != null ? malzemeBirim * miktar : null,
      laborUnitPriceTl: iscilikBirim,
      laborTotalTl: iscilikBirim != null ? iscilikBirim * miktar : null,
      materialGgkarUnitPriceUsd: ggkBirim,
      materialGgkarTotalUsd: ggkBirim != null ? ggkBirim * miktar : null,
      laborGgkarUnitPriceTl: null,
      laborGgkarTotalTl: null,
      totalUsd: null,
      totalTl: birimFiyat != null ? birimFiyat * miktar : null,
      heading: s.aciklama ?? null,
      notes: [],
    })
  })

  const tumKalemler = sections.flatMap((sec) => sec.items)
  const sumNullable = (vals: Array<number | null | undefined>) => {
    const valid = vals.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) : null
  }

  const computedTotals: SurveyTotalsDto = {
    row: null,
    materialTotalUsd: sumNullable(tumKalemler.map((i) => i.materialTotalUsd)),
    laborTotalTl: sumNullable(tumKalemler.map((i) => i.laborTotalTl)),
    materialGgkarTotalUsd: sumNullable(tumKalemler.map((i) => i.materialGgkarTotalUsd)),
    laborGgkarTotalTl: null,
    totalUsd: null,
    totalTl: sumNullable(tumKalemler.map((i) => i.totalTl)),
  }

  return {
    sheetName: 'Keşif',
    projectName: projeKodu || 'ARK İNŞAAT PROJESİ',
    documentTitle: 'KEŞİF VE METRAJ LİSTESİ',
    disciplineTitle: 'İHALE PAKETİ KEŞİF TABLOSU',
    headerRow: 4,
    sections,
    totals: computedTotals,
    computedTotals,
    warnings: [],
  }
}

function blobIndir(blob: Blob, dosyaAdi: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = dosyaAdi
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Standart "Excel Keşif" çalışma dosyasını Ark.Excel üzerinden indirir */
export async function kesifSablonuIndir() {
  try {
    const res = await fetch(`${EXCEL_API_BASE}/template`)
    if (res.ok) {
      const blob = await res.blob()
      blobIndir(blob, 'Excel_Kesif_Calisma_Dosyasi.xlsx')
      return
    }
  } catch {
    // Backend erişilemezse yerel şablon üretimine düş
  }

  // Backend şablonuyla aynı düzen: Level (1–9, C = yorum), Poz Kodu, Poz Tanımı …
  const baslik = ['Level', 'Poz Kodu', 'Poz Tanımı', 'Marka / Model', 'Birim', 'Miktar', 'Malzeme', 'İşçilik', 'GGK']
  const ws = XLSX.utils.aoa_to_sheet([
    baslik,
    [1, 'KY', 'KABA YAPI İŞLERİ', '', '', '', '', '', ''],
    [2, 'KY.01', 'BETON İŞLERİ', '', '', '', '', '', ''],
    [3, 'KY.01.001', 'C30/37 HAZIR BETON', 'Hazır beton firması', 'm³', 150, 95, 18, ''],
    ['C', '', 'Pompa ile dökülür, vibratör kullanılır (önceki satırın devamı).', '', '', '', '', '', ''],
    [3, 'KY.01.002', 'DONATI ÇELİĞİ', '', 'ton', 12, 640, 85, ''],
  ])
  ws['!cols'] = baslik.map((b) => ({ wch: b === 'Poz Tanımı' ? 52 : b === 'Poz Kodu' ? 16 : 14 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keşif')

  XLSX.writeFile(wb, 'Excel_Kesif_Calisma_Dosyasi.xlsx')
}

/* ----------------------- İçe Aktarma Sihirbazı API ----------------------- */

export type SurveyRoleInfo = { key: string; label: string; required: boolean }

export type SurveySheetPreview = {
  name: string
  rowCount: number
  columnCount: number
  /** Tahmin edilen başlık satırı (1 tabanlı); 0 = bulunamadı */
  suggestedHeaderRow: number
  detectedColumnCount: number
  /** 1 tabanlı sütun numarası → rol anahtarı */
  suggestedColumnMap: Record<string, string>
  rows: string[][]
  truncated: boolean
}

export type SurveyWorkbookPreview = {
  sheets: SurveySheetPreview[]
  suggestedSheet?: string | null
  roles: SurveyRoleInfo[]
}

export type SurveyImportOptions = {
  sheetName: string
  /** 0 = başlık satırı yok */
  headerRow: number
  firstDataRow: number
  lastDataRow: number | null
  /** "1:code,2:description" biçiminde sütun eşlemesi */
  columnMap: string
  /** Bölüm ve pozları otomatik numaralandır (01, 01.01, 01.01.0010); özgün kodlar korunur */
  autoNumber?: boolean
  /** Otomatik numaralandırmada üretilen kök satırın (01) açıklaması; boşsa keşif başlığı */
  rootTitle?: string
  /** Belgeyi tek bir üst başlık (kök) altında topla: çok sayfalı keşiflerde her sayfa ayrı bölüm olur */
  groupUnderRoot?: boolean
}

/** Ark.Excel servisinden dönen, kullanıcıya gösterilebilir hata */
export class ExcelServisHatasi extends Error {
  readonly kod?: string
  readonly erisilemedi: boolean

  constructor(mesaj: string, opts?: { kod?: string; erisilemedi?: boolean }) {
    super(mesaj)
    this.name = 'ExcelServisHatasi'
    this.kod = opts?.kod
    this.erisilemedi = opts?.erisilemedi ?? false
  }
}

async function excelIstegi<T>(path: string, file: File): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch(`${EXCEL_API_BASE}${path}`, { method: 'POST', body: formData })
  } catch {
    throw new ExcelServisHatasi(
      'Ark.Excel servisine ulaşılamadı. Servisin çalıştığından emin olup tekrar deneyin.',
      { erisilemedi: true },
    )
  }

  if (!response.ok) {
    // Geliştirme proxy'si / ağ geçidi servis kapalıyken 502-504 döner
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new ExcelServisHatasi(
        'Ark.Excel servisine ulaşılamadı. Servisin çalıştığından emin olup tekrar deneyin.',
        { erisilemedi: true },
      )
    }
    const govde = (await response.json().catch(() => null)) as
      | { error?: { code?: string; message?: string }; code?: string; message?: string; detail?: string; title?: string }
      | null
    const kod = govde?.error?.code ?? govde?.code
    const mesaj =
      govde?.error?.message ??
      govde?.message ??
      govde?.detail ??
      govde?.title ??
      `Ark.Excel servisi isteği reddetti (HTTP ${response.status}).`
    throw new ExcelServisHatasi(mesaj, { kod, erisilemedi: response.status >= 500 })
  }

  return (await response.json()) as T
}

/** Sihirbazın 1-3. adımları: dosyanın sayfaları, ham satırları ve tahmin edilen başlık/eşleme */
export function kesifOnizle(file: File): Promise<SurveyWorkbookPreview> {
  return excelIstegi<SurveyWorkbookPreview>('/preview', file)
}

/** Sihirbazın son adımı: seçilen sayfa/aralık/sütun eşlemesi ile Ark.Excel ayrıştırması */
export function kesifEslemeIleIceAktar(
  file: File,
  opts: SurveyImportOptions,
): Promise<SurveyDocumentDto> {
  const q = new URLSearchParams()
  if (opts.sheetName) q.set('sheetName', opts.sheetName)
  q.set('headerRow', String(opts.headerRow))
  q.set('firstDataRow', String(opts.firstDataRow))
  if (opts.lastDataRow != null) q.set('lastDataRow', String(opts.lastDataRow))
  if (opts.columnMap) q.set('columnMap', opts.columnMap)
  // Ne gelirse Level'a çevrilir ve otomatik numaralanır; yalnızca açıkça false verilirse kapatılır
  q.set('autoNumber', opts.autoNumber === false ? 'false' : 'true')
  if (opts.rootTitle?.trim()) q.set('rootTitle', opts.rootTitle.trim())
  if (opts.groupUnderRoot) q.set('groupUnderRoot', 'true')
  return excelIstegi<SurveyDocumentDto>(`/import?${q.toString()}`, file)
}

/**
 * Excel dosyasını Ark.Excel backend kütüphanesi (/api/excel/survey/import) ile okur ve doğrular.
 * Backend servisine ulaşılamazsa yerel okuyucuya geri döner.
 */
export async function kesifDosyasiOku(file: File): Promise<ImportSonucu> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${EXCEL_API_BASE}/import`, {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const belge = (await response.json()) as SurveyDocumentDto
      const satirlar = surveyDocumentToKesifSatirlari(belge)
      const hatalar: ImportHatasi[] = (belge.warnings ?? []).map((w) => ({
        satir: w.row ?? 0,
        alan: w.code,
        mesaj: w.message,
        tip: 'uyari',
      }))

      if (satirlar.length === 0) {
        hatalar.push({
          satir: 0,
          alan: 'Tablo',
          mesaj: 'Excel dosyasında içe aktarılabilecek keşif satırı bulunamadı.',
          tip: 'hata',
        })
      }

      return {
        satirlar,
        hatalar,
        dosyaAdi: file.name,
        kaynak: 'ark-excel',
        belge,
      }
    }

    if (response.status >= 400 && response.status < 500) {
      const errBody = (await response.json().catch(() => null)) as
        | { error?: { code?: string; message?: string } }
        | null
      return {
        satirlar: [],
        hatalar: [
          {
            satir: 0,
            alan: errBody?.error?.code || 'Ark.Excel',
            mesaj:
              errBody?.error?.message ||
              'Excel dosyası Ark.Excel kütüphanesi tarafından ayrıştırılamadı.',
            tip: 'hata',
          },
        ],
        dosyaAdi: file.name,
        kaynak: 'ark-excel',
      }
    }
  } catch {
    // Backend çevrimdışı ise yerel ayrıştırıcı ile devam et
  }

  return kesifDosyasiYerelOku(file)
}

/** Yerel (tarayıcı içi) yedek Excel okuyucu */
async function kesifDosyasiYerelOku(file: File): Promise<ImportSonucu> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const ilkSayfa = wb.SheetNames[0]
  const ws = wb.Sheets[ilkSayfa]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

  const hatalar: ImportHatasi[] = []

  const mevcutBasliklar = Object.keys(json[0] ?? {})
  for (const zorunlu of KESIF_ZORUNLU_SUTUNLAR) {
    if (!mevcutBasliklar.some((b) => b.trim() === zorunlu)) {
      hatalar.push({
        satir: 0,
        alan: zorunlu,
        mesaj: `"${zorunlu}" kolonu dosyada bulunamadı. Standart şablonu kullanınız.`,
        tip: 'hata',
      })
    }
  }
  if (hatalar.length > 0) {
    return { satirlar: [], hatalar, dosyaAdi: file.name, kaynak: 'yerel' }
  }

  const satirlar: KesifSatiri[] = []

  json.forEach((row, i) => {
    const satirNo = i + 2
    const oku = (ad: string) => {
      const ham = row[ad]
      return typeof ham === 'string' ? ham.trim() : ham == null ? '' : String(ham).trim()
    }

    const pozNo = oku('Poz No')
    const pozTanimi = oku('Poz Tanımı')
    const birim = oku('Birim')
    const miktarHam = oku('Miktar')
    const kirilim = oku('Teklif Kırılımı')
    const seviyeHam = oku('Seviye')
    const seviye =
      seviyeHam === '1'
        ? 1
        : seviyeHam === '3'
          ? 3
          : !birim && (!miktarHam || Number(miktarHam.replace(',', '.')) === 0)
            ? 1
            : 2

    if (!pozTanimi) {
      hatalar.push({ satir: satirNo, alan: 'Poz Tanımı', mesaj: 'Poz tanımı boş bırakılamaz.', tip: 'hata' })
    }
    if (seviye !== 1 && !birim) {
      hatalar.push({ satir: satirNo, alan: 'Birim', mesaj: 'Birim zorunludur.', tip: 'hata' })
    }
    const miktar = Number(miktarHam.replace(',', '.'))
    if (seviye !== 1 && (!miktarHam || Number.isNaN(miktar))) {
      hatalar.push({ satir: satirNo, alan: 'Miktar', mesaj: 'Miktar zorunlu ve sayısal olmalıdır.', tip: 'hata' })
    }
    if (seviye !== 1 && !kirilim) {
      hatalar.push({
        satir: satirNo,
        alan: 'Teklif Kırılımı',
        mesaj: 'Teklif kırılımı zorunludur (hangi kırımdan teklif isteneceği).',
        tip: 'hata',
      })
    }

    const sayiOku = (ad: string): number | undefined => {
      const ham = oku(ad)
      if (!ham) return undefined
      const n = Number(ham.replace(',', '.'))
      return Number.isNaN(n) ? undefined : n
    }

    const malzeme = sayiOku('Malzeme Fiyatı')
    const iscilik = sayiOku('İşçilik Fiyatı')
    const ggk = sayiOku('GGK Fiyatı')

    satirlar.push({
      id: `imp-${satirNo}-${Date.now()}`,
      seviye,
      pozNo,
      pozTanimi,
      aciklama: oku('Açıklama'),
      birim,
      miktar: Number.isNaN(miktar) ? 0 : miktar,
      teklifKirilimi: (kirilim || 'Malzeme + İşçilik') as KesifSatiri['teklifKirilimi'],
      malzeme,
      iscilik,
      ggk,
      birimFiyat:
        malzeme != null || iscilik != null || ggk != null
          ? (malzeme ?? 0) + (iscilik ?? 0) + (ggk ?? 0)
          : undefined,
      markaModel: oku('Marka/Model'),
    })
  })

  return { satirlar, hatalar, dosyaAdi: file.name, kaynak: 'yerel' }
}

/** Keşif tablosunu Ark.Excel SurveyExcelExporter ile Excel'e aktarır */
export async function kesifDisaAktar(
  satirlar: KesifSatiri[],
  projeKodu: string,
  ekSutunlar: KesifEkSutun[] = [],
  formuller: Record<string, string> = {},
) {
  const safeCode = (projeKodu || 'proje').replace(/[^a-zA-Z0-9_-]/g, '_')
  // Portaldaki yapıyla (Level, Poz Kodu, özel sütunlar) yazılır; dosya sihirbazla geri içe aktarılabilir
  const istek = disaAktarimIstegi(satirlar, ekSutunlar, projeKodu, formuller)
  try {
    const res = await fetch(`${EXCEL_API_BASE}/export-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(istek),
    })
    if (res.ok) {
      const blob = await res.blob()
      blobIndir(blob, `Kesif_${safeCode}.xlsx`)
      return
    }
  } catch {
    // Backend erişilemezse yerel dışa aktarıma düş
  }

  const ws = XLSX.utils.aoa_to_sheet(disaAktarimTablosu(istek))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keşif')
  XLSX.writeFile(wb, `Kesif_${safeCode}.xlsx`)
}
