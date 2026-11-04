import { useRef, useState } from 'react'
import { Icon } from './Icon'

export function FileDrop({
  label = 'Dosyaları buraya sürükleyin veya seçmek için tıklayın',
  hint = 'PDF, DOCX, XLSX, ZIP · Dosya başına en fazla 25 MB',
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.png',
  compact = false,
  onFiles,
}: {
  label?: string
  hint?: string
  accept?: string
  compact?: boolean
  onFiles?: (files: File[]) => void
}) {
  const [files, setFiles] = useState<{ name: string; size: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const add = (fileList: FileList | null) => {
    if (!fileList) return
    const incoming = Array.from(fileList).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
    }))
    setFiles((prev) => [...prev, ...incoming])
    onFiles?.(Array.from(fileList))
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          add(e.dataTransfer.files)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-muted text-center transition-colors hover:border-black ${
          compact ? 'px-4 py-4' : 'px-6 py-8'
        }`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink">
          <Icon name="upload" size={17} />
        </span>
        <p className="mt-2 text-[13px] font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          add(e.target.files)
          e.target.value = ''
        }}
      />
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon name="file-text" size={14} className="shrink-0 text-muted-foreground" />
                <span className="truncate">{f.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-[12px] text-muted-foreground">{f.size}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }}
                  className="text-muted-foreground hover:text-black"
                  aria-label="Dosyayı kaldır"
                >
                  <Icon name="x" size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
