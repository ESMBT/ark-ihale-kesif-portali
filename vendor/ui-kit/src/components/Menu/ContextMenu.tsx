import { useEffect, useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

import { Menu, type MenuItem } from './Menu';
import styles from './Menu.module.css';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  /** Menu acik mi. */
  open: boolean;
  /** Ekran (viewport) koordinatinda acilis noktasi (genelde `clientX/clientY`). */
  position: ContextMenuPosition | null;
  /** Menu ogeleri. */
  items: MenuItem[];
  /** Kapanma istegi (disari tiklama, Escape, kaydirma, oge secimi). */
  onClose: () => void;
  /** Yaprak oge secildiginde cagrilir. */
  onItemSelect?: (item: MenuItem) => void;
  /** Erisilebilirlik etiketi. */
  'aria-label'?: string;
}

const VIEWPORT_MARGIN = 8;

/**
 * Sag tik (baglam) menusu. `document.body` uzerine portal ile cizilir ve
 * gorunur alana sigacak sekilde konumu duzeltilir.
 */
export function ContextMenu({
  open,
  position,
  items,
  onClose,
  onItemSelect,
  'aria-label': ariaLabel = 'Baglam menusu',
}: ContextMenuProps): ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState<ContextMenuPosition | null>(null);

  // Gorunur alana sigdir.
  useLayoutEffect(() => {
    if (!open || !position) {
      setAdjusted(null);
      return;
    }
    const element = containerRef.current;
    if (!element) {
      setAdjusted(position);
      return;
    }
    const rect = element.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - VIEWPORT_MARGIN;
    const maxY = window.innerHeight - rect.height - VIEWPORT_MARGIN;
    setAdjusted({
      x: Math.max(VIEWPORT_MARGIN, Math.min(position.x, maxX)),
      y: Math.max(VIEWPORT_MARGIN, Math.min(position.y, maxY)),
    });
  }, [open, position, items]);

  // Disari tiklama / kaydirma / yeniden boyutlandirma kapatir.
  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleDismiss = () => onClose();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('keydown', handleKey, true);
    window.addEventListener('resize', handleDismiss);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('blur', handleDismiss);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKey, true);
      window.removeEventListener('resize', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('blur', handleDismiss);
    };
  }, [open, onClose]);

  if (!open || !position || typeof document === 'undefined') {
    return null;
  }

  const point = adjusted ?? position;

  return createPortal(
    <div
      ref={containerRef}
      className={styles.popover}
      style={{ left: point.x, top: point.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Menu autoFocus aria-label={ariaLabel} items={items} onItemSelect={onItemSelect} onClose={onClose} />
    </div>,
    document.body,
  );
}
