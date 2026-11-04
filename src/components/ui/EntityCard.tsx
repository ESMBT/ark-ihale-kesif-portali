import type { ReactNode } from 'react'
import { DragHandle, IconButton } from './Shell'

/**
 * Conwize "All projects" / "Bids" kart satırı:
 *  · sol: tutamaç + başlık + rozetler
 *  · sağ: aksiyonlar (Aç / ... / chevron)
 *  · alt: genişletilebilir detay şeridi
 */
export function EntityCard({
  title,
  badges,
  actions,
  detail,
  acik = false,
  onToggle,
  onOpen,
  className = '',
}: {
  title: ReactNode
  badges?: ReactNode
  actions?: ReactNode
  detail?: ReactNode
  acik?: boolean
  onToggle?: () => void
  onOpen?: () => void
  className?: string
}) {
  return (
    <article className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`}>
      <div className="flex items-center gap-3 px-5 py-4">
        <DragHandle />
        <button
          onClick={onOpen}
          className="min-w-0 flex-1 text-left font-heading text-[19px] leading-7 font-bold text-ink hover:underline"
        >
          {title}
        </button>


        {badges && <div className="flex shrink-0 flex-wrap items-center gap-2">{badges}</div>}

        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {onToggle && (
            <IconButton
              icon={acik ? 'chevron-up' : 'chevron-down'}
              label={acik ? 'Detayları gizle' : 'Detayları göster'}
              onClick={onToggle}
            />
          )}
        </div>
      </div>

      {acik && detail && (
        <div className="border-t border-border bg-surface-soft/60 px-5 py-5">{detail}</div>
      )}
    </article>
  )
}
