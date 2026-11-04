import type { ReactNode } from 'react'
import { Icon } from './Icon'

/* ---------------------------------------------------------------- */
/*  FilterBar — Conwize tarzı filtre satırı                           */
/* ---------------------------------------------------------------- */

export function FilterBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 ${className}`}>
      {children}
    </div>
  )
}

/** Etiket + ok içeren açılır filtre (Stage, Status, Work type…) */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon,
  className = '',
}: {
  label: string
  value?: string
  options?: string[]
  onChange?: (v: string) => void
  icon?: string
  className?: string
}) {
  return (
    <label
      className={`inline-flex h-11 min-w-[160px] flex-1 cursor-pointer items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 transition-colors hover:border-gray ${className}`}
    >
      <span className="flex items-center gap-2 truncate">
        {icon && <Icon name={icon} size={15} className="shrink-0 text-gray" />}
        <span className={`truncate text-[14px] ${value ? 'font-medium text-ink' : 'text-gray'}`}>
          {value ?? label}
        </span>
      </span>
      {options && <Icon name="chevron-down" size={15} className="shrink-0 text-gray" />}
      {options && (
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className="absolute h-0 w-0 opacity-0"
          aria-label={label}
        >
          <option value="">{label}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </label>
  )
}

/** Arama ikonlu filtre alanı */
export function FilterInput({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <label
      className={`inline-flex h-11 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 transition-colors focus-within:border-black ${className}`}
    >
      <Icon name="search" size={16} className="shrink-0 text-gray" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full bg-transparent text-[14px] outline-none placeholder:text-gray"
      />
    </label>
  )
}

/** Seçili değer rozeti (Country gibi) */
export function FilterChip({
  label,
  onRemove,
  className = '',
}: {
  label: string
  onRemove?: () => void
  className?: string
}) {
  return (
    <span
      className={`inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[14px] font-medium text-ink ${className}`}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-gray hover:text-black" aria-label="Kaldır">
          <Icon name="x" size={14} />
        </button>
      )}
    </span>
  )
}

/** Etiketli filtre alanı (Conwize "Show / Filter" varyantı) */
export function LabeledFilter({
  label,
  value,
  options,
  onChange,
  className = '',
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <label className={`relative inline-flex flex-col ${className}`}>
      <span className="mb-1 text-[12px] font-medium text-muted-foreground">{label}</span>
      <span className="inline-flex h-11 min-w-[180px] items-center justify-between gap-3 rounded-xl border border-line bg-white px-4">
        <span className="text-[14px] font-medium text-ink">{value}</span>
        <Icon name="chevron-down" size={15} className="text-gray" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-x-0 bottom-0 h-11 w-full cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
