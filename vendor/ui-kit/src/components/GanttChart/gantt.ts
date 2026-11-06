/** ISO tarih (`YYYY-MM-DD`) -> UTC gece yarisi (ms). Saat dilimi / DST etkisini ortadan kaldirir. */
export function parseIsoDate(iso: string): number {
  const [year, month, day] = iso.split('-').map((part) => Number.parseInt(part, 10));
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

const DAY_MS = 86_400_000;

/** `to - from` gun farki (isaretli). */
export function diffInDays(from: string, to: string): number {
  return Math.round((parseIsoDate(to) - parseIsoDate(from)) / DAY_MS);
}

/** Tarihe gun ekler ve ISO bicimde dondurur. */
export function addDays(iso: string, days: number): string {
  return new Date(parseIsoDate(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Hafta sonu mu (Cumartesi / Pazar). */
export function isWeekend(iso: string): boolean {
  const day = new Date(parseIsoDate(iso)).getUTCDay();
  return day === 0 || day === 6;
}

export interface MonthSpan {
  /** `YYYY-MM` anahtari. */
  key: string;
  /** Gosterim etiketi (or. `Mart 2026`). */
  label: string;
  /** Aralik icinde kalan gun sayisi. */
  days: number;
  /** Aralik baslangicindan itibaren gun ofseti. */
  offset: number;
}

const MONTH_NAMES = [
  'Ocak',
  'Subat',
  'Mart',
  'Nisan',
  'Mayis',
  'Haziran',
  'Temmuz',
  'Agustos',
  'Eylul',
  'Ekim',
  'Kasim',
  'Aralik',
];

/** `[rangeStart, rangeEnd]` (dahil) araligini aylara boler. */
export function buildMonthSpans(rangeStart: string, rangeEnd: string): MonthSpan[] {
  const total = diffInDays(rangeStart, rangeEnd) + 1;
  if (total <= 0) {
    return [];
  }

  const spans: MonthSpan[] = [];
  for (let offset = 0; offset < total; offset += 1) {
    const iso = addDays(rangeStart, offset);
    const key = iso.slice(0, 7);
    const last = spans[spans.length - 1];
    if (last && last.key === key) {
      last.days += 1;
    } else {
      const month = Number.parseInt(iso.slice(5, 7), 10) - 1;
      spans.push({ key, label: `${MONTH_NAMES[month] ?? key} ${iso.slice(0, 4)}`, days: 1, offset });
    }
  }
  return spans;
}

/** Satirlardan `[min start, max end]` aralik hesaplar; `padDays` iki yana bosluk ekler. */
export function computeRange(
  rows: Array<{ start: string; end: string }>,
  padDays = 3,
): { start: string; end: string } | null {
  if (rows.length === 0) {
    return null;
  }
  let min = rows[0]?.start ?? '';
  let max = rows[0]?.end ?? '';
  for (const row of rows) {
    if (parseIsoDate(row.start) < parseIsoDate(min)) {
      min = row.start;
    }
    if (parseIsoDate(row.end) > parseIsoDate(max)) {
      max = row.end;
    }
  }
  return { start: addDays(min, -padDays), end: addDays(max, padDays) };
}
