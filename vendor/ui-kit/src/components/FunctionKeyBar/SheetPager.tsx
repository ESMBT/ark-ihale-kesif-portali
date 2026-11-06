import { useEffect, useId, useState, type FormEvent, type ReactElement } from 'react';

import { cn } from '../../lib/cn';
import styles from './SheetPager.module.css';

export interface SheetPagerProps {
  /** Gecerli sayfa (1 tabanli). */
  page: number;
  /** Toplam sayfa sayisi. */
  pageCount: number;
  /** Sayfa degistiginde cagrilir. */
  onPageChange: (page: number) => void;
  /** Giris kutusunun onundeki etiket. Varsayilan: `Sayfa:`. */
  label?: string;
  /** Ek sinif. */
  className?: string;
}

/** "Sayfa: [1] |< < 1 / 6 > >|" biciminde sayfa gezgini. */
export function SheetPager({
  page,
  pageCount,
  onPageChange,
  label = 'Sayfa:',
  className,
}: SheetPagerProps): ReactElement {
  const inputId = `ark-sheet-pager-${useId().replace(/:/g, '')}`;
  const [draft, setDraft] = useState(String(page));

  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const clamp = (value: number) => Math.min(Math.max(1, value), Math.max(pageCount, 1));
  const go = (value: number) => {
    const next = clamp(value);
    if (next !== page) {
      onPageChange(next);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(page));
      return;
    }
    go(parsed);
    setDraft(String(clamp(parsed)));
  };

  return (
    <form className={cn(styles.pager, className)} onSubmit={handleSubmit} aria-label="Sayfa gezgini">
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={styles.input}
        inputMode="numeric"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleSubmit}
        aria-label="Sayfa numarasi"
      />
      <button type="button" className={styles.button} onClick={() => go(1)} disabled={page <= 1} aria-label="Ilk sayfa">
        ⏮
      </button>
      <button type="button" className={styles.button} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Onceki sayfa">
        ◀
      </button>
      <span className={styles.status} aria-live="polite">
        Sayfa <strong>{page}</strong> / {pageCount}
      </span>
      <button type="button" className={styles.button} onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Sonraki sayfa">
        ▶
      </button>
      <button type="button" className={styles.button} onClick={() => go(pageCount)} disabled={page >= pageCount} aria-label="Son sayfa">
        ⏭
      </button>
    </form>
  );
}
