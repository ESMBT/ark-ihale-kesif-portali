import type { ReactElement } from 'react';

import { cn } from '../../lib/cn';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Boyut. */
  size?: SpinnerSize;
  /**
   * Ekran okuyucu icin etiket. Verilirse metin gorsel olarak gizlenir,
   * verilmezse spinner tamamen dekoratif sayilir.
   */
  label?: string;
  /** Ek sinif. */
  className?: string;
}

/**
 * Yukleme gostergesi.
 *
 * Figma "Design System" -> spinner component set: 40x40, 1px kalinlikta
 * track (#DFE1E2) ve `currentColor` tonunda hareketli yay.
 */
export function Spinner({ size = 'md', label, className }: SpinnerProps): ReactElement {
  const labelled = Boolean(label);

  return (
    <span
      className={cn(styles.spinner, styles[size], className)}
      role={labelled ? 'status' : undefined}
      aria-live={labelled ? 'polite' : undefined}
      aria-hidden={labelled ? undefined : true}
      data-size={size}
    >
      <svg
        className={styles.circle}
        viewBox="0 0 40 40"
        focusable="false"
        aria-hidden="true"
        data-testid="ark-spinner"
      >
        <circle
          className={styles.track}
          cx="20"
          cy="20"
          r="19.5"
          fill="none"
          strokeWidth="1"
        />
        <circle
          className={styles.arc}
          cx="20"
          cy="20"
          r="19.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="30 93"
          transform="rotate(-90 20 20)"
        />
      </svg>
      {labelled ? <span className={styles.label}>{label}</span> : null}
    </span>
  );
}
