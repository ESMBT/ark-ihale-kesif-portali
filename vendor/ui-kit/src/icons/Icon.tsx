import { cloneElement, isValidElement, type ReactElement, type ReactNode, type SVGAttributes } from 'react';

import type { IconName } from './iconNames';
import { ICON_PATHS, ICON_VIEWBOX } from './icons';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  /** Ikon adi. `ICON_NAMES` icinden secilir. */
  name: IconName;
  /** Genislik ve yukseklik. Varsayilan: `24`. */
  size?: number | string;
  /**
   * Erisilebilirlik etiketi. Verilirse `role="img"` ve `<title>` eklenir;
   * verilmezse ikon tamamen dekoratif sayilir.
   */
  title?: string;
  /**
   * Cizgi kalinligi. Verilmezse ikonun kendi kalinligi (1.5) korunur.
   * Verildiginde gecis cizgileri de bu kalinliga cevrilir.
   */
  strokeWidth?: number;
}

const DEFAULT_SIZE = 24;
const DEFAULT_VIEWBOX = '0 0 24 24';

type IconNodeProps = {
  children?: ReactNode;
  strokeWidth?: number;
};

/**
 * Ikon govdesindeki cizgi kalinligini degistirir. Yalnizca halihazirda
 * `strokeWidth` tasiyan ogeler hedeflenir; dolu sekiller etkilenmez.
 */
function applyStrokeWidth(node: ReactNode, strokeWidth: number): ReactNode {
  if (Array.isArray(node)) {
    return node.map((child) => applyStrokeWidth(child, strokeWidth));
  }

  if (!isValidElement(node)) {
    return node;
  }

  const element = node as ReactElement<IconNodeProps>;
  const { children } = element.props;
  const patch: IconNodeProps = element.props.strokeWidth === undefined ? {} : { strokeWidth };

  if (children === undefined) {
    return cloneElement(element, patch);
  }

  return cloneElement(element, patch, applyStrokeWidth(children, strokeWidth));
}

/** Tasarim sistemi ikonu; rengi `currentColor` ile tema uzerinden gelir. */
export function Icon({
  name,
  size = DEFAULT_SIZE,
  title,
  strokeWidth,
  className,
  ...rest
}: IconProps): ReactElement {
  const body = ICON_PATHS[name];
  const labelled = title !== undefined && title !== '';

  if (!body) {
    throw new Error(`Bilinmeyen ikon adi: ${name}`);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={ICON_VIEWBOX[name] ?? DEFAULT_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...rest}
    >
      {labelled ? <title>{title}</title> : null}
      {strokeWidth === undefined ? body : applyStrokeWidth(body, strokeWidth)}
    </svg>
  );
}
