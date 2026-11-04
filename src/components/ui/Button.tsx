import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'success' | 'brand'
type Size = 'sm' | 'md' | 'lg'

/* Buton panosu: Default (siyah) · Hover (#2C2C2C) · Pressed · Focus · Disabled (#DFE1E2) */
const variants: Record<Variant, string> = {
  primary:
    'bg-black text-white hover:bg-ink active:bg-ink disabled:bg-line-faint disabled:text-gray shadow-sm',
  secondary:
    'bg-white text-black border border-line hover:bg-surface-muted active:bg-line-faint disabled:text-gray disabled:bg-surface-muted',
  ghost:
    'bg-transparent text-ink hover:bg-surface-muted disabled:text-gray',
  danger:
    'bg-danger-d text-white hover:opacity-90 shadow-sm disabled:opacity-40',
  success:
    'bg-success-d text-white hover:opacity-90 shadow-sm disabled:bg-line-faint disabled:text-gray',
  brand:
    'bg-success text-white hover:bg-success-d shadow-sm disabled:bg-line-faint disabled:text-gray',
  link: 'bg-transparent text-black underline underline-offset-4 hover:text-ink',
}

/* Normal 18/24 · Medium 16/20 · Small 14/16 */
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[14px] leading-4 gap-1.5 rounded-md',
  md: 'h-11 px-4 text-[16px] leading-5 gap-2 rounded-md',
  lg: 'h-12 px-6 text-[18px] leading-6 gap-2 rounded-md',
}

type BaseProps = {
  variant?: Variant
  size?: Size
  icon?: string
  iconRight?: string
  children?: ReactNode
  to?: string
  full?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  children,
  to,
  full,
  className = '',
  ...rest
}: BaseProps) {
  const cls = [
    'inline-flex items-center justify-center font-normal transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
    'disabled:pointer-events-none whitespace-nowrap',
    variants[variant],
    sizes[size],
    full ? 'w-full' : '',
    className,
  ].join(' ')

  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  }

  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  )
}
