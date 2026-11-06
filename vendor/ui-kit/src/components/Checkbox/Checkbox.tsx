import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Kontrol etiketi. */
  label: ReactNode;
  /** Etiketin altindaki aciklama. */
  description?: string;
  /** Hata mesaji. */
  error?: string;
  /** Kismi secim durumu. */
  indeterminate?: boolean;
  /** Ek sinif. */
  className?: string;
}

/** Onay kutusu. */
export function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  disabled = false,
  id,
  className,
  ...rest
}: CheckboxProps): ReactElement {
  const generatedId = useId().replace(/:/g, '');
  const checkboxId = id ?? `ark-checkbox-${generatedId}`;
  const descriptionId = `${checkboxId}-description`;
  const errorId = `${checkboxId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const describedBy =
    [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={cn(styles.field, disabled && styles.disabled, className)}
      data-disabled={disabled || undefined}
    >
      <input
        {...rest}
        ref={inputRef}
        id={checkboxId}
        type="checkbox"
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-checked={indeterminate ? 'mixed' : undefined}
        data-indeterminate={indeterminate || undefined}
        className={cn(styles.control, error && styles.invalid)}
      />
      <div className={styles.body}>
        <label className={styles.label} htmlFor={checkboxId}>
          {label}
        </label>
        {description ? (
          <span className={styles.description} id={descriptionId}>
            {description}
          </span>
        ) : null}
        {error ? (
          <span className={styles.error} id={errorId} role="alert">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
