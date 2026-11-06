import { useId, type ReactElement, type SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';
import fieldStyles from '../../styles/field.module.css';
import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> {
  /** Etiket metni; `<label htmlFor>` ile baglanir. */
  label?: string;
  /** Hata mesaji. Varsa `aria-invalid` ve `aria-describedby` baglanir. */
  error?: string;
  /** Ipucu metni. */
  hint?: string;
  /** Secenek listesi. */
  options: SelectOption[];
  /** Secilmemis durumda gosterilen, secilemeyen ilk secenek. */
  placeholder?: string;
  /** Kontrol yuksekligi. Varsayilan: `md`. */
  size?: SelectSize;
  /** Kontrol `id`'si. Verilmezse `useId` ile uretilir. */
  id?: string;
  /** Ek sinif. */
  className?: string;
}

/** Yerel `<select>` tabanli acilir liste. */
export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  size = 'md',
  id,
  className,
  required,
  ...rest
}: SelectProps): ReactElement {
  const generatedId = useId().replace(/:/g, '');
  const selectId = id ?? `ark-select-${generatedId}`;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn(fieldStyles.field, className)}>
      {label ? (
        <label className={fieldStyles.label} htmlFor={selectId}>
          {label}
          {required ? (
            <span className={fieldStyles.required} aria-hidden="true">
              {' *'}
            </span>
          ) : null}
        </label>
      ) : null}
      <select
        {...rest}
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-size={size}
        className={cn(styles.control, styles[size], error && styles.invalid)}
      >
        {placeholder ? (
          <option value="" disabled={required ? undefined : true}>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
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
