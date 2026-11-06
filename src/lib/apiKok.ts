/**
 * Backend (Ark.Api) taban adresi.
 *
 * Öncelik sırası:
 *  1. Tarayıcıda kayıtlı adres (`?api=https://…` ile bir kez verilir, localStorage'da kalır)
 *  2. Derleme zamanı `VITE_API_URL` (Netlify ortam değişkeni)
 *  3. Boş → göreli `/api/...` (Vite dev proxy'si ya da Netlify rewrite'ı)
 *
 * Böylece yayındaki (Netlify) arayüz, kendi bilgisayarınızda çalışan backend'e
 * yeniden derlemeden bağlanabilir:
 *   https://<site>.netlify.app/?api=https://abc.trycloudflare.com   → bağlanır
 *   https://<site>.netlify.app/?api=                                → kaydı siler
 */

const ANAHTAR = 'ark.apiKok'
const PARAMETRE = 'api'

function temizle(adres: string): string {
  return adres.trim().replace(/\/+$/, '')
}

function gecerliMi(adres: string): boolean {
  try {
    const u = new URL(adres)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function kayitOku(): string {
  try {
    return localStorage.getItem(ANAHTAR) ?? ''
  } catch {
    return ''
  }
}

function kayitYaz(adres: string) {
  try {
    if (adres) localStorage.setItem(ANAHTAR, adres)
    else localStorage.removeItem(ANAHTAR)
  } catch {
    /* depolama kapalı olabilir (gizli pencere vb.) */
  }
}

let kok: string | null = null

/** Güncel API taban adresi (sonunda "/" yok; boşsa göreli yol kullanılır). */
export function apiKok(): string {
  if (kok !== null) return kok
  const kayitli = kayitOku()
  const ortam = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
  kok = gecerliMi(kayitli) ? temizle(kayitli) : gecerliMi(ortam) ? temizle(ortam) : ''
  return kok
}

/** Tüm backend çağrıları için tam adres: `apiUrl('/api/excel/survey/import')`. */
export function apiUrl(yol: string): string {
  return `${apiKok()}${yol}`
}

/** Kullanıcı tarafından (kayıtla) seçilmiş bir adres var mı? Arayüzde rozet göstermek için. */
export function apiKokElleSecildi(): boolean {
  return gecerliMi(kayitOku())
}

/**
 * Açılışta bir kez çağrılır: adres çubuğundaki `?api=` değerini kaydeder ve adresten siler.
 * `?api=` (boş) ya da `?api=sil` kaydı temizler.
 */
export function apiParametresiniUygula() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has(PARAMETRE)) return

  const deger = (url.searchParams.get(PARAMETRE) ?? '').trim()
  if (deger === '' || deger.toLowerCase() === 'sil') kayitYaz('')
  else if (gecerliMi(deger)) kayitYaz(temizle(deger))

  kok = null
  url.searchParams.delete(PARAMETRE)
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

/** Ark.Excel keşif uçlarının taban adresi. */
export const excelApiTaban = () => apiUrl('/api/excel/survey')
