export interface DonutDatum {
  /** Dilim etiketi. */
  label: string;
  /** Dilim degeri (negatif degerler 0 sayilir). */
  value: number;
  /** CSS rengi; verilmezse paletten (`--ark-chart-N`) alinir. */
  color?: string;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  /** Toplam icindeki oran (0-1). */
  fraction: number;
  /** Yuzde (0-100). */
  percent: number;
  /** Dilimin baslangic orani (0-1). */
  start: number;
}

export const DONUT_PALETTE_SIZE = 7;

/** Veri kumesini dilimlere cevirir; toplam 0 ise tum oranlar 0'dir. */
export function computeDonutSegments(data: DonutDatum[]): DonutSegment[] {
  const values = data.map((datum) => (Number.isFinite(datum.value) && datum.value > 0 ? datum.value : 0));
  const total = values.reduce((sum, value) => sum + value, 0);

  let cursor = 0;
  return data.map((datum, index) => {
    const value = values[index] ?? 0;
    const fraction = total > 0 ? value / total : 0;
    const segment: DonutSegment = {
      label: datum.label,
      value,
      color: datum.color ?? `var(--ark-chart-${(index % DONUT_PALETTE_SIZE) + 1})`,
      fraction,
      percent: fraction * 100,
      start: cursor,
    };
    cursor += fraction;
    return segment;
  });
}
