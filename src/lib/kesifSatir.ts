import type { KesifSatiri } from '../data/types'

/** Poz sayısı: yorum / devam satırları sayılmaz (başlıklar önceki davranışla aynı şekilde sayılır). */
export function kesifSatirSayisi(satirlar: KesifSatiri[]): number {
  return satirlar.filter((s) => !s.yorum).length
}

/* ------------------------------------------------------------------ *
 * Level (seviye) modeli
 *
 * Her satırın (yorum hariç) bir Level'ı vardır: 1–9. Level = numaradaki nokta sayısı + 1
 * ("01" → 1, "01.02" → 2, "01.02.01" → 3). Yorum / devam satırlarının Level'ı "C"dir.
 * Tablo Poz No göstermez; hiyerarşi Level'dan okunur ve numaralar (01, 01.01, 01.01.0010)
 * kayıt/dışa aktarım için sıradan ve Level'lardan otomatik üretilir.
 * ------------------------------------------------------------------ */

export const LEVEL_MIN = 1
export const LEVEL_MAX = 9

const sinirla = (n: number) => Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, Math.round(n)))

/** Başlık satırı mı? (Yorum satırı başlık sayılmaz.) */
export function baslikMi(s: KesifSatiri): boolean {
  return !s.yorum && s.seviye === 1
}

/** Bir satırın Level'ı: açıkça verilmişse o; yoksa Poz No'daki nokta sayısı + 1; o da yoksa başlık 1, poz 2. */
export function levelDegeri(s: KesifSatiri): number {
  if (s.level != null) return sinirla(s.level)
  const parca = s.pozNo?.split('.').filter((p) => p.trim()).length ?? 0
  if (parca > 0) return sinirla(parca)
  return s.seviye === 1 ? 1 : 2
}

/** Level'ı olmayan (eski / örnek veri) satırlara Level ekler; yorum satırlarına dokunmaz. */
export function levelleriDoldur(satirlar: KesifSatiri[]): KesifSatiri[] {
  return satirlar.map((s) => (s.yorum || s.level != null ? s : { ...s, level: levelDegeri(s) }))
}

const iki = (n: number) => String(n).padStart(2, '0')
const dort = (n: number) => String(n).padStart(4, '0')

/**
 * Poz No'ları sıradan ve Level'lardan üretir (hiyerarşi Level'dan okunur): başlıklar `01`, `01.01`…;
 * pozlar bağlı oldukları başlığın altında `01.01.0010`, `0020`… Yorum satırları numaralanmaz.
 * Girdiyi değiştirmez.
 */
export function levelNumaralariniUygula(satirlar: KesifSatiri[]): KesifSatiri[] {
  type Dugum = { level: number; numara: string; baslikSayac: number; kalemSayac: number }
  const yigin: Dugum[] = []
  let kokBaslik = 0
  let kokKalem = 0

  return satirlar.map((s) => {
    if (s.yorum) return s

    const level = levelDegeri(s)
    while (yigin.length > 0 && yigin[yigin.length - 1].level >= level) yigin.pop()
    const ust = yigin.length > 0 ? yigin[yigin.length - 1] : null

    let numara: string
    if (baslikMi(s)) {
      numara = ust ? `${ust.numara}.${iki(++ust.baslikSayac)}` : iki(++kokBaslik)
    } else {
      numara = ust ? `${ust.numara}.${dort(++ust.kalemSayac * 10)}` : dort(++kokKalem * 10)
    }

    yigin.push({ level, numara, baslikSayac: 0, kalemSayac: 0 })
    return { ...s, level, pozNo: numara }
  })
}

/**
 * Level hücresi değerini çözer: "C"/"c" → yorum satırı; 1–9 tamsayı → seviye; aksi halde geçersiz.
 */
export function levelHucresiCozumle(
  ham: string | number | null | undefined,
): { tur: 'yorum' } | { tur: 'level'; level: number } | { tur: 'gecersiz' } {
  const metin = String(ham ?? '').trim()
  if (/^c$/i.test(metin)) return { tur: 'yorum' }
  if (/^\d+$/.test(metin)) {
    const n = Number(metin)
    if (n >= LEVEL_MIN && n <= LEVEL_MAX) return { tur: 'level', level: n }
  }
  return { tur: 'gecersiz' }
}
