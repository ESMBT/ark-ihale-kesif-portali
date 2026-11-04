import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import type { Tone } from '../../data/types'

/* PageHeader, Feedback bileşeninde tanımlıdır; buradan da erişilebilir olması için
   yeniden dışa aktarılır. */
export { PageHeader } from './Feedback'

/* ---------------------------------------------------------------- */
/*  IconButton — kare ikon butonu ("...", tam ekran, yardım vb.)       */
/* ---------------------------------------------------------------- */

export function IconButton({
  icon,
  label,
  onClick,
  tone = 'default',
  size = 'md',
  className = '',
}: {
  icon: string
  label: string
  onClick?: () => void
  tone?: 'default' | 'brand' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const tones = {
    default: 'border-line bg-white text-ink hover:bg-surface-muted',
    brand: 'border-transparent bg-warning text-white hover:opacity-90',
    primary: 'border-transparent bg-black text-white hover:bg-ink',
  }
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
  }
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border transition-colors ${tones[tone]} ${sizes[size]} ${className}`}
    >
      <Icon name={icon} size={size === 'sm' ? 15 : 17} />
    </button>
  )
}

/* ---------------------------------------------------------------- */
/*  StatusPill — durum rozeti (nokta + metin + açılır ok)            */
/* ---------------------------------------------------------------- */

export type PillTone = 'blue' | 'orange' | 'green' | 'gray' | 'red' | 'purple'

/** Badge tonlarını pill tonlarına çevirir */
export function toneToPill(tone: Tone): PillTone {
  if (tone === 'success') return 'green'
  if (tone === 'warning') return 'orange'
  if (tone === 'danger') return 'red'
  if (tone === 'info') return 'blue'
  if (tone === 'primary' || tone === 'purple') return 'purple'
  return 'gray'
}

const pillTone: Record<PillTone, string> = {
  blue: 'border-info-soft-2 bg-info-bg text-info',
  orange: 'border-warning/40 bg-warning-soft text-warning',
  green: 'border-success/30 bg-success-soft text-success',
  gray: 'border-line bg-surface-muted text-ink',
  red: 'border-danger/30 bg-danger-soft text-danger',
  purple: 'border-line bg-surface-muted text-ink',
}

const pillDot: Record<PillTone, string> = {
  blue: 'bg-info',
  orange: 'bg-warning-strong',
  green: 'bg-success-strong',
  gray: 'bg-gray',
  red: 'bg-danger-strong',
  purple: 'bg-ink',
}

/**
 * Tıklanabilir durum rozeti — açılır listeden yeni durum seçilir.
 */
export function StatusSelect({
  label,
  tone = 'blue',
  options,
  onSelect,
  className = '',
}: {
  label: string
  tone?: PillTone
  options: { value: string; label: string }[]
  onSelect: (value: string) => void
  className?: string
}) {
  const [acik, setAcik] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!acik) return
    const kapat = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAcik(false)
    }
    document.addEventListener('mousedown', kapat)
    return () => document.removeEventListener('mousedown', kapat)
  }, [acik])

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setAcik((v) => !v)
        }}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] leading-5 whitespace-nowrap transition-colors hover:brightness-95 ${
          pillTone[tone]
        }`}
        aria-haspopup="listbox"
        aria-expanded={acik}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        <span className="font-medium">{label}</span>
        <Icon name="chevron-down" size={14} />
      </button>

      {acik && (
        <div
          role="listbox"
          className="absolute left-0 top-10 z-40 max-h-72 w-72 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-lg"
        >
          {options.map((o) => (
            <button
              key={o.value}
              role="option"
              aria-selected={o.value === label}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(o.value)
                setAcik(false)
              }}
              className="block w-full px-4 py-2 text-left text-[13px] hover:bg-surface-muted"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function StatusPill({
  label,
  tone = 'blue',
  dot = true,
  chevron = false,
  onClick,
  className = '',
}: {
  label: string
  tone?: PillTone
  dot?: boolean
  chevron?: boolean
  onClick?: () => void
  className?: string
}) {
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] leading-5 whitespace-nowrap ${
        pillTone[tone]
      } ${onClick ? 'transition-colors hover:brightness-95' : ''} ${className}`}
    >
      {dot && <span className={`h-2 w-2 rounded-full ${pillDot[tone]}`} />}
      <span className="font-medium">{label}</span>
      {chevron && <Icon name="chevron-down" size={14} />}
    </Comp>
  )
}

/* ---------------------------------------------------------------- */
/*  Avatar                                                            */
/* ---------------------------------------------------------------- */

export function Avatar({
  initials,
  size = 32,
  tone = 'dark',
  className = '',
}: {
  initials: string
  size?: number
  tone?: 'dark' | 'orange' | 'light'
  className?: string
}) {
  const tones = {
    dark: 'bg-black text-white',
    orange: 'bg-warning text-white',
    light: 'bg-surface-muted text-ink',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${tones[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  )
}

/* ---------------------------------------------------------------- */
/*  DragHandle — kart listesi tutamağı                                */
/* ---------------------------------------------------------------- */

export function DragHandle({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-grid shrink-0 grid-cols-2 gap-[3px] text-gray ${className}`}
      aria-hidden
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />
      ))}
    </span>
  )
}

/* ---------------------------------------------------------------- */
/*  SectionBox — içerik kutusu başlığı + aksiyon                      */
/* ---------------------------------------------------------------- */

export function SectionBox({
  title,
  description,
  actions,
  children,
  padded = true,
  className = '',
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  padded?: boolean
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h4 className="text-[17px] leading-6">{title}</h4>}
            {description && <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}
