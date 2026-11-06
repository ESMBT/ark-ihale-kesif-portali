/*
 * Spreadsheet formul motoru
 * ---------------------------------------------------------------------------
 * Excel benzeri bir formul dilini destekler:
 *
 *   =A1                       tek hucre
 *   =SUM(G3:G9)               aralik
 *   ='Issue Sheet'!G3         baska sayfaya referans
 *   =E4*F4                    aritmetik (+ - * / ^)
 *   =ROUND(C10*0.18, 2)      fonksiyon cagrisi
 *
 * Desteklenen fonksiyonlar: SUM, COUNT, AVERAGE, MIN, MAX, ROUND, ABS.
 *
 * Formul motoru DOM'a bagimli degildir; hucre degerlerini bir cozumleyici
 * (`FormulaResolver`) uzerinden alir. Bu sayede hem bilesen icinde hem de
 * testlerde ayni kod calisir.
 */

import type { SpreadsheetCell, SpreadsheetNumberFormat, SpreadsheetNumberFormatOptions } from './types';

/** Formul hata kodlari. */
export type SpreadsheetErrorCode = '#REF!' | '#VALUE!' | '#NAME?' | '#DIV/0!' | '#CIRC!';

/** Formul motorunun urettigi hata. */
export class SpreadsheetFormulaError extends Error {
  readonly code: SpreadsheetErrorCode;

  constructor(code: SpreadsheetErrorCode) {
    super(code);
    this.name = 'SpreadsheetFormulaError';
    this.code = code;
  }
}

/** Formul degeri; araliklar dizi olarak doner. */
export type FormulaValue = number | string | boolean | null | FormulaValue[];

/* ------------------------------------------------------------- adresler */

/** Sutun harfini 1 tabanli indekse cevirir (`A` -> 1). */
export function colIndex(letters: string): number {
  let index = 0;
  for (const char of letters) {
    index = index * 26 + (char.toUpperCase().charCodeAt(0) - 64);
  }
  return index;
}

/** 1 tabanli sutun indeksini harfe cevirir (1 -> `A`). */
export function colName(index: number): string {
  let name = '';
  let remaining = index;
  while (remaining > 0) {
    const remainder = (remaining - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return name;
}

/** `A1` gibi bir adresi cozer; gecersizse `null`. */
export function parseRef(ref: string): { col: number; row: number } | null {
  const match = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(String(ref).trim());
  if (!match) {
    return null;
  }
  return { col: colIndex(match[1] as string), row: Number.parseInt(match[2] as string, 10) };
}

/** Normalize edilmis hucre adresi (`a1` -> `A1`). */
export function normalizeRef(ref: string): string {
  const parsed = parseRef(ref);
  if (!parsed) {
    return String(ref).trim().toUpperCase();
  }
  return `${colName(parsed.col)}${parsed.row}`;
}

/* ------------------------------------------------------------ bicimleme */

/** Sayiyi bicime gore metne cevirir. */
export function formatNumber(
  value: number,
  format: SpreadsheetNumberFormat = 'text',
  options: SpreadsheetNumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const locale = options.locale ?? 'tr-TR';
  const currency = options.currency ?? 'TRY';

  switch (format) {
    case 'integer':
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
    case 'number':
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    case 'percent':
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case 'text':
    default:
      return String(value);
  }
}

/* -------------------------------------------------------------- cozumleyici */

/** Hucre degerlerini formul motoruna sunan cozumleyici. */
export interface FormulaResolver {
  /** Sayfa adindan sayfayi bulur. */
  getSheet(name: string): { name: string } | undefined;
  /**
   * Sayfadaki hucreyi dondurur. `row` 1 tabanlidir ve 1 sutun basligini,
   * `row - 2` ise veri satirini gosterir.
   */
  getCell(sheetName: string, row: number, col: number): SpreadsheetCell | undefined;
}

/** Formul degerlendirme baglami. */
export interface EvaluationContext {
  /** Formulun yazildigi sayfa. */
  sheetName: string;
  /** Hucre cozumleyici. */
  resolver: FormulaResolver;
  /** Hesaplanan deger onbellegi. */
  cache: Map<string, FormulaValue>;
  /** Su an hesaplanan hucreler (dongusel referans tespiti). */
  visiting: Set<string>;
}

/* --------------------------------------------------------------- lexer */

type Token =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'ref'; value: string }
  | { type: 'sheet'; value: string }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' }
  | { type: 'colon' };

const REF_PATTERN = /^\$?[A-Za-z]{1,3}\$?[0-9]+/;
const IDENT_PATTERN = /^[A-Za-z_][A-Za-z0-9_.]*/;
const NUMBER_PATTERN = /^[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/;

/** Formul metnini jetona ayirir. */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source.charAt(index);

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    // Tirkali sayfa adi: 'Issue Sheet'!A1
    if (char === "'") {
      const close = source.indexOf("'", index + 1);
      if (close === -1 || source.charAt(close + 1) !== '!') {
        throw new SpreadsheetFormulaError('#REF!');
      }
      tokens.push({ type: 'sheet', value: source.slice(index + 1, close) });
      index = close + 2;
      continue;
    }

    // Metin sabiti
    if (char === '"') {
      let cursor = index + 1;
      let out = '';
      let closed = false;
      while (cursor < source.length) {
        if (source.charAt(cursor) === '\\' && cursor + 1 < source.length) {
          out += source.charAt(cursor + 1);
          cursor += 2;
          continue;
        }
        if (source.charAt(cursor) === '"') {
          closed = true;
          break;
        }
        out += source.charAt(cursor);
        cursor += 1;
      }
      if (!closed) {
        throw new SpreadsheetFormulaError('#VALUE!');
      }
      tokens.push({ type: 'string', value: out });
      index = cursor + 1;
      continue;
    }

    // Sayi
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(source.charAt(index + 1)))) {
      const match = NUMBER_PATTERN.exec(source.slice(index));
      if (!match) {
        throw new SpreadsheetFormulaError('#VALUE!');
      }
      tokens.push({ type: 'number', value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    // Hucre adresi ya da fonksiyon adi
    if (/[A-Za-z_$]/.test(char)) {
      const rest = source.slice(index);
      const ref = REF_PATTERN.exec(rest);
      if (ref) {
        const after = rest.charAt(ref[0].length);
        if (!after || !/[A-Za-z0-9_$]/.test(after)) {
          tokens.push({ type: 'ref', value: normalizeRef(ref[0]) });
          index += ref[0].length;
          continue;
        }
      }
      const ident = IDENT_PATTERN.exec(rest);
      if (!ident) {
        throw new SpreadsheetFormulaError('#VALUE!');
      }
      tokens.push({ type: 'ident', value: ident[0].toUpperCase() });
      index += ident[0].length;
      continue;
    }

    if ('+-*/^%'.includes(char)) {
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }
    if (char === '(') {
      tokens.push({ type: 'lparen' });
      index += 1;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rparen' });
      index += 1;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'comma' });
      index += 1;
      continue;
    }
    if (char === ':') {
      tokens.push({ type: 'colon' });
      index += 1;
      continue;
    }

    throw new SpreadsheetFormulaError('#VALUE!');
  }

  return tokens;
}

/* -------------------------------------------------------------- parser */

type Expr =
  | { type: 'literal'; value: number | string }
  | { type: 'unary'; op: '+' | '-'; operand: Expr }
  | { type: 'binary'; op: '+' | '-' | '*' | '/' | '^'; left: Expr; right: Expr }
  | { type: 'cell'; sheet: string | null; ref: string }
  | { type: 'range'; sheet: string | null; from: string; to: string }
  | { type: 'call'; name: string; args: Expr[] };

/** Jeton listesini soyut sozdizim agacina cevirir. */
export function parse(tokens: Token[]): Expr {
  let position = 0;

  const peek = (): Token | undefined => tokens[position];
  const take = (): Token | undefined => tokens[position++];
  const expect = <T extends Token['type']>(type: T): Extract<Token, { type: T }> => {
    const token = take();
    if (!token || token.type !== type) {
      throw new SpreadsheetFormulaError('#VALUE!');
    }
    return token as Extract<Token, { type: T }>;
  };
  /** Siradaki jetonun operator degeri; operator degilse `undefined`. */
  const peekOperator = (): string | undefined => {
    const token = peek();
    return token && token.type === 'op' ? token.value : undefined;
  };
  const peekType = (): Token['type'] | undefined => peek()?.type;

  function parseExpression(): Expr {
    let node = parseTerm();
    for (;;) {
      const op = peekOperator();
      if (op !== '+' && op !== '-') {
        break;
      }
      take();
      node = { type: 'binary', op, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm(): Expr {
    let node = parsePower();
    for (;;) {
      const op = peekOperator();
      if (op !== '*' && op !== '/') {
        break;
      }
      take();
      node = { type: 'binary', op, left: node, right: parsePower() };
    }
    return node;
  }

  /** Ust uste (`^`) operator Excel'de sagdan sola baglanir: `2^3^2` = 512. */
  function parsePower(): Expr {
    const base = parseUnary();
    if (peekOperator() === '^') {
      take();
      return { type: 'binary', op: '^', left: base, right: parsePower() };
    }
    return base;
  }

  function parseUnary(): Expr {
    const op = peekOperator();
    if (op === '-' || op === '+') {
      take();
      return { type: 'unary', op, operand: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary(): Expr {
    const token = take();
    if (!token) {
      throw new SpreadsheetFormulaError('#VALUE!');
    }

    if (token.type === 'number' || token.type === 'string') {
      return { type: 'literal', value: token.value };
    }

    if (token.type === 'lparen') {
      const inner = parseExpression();
      expect('rparen');
      return inner;
    }

    if (token.type === 'sheet') {
      const sheetRef = expect('ref');
      if (peekType() === 'colon') {
        take();
        const second = expect('ref');
        return { type: 'range', sheet: token.value, from: sheetRef.value, to: second.value };
      }
      return { type: 'cell', sheet: token.value, ref: sheetRef.value };
    }

    if (token.type === 'ref') {
      if (peekType() === 'colon') {
        take();
        const second = expect('ref');
        return { type: 'range', sheet: null, from: token.value, to: second.value };
      }
      return { type: 'cell', sheet: null, ref: token.value };
    }

    if (token.type === 'ident') {
      expect('lparen');
      const args: Expr[] = [];
      if (peekType() !== 'rparen') {
        args.push(parseExpression());
        while (peekType() === 'comma') {
          take();
          args.push(parseExpression());
        }
      }
      expect('rparen');
      return { type: 'call', name: token.value, args };
    }

    throw new SpreadsheetFormulaError('#VALUE!');
  }

  const ast = parseExpression();
  if (position !== tokens.length) {
    throw new SpreadsheetFormulaError('#VALUE!');
  }
  return ast;
}

/* ------------------------------------------------------------ evaluator */

function toNumber(value: FormulaValue): number {
  if (typeof value === 'number') {
    return value;
  }
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new SpreadsheetFormulaError('#VALUE!');
  }
  return parsed;
}

function numbersIn(value: FormulaValue): number[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => numbersIn(entry));
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return [value];
  }
  return [];
}

/** Tek bir hucre degerini (formulleri de cozer) dondurur. */
export function cellValue(
  sheetName: string,
  row: number,
  col: number,
  context: EvaluationContext,
): FormulaValue {
  const key = `${sheetName}!${colName(col)}${row}`;

  const cached = context.cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  if (context.visiting.has(key)) {
    throw new SpreadsheetFormulaError('#CIRC!');
  }

  const cell = context.resolver.getCell(sheetName, row, col);
  if (!cell) {
    // Sayfa yoksa referans hatasi; hucre bossa Excel davranisi (0).
    if (!context.resolver.getSheet(sheetName)) {
      throw new SpreadsheetFormulaError('#REF!');
    }
    context.cache.set(key, 0);
    return 0;
  }

  if (typeof cell.raw === 'number') {
    context.cache.set(key, cell.raw);
    return cell.raw;
  }

  const raw = String(cell.raw);
  if (raw.startsWith('=')) {
    context.visiting.add(key);
    try {
      const value = evaluateAst(parse(tokenize(raw.slice(1))), {
        ...context,
        sheetName,
        visiting: context.visiting,
      });
      context.cache.set(key, value);
      return value;
    } finally {
      context.visiting.delete(key);
    }
  }

  // Kullanici hucreye "20000" yazdiginda deger metin olarak saklanir; formuller
  // bunu sayi olarak gormelidir (Excel davranisi).
  const numeric = toNumeric(raw);
  if (numeric !== null) {
    context.cache.set(key, numeric);
    return numeric;
  }

  context.cache.set(key, raw);
  return raw;
}

/** Metni sayiya cevirir; sayiya benzer degilse `null`. */
export function toNumeric(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function rangeValues(
  sheetName: string,
  from: string,
  to: string,
  context: EvaluationContext,
): FormulaValue[] {
  const start = parseRef(from);
  const end = parseRef(to);
  if (!start || !end) {
    throw new SpreadsheetFormulaError('#REF!');
  }

  const values: FormulaValue[] = [];
  for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row += 1) {
    for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col += 1) {
      values.push(cellValue(sheetName, row, col, context));
    }
  }
  return values;
}

function callFunction(name: string, args: FormulaValue[]): FormulaValue {
  switch (name) {
    case 'SUM':
      return args.reduce<number>(
        (total, value) => total + numbersIn(value).reduce((sum, n) => sum + n, 0),
        0,
      );

    case 'COUNT':
      return args.reduce<number>((total, value) => total + numbersIn(value).length, 0);

    case 'AVERAGE': {
      const all = args.flatMap((value) => numbersIn(value));
      if (all.length === 0) {
        throw new SpreadsheetFormulaError('#DIV/0!');
      }
      return all.reduce((sum, n) => sum + n, 0) / all.length;
    }

    case 'MIN': {
      const list = args.flatMap((value) => numbersIn(value));
      return list.length === 0 ? 0 : list.reduce((min, n) => Math.min(min, n), Infinity);
    }

    case 'MAX': {
      const list = args.flatMap((value) => numbersIn(value));
      return list.length === 0 ? 0 : list.reduce((max, n) => Math.max(max, n), -Infinity);
    }

    case 'ROUND': {
      const raw = toNumber(args[0] ?? 0);
      const digits = args.length > 1 ? toNumber(args[1] ?? 0) : 0;
      const factor = 10 ** digits;
      return Math.round(raw * factor) / factor;
    }

    case 'ABS':
      return Math.abs(toNumber(args[0] ?? 0));

    default:
      throw new SpreadsheetFormulaError('#NAME?');
  }
}

/** Soyut soz dizim agacini degerlendirir. */
export function evaluateAst(node: Expr, context: EvaluationContext): FormulaValue {
  switch (node.type) {
    case 'literal':
      return node.value;

    case 'unary': {
      const operand = toNumber(evaluateAst(node.operand, context));
      return node.op === '-' ? -operand : operand;
    }

    case 'binary': {
      const left = toNumber(evaluateAst(node.left, context));
      const right = toNumber(evaluateAst(node.right, context));
      switch (node.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) {
            throw new SpreadsheetFormulaError('#DIV/0!');
          }
          return left / right;
        case '^':
          return left ** right;
        default:
          throw new SpreadsheetFormulaError('#VALUE!');
      }
    }

    case 'cell':
      return cellValue(node.sheet ?? context.sheetName, ...refToRowCol(node.ref), context);

    case 'range':
      return rangeValues(node.sheet ?? context.sheetName, node.from, node.to, context);

    case 'call':
      return callFunction(
        node.name,
        node.args.map((arg) => evaluateAst(arg, context)),
      );

    default:
      throw new SpreadsheetFormulaError('#VALUE!');
  }
}

/** `A1` adresini (satir, sutun) ciftine cevirir. */
function refToRowCol(ref: string): [number, number] {
  const parsed = parseRef(ref);
  if (!parsed) {
    throw new SpreadsheetFormulaError('#REF!');
  }
  return [parsed.row, parsed.col];
}

/**
 * Formul metnini degerlendirir.
 *
 * @param source `=` isareti olmadan formul govdesi.
 */
export function evaluateFormula(source: string, context: EvaluationContext): FormulaValue {
  return evaluateAst(parse(tokenize(source)), context);
}

/**
 * Formul metnini degerlendirir; hata durumunda hata kodunu dondurur.
 */
export function evaluateFormulaSafe(
  source: string,
  context: EvaluationContext,
): { value: FormulaValue; error?: SpreadsheetErrorCode } {
  try {
    return { value: evaluateFormula(source, context) };
  } catch (error) {
    if (error instanceof SpreadsheetFormulaError) {
      return { value: null, error: error.code };
    }
    return { value: null, error: '#VALUE!' };
  }
}
