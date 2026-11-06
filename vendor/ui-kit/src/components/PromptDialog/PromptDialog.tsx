import type { ReactElement, ReactNode } from 'react';

import { Icon, type IconProps } from '../../icons/Icon';
import { Button, type ButtonVariant } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './PromptDialog.module.css';

export type PromptTone = 'info' | 'success' | 'warning' | 'danger';

export interface PromptAction {
  /** Benzersiz kimlik. */
  id: string;
  /** Dugme metni. */
  label: string;
  /** Gorsel stil. Varsayilan: son eylem `primary`, digerleri `secondary`. */
  variant?: ButtonVariant;
  /** Tiklama. Dialog kapatmak cagirana aittir. */
  onClick: () => void;
}

export interface PromptDialogProps {
  /** Acik mi. */
  open: boolean;
  /** Kapatma istegi (Escape, X, overlay). */
  onClose: () => void;
  /** Baslik. */
  title: ReactNode;
  /** Ileti metni ya da icerigi. */
  message?: ReactNode;
  /** Ton; ikonu ve rengi belirler. Varsayilan: `info`. */
  tone?: PromptTone;
  /** Eylem dugmeleri. Verilmezse tek bir "Tamam" dugmesi gosterilir. */
  actions?: PromptAction[];
  /** Ek icerik (ayrintilar, listeler). */
  children?: ReactNode;
}

const ICONS: Record<PromptTone, IconProps['name']> = {
  info: 'info-square',
  success: 'tick-square',
  warning: 'danger-triangle',
  danger: 'danger-circle',
};

/** Ikonlu, kisa onay / bilgi iletisi. `Modal` uzerine kuruludur. */
export function PromptDialog({
  open,
  onClose,
  title,
  message,
  tone = 'info',
  actions,
  children,
}: PromptDialogProps): ReactElement {
  const resolved: PromptAction[] = actions && actions.length > 0 ? actions : [{ id: 'ok', label: 'Tamam', onClick: onClose }];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={resolved.map((action, index) => (
        <Button
          key={action.id}
          size="sm"
          variant={action.variant ?? (index === resolved.length - 1 ? (tone === 'danger' ? 'danger' : 'primary') : 'secondary')}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    >
      <div className={styles.content}>
        <span className={styles.icon} data-tone={tone}>
          <Icon name={ICONS[tone]} size={28} />
        </span>
        <div className={styles.text}>
          {message ? <p className={styles.message}>{message}</p> : null}
          {children}
        </div>
      </div>
    </Modal>
  );
}
