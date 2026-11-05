import type { KesifSatiri } from '../data/types'
import {
  surveyDocumentToKaynakliSatirlar,
  type SurveyDocumentDto,
  type SurveySheetPreview,
} from './kesif'

/* ------------------------------------------------------------------ *
 * Keşif İçe Aktarma Sihirbazı — yardımcılar
 *
 * Ayrıştırma, başlık/sütun tanıma ve doğrulama Ark.Excel backend'inde
 * yapılır (/api/excel/survey/preview ve /import). Bu dosya yalnızca
 *   • sihirbaz durumunu (sayfa, aralık, eşleme) tutan tipleri,
 *   • eşlemeyi API'nin "1:code,2:description" biçimine çeviren yardımcıları,
 *   • backend yanıtını (SurveyDocument) önizleme/tablo satırlarına çeviren
 *     son işlemeyi
 * içerir.
 * ------------------------------------------------------------------ */

export type AktarimModu = 'degistir' | 'ekle'

/** Sütun başına rol anahtarı ('' = aktarma). Dizi indeksi = 0 tabanlı sütun. */
export type Esleme = string[]

export type IceAktarAyar = {
  /** 1 tabanlı; 0 = dosyada başlık satırı yok */
  baslikSatiri: number
  /** 1 tabanlı, ilk veri satırı */
  ilkSatir: number
  /** 1 tabanlı, dahil; null = sona kadar */
  sonSatir: number | null
  esleme: Esleme
  birimNormalize: boolean
  /** Otomatik numaralandırmada üretilen kök satırın (01) açıklaması; boşsa keşif başlığı */
  kokBasligi: string
}

export type SayfaVerisi = {
  ad: string
  /** Ham hücre metinleri (en fazla ilk 200 satır) */
  satirlar: string[][]
  sutunSayisi: number
  /** Sayfadaki gerçek toplam satır sayısı */
  toplamSatir: number
  kesildi: boolean
}

export type OnizlemeSatiri = {
  kaynakSatir: number
  durum: 'tamam' | 'uyari'
  mesajlar: string[]
  satir: KesifSatiri
}

export type IceAktarSonucu = {
  satirlar: KesifSatiri[]
  onizleme: OnizlemeSatiri[]
  /** Belirli bir satıra bağlanamayan backend uyarıları */
  genelUyarilar: string[]
  ozet: { grup: number; kalem: number; yorum: number; uyari: number }
}

/** "TOTAL", "TOPLAM", "Genel Toplam" gibi toplam satırı etiketleri (Ark.Excel ile aynı kural) */
const TOPLAM_ETIKETI = /^(total|toplam|genel\s*toplam|grand\s*total|sub\s*total|ara\s*toplam)$/i

export type BaslikPozAyrimi = {
  baslikSayisi: number
  pozSayisi: number
  baslikOrnekleri: string[]
  pozOrnekleri: string[]
}

/**
 * Anahtar sütun Level mi (1–9 / "C"), yoksa Poz No / kod mu? Boş olmayan her değer 1–9 ya da "C" ise ve
 * ("C" var, değer tekrar ediyor ya da başlık Level/Seviye ise) Level'dır; sıralı "1, 2, 3" sıra numarası değildir.
 */
export function anahtarLevelMi(sayfa: SayfaVerisi, ayar: IceAktarAyar, sutun: number): boolean {
  const son = Math.min(ayar.sonSatir ?? sayfa.satirlar.length, sayfa.satirlar.length)
  const gorulen = new Set<string>()
  let adet = 0
  let yorum = false
  let tekrar = false
  for (let r = ayar.ilkSatir; r <= son; r++) {
    const deger = hucreMetin(sayfa.satirlar[r - 1]?.[sutun]).toLowerCase()
    if (!deger) continue
    if (deger === 'c') yorum = true
    else if (!/^[1-9]$/.test(deger)) return false
    adet++
    if (gorulen.has(deger)) tekrar = true
    gorulen.add(deger)
  }
  if (adet === 0) return false
  const baslik = ayar.baslikSatiri > 0 ? hucreMetin(sayfa.satirlar[ayar.baslikSatiri - 1]?.[sutun]).toLowerCase() : ''
  return yorum || tekrar || /^(level|seviye|lvl)$/.test(baslik)
}

/**
 * Sütun eşleme adımı için TAHMİNİ başlık/poz ayrımı. Kural, Ark.Excel'in kuralıyla aynıdır:
 * numarası/tanımı olup birim VE miktarı boş olan satır "başlık", diğeri "poz"tur.
 * Kesin sonuç son adımda backend'den gelir; bu yalnızca eşleme sırasında fikir vermek içindir.
 */
export function baslikPozAyrimi(sayfa: SayfaVerisi, ayar: IceAktarAyar): BaslikPozAyrimi {
  const kolon = (rol: string) => ayar.esleme.indexOf(rol)
  // "Level / Poz No" tek rol: sütun türü içerikten çözülür (Ark.Excel ile aynı kural)
  // "Level / Poz No" ve "Poz Kodu" ayrı sütunlar olabilir: Level sütunu 1–9 / C değilse (Poz No) kod gibi okunur
  const levelAday = kolon('level')
  const kodAday = kolon('code')
  const levelSutunu = levelAday >= 0 && anahtarLevelMi(sayfa, ayar, levelAday)
  const level = levelSutunu ? levelAday : -1
  const kod = levelSutunu ? kodAday : levelAday >= 0 ? levelAday : kodAday
  const tanim = kolon('description')
  const birim = kolon('unit')
  const miktar = kolon('quantity')
  const sonuc: BaslikPozAyrimi = { baslikSayisi: 0, pozSayisi: 0, baslikOrnekleri: [], pozOrnekleri: [] }
  if (tanim < 0) return sonuc

  const son = Math.min(ayar.sonSatir ?? sayfa.satirlar.length, sayfa.satirlar.length)
  for (let r = ayar.ilkSatir; r <= son; r++) {
    const satir = sayfa.satirlar[r - 1] ?? []
    const metin = hucreMetin(satir[tanim])
    const no = kod >= 0 ? hucreMetin(satir[kod]) : ''
    if (!metin && !no) continue
    if (TOPLAM_ETIKETI.test(no)) continue
    // Level sütunu varsa: "C" yorum, boş Level önceki satırın devamıdır; ikisi de ne başlık ne poz
    if (level >= 0) {
      const lv = hucreMetin(satir[level])
      if (!/^\d+$/.test(lv)) continue
    }
    const birimVar = birim >= 0 && !hucreBos(satir[birim])
    const miktarVar = miktar >= 0 && !hucreBos(satir[miktar])
    // Numarası olmayan satırlar Ark.Excel'de açıklama notudur; ne başlık ne poz.
    if (level < 0 && kod >= 0 && !no) continue
    const baslikMi = !birimVar && !miktarVar
    const hedef = baslikMi ? sonuc.baslikOrnekleri : sonuc.pozOrnekleri
    if (baslikMi) sonuc.baslikSayisi++
    else sonuc.pozSayisi++
    if (hedef.length < 3) hedef.push(metin || no)
  }
  return sonuc
}

export function sayfaVerisi(s: SurveySheetPreview): SayfaVerisi {
  const sutunSayisi = s.rows.reduce((m, r) => Math.max(m, r.length), 0)
  return {
    ad: s.name,
    satirlar: s.rows,
    sutunSayisi,
    toplamSatir: s.rowCount,
    kesildi: s.truncated,
  }
}

export function hucreBos(h: string | undefined): boolean {
  return h == null || h.trim() === ''
}

export function hucreMetin(h: string | undefined): string {
  return h == null ? '' : h.trim()
}

/** 0 → A, 25 → Z, 26 → AA */
export function sutunHarfi(i: number): string {
  let n = i
  let s = ''
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

/** Backend'in tahmin ettiği eşlemeyi (1 tabanlı sütun → rol) sütun dizisine çevirir */
export function eslemeOnerisi(oneri: Record<string, string>, sutunSayisi: number): Esleme {
  const esleme: Esleme = Array.from({ length: sutunSayisi }, () => '')
  for (const [sutun, rol] of Object.entries(oneri)) {
    const i = Number(sutun) - 1
    if (Number.isInteger(i) && i >= 0 && i < sutunSayisi) esleme[i] = rol
  }
  return esleme
}

/** Eşlemeyi API'nin sorgu biçimine çevirir: "1:code,2:description" */
export function eslemeSorgusu(esleme: Esleme): string {
  return esleme
    .map((rol, i) => (rol ? `${i + 1}:${rol}` : ''))
    .filter(Boolean)
    .join(',')
}

function birimDuzelt(birim: string): string {
  const n = birim.trim().toLocaleLowerCase('tr')
  if (n === 'm2' || n === 'mt2' || n === 'm^2') return 'm²'
  if (n === 'm3' || n === 'mt3' || n === 'm^3') return 'm³'
  if (n === 'mt') return 'm'
  return birim.trim()
}

/**
 * Backend'in döndürdüğü belgeyi portal satırlarına çevirir; kullanıcı seçeneklerini
 * (birim düzeltme) uygular ve backend uyarılarını satırlara bağlar.
 */
export function belgeyiSatirlaraCevir(belge: SurveyDocumentDto, ayar: IceAktarAyar): IceAktarSonucu {
  const kaynakli = surveyDocumentToKaynakliSatirlar(belge)

  const uyarilar = new Map<number, string[]>()
  const genelUyarilar: string[] = []
  for (const w of belge.warnings ?? []) {
    if (w.row) {
      const liste = uyarilar.get(w.row) ?? []
      liste.push(w.message)
      uyarilar.set(w.row, liste)
    } else {
      genelUyarilar.push(w.message)
    }
  }

  const onizleme: OnizlemeSatiri[] = kaynakli.map(({ satir, kaynakSatir }) => {
    let s = satir
    if (s.seviye !== 1 && !s.yorum && ayar.birimNormalize) {
      s = { ...s, birim: birimDuzelt(s.birim) }
    }
    const mesajlar = uyarilar.get(kaynakSatir) ?? []
    return { kaynakSatir, durum: mesajlar.length > 0 ? 'uyari' : 'tamam', mesajlar, satir: s }
  })

  // Satırı olmayan (ör. dosyada olmayan bir kaleme ait) uyarıları genel listeye taşı
  const gorulen = new Set(kaynakli.map((k) => k.kaynakSatir))
  for (const [satir, mesajlar] of uyarilar) {
    if (!gorulen.has(satir)) genelUyarilar.push(...mesajlar.map((m) => `Satır ${satir}: ${m}`))
  }

  const satirlar = onizleme.map((o) => o.satir)
  return {
    satirlar,
    onizleme,
    genelUyarilar,
    ozet: {
      grup: satirlar.filter((s) => s.seviye === 1).length,
      kalem: satirlar.filter((s) => s.seviye !== 1 && !s.yorum).length,
      yorum: satirlar.filter((s) => s.yorum).length,
      uyari: (belge.warnings ?? []).length,
    },
  }
}
