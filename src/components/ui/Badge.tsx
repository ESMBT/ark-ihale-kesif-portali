import type { ReactNode } from 'react'
import type { Tone } from '../../data/types'

/* Renkler panosundaki soft tonlar eşleştirildi */
const toneStyles: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-ink',
  primary: 'bg-black text-white',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  purple: 'bg-surface-muted text-ink',
}

const dotStyles: Record<Tone, string> = {
  neutral: 'bg-gray',
  primary: 'bg-black',
  success: 'bg-success-strong',
  warning: 'bg-warning-strong',
  danger: 'bg-danger-strong',
  info: 'bg-ink',
  purple: 'bg-ink',
}

type BadgeProps = {
  children: ReactNode
  tone?: Tone
  dot?: boolean
  solid?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  solid = false,
  size = 'md',
  className = '',
}: BadgeProps) {
  const solidTone: Record<Tone, string> = {
    neutral: 'bg-ink text-white',
    primary: 'bg-black text-white',
    success: 'bg-success-d text-white',
    warning: 'bg-warning-d text-white',
    danger: 'bg-danger-d text-white',
    info: 'bg-ink text-white',
    purple: 'bg-ink text-white',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-normal whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] leading-4' : 'px-2.5 py-1 text-[12px] leading-4',
        solid ? solidTone[tone] : toneStyles[tone],
        className,
      ].join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${solid ? 'bg-white' : dotStyles[tone]}`} />}
      {children}
    </span>
  )
}

export const statusLabels: Record<string, { label: string; tone: Tone }> = {
  talep: { label: 'Proje Kodu Talep Edildi', tone: 'warning' },
  'sap-bekliyor': { label: 'SAP Sorumlusu Bekliyor', tone: 'warning' },
  'proje-kodu-var': { label: 'Proje Kodu Oluştu', tone: 'success' },
  'keşif-taslak': { label: 'Keşif Taslağı', tone: 'neutral' },
  'keşif-hazir': { label: 'Keşif Hazır', tone: 'info' },
  'paket-hazir': { label: 'İhale Paketi Hazır', tone: 'info' },
  'ihale-ekibinde': { label: 'İhale Ekibinde', tone: 'warning' },
  'revize': { label: 'Revize Talep Edildi', tone: 'danger' },
  onaylandi: { label: 'Onaylandı', tone: 'success' },
  taslak: { label: 'Taslak', tone: 'neutral' },
  eksik: { label: 'Eksik', tone: 'danger' },
  aktif: { label: 'Aktif', tone: 'success' },
  bekliyor: { label: 'Bekliyor', tone: 'warning' },
  tamamlandi: { label: 'Tamamlandı', tone: 'success' },
}
