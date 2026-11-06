import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Gorsel stil. Varsayilan: `primary`. */
  variant?: ButtonVariant;
  /** Boyut. Varsayilan: `md`. */
  size?: ButtonSize;
  /** Yukle durumu; butonu devre disi birakir ve spinner gosterir. */
  loading?: boolean;
  /** Butonu kabin genisligine yayar. */
  fullWidth?: boolean;
  /** Buton metninin solundaki ikon. */
  leftIcon?: ReactNode;
  /** Buton metninin sagindaki ikon. */
  rightIcon?: ReactNode;
  /** Ek sinif. */
  className?: string;
}

/** Aksiyon butonu. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
    >
      {loading ? (
        <Spinner size={size} label="Yukleniyor" />
      ) : (
        leftIcon && <span className={styles.content} aria-hidden="true">{leftIcon}</span>
      )}
      {children ? <span className={styles.content}>{children}</span> : null}
      {!loading && rightIcon ? (
        <span className={styles.content} aria-hidden="true">{rightIcon}</span>
      ) : null}
    </button>
  );
}
