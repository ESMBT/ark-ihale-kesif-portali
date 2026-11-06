import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Ek sinif. */
  className?: string;
  /** Kart icerigi. */
  children?: ReactNode;
}

/** Yuzey karti. */
export function Card({ className, children, ...rest }: CardProps): ReactElement {
  return (
    <div {...rest} className={cn(styles.card, className)}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Baslik. */
  title?: ReactNode;
  /** Alt baslik. */
  subtitle?: ReactNode;
  /** Sag taraftaki aksiyonlar. */
  actions?: ReactNode;
  /** Ek sinif. */
  className?: string;
  /** Kart icerigi. */
  children?: ReactNode;
}

/** Kart basligi. */
export function CardHeader({
  title,
  subtitle,
  actions,
  className,
  children,
  ...rest
}: CardHeaderProps): ReactElement {
  return (
    <div {...rest} className={cn(styles.header, className)}>
      <div className={styles.headerGroup}>
        {title ? <h3 className={styles.title}>{title}</h3> : null}
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        {children}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Ek sinif. */
  className?: string;
  /** Kart icerigi. */
  children?: ReactNode;
}

/** Kart govdesi. */
export function CardBody({ className, children, ...rest }: CardBodyProps): ReactElement {
  return (
    <div {...rest} className={cn(styles.body, className)}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Ek sinif. */
  className?: string;
  /** Kart icerigi. */
  children?: ReactNode;
}

/** Kart altligi. */
export function CardFooter({ className, children, ...rest }: CardFooterProps): ReactElement {
  return (
    <div {...rest} className={cn(styles.footer, className)}>
      {children}
    </div>
  );
}
