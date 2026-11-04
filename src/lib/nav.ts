import type { ModuleId } from './modul'
import { modulYolu } from './modul'

export type NavChild = {
  label: string
  to: string
}

export type NavGroup = {
  label: string
  to: string
  icon: string
  children?: NavChild[]
  /** Gruplar arası ayraç çizgisi */
  divider?: boolean
  /** Tıklanamaz (pasif) menü girdisi */
  disabled?: boolean
}

/* Hesap ayarları her iki modülde de aynı */
const hesapAyarlari = (): NavGroup => ({
  label: 'Hesap Ayarları',
  to: '/profilim',
  icon: 'settings',
  children: [
    { label: 'Profilim', to: '/profilim' },
    { label: 'Kullanıcı Yönetimi', to: '/kullanim' },
    { label: 'Genel Ayarlar', to: '/hesap-ayarlari' },
  ],
})

const sirketler = (): NavGroup => ({
  label: 'Şirketler',
  to: '/sirketler',
  icon: 'building',
  children: [{ label: 'Tüm Şirketler', to: '/sirketler' }],
  disabled: true,
})

/**
 * Menü modüle göre değişir:
 *  · İhale modülü  → Tüm Projeler (Proje Kodu Talebi **görünmez**) · Keşif · Bildirimler · Hesap Ayarları
 *  · Şantiyeci      → Projelerim · Proje Kodu Talebi · Keşif · Bildirimler · Hesap Ayarları
 * Keşif menüsü alt başlıksız kalır; içeriği şimdilik boştur.
 */
export function modulNav(modul: ModuleId): NavGroup[] {
  if (modul === 'santiyeci') {
    return [
      sirketler(),
      {
        label: 'Projelerim',
        to: modulYolu(modul, '/projeler'),
        icon: 'building2',
        children: [{ label: 'Projelerim', to: modulYolu(modul, '/projeler') }],
      },
      {
        label: 'Proje Kodu Talebi',
        to: modulYolu(modul, '/projeler/talep'),
        icon: 'file-text',
      },
      {
        label: 'Keşif',
        to: modulYolu(modul, '/kesif'),
        icon: 'layers',
      },
      {
        label: 'Bildirimler',
        to: '/bildirimler',
        icon: 'bell',
      },
      hesapAyarlari(),
    ]
  }

  return [
    sirketler(),
    {
      label: 'Projeler',
      to: modulYolu(modul, '/projeler'),
      icon: 'building2',
      children: [{ label: 'Tüm Projeler', to: modulYolu(modul, '/projeler') }],
    },
    {
      label: 'Ekip Yönetimi',
      to: modulYolu(modul, '/ekip-yonetimi'),
      icon: 'users',
    },
    {
      label: 'Keşif',
      to: modulYolu(modul, '/kesif'),
      icon: 'layers',
    },
    {
      label: 'Bildirimler',
      to: '/bildirimler',
      icon: 'bell',
    },
    hesapAyarlari(),
  ]
}
