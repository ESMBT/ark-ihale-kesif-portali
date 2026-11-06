import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Badge.module.css';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Varyant. Varsayilan: `neutral`. */
  variant?: BadgeVariant;
  /** Boyut. Varsayilan: `md`. */
  size?: BadgeSize;
  /** Ek sinif. */
  className?: string;
  /** Rozet icerigi. */
  children?: ReactNode;
}

/** Durum rozeti. */
export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...rest
}: BadgeProps): ReactElement {
  return (
    <span
      {...rest}
      data-variant={variant}
      data-size={size}
      className={cn(styles.badge, styles[variant], styles[size], className)}
    >
      {children}
    </span>
  );
}
