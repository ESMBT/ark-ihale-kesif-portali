import { useId, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Switch.module.css';

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps {
  /** Kontrol etiketi. */
  label: ReactNode;
  /** Etiketin altindaki aciklama. */
  description?: string;
  /** Secili durumu (kontrollu). */
  checked: boolean;
  /** Durum degisince cagrilir. */
  onCheckedChange?: (checked: boolean) => void;
  /** Devre disi birakir. */
  disabled?: boolean;
  /** Boyut. Varsayilan: `md`. */
  size?: SwitchSize;
  /** Ek sinif. */
  className?: string;
}

/** `role="switch"` butonu olarak uygulanan acik/kapali kontrol. */
export function Switch({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  className,
}: SwitchProps): ReactElement {
  const generatedId = useId().replace(/:/g, '');
  const labelId = `ark-switch-${generatedId}-label`;
  const descriptionId = `ark-switch-${generatedId}-description`;

  const describedBy = description ? descriptionId : undefined;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onCheckedChange?.(!checked);
  };

  return (
    <span
      className={cn(styles.field, disabled && styles.disabled, className)}
      data-disabled={disabled || undefined}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={handleClick}
        data-size={size}
        data-state={checked ? 'checked' : 'unchecked'}
        className={cn(styles.track, styles[size], checked && styles.checked)}
      >
        <span className={styles.thumb} />
      </button>
      <span className={styles.body}>
        <span className={styles.label} id={labelId}>
          {label}
        </span>
        {description ? (
          <span className={styles.description} id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </span>
  );
}
