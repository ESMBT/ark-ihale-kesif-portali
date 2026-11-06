import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './ModuleNav.module.css';

export interface ModuleNavItem {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen metin. */
  label: ReactNode;
  /** Devre disi birakir. */
  disabled?: boolean;
}

export interface ModuleNavProps {
  /** Marka / logo alani (ilk sekme gibi gorunur). */
  brand?: ReactNode;
  /** Ust seviye modul sekmeleri. */
  modules: ModuleNavItem[];
  /** Secili modul. */
  value: string;
  /** Modul secildiginde cagrilir. */
  onValueChange: (id: string) => void;
  /** Modul sekmelerinin sagindaki ogeler (Yardimlar, surum...). */
  trailing?: ReactNode;
  /** Secili modulun alt gezinme ogeleri. */
  subItems?: ModuleNavItem[];
  /** Secili alt oge. */
  subValue?: string;
  /** Alt oge secildiginde cagrilir. */
  onSubValueChange?: (id: string) => void;
  /** Alt gezinme satirinin sagindaki alan (ana belge secimi...). */
  subTrailing?: ReactNode;
  /** Ucuncu satir: hizli baslatma arac cubugu. */
  toolbar?: ReactNode;
  /** Erisilebilirlik etiketi. */
  'aria-label'?: string;
  /** Ek sinif. */
  className?: string;
}

/**
 * Uygulamanin ust gezinme cubugu: modul sekmeleri, secili modulun alt
 * gezinmesi ve istege bagli hizli baslatma arac cubugu.
 */
export function ModuleNav({
  brand,
  modules,
  value,
  onValueChange,
  trailing,
  subItems,
  subValue,
  onSubValueChange,
  subTrailing,
  toolbar,
  'aria-label': ariaLabel = 'Ana gezinme',
  className,
}: ModuleNavProps): ReactElement {
  return (
    <nav className={cn(styles.nav, className)} aria-label={ariaLabel}>
      <div className={styles.top}>
        {brand ? <div className={styles.brand}>{brand}</div> : null}
        <div className={styles.tabs}>
          {modules.map((item) => {
            const active = item.id === value;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                aria-current={active ? 'page' : undefined}
                className={cn(styles.tab, active && styles.active)}
                onClick={() => onValueChange(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      </div>

      {subItems && subItems.length > 0 ? (
        <div className={styles.sub}>
          <div className={styles.subItems}>
            {subItems.map((item) => {
              const active = item.id === subValue;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  aria-current={active ? 'true' : undefined}
                  className={cn(styles.subItem, active && styles.subActive)}
                  onClick={() => onSubValueChange?.(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {subTrailing ? <div className={styles.subTrailing}>{subTrailing}</div> : null}
        </div>
      ) : null}

      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
    </nav>
  );
}
