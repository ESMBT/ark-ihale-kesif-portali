import { useId, useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './DualListPicker.module.css';

export interface DualListItem {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen metin. */
  label: ReactNode;
  /** Duz metin karsiligi; `label` bir ReactNode ise erisilebilir ad olarak kullanilir. */
  text?: string;
  /** `true` ise koyu baslik gibi gosterilir (grup basligi). */
  group?: boolean;
  /** Girintili alt oge. */
  indent?: boolean;
  /** Tasinamaz. */
  disabled?: boolean;
}

export interface DualListPickerProps {
  /** Tum secenekler (mevcut + secili). */
  items: DualListItem[];
  /** Secili ogelerin kimlikleri; sira, sag listedeki siradir. */
  value: string[];
  /** Secim ya da sira degistiginde cagrilir. */
  onChange: (ids: string[]) => void;
  /** Sol liste basligi. */
  availableTitle?: string;
  /** Sag liste basligi. */
  selectedTitle?: string;
  /** Sag listede yukari/asagi siralama dugmeleri. Varsayilan: `true`. */
  reorderable?: boolean;
  /** Liste yuksekligi (px). Varsayilan: `260`. */
  height?: number;
  /** Ek sinif. */
  className?: string;
}

type Side = 'available' | 'selected';

/**
 * Iki listeli (Mevcut <-> Secili) tasima bileseni; sutun duzeni ve kaynak
 * secici diyaloglarinda kullanilir. Ctrl/Cmd ve Shift ile coklu secim,
 * cift tiklama ya da Enter ile tasima destekler.
 */
export function DualListPicker({
  items,
  value,
  onChange,
  availableTitle = 'Mevcut',
  selectedTitle = 'Secili',
  reorderable = true,
  height = 260,
  className,
}: DualListPickerProps): ReactElement {
  const baseId = useId().replace(/:/g, '');
  const [marked, setMarked] = useState<Record<Side, string[]>>({ available: [], selected: [] });
  const [anchor, setAnchor] = useState<Record<Side, string | null>>({ available: null, selected: null });

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  // Tum alt ogeleri sag listeye gecmis grup basliklari sol listede gosterilmez.
  const available = useMemo(() => {
    const remaining = items.filter((item) => !selectedSet.has(item.id));
    return remaining.filter((item, index) => {
      if (!item.group) {
        return true;
      }
      for (let next = index + 1; next < remaining.length; next += 1) {
        const candidate = remaining[next];
        if (candidate?.group) {
          return false;
        }
        if (candidate) {
          return true;
        }
      }
      return false;
    });
  }, [items, selectedSet]);
  const selected = useMemo(
    () => value.map((id) => itemById.get(id)).filter((item): item is DualListItem => item !== undefined),
    [value, itemById],
  );

  const movable = (item: DualListItem) => !item.group && !item.disabled;

  const mark = (side: Side, list: DualListItem[], item: DualListItem, event: MouseEvent | KeyboardEvent) => {
    if (!movable(item)) {
      return;
    }
    setMarked((current) => {
      const existing = current[side];
      if (event.shiftKey && anchor[side]) {
        const from = list.findIndex((entry) => entry.id === anchor[side]);
        const to = list.findIndex((entry) => entry.id === item.id);
        if (from !== -1 && to !== -1) {
          const [start, end] = from < to ? [from, to] : [to, from];
          return {
            ...current,
            [side]: list.slice(start, end + 1).filter(movable).map((entry) => entry.id),
          };
        }
      }
      if (event.ctrlKey || event.metaKey) {
        return {
          ...current,
          [side]: existing.includes(item.id) ? existing.filter((id) => id !== item.id) : [...existing, item.id],
        };
      }
      return { ...current, [side]: [item.id] };
    });
    if (!event.shiftKey) {
      setAnchor((current) => ({ ...current, [side]: item.id }));
    }
  };

  const clearMarks = () => {
    setMarked({ available: [], selected: [] });
    setAnchor({ available: null, selected: null });
  };

  const add = (ids: string[]) => {
    const toAdd = ids.filter((id) => !selectedSet.has(id) && itemById.has(id));
    if (toAdd.length === 0) {
      return;
    }
    onChange([...value, ...toAdd]);
    clearMarks();
  };

  const remove = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }
    const drop = new Set(ids);
    onChange(value.filter((id) => !drop.has(id)));
    clearMarks();
  };

  const move = (direction: -1 | 1) => {
    const ids = marked.selected;
    if (ids.length === 0) {
      return;
    }
    const next = [...value];
    const indexes = ids.map((id) => next.indexOf(id)).filter((index) => index >= 0).sort((a, b) => a - b);
    if (direction === 1) {
      indexes.reverse();
    }
    for (const index of indexes) {
      const target = index + direction;
      if (target < 0 || target >= next.length || ids.includes(next[target] ?? '')) {
        continue;
      }
      const current = next[index];
      const swap = next[target];
      if (current === undefined || swap === undefined) {
        continue;
      }
      next[index] = swap;
      next[target] = current;
    }
    onChange(next);
  };

  const renderList = (side: Side, list: DualListItem[], title: string) => {
    const titleId = `${baseId}-${side}`;
    return (
      <div className={styles.column}>
        <h4 className={styles.title} id={titleId}>
          {title}
          <span className={styles.count}>{list.filter((item) => !item.group).length}</span>
        </h4>
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={titleId}
          className={styles.list}
          style={{ height }}
        >
          {list.length === 0 ? <li className={styles.empty}>Oge yok</li> : null}
          {list.map((item) => {
            const isMarked = marked[side].includes(item.id);
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={isMarked}
                aria-label={item.text}
                aria-disabled={item.disabled || item.group || undefined}
                tabIndex={movable(item) ? 0 : -1}
                data-group={item.group || undefined}
                className={cn(styles.option, item.indent && styles.indent, isMarked && styles.marked)}
                onClick={(event) => mark(side, list, item, event)}
                onDoubleClick={() => {
                  if (!movable(item)) {
                    return;
                  }
                  if (side === 'available') {
                    add([item.id]);
                  } else {
                    remove([item.id]);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && movable(item)) {
                    event.preventDefault();
                    const ids = marked[side].length > 0 ? marked[side] : [item.id];
                    if (side === 'available') {
                      add(ids);
                    } else {
                      remove(ids);
                    }
                  } else if (event.key === ' ' && movable(item)) {
                    event.preventDefault();
                    mark(side, list, item, event);
                  }
                }}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const addable = marked.available.filter((id) => itemById.get(id) && !selectedSet.has(id));
  const removable = marked.selected.filter((id) => selectedSet.has(id));

  return (
    <div className={cn(styles.picker, className)}>
      {renderList('available', available, availableTitle)}
      <div className={styles.actions} role="group" aria-label="Tasima eylemleri">
        <button type="button" className={styles.action} data-tone="success" aria-label="Seciliyi ekle" disabled={addable.length === 0} onClick={() => add(addable)}>
          ›
        </button>
        <button
          type="button"
          className={styles.action}
          aria-label="Tumunu ekle"
          disabled={available.every((item) => !movable(item))}
          onClick={() => add(available.filter(movable).map((item) => item.id))}
        >
          »
        </button>
        <button type="button" className={styles.action} data-tone="danger" aria-label="Seciliyi cikar" disabled={removable.length === 0} onClick={() => remove(removable)}>
          ‹
        </button>
        <button
          type="button"
          className={styles.action}
          aria-label="Tumunu cikar"
          disabled={selected.every((item) => !movable(item))}
          onClick={() => remove(selected.filter(movable).map((item) => item.id))}
        >
          «
        </button>
        {reorderable ? (
          <>
            <span className={styles.rule} />
            <button type="button" className={styles.action} aria-label="Yukari tasi" disabled={removable.length === 0} onClick={() => move(-1)}>
              ▲
            </button>
            <button type="button" className={styles.action} aria-label="Asagi tasi" disabled={removable.length === 0} onClick={() => move(1)}>
              ▼
            </button>
          </>
        ) : null}
      </div>
      {renderList('selected', selected, selectedTitle)}
    </div>
  );
}
