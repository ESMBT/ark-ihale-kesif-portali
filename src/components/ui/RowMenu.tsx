import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export type MenuItem = {
  label: string
  icon: string
  onSelect?: () => void
  /** Soru işareti — henüz ekranı olmayan aksiyonlar için */
  soru?: boolean
  danger?: boolean
}

/** Satır sonundaki "⋮" menüsü */
export function RowMenu({ items, label = 'Daha fazla işlem' }: { items: MenuItem[]; label?: string }) {
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
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setAcik((v) => !v)
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-surface-muted"
        aria-label={label}
        title={label}
      >
        <Icon name="more-horizontal" size={16} />
      </button>

      {acik && (
        <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation()
                setAcik(false)
                item.onSelect?.()
              }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-surface-muted ${
                item.danger ? 'text-danger-d' : 'text-ink'
              }`}
            >
              <Icon name={item.icon} size={16} className={item.danger ? 'text-danger-d' : 'text-gray'} />
              {item.label}
              {item.soru && <Icon name="help" size={13} className="ml-auto text-gray" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
