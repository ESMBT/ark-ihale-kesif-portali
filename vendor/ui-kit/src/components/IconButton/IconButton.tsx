import type { ButtonHTMLAttributes, ReactElement } from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner/Spinner';
import type { ButtonSize, ButtonVariant } from '../Button/Button';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Gorsel stil. Varsayilan: `secondary`. */
  variant?: ButtonVariant;
  /** Boyut. Varsayilan: `md`. */
  size?: ButtonSize;
  /** Yukle durumu; butonu devre disi birakir ve spinner gosterir. */
  loading?: boolean;
  /** Zorunlu: ikon-only butonun erisilebilir adi. */
  'aria-label': string;
  /** Ek sinif. */
  className?: string;
}

/** Kare, yalnizca ikon iceren buton. */
export function IconButton({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps): ReactElement {
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
      className={cn(styles.button, styles[variant], styles[size], loading && styles.loading, className)}
    >
      {loading ? (
        <Spinner size={size} label="Yukleniyor" />
      ) : (
        <span aria-hidden="true" className={styles.content}>
          {children}
        </span>
      )}
    </button>
  );
}
