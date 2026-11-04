import { useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

/* ---------------------------------------------------------------- */
/*  DropZone — mavi kesikli büyük yükleme alanı                       */
/* ---------------------------------------------------------------- */

export function DropZone({
  baslik = 'Belgeleri sürükleyerek veya buraya tıklayarak ekleyin',
  ipucu = 'PDF, DOCX, XLSX, ZIP · Dosya başına en fazla 50 MB',
  onFiles,
}: {
  baslik?: string
  ipucu?: string
  onFiles?: (files: File[]) => void
}) {
  const [aktif, setAktif] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setAktif(true)
      }}
      onDragLeave={() => setAktif(false)}
      onDrop={(e) => {
        e.preventDefault()
        setAktif(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) onFiles?.(files)
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        aktif ? 'border-info bg-info-bg' : 'border-info-soft-2 bg-info-bg/40'
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-sm">
        <Icon name="upload" size={22} />
      </span>
      <p className="text-[16px] font-bold text-info">{baslik}</p>
      <p className="text-[13px] text-muted-foreground">{ipucu}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.dwg,.jpg,.png"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) onFiles?.(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*  SplitPane — sol klasör paneli + sağ içerik                        */
/* ---------------------------------------------------------------- */

export function SplitPane({
  solBaslik,
  solIkonlar,
  solIstatistik,
  solCocuklar,
  sagBaslik,
  sagIkonlar,
  children,
  solGenislik = 'w-[320px]',
}: {
  solBaslik: string
  solIkonlar?: ReactNode
  solIstatistik?: ReactNode
  solCocuklar?: ReactNode
  sagBaslik?: ReactNode
  sagIkonlar?: ReactNode
  children: ReactNode
  solGenislik?: string
}) {
  return (
    <div className="flex min-h-[520px] overflow-hidden rounded-2xl border border-border bg-surface">
      <aside className={`${solGenislik} shrink-0 border-r border-border bg-surface-soft/40 p-5`}>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[17px] leading-6">{solBaslik}</h4>
          {solIkonlar && <div className="flex items-center gap-1">{solIkonlar}</div>}
        </div>

        {solIstatistik && <div className="mt-4">{solIstatistik}</div>}
        <div className="mt-5 space-y-1">{solCocuklar}</div>
      </aside>

      <section className="min-w-0 flex-1 p-5">
        {sagBaslik && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-[15px] font-medium text-muted-foreground">{sagBaslik}</h4>
            {sagIkonlar && <div className="flex items-center gap-1">{sagIkonlar}</div>}
          </div>
        )}
        {children}
      </section>
    </div>
  )
}
