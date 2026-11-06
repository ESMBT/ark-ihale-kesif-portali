import { useMemo, type CSSProperties, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { addDays, buildMonthSpans, computeRange, diffInDays, isWeekend } from './gantt';
import styles from './GanttChart.module.css';

export type GanttTone = 'primary' | 'success' | 'warning' | 'danger';

export interface GanttRow {
  /** Benzersiz kimlik. */
  id: string;
  /** Faaliyet adi. */
  label: ReactNode;
  /** Faaliyet kodu / numarasi. */
  code?: string;
  /** Baslangic (ISO `YYYY-MM-DD`, dahil). */
  start: string;
  /** Bitis (ISO `YYYY-MM-DD`, dahil). */
  end: string;
  /** `summary` ise ozet (parantez) cubugu cizilir. */
  kind?: 'task' | 'summary';
  /** Cubuk rengi. Varsayilan: `primary`. */
  tone?: GanttTone;
  /** Tamamlanma orani (0-1). */
  progress?: number;
  /** Cubugun yanina yazilan etiket. */
  barLabel?: string;
}

export interface GanttChartProps {
  /** Faaliyet satirlari. */
  rows: GanttRow[];
  /** Zaman cizelgesi baslangici; verilmezse satirlardan hesaplanir. */
  rangeStart?: string;
  /** Zaman cizelgesi bitisi; verilmezse satirlardan hesaplanir. */
  rangeEnd?: string;
  /** Bir gunun piksel genisligi. Varsayilan: `14`. */
  dayWidth?: number;
  /** Satir yuksekligi (px). Varsayilan: `32`. */
  rowHeight?: number;
  /** "Bugun" cizgisi (ISO). */
  today?: string;
  /** Secili satir. */
  selectedId?: string | null;
  /** Satir secildiginde cagrilir. */
  onSelectedIdChange?: (id: string) => void;
  /** Sol tablo basliklari. */
  labels?: {
    activity?: string;
    start?: string;
    end?: string;
    days?: string;
  };
  /** Ek sinif. */
  className?: string;
}

const HEAD_ROW = 28;

function formatShort(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year?.slice(2)}`;
}

/**
 * Sol tabloda faaliyet listesi, sagda aylik/gunluk zaman cizelgesi ve cubuklar
 * (Gantt) gosteren program grafigi. Tarihler UTC gun olarak islenir.
 */
export function GanttChart({
  rows,
  rangeStart,
  rangeEnd,
  dayWidth = 14,
  rowHeight = 32,
  today,
  selectedId,
  onSelectedIdChange,
  labels,
  className,
}: GanttChartProps): ReactElement {
  const range = useMemo(() => {
    if (rangeStart && rangeEnd) {
      return { start: rangeStart, end: rangeEnd };
    }
    const computed = computeRange(rows);
    return {
      start: rangeStart ?? computed?.start ?? '2026-01-01',
      end: rangeEnd ?? computed?.end ?? '2026-01-31',
    };
  }, [rows, rangeStart, rangeEnd]);

  const totalDays = Math.max(diffInDays(range.start, range.end) + 1, 1);
  const months = useMemo(() => buildMonthSpans(range.start, range.end), [range]);
  const weekendOffsets = useMemo(() => {
    const offsets: number[] = [];
    for (let offset = 0; offset < totalDays; offset += 1) {
      if (isWeekend(addDays(range.start, offset))) {
        offsets.push(offset);
      }
    }
    return offsets;
  }, [range, totalDays]);

  const showDayNumbers = dayWidth >= 18;
  const timelineWidth = totalDays * dayWidth;
  const bodyHeight = rows.length * rowHeight;
  const todayOffset = today ? diffInDays(range.start, today) : null;

  const style = {
    '--gantt-row': `${rowHeight}px`,
    '--gantt-head': `${HEAD_ROW * 2}px`,
    '--gantt-day': `${dayWidth}px`,
  } as CSSProperties;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>, id: string) => {
    if (!onSelectedIdChange) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectedIdChange(id);
    }
  };

  const selectable = Boolean(onSelectedIdChange);

  return (
    <div className={cn(styles.chart, className)} style={style} role="group" aria-label="Program cizelgesi">
      <div className={styles.scroller}>
        <div className={styles.canvas}>
          {/* ---------------------------------------------------- sol tablo */}
          <div className={styles.left}>
            <div className={styles.leftHead}>
              <span>No</span>
              <span>{labels?.activity ?? 'Faaliyet'}</span>
              <span>{labels?.start ?? 'Baslangic'}</span>
              <span>{labels?.end ?? 'Bitis'}</span>
              <span className={styles.numeric}>{labels?.days ?? 'Gun'}</span>
            </div>
            {rows.map((row) => {
              const duration = diffInDays(row.start, row.end) + 1;
              const isSelected = row.id === selectedId;
              return (
                <div
                  key={row.id}
                  role={selectable ? 'button' : undefined}
                  tabIndex={selectable ? 0 : undefined}
                  aria-pressed={selectable ? isSelected : undefined}
                  data-summary={row.kind === 'summary' || undefined}
                  data-selected={isSelected || undefined}
                  className={styles.leftRow}
                  onClick={selectable ? () => onSelectedIdChange?.(row.id) : undefined}
                  onKeyDown={selectable ? (event) => handleRowKeyDown(event, row.id) : undefined}
                >
                  <span className={styles.code}>{row.code}</span>
                  <span className={styles.activity}>{row.label}</span>
                  <span>{formatShort(row.start)}</span>
                  <span>{formatShort(row.end)}</span>
                  <span className={styles.numeric}>{duration}</span>
                </div>
              );
            })}
          </div>

          {/* ------------------------------------------------ zaman cizelgesi */}
          <div className={styles.right} style={{ width: timelineWidth }}>
            <div className={styles.rightHead}>
              <div className={styles.months}>
                {months.map((month) => (
                  <div key={month.key} className={styles.month} style={{ width: month.days * dayWidth }}>
                    {month.days * dayWidth >= 70 ? month.label : month.label.slice(0, 3)}
                  </div>
                ))}
              </div>
              <div className={styles.days} aria-hidden="true">
                {Array.from({ length: totalDays }, (_, offset) => {
                  const iso = addDays(range.start, offset);
                  const day = Number.parseInt(iso.slice(8, 10), 10);
                  const show = showDayNumbers || day === 1 || day === 8 || day === 15 || day === 22;
                  return (
                    <div
                      key={iso}
                      className={cn(styles.day, isWeekend(iso) && styles.weekendHead)}
                      style={{ width: dayWidth }}
                    >
                      {show ? day : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.plot} style={{ height: bodyHeight }}>
              {weekendOffsets.map((offset) => (
                <span
                  key={offset}
                  aria-hidden="true"
                  className={styles.weekend}
                  style={{ left: offset * dayWidth, width: dayWidth }}
                />
              ))}
              {rows.map((row, index) => {
                const left = diffInDays(range.start, row.start) * dayWidth;
                const width = Math.max((diffInDays(row.start, row.end) + 1) * dayWidth, 4);
                const progress = Math.min(Math.max(row.progress ?? 0, 0), 1);
                const summary = row.kind === 'summary';
                const labelText = typeof row.label === 'string' ? row.label : (row.code ?? row.id);
                return (
                  <div
                    key={row.id}
                    className={styles.track}
                    data-selected={row.id === selectedId || undefined}
                    style={{ top: index * rowHeight }}
                    onClick={selectable ? () => onSelectedIdChange?.(row.id) : undefined}
                  >
                    <div
                      className={styles.bar}
                      data-tone={row.tone ?? 'primary'}
                      data-summary={summary || undefined}
                      style={{ left, width }}
                      title={`${labelText}: ${formatShort(row.start)} - ${formatShort(row.end)}`}
                      role="img"
                      aria-label={`${labelText}, ${formatShort(row.start)} - ${formatShort(row.end)}${
                        progress > 0 ? `, %${Math.round(progress * 100)} tamamlandi` : ''
                      }`}
                    >
                      {!summary && progress > 0 ? (
                        <span className={styles.progress} style={{ width: `${progress * 100}%` }} />
                      ) : null}
                    </div>
                    {row.barLabel ? (
                      <span className={styles.barLabel} style={{ left: left + width + 6 }}>
                        {row.barLabel}
                      </span>
                    ) : null}
                  </div>
                );
              })}
              {todayOffset !== null && todayOffset >= 0 && todayOffset < totalDays ? (
                <span
                  className={styles.today}
                  aria-label="Bugun"
                  role="img"
                  style={{ left: todayOffset * dayWidth + dayWidth / 2 }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
