import { useId, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './FieldGroup.module.css';

export interface FieldGroupProps {
  /** Cerceve basligi (legend). */
  legend: ReactNode;
  /** Gruptaki tum kontrolleri devre disi birakir. */
  disabled?: boolean;
  /** Ek sinif. */
  className?: string;
  /** Icerik (`FieldRow` ogeleri). */
  children?: ReactNode;
}

/** Basligi cerceveye oturan, kutulu form bolumu (`<fieldset>`). */
export function FieldGroup({ legend, disabled, className, children }: FieldGroupProps): ReactElement {
  return (
    <fieldset className={cn(styles.group, className)} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.rows}>{children}</div>
    </fieldset>
  );
}

export interface FieldRowProps {
  /** Etiket. */
  label: ReactNode;
  /** Altta gosterilen aciklama. */
  hint?: ReactNode;
  /** Etiketi ustte gosterir. Varsayilan: `false` (solda). */
  stacked?: boolean;
  /** Ek sinif. */
  className?: string;
  /**
   * Kontrol. Fonksiyon verilirse etikete bagli `id` ile cagrilir
   * (`<Input id={id} />`); aksi halde etiket, icerigi sarmalayan `<label>` olur.
   */
  children: ReactNode | ((id: string) => ReactNode);
}

/** `Etiket | Kontrol` satiri. */
export function FieldRow({ label, hint, stacked = false, className, children }: FieldRowProps): ReactElement {
  const generatedId = `ark-field-${useId().replace(/:/g, '')}`;
  const hintId = `${generatedId}-hint`;
  const isRender = typeof children === 'function';

  const control = isRender ? children(generatedId) : children;

  return (
    <div className={cn(styles.row, stacked && styles.stacked, className)}>
      {isRender ? (
        <label className={styles.label} htmlFor={generatedId}>
          {label}
        </label>
      ) : (
        <span className={styles.label}>{label}</span>
      )}
      <div className={styles.control} aria-describedby={hint ? hintId : undefined}>
        {control}
        {hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
