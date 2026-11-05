import type { DogrulamaDurumu } from './kesifDogrulama'

/**
 * YAYIN KAPISI (F5)
 * Ihale paketi, keşif doğrulaması (Ark.Excel kuralları) hata içerirken yayınlanamaz.
 * Karar yalnızca **güncel** doğrulama sonucuna dayanır: sonuç henüz gelmediyse veya servise
 * ulaşılamıyorsa kapı kapalı kalır (doğrulanamayan keşif yayınlanmaz).
 *
 * Not: Bu bir arayüz kapısıdır. Aynı kuralın sunucuda zorlanması, durum makinesi
 * (Hazırlık → İhale çıkarılmaya hazır) backend'e eklendiğinde yapılacaktır.
 */
export type YayinKapisi = {
  izinli: boolean
  durum: 'hazir' | 'hata' | 'kontrol' | 'servis' | 'bos'
  hataSayisi: number
  /** Kullanıcıya gösterilecek kısa açıklama */
  mesaj: string
}

/** `pozSayisi` verilirse ve 0 ise (boş keşif) kapı kapalıdır: önce keşif hazırlanmalı */
export function yayinKapisiHesapla(d: DogrulamaDurumu, pozSayisi?: number): YayinKapisi {
  if (pozSayisi === 0) {
    return { izinli: false, durum: 'bos', hataSayisi: 0, mesaj: 'Keşif boş; yayınlamadan önce en az bir poz ekleyin.' }
  }
  if (d.hata) {
    return {
      izinli: false,
      durum: 'servis',
      hataSayisi: 0,
      mesaj: d.erisilemedi
        ? 'Keşif doğrulanamadı: doğrulama servisine ulaşılamıyor.'
        : 'Keşif doğrulanamadı.',
    }
  }
  if (!d.guncel || !d.sonuc) {
    return { izinli: false, durum: 'kontrol', hataSayisi: 0, mesaj: 'Keşif doğrulanıyor…' }
  }
  if (d.sonuc.errorCount > 0) {
    return {
      izinli: false,
      durum: 'hata',
      hataSayisi: d.sonuc.errorCount,
      mesaj: `Keşifte ${d.sonuc.errorCount} hata var; düzeltilmeden yayınlanamaz.`,
    }
  }
  return { izinli: true, durum: 'hazir', hataSayisi: 0, mesaj: 'Keşif doğrulaması geçti.' }
}
