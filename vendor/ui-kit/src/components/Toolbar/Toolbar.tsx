import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Toolbar.module.css';

export interface ToolbarProps {
  /** Erisilebilirlik etiketi. */
  'aria-label'?: string;
  /** Ek sinif. */
  className?: string;
  /** `ToolbarButton`, `ToolbarSeparator` ve `ToolbarSpacer` ogeleri. */
  children?: ReactNode;
}

/** Yatay arac cubugu. */
export function Toolbar({ 'aria-label': ariaLabel = 'Arac cubugu', className, children }: ToolbarProps): ReactElement {
  return (
    <div role="toolbar" aria-label={ariaLabel} className={cn(styles.toolbar, className)}>
      {children}
    </div>
  );
}

export type ToolbarTone = 'default' | 'primary' | 'danger' | 'success';

export interface ToolbarButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'title'> {
  /** Zorunlu: hem `aria-label` hem ipucu (title) olarak kullanilir. */
  label: string;
  /** Vurgu rengi. Varsayilan: `default`. */
  tone?: ToolbarTone;
  /** Basili (toggle) durum. */
  pressed?: boolean;
}

/** Arac cubugu ikon dugmesi. */
export function ToolbarButton({
  label,
  tone = 'default',
  pressed,
  type = 'button',
  className,
  children,
  ...rest
}: ToolbarButtonProps): ReactElement {
  return (
    <button
      {...rest}
      type={type}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      data-tone={tone}
      className={cn(styles.button, className)}
    >
      <span aria-hidden="true" className={styles.glyph}>
        {children}
      </span>
    </button>
  );
}

/** Dugme gruplari arasi dikey ayirac. */
export function ToolbarSeparator(): ReactElement {
  return <span role="separator" aria-orientation="vertical" className={styles.separator} />;
}

/** Sonraki ogeleri saga iter. */
export function ToolbarSpacer(): ReactElement {
  return <span aria-hidden="true" className={styles.spacer} />;
}
