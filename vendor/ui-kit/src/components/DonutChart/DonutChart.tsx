import { useState, type ReactElement } from 'react';

import { cn } from '../../lib/cn';
import { computeDonutSegments, type DonutDatum } from './donut';
import styles from './DonutChart.module.css';

export interface DonutChartProps {
  /** Dilim verisi. */
  data: DonutDatum[];
  /** Grafik basligi. */
  title?: string;
  /** Merkezde gosterilen buyuk metin (or. toplam). */
  centerLabel?: string;
  /** Merkezdeki kucuk aciklama. */
  centerCaption?: string;
  /** Degeri metne ceviren fonksiyon (legend). Varsayilan: `toLocaleString`. */
  formatValue?: (value: number) => string;
  /** Aciklama listesini goster. Varsayilan: `true`. */
  legend?: boolean;
  /** Grafik boyutu (px). Varsayilan: `200`. */
  size?: number;
  /** Halka kalinligi (viewBox biriminde, 4-30). Varsayilan: `16`. */
  thickness?: number;
  /** Ek sinif. */
  className?: string;
}

const RADIUS_BASE = 50;

/** SVG halka (donut) grafigi; erisilebilir ozet ve etkilesimli aciklama listesiyle. */
export function DonutChart({
  data,
  title,
  centerLabel,
  centerCaption,
  formatValue = (value) => value.toLocaleString('tr-TR'),
  legend = true,
  size = 200,
  thickness = 16,
  className,
}: DonutChartProps): ReactElement {
  const [hovered, setHovered] = useState<number | null>(null);
  const segments = computeDonutSegments(data);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const stroke = Math.min(Math.max(thickness, 4), 30);
  const radius = RADIUS_BASE - stroke / 2 - 1;
  const circumference = 2 * Math.PI * radius;

  const summary = `${title ?? 'Dagilim'}: ${segments
    .map((segment) => `${segment.label} %${segment.percent.toFixed(1)}`)
    .join(', ')}`;

  return (
    <figure className={cn(styles.chart, className)}>
      {title ? <figcaption className={styles.title}>{title}</figcaption> : null}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label={total > 0 ? summary : `${title ?? 'Dagilim'}: veri yok`}
        className={styles.svg}
      >
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth={stroke} className={styles.track} />
        {segments.map((segment, index) => {
          if (segment.fraction <= 0) {
            return null;
          }
          const length = segment.fraction * circumference;
          const dimmed = hovered !== null && hovered !== index;
          return (
            <circle
              key={`${segment.label}-${index}`}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={hovered === index ? stroke + 2 : stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-segment.start * circumference}
              transform="rotate(-90 50 50)"
              opacity={dimmed ? 0.35 : 1}
              className={styles.segment}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{`${segment.label}: ${formatValue(segment.value)} (%${segment.percent.toFixed(1)})`}</title>
            </circle>
          );
        })}
        {centerLabel ? (
          <text x="50" y={centerCaption ? 49 : 53} textAnchor="middle" className={styles.centerLabel}>
            {centerLabel}
          </text>
        ) : null}
        {centerCaption ? (
          <text x="50" y="60" textAnchor="middle" className={styles.centerCaption}>
            {centerCaption}
          </text>
        ) : null}
      </svg>
      {legend ? (
        <ul className={styles.legend}>
          {segments.map((segment, index) => (
            <li
              key={`${segment.label}-${index}`}
              className={cn(styles.legendItem, hovered === index && styles.legendActive)}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={styles.swatch} style={{ backgroundColor: segment.color }} />
              <span className={styles.legendLabel}>{segment.label}</span>
              <span className={styles.legendValue}>{formatValue(segment.value)}</span>
              <span className={styles.legendPercent}>%{segment.percent.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
