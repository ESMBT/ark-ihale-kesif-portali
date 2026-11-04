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

export const navGroups: NavGroup[] = [
  {
    label: 'Şirketler',
    to: '/sirketler',
    icon: 'building',
    children: [{ label: 'Tüm Şirketler', to: '/sirketler' }],
    disabled: true,
  },
  {
    label: 'Projeler',
    to: '/projeler',
    icon: 'building2',
    children: [
      { label: 'Tüm Projeler', to: '/projeler' },
      { label: 'Proje Kodu Talebi', to: '/projeler/talep' },
    ],
  },
  {
    label: 'Keşif',
    to: '/kesif/sozlesmeler',
    icon: 'layers',
    children: [{ label: 'Sözleşmeye Dönüşmüş Keşifler', to: '/kesif/sozlesmeler' }],
  },
  {
    label: 'Bildirimler',
    to: '/bildirimler',
    icon: 'bell',
  },
  {
    label: 'Hesap Ayarları',
    to: '/hesap-ayarlari',
    icon: 'settings',
    children: [
      { label: 'Profilim', to: '/profilim' },
      { label: 'Kullanıcı Yönetimi', to: '/kullanim' },
      { label: 'Genel Ayarlar', to: '/hesap-ayarlari' },
    ],
  },
]
