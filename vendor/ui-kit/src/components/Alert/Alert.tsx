import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Varyant. Varsayilan: `info`. */
  variant?: AlertVariant;
  /** Baslik. */
  title?: ReactNode;
  /** Kapatma butonu gosterilsin mi. */
  dismissible?: boolean;
  /** Kapatildiginda cagrilir. */
  onDismiss?: () => void;
  /** Ek sinif. */
  className?: string;
  /** Uyari icerigi. */
  children?: ReactNode;
}

const ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '!',
  danger: '×',
};

/** Ucari veya bilgilendirme kutusu. */
export function Alert({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps): ReactElement {
  const isAssertive = variant === 'danger' || variant === 'warning';

  return (
    <div
      {...rest}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      data-variant={variant}
      className={cn(styles.alert, styles[variant], className)}
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[variant]}
      </span>
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.message}>{children}</div> : null}
      </div>
      {dismissible ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Kapat">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
