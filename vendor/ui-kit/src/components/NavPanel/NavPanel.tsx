import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './NavPanel.module.css';

export interface NavPanelItem {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen metin. */
  label: ReactNode;
  /** Devre disi birakir. */
  disabled?: boolean;
}

export interface NavPanelGroup {
  /** Benzersiz kimlik. */
  id: string;
  /** Grup basligi. */
  title: ReactNode;
  /** Gruptaki ogeler. */
  items: NavPanelItem[];
}

export interface NavPanelProps {
  /** Sol gezinme gruplari. */
  groups: NavPanelGroup[];
  /** Secili oge. */
  value: string;
  /** Oge secildiginde cagrilir. */
  onValueChange: (id: string) => void;
  /** Ogeleri 1, 2, 3... diye numaralandirir. Varsayilan: `true`. */
  numbered?: boolean;
  /** Sol sutun genisligi (px). Varsayilan: `240`. */
  navWidth?: number;
  /** Gezinme alani icin erisilebilirlik etiketi. */
  'aria-label'?: string;
  /** Sagdaki calisma paneli icerigi. */
  children?: ReactNode;
  /** Ek sinif. */
  className?: string;
}

/**
 * Soldan gruplu/numarali gezinme, sagda calisma paneli olan ayar yerlesimi.
 * `Modal` icinde ya da sayfa govdesinde kullanilabilir.
 */
export function NavPanel({
  groups,
  value,
  onValueChange,
  numbered = true,
  navWidth = 240,
  'aria-label': ariaLabel = 'Ayar bolumleri',
  children,
  className,
}: NavPanelProps): ReactElement {
  let counter = 0;

  return (
    <div className={cn(styles.panel, className)} style={{ gridTemplateColumns: `${navWidth}px minmax(0, 1fr)` }}>
      <nav className={styles.nav} aria-label={ariaLabel}>
        {groups.map((group) => (
          <div key={group.id} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <ul className={styles.list}>
              {group.items.map((item) => {
                counter += 1;
                const active = item.id === value;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={item.disabled}
                      aria-current={active ? 'page' : undefined}
                      className={cn(styles.item, active && styles.active)}
                      onClick={() => onValueChange(item.id)}
                    >
                      {numbered ? <span className={styles.number}>{counter}</span> : null}
                      <span className={styles.itemLabel}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <section className={styles.content}>{children}</section>
    </div>
  );
}
