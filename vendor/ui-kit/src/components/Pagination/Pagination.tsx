import { useRef, type HTMLAttributes, type KeyboardEvent, type ReactElement } from 'react';

import { cn } from '../../lib/cn';
import styles from './Pagination.module.css';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 1 tabanli aktif sayfa. */
  page: number;
  /** Toplam sayfa sayisi. */
  pageCount: number;
  /** Sayfa degistiginde cagrilir. */
  onPageChange: (page: number) => void;
  /** Gosterilecek sayfa sayisi (aktif sayfa merkezli pencere). Varsayilan: 5. */
  siblingCount?: number;
  /** Ellipsis gosterilsin mi. Varsayilan: true. */
  showEllipsis?: boolean;
  /** Etiketler (ekran okuyucu icin). */
  labels?: {
    /** Onceki sayfa butonunun etiketi. */
    previous?: string;
    /** Sonraki sayfa butonunun etiketi. */
    next?: string;
    /** Sayfa butonunun etiket fonksiyonu. */
    page?: (page: number) => string;
    /** Diger sayfalar etiketi. */
    ellipsis?: string;
  };
  /** Ek sinif. */
  className?: string;
}

/** Sayfa listesindeki iki tip oge: sayfa numarasi ya da ellipsis. */
type PageSlot = number | 'ellipsis';

/**
 * Aktif sayfaya gore goruntulenecek sayfa ogelerini hesaplar:
 * ilk sayfa, gerekirse ellipsis, pencere, gerekirse ellipsis, son sayfa.
 */
function buildPageSlots(page: number, pageCount: number, siblingCount: number): PageSlot[] {
  if (pageCount <= 0) {
    return [];
  }

  const current = Math.min(Math.max(page, 1), pageCount);
  const windowSize = Math.max(1, siblingCount);

  let start = current - Math.floor((windowSize - 1) / 2);
  let end = start + windowSize - 1;

  if (start < 1) {
    start = 1;
    end = windowSize;
  }
  if (end > pageCount) {
    end = pageCount;
    start = Math.max(1, end - windowSize + 1);
  }

  const slots: PageSlot[] = [];

  if (start > 1) {
    slots.push(1);
    if (start > 2) {
      slots.push('ellipsis');
    }
  }

  for (let value = start; value <= end; value += 1) {
    slots.push(value);
  }

  if (end < pageCount) {
    if (end < pageCount - 1) {
      slots.push('ellipsis');
    }
    slots.push(pageCount);
  }

  return slots;
}

/** Onceki sayfa oku. */
function ChevronLeftIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M10 3 5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Sonraki sayfa oku. */
function ChevronRightIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Sayfalama navigasyonu. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 5,
  showEllipsis = true,
  labels,
  className,
  ...rest
}: PaginationProps): ReactElement {
  const listRef = useRef<HTMLUListElement>(null);

  const previousLabel = labels?.previous ?? 'Onceki sayfa';
  const nextLabel = labels?.next ?? 'Sonraki sayfa';
  const pageLabel = labels?.page ?? ((value: number) => `${value}. sayfa`);
  const ellipsisLabel = labels?.ellipsis ?? 'Diger sayfalar';

  const currentPage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const slots = buildPageSlots(page, pageCount, siblingCount).filter(
    (slot) => showEllipsis || slot !== 'ellipsis',
  );

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= pageCount;

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-page]') ?? [],
    );
    if (buttons.length === 0) {
      return;
    }

    const activeIndex = buttons.findIndex((button) => button === document.activeElement);
    if (activeIndex === -1) {
      return;
    }

    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = Math.min(Math.max(activeIndex + offset, 0), buttons.length - 1);
    buttons[nextIndex]?.focus();
  };

  return (
    <nav {...rest} aria-label="Sayfalama" className={cn(styles.pagination, className)}>
      <ul ref={listRef} className={styles.list} onKeyDown={handleKeyDown}>
        <li className={styles.item}>
          <button
            type="button"
            className={styles.button}
            aria-label={previousLabel}
            disabled={isFirstPage}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon />
          </button>
        </li>

        {slots.map((slot, index) =>
          slot === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} className={styles.item}>
              <span className={styles.ellipsis} aria-hidden="true" title={ellipsisLabel}>
                &hellip;
              </span>
            </li>
          ) : (
            <li key={slot} className={styles.item}>
              <button
                type="button"
                data-page={slot}
                className={cn(styles.button, slot === currentPage && styles.current)}
                aria-label={pageLabel(slot)}
                aria-current={slot === currentPage ? 'page' : undefined}
                onClick={() => onPageChange(slot)}
              >
                {slot}
              </button>
            </li>
          ),
        )}

        <li className={styles.item}>
          <button
            type="button"
            className={styles.button}
            aria-label={nextLabel}
            disabled={isLastPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </nav>
  );
}
