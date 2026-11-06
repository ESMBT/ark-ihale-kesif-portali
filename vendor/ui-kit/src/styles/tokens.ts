/**
 * Tasarim tokenlarinin isim listesi ve tipleri.
 * `tokens.css` ile birebir senkron tutulmalidir.
 *
 * Kaynak: Figma "Design System" (file key: kmsebzYktpGg2phjeHeTno)
 */
export const THEME_TOKEN_NAMES = [
  /* --- Marka --- */
  '--ark-color-primary',
  '--ark-color-primary-hover',
  '--ark-color-primary-active',
  '--ark-color-primary-contrast',
  '--ark-color-primary-soft',
  '--ark-color-primary-soft-strong',
  '--ark-color-primary-border',
  /* --- Basari --- */
  '--ark-color-success',
  '--ark-color-success-hover',
  '--ark-color-success-active',
  '--ark-color-success-contrast',
  '--ark-color-success-soft',
  '--ark-color-success-border',
  '--ark-color-success-deep',
  /* --- Uyari --- */
  '--ark-color-warning',
  '--ark-color-warning-hover',
  '--ark-color-warning-active',
  '--ark-color-warning-contrast',
  '--ark-color-warning-soft',
  '--ark-color-warning-border',
  '--ark-color-warning-deep',
  /* --- Tehlike --- */
  '--ark-color-danger',
  '--ark-color-danger-hover',
  '--ark-color-danger-active',
  '--ark-color-danger-contrast',
  '--ark-color-danger-soft',
  '--ark-color-danger-border',
  /* --- Bilgi --- */
  '--ark-color-info',
  '--ark-color-info-hover',
  '--ark-color-info-soft',
  '--ark-color-info-border',
  /* --- Notr --- */
  '--ark-color-bg',
  '--ark-color-surface',
  '--ark-color-surface-muted',
  '--ark-color-border',
  '--ark-color-border-strong',
  '--ark-color-text',
  '--ark-color-text-muted',
  '--ark-color-text-subtle',
  '--ark-color-text-inverted',
  '--ark-color-disabled-bg',
  '--ark-color-disabled-text',
  /* --- Kontrol (Figma Button "Primary") --- */
  '--ark-color-control-bg',
  '--ark-color-control-border',
  '--ark-color-control-text',
  '--ark-color-control-hover-bg',
  '--ark-color-control-subtle-text',
  /* --- Bosluk --- */
  '--ark-space-0',
  '--ark-space-1',
  '--ark-space-2',
  '--ark-space-3',
  '--ark-space-4',
  '--ark-space-5',
  '--ark-space-6',
  '--ark-space-8',
  '--ark-space-10',
  '--ark-space-12',
  /* --- Yaricap --- */
  '--ark-radius-xs',
  '--ark-radius-sm',
  '--ark-radius-md',
  '--ark-radius-lg',
  '--ark-radius-xl',
  '--ark-radius-full',
  /* --- Tipografi --- */
  '--ark-font-sans',
  '--ark-font-display',
  '--ark-font-mono',
  '--ark-font-size-xs',
  '--ark-font-size-sm',
  '--ark-font-size-md',
  '--ark-font-size-lg',
  '--ark-font-size-xl',
  '--ark-font-size-2xl',
  '--ark-font-size-3xl',
  '--ark-font-size-4xl',
  '--ark-line-height-tight',
  '--ark-line-height-normal',
  '--ark-line-height-relaxed',
  '--ark-font-weight-regular',
  '--ark-font-weight-medium',
  '--ark-font-weight-semibold',
  '--ark-font-weight-bold',
  /* --- Efekt --- */
  '--ark-shadow-sm',
  '--ark-shadow-md',
  '--ark-shadow-lg',
  '--ark-shadow-xl',
  '--ark-shadow-control',
  '--ark-shadow-control-hover',
  '--ark-shadow-control-pressed',
  '--ark-ring-color',
  '--ark-ring-width',
  '--ark-transition-fast',
  '--ark-transition-base',
  /* --- Katman --- */
  '--ark-z-dropdown',
  '--ark-z-sticky',
  '--ark-z-modal',
  '--ark-z-toast',
] as const;

/** Token adinin birebir tipi. */
export type ThemeTokenName = (typeof THEME_TOKEN_NAMES)[number];

/** Bir token'in `name -> deger` eslemesi. */
export type ThemeTokenMap = Record<ThemeTokenName, string>;

/** Uygulanan tema. */
export type ThemeName = 'light' | 'dark';
