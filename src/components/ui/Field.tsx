import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/* Formlar panosu: beyaz zemin · #D2D2D2 çizgi · 8px köşe · 44px yükseklik */
const baseControl =
  'w-full rounded-md border border-line bg-white px-3 text-ink outline-none transition-colors placeholder:text-gray focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-surface-muted disabled:text-gray'

type FieldProps = {
  label: ReactNode
  required?: boolean
  hint?: ReactNode
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, required, hint, error, children, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1 text-[14px] leading-5 text-black">
        {label}
        {required && <span className="text-danger-d">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] leading-4 text-danger-d">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12px] leading-4 text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  )
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseControl} h-11 text-[16px] leading-6 ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${baseControl} h-11 text-[16px] leading-6 appearance-none pr-9 ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseControl} min-h-24 py-3 text-[16px] leading-6 ${className}`} {...rest} />
}

export function Checkbox({
  label,
  description,
  className = '',
}: {
  label: string
  description?: string
  className?: string
}) {
  return (
    <label className={`flex cursor-pointer items-start gap-2.5 ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-line accent-black"
      />
      <span>
        <span className="block text-[14px] leading-5 text-black">{label}</span>
        {description && <span className="mt-0.5 block text-[12px] leading-4 text-muted-foreground">{description}</span>}
      </span>
    </label>
  )
}
