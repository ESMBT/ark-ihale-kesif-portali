import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './StatusBar.module.css';

export interface StatusBarProps {
  /** Durum ogeleri (`StatusBarItem`) ve ek icerik. */
  children?: ReactNode;
  /** Ek sinif. */
  className?: string;
}

/** Pencere altindaki durum satiri ("Paket: Bagli", "Varsayilan ticaret: ..."). */
export function StatusBar({ children, className }: StatusBarProps): ReactElement {
  return (
    <div role="status" className={cn(styles.bar, className)}>
      {children}
    </div>
  );
}

export type StatusBarTone = 'default' | 'success' | 'warning' | 'danger';

export interface StatusBarItemProps {
  /** Etiket (soluk). */
  label?: ReactNode;
  /** Deger (kalin). */
  children?: ReactNode;
  /** Deger rengi. Varsayilan: `default`. */
  tone?: StatusBarTone;
}

/** `etiket: deger` ciftini gosterir. */
export function StatusBarItem({ label, children, tone = 'default' }: StatusBarItemProps): ReactElement {
  return (
    <span className={styles.item}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <strong className={styles.value} data-tone={tone}>
        {children}
      </strong>
    </span>
  );
}

/** Sonraki ogeleri saga iter. */
export function StatusBarSpacer(): ReactElement {
  return <span aria-hidden="true" className={styles.spacer} />;
}
