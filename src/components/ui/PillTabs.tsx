import type { ReactNode } from 'react'

export type PillTab = {
  key: string
  label: string
  content?: ReactNode
  disabled?: boolean
}

/**
 * Conwize referansındaki "pill" sekme yapısı:
 * ayrı ayrı beyaz haplar, aktif olan turuncu metin + gölge.
 */
export function PillTabs({
  items,
  active,
  onChange,
}: {
  items: PillTab[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            onClick={() => !item.disabled && onChange(item.key)}
            disabled={item.disabled}
            className={`rounded-full px-5 py-2.5 text-[14px] leading-5 transition-colors ${
              item.disabled
                ? 'cursor-not-allowed bg-surface-muted text-gray'
                : isActive
                  ? 'bg-white font-bold text-warning shadow-sm'
                  : 'bg-white text-ink hover:bg-surface-muted'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
