import {
  useMemo,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '../../lib/cn';
import styles from './DataGrid.module.css';

/** Hiyerarsi seviyesi: 1 bolum, 2 alt bolum, 3 grup (italik), 4 toplam satiri. */
export type DataGridLevel = 1 | 2 | 3 | 4;

/** Satir vurgusu. */
export type DataGridRowTone = 'highlight' | 'preferred' | 'danger' | 'muted';

/** Hucre metin tonu. */
export type DataGridCellTone = 'muted' | 'attention' | 'positive' | 'negative' | 'strong';

export type DataGridAlign = 'left' | 'center' | 'right';

export interface DataGridColumn<T> {
  /** Sutun anahtari; `render` verilmezse satirin ayni adli alani yazilir. */
  key: string;
  /** Baslik icerigi. */
  header: ReactNode;
  /** Ozel hucre render fonksiyonu. */
  render?: (row: T, index: number) => ReactNode;
  /** Hizalama. Varsayilan: `left`. */
  align?: DataGridAlign;
  /** Sabit genislik (px sayi ya da CSS degeri). */
  width?: number | string;
  /** `true` ise sutun gizlenir (sutun duzeni secicisi icin). */
  hidden?: boolean;
  /** Rakamlar icin sabit genisliklu basamak. Sagda hizalar. */
  numeric?: boolean;
  /** Satira gore hucre tonu. */
  tone?: (row: T) => DataGridCellTone | undefined;
  /** Sutunu vurgular (tercih edilen teklif, secili donem). */
  emphasis?: boolean;
}

export interface DataGridHeaderGroup {
  /** Benzersiz kimlik. */
  id: string;
  /** Grup basligi. */
  label: ReactNode;
  /** Gruba dahil sutun anahtarlari. */
  columnKeys: string[];
  /** Gorunum tonu. Varsayilan: `default`. */
  tone?: 'default' | 'strong' | 'success' | 'warning';
}

export interface DataGridRowSpan {
  /** Birlestirmenin basladigi sutun anahtari. */
  startKey: string;
  /** Kac sutuna yayilacagi (baslangic sutunu dahil). */
  span: number;
}

export interface DataGridProps<T> {
  /** Sutun tanimlari. */
  columns: Array<DataGridColumn<T>>;
  /** Satir verisi. */
  rows: T[];
  /** Satir anahtari. */
  rowKey: (row: T) => string;
  /** Ust baslik gruplari (iki katmanli baslik). */
  headerGroups?: DataGridHeaderGroup[];
  /** Satirin hiyerarsi seviyesi. */
  getRowLevel?: (row: T) => DataGridLevel | undefined;
  /** Satir vurgusu. */
  getRowTone?: (row: T) => DataGridRowTone | undefined;
  /** Bir hucrenin yan sutunlara yayilmasi (baslik satirlari icin). */
  getRowSpan?: (row: T) => DataGridRowSpan | undefined;
  /** Secili satir anahtari. */
  selectedKey?: string | null;
  /** Satir secildiginde cagrilir. Tanimliysa satirlar secilebilir olur. */
  onSelectedKeyChange?: (key: string) => void;
  /** Satir cift tiklandiginda cagrilir. */
  onRowActivate?: (row: T) => void;
  /** Satirda sag tiklandiginda cagrilir. */
  onRowContextMenu?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Alt toplam satiri: sutun anahtari -> deger. */
  totals?: Record<string, ReactNode>;
  /** Toplam satirinin etiketi (toplam degerlerinin solundaki hucreye yazilir). */
  totalsLabel?: ReactNode;
  /** Bos durum metni. */
  emptyMessage?: ReactNode;
  /** Tablo basligi (erisilebilirlik). */
  caption?: string;
  /** Yogun satir araligi. Varsayilan: `true`. */
  dense?: boolean;
  /** Dikey cizgileri goster. Varsayilan: `true`. */
  gridLines?: boolean;
  /** Ek sinif. */
  className?: string;
}

function toCssSize(value: number | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

function readValue<T>(row: T, key: string): ReactNode {
  if (row !== null && typeof row === 'object' && key in row) {
    const value = (row as Record<string, unknown>)[key];
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
  }
  return null;
}

/**
 * Hiyerarsik, renk kodlu veri izgarasi: metraj cetveli, kesif ve karsilastirma
 * tablolari icin. Satir seviyeleri, grup basliklari, secim ve baglam menusu
 * kancalari saglar.
 */
export function DataGrid<T>({
  columns,
  rows,
  rowKey,
  headerGroups,
  getRowLevel,
  getRowTone,
  getRowSpan,
  selectedKey,
  onSelectedKeyChange,
  onRowActivate,
  onRowContextMenu,
  totals,
  totalsLabel,
  emptyMessage = 'Kayit bulunamadi.',
  caption,
  dense = true,
  gridLines = true,
  className,
}: DataGridProps<T>): ReactElement {
  const visible = useMemo(() => columns.filter((column) => !column.hidden), [columns]);
  const selectable = Boolean(onSelectedKeyChange);

  const groupRuns = useMemo(() => {
    if (!headerGroups || headerGroups.length === 0) {
      return null;
    }
    const groupByKey = new Map<string, DataGridHeaderGroup>();
    for (const group of headerGroups) {
      for (const key of group.columnKeys) {
        groupByKey.set(key, group);
      }
    }
    const runs: Array<{ id: string; group: DataGridHeaderGroup | null; span: number }> = [];
    for (const column of visible) {
      const group = groupByKey.get(column.key) ?? null;
      const last = runs[runs.length - 1];
      if (last && last.group === group && group !== null) {
        last.span += 1;
      } else {
        runs.push({ id: `${group?.id ?? 'none'}-${column.key}`, group, span: 1 });
      }
    }
    return runs;
  }, [headerGroups, visible]);

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T, index: number) => {
    if (!onSelectedKeyChange) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectedKeyChange(rowKey(row));
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (next !== undefined) {
        onSelectedKeyChange(rowKey(next));
        const sibling =
          event.key === 'ArrowDown'
            ? event.currentTarget.nextElementSibling
            : event.currentTarget.previousElementSibling;
        (sibling as HTMLElement | null)?.focus();
      }
    }
  };

  const totalsStart = totals ? visible.findIndex((column) => column.key in totals) : -1;

  return (
    <div className={cn(styles.wrapper, className)}>
      <table
        className={cn(styles.grid, dense && styles.dense, gridLines && styles.lines)}
        role={selectable ? 'grid' : undefined}
      >
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <colgroup>
          {visible.map((column) => (
            <col key={column.key} style={{ width: toCssSize(column.width) }} />
          ))}
        </colgroup>
        <thead className={styles.head}>
          {groupRuns ? (
            <tr className={styles.groupRow}>
              {groupRuns.map((run) => (
                <th
                  key={run.id}
                  colSpan={run.span}
                  scope="colgroup"
                  data-tone={run.group?.tone ?? 'default'}
                  className={cn(styles.groupCell, run.group === null && styles.groupEmpty)}
                >
                  {run.group?.label}
                </th>
              ))}
            </tr>
          ) : null}
          <tr>
            {visible.map((column) => (
              <th
                key={column.key}
                scope="col"
                data-emphasis={column.emphasis || undefined}
                className={cn(styles.headCell, styles[column.align ?? (column.numeric ? 'right' : 'left')])}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={Math.max(visible.length, 1)}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const key = rowKey(row);
              const level = getRowLevel?.(row);
              const tone = getRowTone?.(row);
              const spanInfo = getRowSpan?.(row);
              const isSelected = selectedKey === key;
              const cells: ReactElement[] = [];

              for (let columnIndex = 0; columnIndex < visible.length; columnIndex += 1) {
                const column = visible[columnIndex];
                if (!column) {
                  continue;
                }
                let colSpan: number | undefined;
                if (spanInfo && spanInfo.startKey === column.key && spanInfo.span > 1) {
                  colSpan = Math.min(spanInfo.span, visible.length - columnIndex);
                }
                const cellTone = column.tone?.(row);
                cells.push(
                  <td
                    key={column.key}
                    role={selectable ? 'gridcell' : undefined}
                    colSpan={colSpan}
                    data-tone={cellTone}
                    data-emphasis={column.emphasis || undefined}
                    className={cn(
                      styles.cell,
                      styles[column.align ?? (column.numeric ? 'right' : 'left')],
                      column.numeric && styles.numeric,
                    )}
                  >
                    {column.render ? column.render(row, index) : readValue(row, column.key)}
                  </td>,
                );
                if (colSpan) {
                  columnIndex += colSpan - 1;
                }
              }

              return (
                <tr
                  key={key}
                  role={selectable ? 'row' : undefined}
                  aria-selected={selectable ? isSelected : undefined}
                  tabIndex={selectable ? (isSelected || (selectedKey == null && index === 0) ? 0 : -1) : undefined}
                  data-level={level}
                  data-tone={tone}
                  data-selected={isSelected || undefined}
                  className={cn(styles.row, selectable && styles.selectable)}
                  onClick={selectable ? () => onSelectedKeyChange?.(key) : undefined}
                  onDoubleClick={onRowActivate ? () => onRowActivate(row) : undefined}
                  onContextMenu={
                    onRowContextMenu
                      ? (event) => {
                          event.preventDefault();
                          onSelectedKeyChange?.(key);
                          onRowContextMenu(row, event);
                        }
                      : undefined
                  }
                  onKeyDown={selectable ? (event) => handleRowKeyDown(event, row, index) : undefined}
                >
                  {cells}
                </tr>
              );
            })
          )}
        </tbody>
        {totals && totalsStart >= 0 ? (
          <tfoot className={styles.foot}>
            <tr>
              {totalsStart > 0 ? (
                <td colSpan={totalsStart} className={cn(styles.totalLabel)}>
                  {totalsLabel}
                </td>
              ) : null}
              {visible.slice(totalsStart).map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    styles.cell,
                    styles.totalCell,
                    styles[column.align ?? (column.numeric ? 'right' : 'left')],
                    column.numeric && styles.numeric,
                  )}
                >
                  {totals[column.key]}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
