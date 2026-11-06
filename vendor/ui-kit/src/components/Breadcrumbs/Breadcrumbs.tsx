import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  /** Ogenin gorunen metni. */
  label: string;
  /** Ogenin link adresi. Verilmezse oge duz metin olarak gosterilir. */
  href?: string;
  /** Ogeyi devre disi birakir; link olarak render edilmez. */
  disabled?: boolean;
}

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Kirinti ogeleri. */
  items: BreadcrumbItem[];
  /** Son ogenin "aktif" (current page) gorunumu. Varsayilan: true. */
  showCurrent?: boolean;
  /** Ayirici gorunumu. Varsayilan: sag chevron ikonu. */
  separator?: ReactNode;
  /** Ek sinif. */
  className?: string;
}

/** Varsayilan ayirici: "/" isareti (Figma'da her etiketin onunde yer alir). */
const DEFAULT_SEPARATOR = '/';

/** Sayfa yolu (kirinti) navigasyonu. */
export function Breadcrumbs({
  items,
  showCurrent = true,
  separator,
  className,
  ...rest
}: BreadcrumbsProps): ReactElement {
  const lastIndex = items.length - 1;

  return (
    <nav {...rest} aria-label="Breadcrumb" className={cn(styles.breadcrumbs, className)}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const isDisabled = item.disabled === true;
          const isCurrent = isLast && showCurrent;

          let content: ReactNode;
          if (isDisabled) {
            content = (
              <span className={cn(styles.link, styles.disabled)} aria-disabled="true">
                {item.label}
              </span>
            );
          } else if (isCurrent) {
            content = (
              <span className={cn(styles.link, styles.current)} aria-current="page">
                {item.label}
              </span>
            );
          } else if (item.href) {
            content = (
              <a className={cn(styles.link, styles.anchor)} href={item.href}>
                {item.label}
              </a>
            );
          } else {
            content = <span className={styles.link}>{item.label}</span>;
          }

          return (
            <li key={`${item.label}-${index}`} className={styles.listItem}>
              <span className={styles.separator} aria-hidden="true">
                {separator ?? DEFAULT_SEPARATOR}
              </span>
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
