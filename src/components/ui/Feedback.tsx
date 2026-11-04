import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Tone } from '../../data/types'
import { Icon } from './Icon'

/* ---------------------------------------------------------------- */
/*  Alert                                                            */
/* ---------------------------------------------------------------- */

const alertTone: Record<Tone, { wrap: string; icon: string }> = {
  neutral: { wrap: 'bg-surface-muted border-line text-ink', icon: 'info' },
  primary: { wrap: 'bg-info-bg border-info-soft-2 text-ink', icon: 'info' },
  success: { wrap: 'bg-success-soft border-success/25 text-ink', icon: 'check-circle' },
  warning: { wrap: 'bg-warning-soft border-warning/30 text-ink', icon: 'alert-triangle' },
  danger: { wrap: 'bg-danger-soft border-danger/25 text-ink', icon: 'alert-triangle' },
  info: { wrap: 'bg-info-bg border-info-soft-2 text-ink', icon: 'info' },
  purple: { wrap: 'bg-surface-muted border-line text-ink', icon: 'info' },
}

export function Alert({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: Tone
  title?: string
  children?: ReactNode
  action?: ReactNode
}) {
  const t = alertTone[tone]
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 ${t.wrap}`}>
      <Icon name={t.icon} size={18} className="mt-0.5 shrink-0 opacity-70" />
      <div className="min-w-0 flex-1 text-[14px] leading-5">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-1 text-muted-foreground' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*  EmptyState                                                       */
/* ---------------------------------------------------------------- */

export function EmptyState({
  icon = 'folder',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-gray">
        <Icon name={icon} size={22} />
      </span>
      <h5 className="mt-4">{title}</h5>
      {description && <p className="mt-1.5 max-w-sm text-[14px] leading-5 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*  ProgressBar                                                      */
/* ---------------------------------------------------------------- */

export function ProgressBar({
  value,
  tone = 'primary',
  className = '',
}: {
  value: number
  tone?: Tone
  className?: string
}) {
  const bar: Record<Tone, string> = {
    neutral: 'bg-gray',
    primary: 'bg-black',
    success: 'bg-success-strong',
    warning: 'bg-warning-strong',
    danger: 'bg-danger-strong',
    info: 'bg-ink',
    purple: 'bg-ink',
  }
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-muted ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${bar[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*  StatTile                                                         */
/* ---------------------------------------------------------------- */

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
}: {
  label: string
  value: string
  hint?: string
  icon?: string
  tone?: Tone
}) {
  const soft: Record<Tone, string> = {
    neutral: 'bg-surface-muted text-ink',
    primary: 'bg-black text-white',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-ink',
    purple: 'bg-surface-muted text-ink',
  }
  return (
    <div className="card flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-[12px] leading-4 uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1.5 font-heading text-[28px] font-bold leading-9 tracking-tight text-black">{value}</p>
        {hint && <p className="mt-1 truncate text-[12px] leading-4 text-muted-foreground">{hint}</p>}
      </div>
      {icon && (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${soft[tone]}`}>
          <Icon name={icon} size={18} />
        </span>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*  Timeline                                                         */
/* ---------------------------------------------------------------- */

export function Timeline({ items }: { items: { date: string; label: string; done: boolean }[] }) {
  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-line" aria-hidden />
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span
            className={`absolute -left-6 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 ${
              item.done ? 'border-black bg-black' : 'border-line bg-white'
            }`}
          >
            {item.done && <Icon name="check" size={9} className="text-white" strokeWidth={3} />}
          </span>
          <p className={`text-[14px] leading-5 ${item.done ? 'text-black' : 'text-muted-foreground'}`}>{item.label}</p>
          <p className="mt-0.5 text-[12px] leading-4 text-gray">{item.date}</p>
        </li>
      ))}
    </ol>
  )
}

/* ---------------------------------------------------------------- */
/*  PageHeader                                                       */
/* ---------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string
  description?: string
  breadcrumb?: { label: string; to?: string }[]
  actions?: ReactNode
}) {
  return (
    <div className="mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-3 flex items-center gap-1.5 text-[12px] leading-4 text-gray">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevron-right" size={12} />}
              {b.to ? (
                <Link to={b.to} className="font-medium tracking-wide uppercase hover:text-black hover:underline">
                  {b.label}
                </Link>
              ) : (
                <span className="font-medium tracking-wide text-black uppercase underline underline-offset-4">
                  {b.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-heading text-[30px] leading-10 font-bold text-black">{title}</h2>
          {description && <p className="mt-1.5 max-w-3xl text-[15px] leading-6 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*  Spinner                                                          */
/* ---------------------------------------------------------------- */

export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/*  SectionTitle — blok başlıkları (Proje Kartı blok yapısı)          */
/* ---------------------------------------------------------------- */

export function SectionTitle({
  title,
  description,
  right,
  icon,
}: {
  title: string
  description?: string
  right?: ReactNode
  icon?: string
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4 border-b border-line pb-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink">
            <Icon name={icon} size={15} />
          </span>
        )}
        <div className="min-w-0">
          <h5 className="leading-tight">{title}</h5>
          {description && <p className="mt-0.5 text-[12px] leading-4 text-muted-foreground">{description}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
