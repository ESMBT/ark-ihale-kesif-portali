import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Menu, type MenuItem } from './Menu';
import styles from './Menu.module.css';

export interface MenuBarItem {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen metin. */
  label: ReactNode;
  /** Acilir menu ogeleri. Yoksa dugme dogrudan `onClick` cagirir. */
  items?: MenuItem[];
  /** Acilir menusu olmayan ogelerde tiklama. */
  onClick?: () => void;
  /** Devre disi birakir. */
  disabled?: boolean;
}

export interface MenuBarProps {
  /** Ust seviye ogeler. */
  items: MenuBarItem[];
  /** Acilir menudeki bir yaprak oge secildiginde cagrilir. */
  onItemSelect?: (item: MenuItem, parent: MenuBarItem) => void;
  /** Erisilebilirlik etiketi. */
  'aria-label'?: string;
  /** Ek sinif. */
  className?: string;
}

/** Pencere ustu menu cubugu (Duzen / Gorunum / Araclar). */
export function MenuBar({
  items,
  onItemSelect,
  'aria-label': ariaLabel = 'Menu cubugu',
  className,
}: MenuBarProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown, true);
    return () => document.removeEventListener('mousedown', handlePointerDown, true);
  }, [openId]);

  const close = (restoreFocus: boolean) => {
    const previous = openId;
    setOpenId(null);
    if (restoreFocus && previous) {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-bar-id="${CSS.escape(previous)}"]`)
        ?.focus();
    }
  };

  return (
    <div ref={rootRef} role="menubar" aria-label={ariaLabel} className={cn(styles.bar, className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const hasMenu = Boolean(item.items && item.items.length > 0);

        return (
          <div
            key={item.id}
            className={styles.barItem}
            onMouseEnter={() => {
              if (openId && hasMenu && !item.disabled) {
                setOpenId(item.id);
              }
            }}
          >
            <button
              type="button"
              role="menuitem"
              data-bar-id={item.id}
              aria-haspopup={hasMenu ? 'menu' : undefined}
              aria-expanded={hasMenu ? isOpen : undefined}
              disabled={item.disabled}
              className={styles.barButton}
              onClick={() => {
                if (hasMenu) {
                  setOpenId(isOpen ? null : item.id);
                } else {
                  item.onClick?.();
                }
              }}
              onKeyDown={(event) => {
                if (hasMenu && event.key === 'ArrowDown') {
                  event.preventDefault();
                  setOpenId(item.id);
                }
              }}
            >
              {item.label}
            </button>
            {isOpen && item.items ? (
              <div className={styles.dropdown}>
                <Menu
                  autoFocus
                  items={item.items}
                  aria-label={typeof item.label === 'string' ? item.label : undefined}
                  onItemSelect={(selected) => onItemSelect?.(selected, item)}
                  onClose={() => close(true)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
