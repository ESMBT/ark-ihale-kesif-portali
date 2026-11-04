/* =================================================================
   MODÜL YAPISI
   -----------------------------------------------------------------
   Portal iki modülden oluşur:
     · İhale Yönetimi   → /modul/ihale/...
     · Şantiyeci Yönetimi → /modul/santiyeci/...
   Keşif (İhale Keşif Portalı) her iki modülün altında ortak çalışır.

   Nihai hedef (rol bazlı otomatik yönlendirme): kullanıcının tek
   erişimi olan modül varsa modül seçim ekranı hiç gösterilmez;
   birden fazla modülü varsa seçim ekranı açılır. Şimdilik seçim
   ekranı her zaman görünür (geçişi kolaylaştırmak için).
   ================================================================= */

export type ModuleId = 'ihale' | 'santiyeci'

export const MODUL_ADI: Record<ModuleId, string> = {
  ihale: 'İhale Yönetimi',
  santiyeci: 'Şantiyeci Yönetimi',
}

/** Modülün route kökü */
export const MODUL_KOK: Record<ModuleId, string> = {
  ihale: '/modul/ihale',
  santiyeci: '/modul/santiyeci',
}

/** Modül kökü + alt yol */
export function modulYolu(id: ModuleId, alt = ''): string {
  return `${MODUL_KOK[id]}${alt}`
}

/** Adres çubuğundan aktif modülü çözer (varsayılan: ihale) */
export function aktifModul(pathname: string): ModuleId {
  if (pathname.startsWith(MODUL_KOK.santiyeci)) return 'santiyeci'
  return 'ihale'
}
