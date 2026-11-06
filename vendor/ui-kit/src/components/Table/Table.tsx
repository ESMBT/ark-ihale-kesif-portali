import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner/Spinner';
import styles from './Table.module.css';

export interface TableColumn<T> {
  /** Sutun anahtari. */
  key: string;
  /** Baslik icerigi. */
  header: ReactNode;
  /** Ozel hucre render fonksiyonu. */
  render?: (row: T, index: number) => ReactNode;
  /** Hizalama. Varsayilan: `left`. */
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  /** Satir verisi. */
  data: T[];
  /** Sutun tanimlari. */
  columns: Array<TableColumn<T>>;
  /** Satir anahtari uretici. */
  rowKey: (row: T) => string;
  /** Veri yokken gosterilecek icerik. */
  empty?: ReactNode;
  /** Yukleme durumu. */
  loading?: boolean;
  /** Tablo basligi. */
  caption?: string;
  /** Ek sinif. */
  className?: string;
}

/** Veri tablosu. */
export function Table<T>({
  data,
  columns,
  rowKey,
  empty,
  loading = false,
  caption,
  className,
}: TableProps<T>): ReactElement {
  const columnCount = Math.max(columns.length, 1);

  return (
    <div className={cn(styles.wrapper, className)}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead className={styles.head}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(styles.headCell, styles[column.align ?? 'left'])}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className={styles.stateCell} colSpan={columnCount}>
                <Spinner size="sm" label="Yukleniyor" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className={styles.stateCell} colSpan={columnCount}>
                {empty ?? 'Kayit bulunamadi.'}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(styles.cell, styles[column.align ?? 'left'])}
                  >
                    {column.render ? column.render(row, index) : renderDefault(row, column.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** `render` verilmemisse satirin `key` alanini yazar. */
function renderDefault<T>(row: T, key: string): ReactNode {
  if (row !== null && typeof row === 'object' && key in row) {
    const value = (row as Record<string, unknown>)[key];
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return null;
  }
  return null;
}
