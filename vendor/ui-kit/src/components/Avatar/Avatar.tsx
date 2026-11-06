import { useEffect, useState, type ReactElement } from 'react';

import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/initials';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Kullanici adi; bas harfler bu degerden turetilir. */
  name?: string;
  /** Profil fotografi URL'si. */
  src?: string;
  /** Boyut. Varsayilan: `md`. */
  size?: AvatarSize;
  /** `alt` metni. Verilmezse `name` kullanilir. */
  alt?: string;
  /** Ek sinif. */
  className?: string;
}

/** Kullanici avatari; fotograf yoksa bas harflere duser. */
export function Avatar({ name, src, size = 'md', alt, className }: AvatarProps): ReactElement {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const initials = name ? getInitials(name) : '';
  const showImage = Boolean(src) && !failed;
  const label = alt ?? name;

  return (
    <span
      className={cn(styles.avatar, styles[size], className)}
      data-size={size}
      data-fallback={!showImage || undefined}
    >
      {showImage ? (
        <img className={styles.image} src={src} alt={label ?? ''} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden={label ? undefined : true}>{initials}</span>
      )}
    </span>
  );
}
