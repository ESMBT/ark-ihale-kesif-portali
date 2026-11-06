import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/cn';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  /** Modalin acik olup olmadigi. */
  open: boolean;
  /** Kapatildiginda cagrilir. */
  onClose: () => void;
  /** Baslik. */
  title?: ReactNode;
  /** Alt kisim (eylem butonlari). */
  footer?: ReactNode;
  /** Genislik. Varsayilan: `md`. */
  size?: ModalSize;
  /** Overlay'a tiklaninca kapansin mi. Varsayilan: `true`. */
  closeOnOverlayClick?: boolean;
  /** Escape tusu ile kapansin mi. Varsayilan: `true`. */
  closeOnEscape?: boolean;
  /** Ek sinif. */
  className?: string;
  /** Modal icerigi. */
  children?: ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true',
  );
}

/**
 * Sayfa ortasinda gosterilen, odagi kilitli modal.
 * Portal ile `document.body` uzerine render edilir.
 */
export function Modal({
  open,
  onClose,
  title,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  children,
}: ModalProps): ReactElement | null {
  const generatedId = useId().replace(/:/g, '');
  const titleId = `ark-modal-${generatedId}-title`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Odagi kilitle: Escape ile kapatma + Tab ile odak dongusu.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeOnEscape) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusables = getFocusableElements(dialog);
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last?.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault();
        first?.focus();
      }
    },
    [closeOnEscape, onClose],
  );

  // Acildiginda odagi modala tasi, kapandiginda geri dondur; govde kaydirmasini kilitle.
  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    dialog?.focus();

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    };
  }, [open, handleKeyDown]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const handleOverlayMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown} data-testid="ark-modal-overlay">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        data-size={size}
        className={cn(styles.dialog, styles[size], className)}
      >
        <div className={styles.header}>
          {title ? (
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
          ) : null}
          <button type="button" className={styles.close} onClick={onClose} aria-label="Kapat">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
