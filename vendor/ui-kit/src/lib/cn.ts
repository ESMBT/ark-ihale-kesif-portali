/**
 * Sinif adlarini birlestirir (clsx uyumlu).
 *
 * @example
 * cn('btn', isPrimary && 'btn--primary', { 'btn--wide': fullWidth })
 */
import { clsx, type ClassValue } from 'clsx';

export type { ClassValue };

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
