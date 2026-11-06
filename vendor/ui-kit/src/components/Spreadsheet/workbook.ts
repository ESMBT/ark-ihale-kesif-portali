/*
 * Spreadsheet calisma kitabigi (workbook)
 * ---------------------------------------------------------------------------
 * Sayfalari indexler, hucre adreslerini (A1, B3) grid koordinatlarina cevirir
 * ve formul motorunu besleyen cozumleyiciyi uretir.
 *
 * Grid duzeni (tum sayfalarda ayni):
 *
 *   satir 1        sutun basliklari   (A1, B1, ...)
 *   satir 2..n+1   veri satirlari
 *
 * Bu eslesme formullerin Excel'deki gibi calismasini saglar: `=SUM(G3:G9)`
 * ifadesi G sutununun 3-9. veri satirlarini toplar.
 */

import {
  colName,
  evaluateFormulaSafe,
  formatNumber,
  toNumeric,
  type EvaluationContext,
  type FormulaResolver,
  type FormulaValue,
  type SpreadsheetErrorCode,
} from './formula';
import type {
  SpreadsheetCell,
  SpreadsheetCellValue,
  SpreadsheetNumberFormat,
  SpreadsheetNumberFormatOptions,
  SpreadsheetSheet,
} from './types';

/** Baslik satirinin grid numarasi. */
export const HEADER_ROW_NUMBER = 1;

/** Ilk veri satirinin grid numarasi. */
export const FIRST_DATA_ROW_NUMBER = 2;

/** Veri satirindaki 0 tabanli indeksi grid satir numarasina cevirir. */
export function rowNumberOf(rowIndex: number): number {
  return rowIndex + FIRST_DATA_ROW_NUMBER;
}

/** Grid satir numarasini veri satiri indeksine cevirir. */
export function rowIndexOf(rowNumber: number): number {
  return rowNumber - FIRST_DATA_ROW_NUMBER;
}

/** Hucre degerini her zaman `SpreadsheetCell` bicimine getirir. */
export function normalizeCell(value: SpreadsheetCellValue | undefined): SpreadsheetCell | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return { raw: value };
  }
  return value;
}

/** Sutun anahtarinin 0 tabanli indeksini dondurur; bulunamazsa `-1`. */
export function columnIndexOfKey(sheet: SpreadsheetSheet, key: string): number {
  return sheet.columns.findIndex((column) => column.key === key);
}

/** Satir kimliginin 0 tabanli indeksini dondurur; bulunamazsa `-1`. */
export function rowIndexOfId(sheet: SpreadsheetSheet, id: string): number {
  return sheet.rows.findIndex((row) => row.id === id);
}

/** Hesaplanmis hucre. */
export interface SpreadsheetComputedCell {
  /** Ekranda gosterilecek metin. */
  text: string;
  /** Ham deger (formul sonucu sayisalsa sayi). */
  value: number | string | boolean | null;
  /** Formul hata kodu. */
  error?: SpreadsheetErrorCode;
  /** Formul hucreli mi. */
  formula: boolean;
}

/** Hesaplanmis sayfa. */
export interface SpreadsheetComputedSheet {
  /** satir kimligi -> sutun anahtari -> hesaplanmis hucre. */
  cells: Map<string, Map<string, SpreadsheetComputedCell>>;
}

/** Formul sonucunu hucre bicimine cevirir. */
export function formatFormulaValue(
  value: FormulaValue,
  format: SpreadsheetNumberFormat,
  options: SpreadsheetNumberFormatOptions,
): string {
  let resolved = value;

  if (Array.isArray(resolved)) {
    resolved = resolved.length > 0 ? (resolved[0] as FormulaValue) : null;
  }
  if (resolved === null || resolved === undefined) {
    return '';
  }
  if (typeof resolved === 'number') {
    return formatNumber(resolved, format, options);
  }
  if (typeof resolved === 'boolean') {
    return resolved ? 'TRUE' : 'FALSE';
  }
  return String(resolved);
}

/**
 * Tum sayfalari hesaplar.
 *
 * @returns sayfa kimligi -> hesaplanmis sayfa
 */
export function computeWorkbook(
  sheets: SpreadsheetSheet[],
  options: SpreadsheetNumberFormatOptions = {},
): Map<string, SpreadsheetComputedSheet> {
  const byName = new Map<string, SpreadsheetSheet>();
  for (const sheet of sheets) {
    byName.set(sheet.name, sheet);
  }

  const resolver: FormulaResolver = {
    getSheet: (name) => byName.get(name),
    getCell: (sheetName, row, col) => {
      const sheet = byName.get(sheetName);
      if (!sheet) {
        return undefined;
      }

      const column = sheet.columns[col - 1];
      if (!column) {
        return undefined;
      }

      if (row === HEADER_ROW_NUMBER) {
        return { raw: typeof column.title === 'string' ? column.title : '' };
      }

      const dataRow = sheet.rows[rowIndexOf(row)];
      if (!dataRow) {
        return undefined;
      }

      const value = dataRow.cells[column.key];
      if (value === undefined) {
        return undefined;
      }
      return normalizeCell(value);
    },
  };

  const cache = new Map<string, FormulaValue>();
  const visiting = new Set<string>();
  const result = new Map<string, SpreadsheetComputedSheet>();

  for (const sheet of sheets) {
    const sheetCells = new Map<string, Map<string, SpreadsheetComputedCell>>();

    sheet.rows.forEach((row, rowIndex) => {
      const rowCells = new Map<string, SpreadsheetComputedCell>();

      sheet.columns.forEach((column, columnIndex) => {
        const cell = normalizeCell(row.cells[column.key]);
        if (!cell) {
          rowCells.set(column.key, { text: '', value: null, formula: false });
          return;
        }

        const format = cell.format ?? column.format ?? 'text';

        if (typeof cell.raw === 'number') {
          rowCells.set(column.key, {
            text: formatNumber(cell.raw, format, options),
            value: cell.raw,
            formula: false,
          });
          return;
        }

        const raw = String(cell.raw);
        if (!raw.startsWith('=')) {
          // Sayiya benzer metinler sutun bicimine gore gosterilir; "text"
          // biciminde yazildigi gibi kalir.
          const numeric = toNumeric(raw);
          if (numeric !== null && format !== 'text') {
            rowCells.set(column.key, {
              text: formatNumber(numeric, format, options),
              value: numeric,
              formula: false,
            });
            return;
          }
          rowCells.set(column.key, { text: raw, value: raw, formula: false });
          return;
        }

        const key = `${sheet.name}!${colName(columnIndex + 1)}${rowNumberOf(rowIndex)}`;
        const context: EvaluationContext = {
          sheetName: sheet.name,
          resolver,
          cache,
          visiting,
        };

        visiting.add(key);
        let evaluation: { value: FormulaValue; error?: SpreadsheetErrorCode };
        try {
          evaluation = evaluateFormulaSafe(raw.slice(1), context);
        } finally {
          visiting.delete(key);
        }

        if (evaluation.error) {
          rowCells.set(column.key, {
            text: evaluation.error,
            value: null,
            error: evaluation.error,
            formula: true,
          });
          return;
        }

        rowCells.set(column.key, {
          text: formatFormulaValue(evaluation.value, format, options),
          value: evaluation.value as number | string | boolean | null,
          formula: true,
        });
      });

      sheetCells.set(row.id, rowCells);
    });

    result.set(sheet.id, { cells: sheetCells });
  }

  return result;
}

/** Secim araligindaki hucre adreslerini dondurur. */
export function rangeAddresses(
  sheet: SpreadsheetSheet,
  anchor: { rowId: string; columnKey: string },
  focus: { rowId: string; columnKey: string },
): Array<{ rowId: string; columnKey: string }> {
  const anchorRow = rowIndexOfId(sheet, anchor.rowId);
  const focusRow = rowIndexOfId(sheet, focus.rowId);
  const anchorCol = columnIndexOfKey(sheet, anchor.columnKey);
  const focusCol = columnIndexOfKey(sheet, focus.columnKey);

  if (anchorRow === -1 || focusRow === -1 || anchorCol === -1 || focusCol === -1) {
    return [];
  }

  const addresses: Array<{ rowId: string; columnKey: string }> = [];
  for (let row = Math.min(anchorRow, focusRow); row <= Math.max(anchorRow, focusRow); row += 1) {
    const dataRow = sheet.rows[row];
    if (!dataRow) {
      continue;
    }
    for (
      let col = Math.min(anchorCol, focusCol);
      col <= Math.max(anchorCol, focusCol);
      col += 1
    ) {
      const column = sheet.columns[col];
      if (!column) {
        continue;
      }
      addresses.push({ rowId: dataRow.id, columnKey: column.key });
    }
  }
  return addresses;
}
