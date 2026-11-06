import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './ProgressBar.module.css';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md';

export interface ProgressBarProps {
  /** Mevcut deger. */
  value: number;
  /** En yuksek deger. Varsayilan: `100`. */
  max?: number;
  /** Renk. Varsayilan: `primary`. */
  tone?: ProgressTone;
  /** Boyut. Varsayilan: `md`. */
  size?: ProgressSize;
  /** Erisilebilirlik etiketi (gorsel etiket yoksa zorunlu kabul edilir). */
  'aria-label'?: string;
  /** Cubugun solundaki gorsel etiket. */
  label?: ReactNode;
  /** Yuzdeyi saga yazar. Varsayilan: `true`. */
  showValue?: boolean;
  /** Ek sinif. */
  className?: string;
}

/** Yatay ilerleme cubugu (butce / hakedis gerceklesmesi). */
export function ProgressBar({
  value,
  max = 100,
  tone = 'primary',
  size = 'md',
  'aria-label': ariaLabel,
  label,
  showValue = true,
  className,
}: ProgressBarProps): ReactElement {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = (clamped / safeMax) * 100;
  const overflow = value > safeMax;

  return (
    <div className={cn(styles.wrapper, className)}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-label={ariaLabel}
        data-size={size}
        data-tone={overflow ? 'danger' : tone}
        className={styles.track}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      {showValue ? (
        <span className={cn(styles.value, overflow && styles.over)}>%{Math.round((value / safeMax) * 100)}</span>
      ) : null}
    </div>
  );
}
