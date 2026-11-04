import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export type Secenek = { deger: string; etiket: string; alt?: string }

/**
 * Çoklu seçim — birden fazla kişi seçilebilen alanlar için.
 * Seçilenler etiket (chip) olarak görünür, açılır listeden kaldırılabilir.
 */
export function MultiSelect({
  secenekler,
  degerler,
  onChange,
  placeholder = 'Seçiniz…',
  disabled,
}: {
  secenekler: Secenek[]
  degerler: string[]
  onChange: (yeni: string[]) => void
  placeholder?: string
  disabled?: boolean
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

  const secili = secenekler.filter((s) => degerler.includes(s.deger))

  const toggle = (deger: string) =>
    onChange(degerler.includes(deger) ? degerler.filter((d) => d !== deger) : [...degerler, deger])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAcik((v) => !v)}
        className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-left transition-colors focus:border-black disabled:bg-surface-muted disabled:text-gray"
      >
        {secili.length === 0 ? (
          <span className="text-[16px] text-gray">{placeholder}</span>
        ) : (
          secili.map((s) => (
            <span
              key={s.deger}
              className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-1 text-[13px] text-ink"
            >
              {s.etiket}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(s.deger)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    toggle(s.deger)
                  }
                }}
                className="text-gray hover:text-black"
                aria-label={`${s.etiket} seçimini kaldır`}
              >
                <Icon name="x" size={12} />
              </span>
            </span>
          ))
        )}
        <Icon name="chevron-down" size={15} className="ml-auto shrink-0 text-gray" />
      </button>

      {acik && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-lg">
          {secenekler.map((s) => {
            const isSecili = degerler.includes(s.deger)
            return (
              <button
                key={s.deger}
                type="button"
                onClick={() => toggle(s.deger)}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[14px] hover:bg-surface-muted"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                    isSecili ? 'border-black bg-black' : 'border-line'
                  }`}
                >
                  {isSecili && <Icon name="check" size={11} className="text-white" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 truncate">{s.etiket}</span>
                {s.alt && <span className="shrink-0 text-[12px] text-gray">{s.alt}</span>}
              </button>
            )
          })}
          {secenekler.length === 0 && (
            <p className="px-4 py-3 text-[13px] text-muted-foreground">Kayıt bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  )
}
