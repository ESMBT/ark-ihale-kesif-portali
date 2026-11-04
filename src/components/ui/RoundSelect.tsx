import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export type RoundOption = {
  tur: number
  /** Tur durumu etiketi */
  etiket: string
  /** Tur kapanış notu (varsa) */
  not?: string
  aktif?: boolean
}

/**
 * Tur seçici — paket başlığındaki "N. tur" rozeti.
 * Açılınca eski turlar ve kapanış notları listelenir.
 */
export function RoundSelect({
  rounds,
  value,
  onSelect,
}: {
  rounds: RoundOption[]
  value: number
  onSelect: (tur: number) => void
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

  const aktif = rounds.find((r) => r.tur === value) ?? rounds[rounds.length - 1]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAcik((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-info-soft-2 bg-info-bg px-3 py-1.5 text-[13px] leading-5 font-medium text-info transition-colors hover:brightness-95"
        aria-haspopup="listbox"
        aria-expanded={acik}
      >
        <span className="h-2 w-2 rounded-full bg-info" />
        {aktif?.tur}. Tur
        <Icon name="chevron-down" size={14} />
      </button>

      {acik && (
        <div
          role="listbox"
          className="absolute left-0 top-11 z-30 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">Turlar</span>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {[...rounds].reverse().map((r) => (
              <li key={r.tur}>
                <button
                  role="option"
                  aria-selected={r.tur === value}
                  onClick={() => {
                    onSelect(r.tur)
                    setAcik(false)
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted ${
                    r.tur === value ? 'bg-info-bg' : ''
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-ink">
                    {r.tur}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-foreground">{r.tur}. Tur</span>
                      {r.aktif && (
                        <span className="rounded-full bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Aktif
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">{r.etiket}</span>
                    {r.not && (
                      <span className="mt-1 block text-[12px] leading-4 text-muted-foreground">“{r.not}”</span>
                    )}
                  </span>
                  {r.tur === value && <Icon name="check" size={15} className="mt-1 shrink-0 text-ink" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
