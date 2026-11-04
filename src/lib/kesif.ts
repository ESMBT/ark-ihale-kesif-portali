import * as XLSX from 'xlsx'
import type { KesifSatiri } from '../data/types'

export const KESIF_SABLON_BASLIKLARI = [
  'Poz No',
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
}

/** Standart "Excel Keşif" çalışma dosyasını indirir */
export function kesifSablonuIndir() {
  const ornekSatir = [
    '01',
    'KABA YAPI İŞLERİ',
    '',
    '',
    '',
    'Malzeme + İşçilik',
    '',
    '',
    '',
    '',
    '',
  ]
  const ornekSatir2 = [
    '01.02',
    '2 CM MERMER ZEMİN KAPLAMASI',
    'Zemin kaplaması ve teslim',
    'm²',
    472,
    'Malzeme + İşçilik',
    '',
    '',
    '',
    '',
    '',
  ]

  const ws = XLSX.utils.aoa_to_sheet([[...KESIF_SABLON_BASLIKLARI], ornekSatir, ornekSatir2])

  ws['!cols'] = [...KESIF_SABLON_BASLIKLARI].map((b) => ({
    wch: b === 'Poz Tanımı' ? 42 : b === 'Açıklama' ? 28 : 18,
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keşif')

  XLSX.writeFile(wb, 'Excel_Kesif_Calisma_Dosyasi.xlsx')
}

/** Excel/CSV dosyasını okur ve doğrular */
export async function kesifDosyasiOku(file: File): Promise<ImportSonucu> {
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
    return { satirlar: [], hatalar, dosyaAdi: file.name }
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
    const seviye = seviyeHam === '1' ? 1 : seviyeHam === '3' ? 3 : 2

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

    const fiyatDoluluk = ['Malzeme Fiyatı', 'İşçilik Fiyatı', 'GGK Fiyatı'].filter((f) => oku(f) !== '')
    if (fiyatDoluluk.length > 0) {
      hatalar.push({
        satir: satirNo,
        alan: fiyatDoluluk.join(', '),
        mesaj: 'Fiyat alanları keşif aşamasında doldurulmaz — içe aktarımda boşaltılacaktır.',
        tip: 'uyari',
      })
    }

    satirlar.push({
      id: `imp-${satirNo}-${Date.now()}`,
      seviye,
      pozNo,
      pozTanimi,
      aciklama: oku('Açıklama'),
      birim,
      miktar: Number.isNaN(miktar) ? 0 : miktar,
      teklifKirilimi: (kirilim || 'Malzeme') as KesifSatiri['teklifKirilimi'],
      markaModel: oku('Marka/Model'),
    })
  })

  return { satirlar, hatalar, dosyaAdi: file.name }
}

/** Keşif tablosunu Excel'e aktarır */
export function kesifDisaAktar(satirlar: KesifSatiri[], projeKodu: string) {
  const veri = satirlar.map((s) => [
    s.pozNo,
    s.pozTanimi,
    s.aciklama ?? '',
    s.birim,
    s.miktar,
    s.teklifKirilimi,
    s.malzeme ?? '',
    s.iscilik ?? '',
    s.ggk ?? '',
    '',
    s.markaModel ?? '',
  ])

  const ws = XLSX.utils.aoa_to_sheet([[...KESIF_SABLON_BASLIKLARI], ...veri])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keşif')
  XLSX.writeFile(wb, `Kesif_${projeKodu || 'proje'}.xlsx`)
}
