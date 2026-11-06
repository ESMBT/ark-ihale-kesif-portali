import { useId, useRef, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Tabs.module.css';

export interface TabItem {
  /** Sekmenin benzersiz kimligi. */
  id: string;
  /** Sekme etiketi. */
  label: ReactNode;
  /** Sekme icerigi. */
  content: ReactNode;
  /** Devre disi birakir. */
  disabled?: boolean;
}

export interface TabsProps {
  /** Sekmeler. */
  tabs: TabItem[];
  /** Secili sekmenin `id`'si. */
  value: string;
  /** Secim degistiginde cagrilir. */
  onValueChange: (id: string) => void;
  /** Sekme etiketlerinin yonu. Varsayilan: `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Ust kapsayicinin yuksekligini doldurur ve aktif panele sinirli yukseklik
   * verir (panel icindeki tablo kendi basina kayabilir). Varsayilan: `false`.
   */
  fill?: boolean;
  /** Ek sinif. */
  className?: string;
}

/** WAI-ARIA tabs pattern (roving tabindex + ok tusu gezinmesi). */
export function Tabs({
  tabs,
  value,
  onValueChange,
  orientation = 'horizontal',
  fill = false,
  className,
}: TabsProps): ReactElement {
  const generatedId = useId().replace(/:/g, '');
  const listRef = useRef<HTMLDivElement>(null);

  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const selectedTab = tabs.find((tab) => tab.id === value) ?? enabledTabs[0];

  const moveFocus = (direction: 1 | -1) => {
    if (enabledTabs.length === 0) {
      return;
    }
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === value);
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (baseIndex + direction + enabledTabs.length) % enabledTabs.length;
    const next = enabledTabs[nextIndex];
    if (next) {
      onValueChange(next.id);
      const nextButton = listRef.current?.querySelector<HTMLButtonElement>(
        `[data-tab-id="${CSS.escape(next.id)}"]`,
      );
      nextButton?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isHorizontal = orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const previousKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    if (event.key === nextKey) {
      event.preventDefault();
      moveFocus(1);
      return;
    }
    if (event.key === previousKey) {
      event.preventDefault();
      moveFocus(-1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      const first = enabledTabs[0];
      if (first) {
        onValueChange(first.id);
      }
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const last = enabledTabs[enabledTabs.length - 1];
      if (last) {
        onValueChange(last.id);
      }
    }
  };

  return (
    <div className={cn(styles.tabs, fill && styles.fill, className)} data-orientation={orientation}>
      <div
        ref={listRef}
        role="tablist"
        aria-orientation={orientation}
        className={styles.list}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selectedTab?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`ark-tab-${generatedId}-${tab.id}`}
              aria-controls={`ark-tabpanel-${generatedId}-${tab.id}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              data-tab-id={tab.id}
              data-state={isSelected ? 'active' : 'inactive'}
              onClick={() => onValueChange(tab.id)}
              className={cn(styles.tab, isSelected && styles.selected)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`ark-tabpanel-${generatedId}-${tab.id}`}
          aria-labelledby={`ark-tab-${generatedId}-${tab.id}`}
          tabIndex={0}
          hidden={tab.id !== selectedTab?.id}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
