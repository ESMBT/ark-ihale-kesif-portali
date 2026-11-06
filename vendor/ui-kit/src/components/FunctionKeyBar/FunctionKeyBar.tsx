import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './FunctionKeyBar.module.css';

export type FunctionKeyTone = 'default' | 'accent' | 'danger';

export interface FunctionKey {
  /** Benzersiz kimlik. */
  id: string;
  /** Tus etiketi (or. `F12`). */
  keyLabel: string;
  /** Eylem adi. */
  label: ReactNode;
  /** Vurgu rengi. Varsayilan: `default`. */
  tone?: FunctionKeyTone;
  /** Devre disi birakir. */
  disabled?: boolean;
  /** Tiklama. */
  onClick?: () => void;
}

export interface FunctionKeyBarProps {
  /** Sagdaki fonksiyon tuslari. */
  keys: FunctionKey[];
  /** Soldaki alan (sayfalayici, yol bilgisi). */
  leading?: ReactNode;
  /** Ek sinif. */
  className?: string;
}

/**
 * Pencere altindaki F-tus eylem cubugu. Bilgi solda, eylemler sagdadir.
 * Gercek klavye kisayollari uygulamanin sorumlulugundadir.
 */
export function FunctionKeyBar({ keys, leading, className }: FunctionKeyBarProps): ReactElement {
  return (
    <div className={cn(styles.bar, className)}>
      {leading ? <div className={styles.leading}>{leading}</div> : null}
      <span className={styles.spacer} />
      <div className={styles.keys} role="toolbar" aria-label="Fonksiyon tuslari">
        {keys.map((key) => (
          <button
            key={key.id}
            type="button"
            disabled={key.disabled}
            data-tone={key.tone ?? 'default'}
            className={styles.key}
            onClick={key.onClick}
          >
            <kbd className={styles.kbd}>{key.keyLabel}</kbd>
            <span>{key.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
