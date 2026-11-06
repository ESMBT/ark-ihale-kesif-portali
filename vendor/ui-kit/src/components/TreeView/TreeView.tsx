import { useMemo, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './TreeView.module.css';

export interface TreeNode {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen metin. */
  label: ReactNode;
  /** Soldaki ikon. */
  icon?: ReactNode;
  /** Alt dugumler. */
  children?: TreeNode[];
  /** Secilemez. */
  disabled?: boolean;
  /** Sagda gosterilen ek bilgi (rozet, durum). */
  meta?: ReactNode;
}

export interface TreeViewProps {
  /** Kok dugumler. */
  nodes: TreeNode[];
  /** Secili dugum. */
  value?: string | null;
  /** Dugum secildiginde cagrilir. */
  onValueChange?: (id: string) => void;
  /** Kontrollu acik dugumler. */
  expandedIds?: string[];
  /** Kontrolsuz kullanimda baslangic acik dugumler. */
  defaultExpandedIds?: string[];
  /** Acik dugumler degistiginde cagrilir. */
  onExpandedIdsChange?: (ids: string[]) => void;
  /** Erisilebilirlik etiketi. */
  'aria-label'?: string;
  /** Ek sinif. */
  className?: string;
}

interface FlatNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
}

function flatten(nodes: TreeNode[], expanded: Set<string>, level = 1, parentId: string | null = null): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ node, level, parentId });
    if (node.children && node.children.length > 0 && expanded.has(node.id)) {
      result.push(...flatten(node.children, expanded, level + 1, node.id));
    }
  }
  return result;
}

/** WAI-ARIA `tree` pattern: ok tuslariyla gezilen, acilir/kapanir agac. */
export function TreeView({
  nodes,
  value,
  onValueChange,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedIdsChange,
  'aria-label': ariaLabel = 'Agac gorunumu',
  className,
}: TreeViewProps): ReactElement {
  const rootRef = useRef<HTMLUListElement>(null);
  const [innerExpanded, setInnerExpanded] = useState<string[]>(defaultExpandedIds);
  const [focusId, setFocusId] = useState<string | null>(null);

  const expandedList = expandedIds ?? innerExpanded;
  const expanded = useMemo(() => new Set(expandedList), [expandedList]);
  const flat = useMemo(() => flatten(nodes, expanded), [nodes, expanded]);

  const tabStopId =
    (focusId && flat.some((entry) => entry.node.id === focusId) ? focusId : null) ??
    (value && flat.some((entry) => entry.node.id === value) ? value : null) ??
    flat[0]?.node.id ??
    null;

  const setExpanded = (next: string[]) => {
    if (expandedIds === undefined) {
      setInnerExpanded(next);
    }
    onExpandedIdsChange?.(next);
  };

  const toggle = (id: string, open: boolean) => {
    const without = expandedList.filter((entry) => entry !== id);
    setExpanded(open ? [...without, id] : without);
  };

  const focusNode = (id: string | undefined) => {
    if (!id) {
      return;
    }
    setFocusId(id);
    rootRef.current?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(id)}"]`)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, entry: FlatNode, index: number) => {
    const { node } = entry;
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isOpen = expanded.has(node.id);
    event.stopPropagation();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNode(flat[index + 1]?.node.id);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusNode(flat[index - 1]?.node.id);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (hasChildren && !isOpen) {
          toggle(node.id, true);
        } else if (hasChildren) {
          focusNode(node.children?.[0]?.id);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (hasChildren && isOpen) {
          toggle(node.id, false);
        } else if (entry.parentId) {
          focusNode(entry.parentId);
        }
        break;
      case 'Home':
        event.preventDefault();
        focusNode(flat[0]?.node.id);
        break;
      case 'End':
        event.preventDefault();
        focusNode(flat[flat.length - 1]?.node.id);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!node.disabled) {
          onValueChange?.(node.id);
        }
        if (hasChildren && event.key === 'Enter') {
          toggle(node.id, !isOpen);
        }
        break;
      default:
        break;
    }
  };

  const renderNodes = (list: TreeNode[], level: number): ReactNode =>
    list.map((node) => {
      const index = flat.findIndex((entry) => entry.node.id === node.id);
      const entry = flat[index];
      if (!entry) {
        return null;
      }
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isOpen = hasChildren && expanded.has(node.id);
      const isSelected = value === node.id;

      return (
        <li
          key={node.id}
          role="treeitem"
          aria-level={level}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={isSelected}
          aria-disabled={node.disabled || undefined}
          data-node-id={node.id}
          tabIndex={tabStopId === node.id ? 0 : -1}
          className={styles.item}
          onFocus={(event) => {
            if (event.target === event.currentTarget) {
              setFocusId(node.id);
            }
          }}
          onKeyDown={(event) => handleKeyDown(event, entry, index)}
          // Tiklama `treeitem` ogesinde yakalanir; boylece yardimci teknolojilerin
          // ogeyi dogrudan "etkinlestirmesi" de calisir. Ic ice ogeler yayilimi durdurur.
          onClick={(event) => {
            event.stopPropagation();
            setFocusId(node.id);
            if (!node.disabled) {
              onValueChange?.(node.id);
            }
          }}
        >
          <div
            className={cn(styles.row, isSelected && styles.selected, hasChildren && styles.parent)}
            style={{ paddingLeft: `calc(var(--ark-space-2) + ${(level - 1) * 18}px)` }}
          >
            {hasChildren ? (
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className={styles.toggle}
                data-open={isOpen || undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  toggle(node.id, !isOpen);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M3 1.5L6.5 5L3 8.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <span className={styles.toggleSpacer} />
            )}
            {node.icon ? <span className={styles.icon}>{node.icon}</span> : null}
            <span className={styles.label}>{node.label}</span>
            {node.meta ? <span className={styles.meta}>{node.meta}</span> : null}
          </div>
          {hasChildren && isOpen && node.children ? (
            <ul role="group" className={styles.group}>
              {renderNodes(node.children, level + 1)}
            </ul>
          ) : null}
        </li>
      );
    });

  return (
    <ul ref={rootRef} role="tree" aria-label={ariaLabel} className={cn(styles.tree, className)}>
      {renderNodes(nodes, 1)}
    </ul>
  );
}
