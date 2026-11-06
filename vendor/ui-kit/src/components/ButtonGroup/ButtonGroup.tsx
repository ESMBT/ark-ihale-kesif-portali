import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './ButtonGroup.module.css';

export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Buton grubunun icerigi. */
  children: ReactNode;
  /** Cocuklarin yatay hizalanmasi. Varsayilan: `start`. */
  align?: 'start' | 'center' | 'end' | 'justify';
  /** Dikey yon. Varsayilan: `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
  /** Aradaki bosluk (px). Varsayilan: 16. */
  gap?: number;
  /** Tum cocuklar ayni genislikte olsun mu (flex: 1). Varsayilan: false. */
  stretch?: boolean;
  /** Ek sinif. */
  className?: string;
}

/** Butonlari yatay ya da dikey olarak gruplar. */
export function ButtonGroup({
  children,
  align = 'start',
  orientation = 'horizontal',
  gap = 16,
  stretch = false,
  className,
  style,
  ...rest
}: ButtonGroupProps): ReactElement {
  return (
    <div
      {...rest}
      role="group"
      className={cn(
        styles.group,
        styles[orientation],
        styles[align],
        stretch && styles.stretch,
        className,
      )}
      style={{ gap, ...style }}
    >
      {children}
    </div>
  );
}
