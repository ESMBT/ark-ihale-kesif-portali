import type { ReactNode } from 'react'
import { Icon } from './Icon'

type CardProps = {
  children: ReactNode
  className?: string
  padded?: boolean
  id?: string
}

export function Card({ children, className = '', padded = true, id }: CardProps) {
  return (
    <div id={id} className={`card ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}

type CardHeaderProps = {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: string
  className?: string
}

export function CardHeader({ title, description, action, icon, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink">
            <Icon name={icon} size={17} />
          </span>
        )}
        <div className="min-w-0">
          <h4 className="text-[20px] leading-7">{title}</h4>
          {description && <p className="mt-1 text-[14px] leading-5 text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
