import type { KesifSatiri } from '../data/types'

/** Poz sayısı: yorum / devam satırları sayılmaz (başlıklar önceki davranışla aynı şekilde sayılır). */
export function kesifSatirSayisi(satirlar: KesifSatiri[]): number {
  return satirlar.filter((s) => !s.yorum).length
}
