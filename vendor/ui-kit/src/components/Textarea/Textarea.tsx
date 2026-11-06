import { useId, type ReactElement, type TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';
import fieldStyles from '../../styles/field.module.css';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Etiket metni; `<label htmlFor>` ile baglanir. */
  label?: string;
  /** Hata mesaji. Varsa `aria-invalid` ve `aria-describedby` baglanir. */
  error?: string;
  /** Ipucu metni. */
  hint?: string;
  /** Satir sayisi. Varsayilan: 3. */
  rows?: number;
  /** Ek sinif. */
  className?: string;
}

/** Cok satirli metin girisi. */
export function Textarea({
  label,
  error,
  hint,
  rows = 3,
  id,
  className,
  required,
  ...rest
}: TextareaProps): ReactElement {
  const generatedId = useId().replace(/:/g, '');
  const textareaId = id ?? `ark-textarea-${generatedId}`;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn(fieldStyles.field, className)}>
      {label ? (
        <label className={fieldStyles.label} htmlFor={textareaId}>
          {label}
          {required ? (
            <span className={fieldStyles.required} aria-hidden="true">
              {' *'}
            </span>
          ) : null}
        </label>
      ) : null}
      <textarea
        {...rest}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(styles.control, error && styles.invalid)}
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
