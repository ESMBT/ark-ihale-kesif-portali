import { useId, type InputHTMLAttributes, type ReactElement } from 'react';

import { cn } from '../../lib/cn';
import fieldStyles from '../../styles/field.module.css';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Etiket metni; `<label htmlFor>` ile baglanir. */
  label?: string;
  /** Hata mesaji. Varsa `aria-invalid` ve `aria-describedby` baglanir. */
  error?: string;
  /** Ipucu metni. */
  hint?: string;
  /** Kontrol yuksekligi. Varsayilan: `md`. */
  size?: InputSize;
  /** Kontrol `id`'si. Verilmezse `useId` ile uretilir. */
  id?: string;
  /** Ek sinif. */
  className?: string;
}

/** Tek satirlik metin girisi. */
export function Input({
  label,
  error,
  hint,
  size = 'md',
  id,
  className,
  required,
  ...rest
}: InputProps): ReactElement {
  const generatedId = useId().replace(/:/g, '');
  const inputId = id ?? `ark-input-${generatedId}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn(fieldStyles.field, className)}>
      {label ? (
        <label className={fieldStyles.label} htmlFor={inputId}>
          {label}
          {required ? (
            <span className={fieldStyles.required} aria-hidden="true">
              {' *'}
            </span>
          ) : null}
        </label>
      ) : null}
      <input
        {...rest}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-size={size}
        className={cn(styles.control, styles[size], error && styles.invalid)}
      />
      {hint ? (
        <p className={fieldStyles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={fieldStyles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
