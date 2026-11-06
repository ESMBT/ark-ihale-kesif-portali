import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '../../lib/cn';
import styles from './Menu.module.css';

export interface MenuItem {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen metin. */
  label?: ReactNode;
  /** Soldaki ikon alani. */
  icon?: ReactNode;
  /** Sagda gosterilen kisayol metni (or. `Ctrl+F`). */
  shortcut?: string;
  /** Devre disi birakir. */
  disabled?: boolean;
  /** Tanimliysa onay kutulu (checkable) oge olur. */
  checked?: boolean;
  /** Kirmizi vurgu (yikici eylem). */
  danger?: boolean;
  /** `true` ise yalnizca ayirac cizgisi cizilir. */
  separator?: boolean;
  /** `true` ise tiklanamayan grup basligi olur. */
  heading?: boolean;
  /** Alt menu ogeleri. */
  items?: MenuItem[];
  /** Secildiginde cagrilir. */
  onSelect?: () => void;
}

export interface MenuProps {
  /** Menu ogeleri. */
  items: MenuItem[];
  /** Herhangi bir (yaprak) oge secildiginde cagrilir. */
  onItemSelect?: (item: MenuItem) => void;
  /** Escape / Tab ya da oge secimi sonrasi kapanma istegi. */
  onClose?: () => void;
  /** Acilista ilk ogeye odaklan. Varsayilan: `false`. */
  autoFocus?: boolean;
  /** Erisilebilirlik etiketi. */
  'aria-label'?: string;
  /** Ek sinif. */
  className?: string;
}

interface MenuListProps extends MenuProps {
  depth: number;
  /** Alt menuden geri donus (ArrowLeft). */
  onExit?: () => void;
}

function MenuList({
  items,
  onItemSelect,
  onClose,
  onExit,
  autoFocus = false,
  depth,
  className,
  'aria-label': ariaLabel,
}: MenuListProps): ReactElement {
  const listRef = useRef<HTMLUListElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusChild, setFocusChild] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      listRef.current?.querySelector<HTMLButtonElement>(':scope > li > button:not(:disabled)')?.focus();
    }
  }, [autoFocus]);

  const buttons = (): HTMLButtonElement[] =>
    Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>(':scope > li > button:not(:disabled)') ?? []);

  const moveFocus = (target: 'next' | 'prev' | 'first' | 'last') => {
    const list = buttons();
    if (list.length === 0) {
      return;
    }
    const current = list.findIndex((button) => button === document.activeElement);
    let next = 0;
    if (target === 'next') {
      next = (current + 1) % list.length;
    } else if (target === 'prev') {
      next = (current - 1 + list.length) % list.length;
    } else if (target === 'last') {
      next = list.length - 1;
    }
    list[next]?.focus();
  };

  const activate = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }
    if (item.items && item.items.length > 0) {
      setOpenId(item.id);
      setFocusChild(true);
      return;
    }
    item.onSelect?.();
    onItemSelect?.(item);
    onClose?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        moveFocus('next');
        break;
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        moveFocus('prev');
        break;
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        moveFocus('first');
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        moveFocus('last');
        break;
      case 'ArrowRight': {
        const focused = items.find(
          (item) => (document.activeElement as HTMLElement | null)?.dataset.itemId === item.id,
        );
        if (focused?.items?.length && !focused.disabled) {
          event.preventDefault();
          event.stopPropagation();
          setOpenId(focused.id);
          setFocusChild(true);
        }
        break;
      }
      case 'ArrowLeft':
        if (depth > 0 && onExit) {
          event.preventDefault();
          event.stopPropagation();
          onExit();
        }
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        break;
      case 'Tab':
        onClose?.();
        break;
      default:
        break;
    }
  };

  return (
    <ul
      ref={listRef}
      role="menu"
      aria-label={ariaLabel}
      className={cn(styles.menu, depth > 0 && styles.submenu, className)}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        if (item.separator) {
          return <li key={item.id} role="separator" className={styles.separator} />;
        }
        if (item.heading) {
          return (
            <li key={item.id} role="presentation" className={styles.heading}>
              {item.label}
            </li>
          );
        }

        const hasSub = Boolean(item.items && item.items.length > 0);
        const isOpen = hasSub && openId === item.id;
        const checkable = item.checked !== undefined;

        return (
          <li
            key={item.id}
            role="none"
            className={styles.entry}
            onMouseEnter={() => {
              setFocusChild(false);
              setOpenId(hasSub && !item.disabled ? item.id : null);
            }}
          >
            <button
              type="button"
              role={checkable ? 'menuitemcheckbox' : 'menuitem'}
              aria-checked={checkable ? item.checked : undefined}
              aria-haspopup={hasSub ? 'menu' : undefined}
              aria-expanded={hasSub ? isOpen : undefined}
              data-item-id={item.id}
              data-danger={item.danger || undefined}
              disabled={item.disabled}
              className={cn(styles.item, isOpen && styles.open)}
              onClick={() => activate(item)}
            >
              <span className={styles.icon} aria-hidden="true">
                {checkable ? (item.checked ? '✓' : '') : item.icon}
              </span>
              <span className={styles.label}>{item.label}</span>
              {item.shortcut && !hasSub ? <kbd className={styles.shortcut}>{item.shortcut}</kbd> : null}
              {hasSub ? (
                <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M3 1.5L6.5 5L3 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </button>
            {isOpen && item.items ? (
              <MenuList
                items={item.items}
                depth={depth + 1}
                autoFocus={focusChild}
                aria-label={typeof item.label === 'string' ? item.label : undefined}
                onItemSelect={onItemSelect}
                onClose={onClose}
                onExit={() => {
                  setOpenId(null);
                  setFocusChild(false);
                  listRef.current
                    ?.querySelector<HTMLButtonElement>(`[data-item-id="${CSS.escape(item.id)}"]`)
                    ?.focus();
                }}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Alt menulu, klavye ile gezilebilen menu paneli (WAI-ARIA `menu` pattern).
 * Konumlandirma `ContextMenu` ve `MenuBar` tarafindan yapilir.
 */
export function Menu(props: MenuProps): ReactElement {
  return <MenuList {...props} depth={0} />;
}
