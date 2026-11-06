import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import styles from './WorkWindow.module.css';

export interface WorkWindowProps {
  /** Baslik cubugundaki metin. */
  title: ReactNode;
  /** Geri oku verilirse baslik cubugunda gosterilir. */
  onBack?: () => void;
  /** Kucult dugmesi. */
  onMinimize?: () => void;
  /** Buyut / geri yukle dugmesi. */
  onMaximize?: () => void;
  /** Kapat dugmesi. */
  onClose?: () => void;
  /** Baslik cubugunun altindaki menu cubugu (`MenuBar`). */
  menu?: ReactNode;
  /** Arac cubugu (`Toolbar`). */
  toolbar?: ReactNode;
  /** Arac cubugunun altinda tam genislik, ortalanmis bant metni. */
  band?: ReactNode;
  /** Govdenin altindaki alan (`FunctionKeyBar`, `StatusBar`). */
  footer?: ReactNode;
  /** Pencere odakta degilse `false`; baslik cubugu soluklasir. Varsayilan: `true`. */
  active?: boolean;
  /** Govde kaydirilsin mi. Varsayilan: `true`. */
  scrollBody?: boolean;
  /** Ek sinif. */
  className?: string;
  /** Pencere icerigi. */
  children?: ReactNode;
}

/** Uygulama icinde kullanilan, baslik cubuklu calisma penceresi. */
export function WorkWindow({
  title,
  onBack,
  onMinimize,
  onMaximize,
  onClose,
  menu,
  toolbar,
  band,
  footer,
  active = true,
  scrollBody = true,
  className,
  children,
}: WorkWindowProps): ReactElement {
  const hasControls = Boolean(onMinimize || onMaximize || onClose);

  return (
    <section
      className={cn(styles.window, !active && styles.inactive, className)}
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <header className={styles.titlebar}>
        {onBack ? (
          <button type="button" className={styles.back} onClick={onBack} aria-label="Geri">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        ) : null}
        <h2 className={styles.title}>{title}</h2>
        {hasControls ? (
          <div className={styles.controls}>
            {onMinimize ? (
              <button type="button" onClick={onMinimize} aria-label="Kucult">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                  <path d="M2 9h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
            {onMaximize ? (
              <button type="button" onClick={onMaximize} aria-label="Buyut">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                  <rect
                    x="2"
                    y="2"
                    width="8"
                    height="8"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </button>
            ) : null}
            {onClose ? (
              <button type="button" onClick={onClose} aria-label="Kapat" data-close="">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                  <path
                    d="M2 2l8 8M10 2L2 10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </header>
      {menu ? <div className={styles.menu}>{menu}</div> : null}
      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
      {band ? <div className={styles.band}>{band}</div> : null}
      <div className={cn(styles.body, scrollBody && styles.scroll)}>{children}</div>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </section>
  );
}
