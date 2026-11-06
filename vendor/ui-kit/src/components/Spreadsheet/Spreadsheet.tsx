import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';

import { Icon } from '../../icons/Icon';
import { cn } from '../../lib/cn';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Modal } from '../Modal/Modal';
import { colName } from './formula';
import {
  columnIndexOfKey,
  computeWorkbook,
  normalizeCell,
  rangeAddresses,
  rowIndexOfId,
  rowNumberOf,
} from './workbook';
import type {
  SpreadsheetLabels,
  SpreadsheetProps,
  SpreadsheetRow,
  SpreadsheetSheet,
  SpreadsheetContextTarget,
  SpreadsheetMenuItem,
} from './types';
import styles from './Spreadsheet.module.css';

/** Hucre adresi (satir kimligi + sutun anahtari). */
interface CellAddress {
  rowId: string;
  columnKey: string;
}

interface Selection {
  anchor: CellAddress;
  focus: CellAddress;
}

interface EditingState {
  rowId: string;
  columnKey: string;
  /** Duzenleme baslangicindaki hucre degeri. */
  original: string;
  /** Yazmaya baslayarak duzenleme (type-to-edit) icin ilk karakter. */
  seed?: string;
}

const DEFAULT_LABELS: SpreadsheetLabels = {
  undo: 'Geri al',
  redo: 'Ileri al',
  bold: 'Kalin',
  copy: 'Kopyala',
  paste: 'Yapistir',
  print: 'Yazdir',
  insertRow: 'Satir ekle',
  deleteRow: 'Satir sil',
  reset: 'Sifirla',
  cellReference: 'Hucre adresi',
  cellContents: 'Hucre icerigi',
  sheetTabs: 'Sayfalar',
  editCell: 'Hucreyi duzenle',
  statusSum: 'Toplam',
  statusAverage: 'Ortalama',
  statusCount: 'Adet',
  empty: 'Kayit bulunamadi.',
  resetTitle: 'Tabloyu sifirla?',
  resetBody: 'Bu islem tum duzenlemeleri geri alir ve tabloyu ilk haline dondurur.',
  resetConfirm: 'Sifirla',
  cancel: 'Vazgec',
  collapseGroup: 'Bolumu kapat',
  expandGroup: 'Bolumu ac',
  collapseAllGroups: 'Bolumleri kapat',
  expandAllGroups: 'Bolumleri ac',
  insertRowAbove: 'Yukariya satir ekle',
  insertRowBelow: 'Asagiya satir ekle',
};

const HISTORY_LIMIT = 80;

/** Sol seridin (satir numaralarinin) genisligi. */
const GUTTER_WIDTH = 44;

/** Bolum ac/kapa dugmesi varken sol seridin genisligi. */
const GUTTER_WIDTH_COLLAPSIBLE = 64;

const NO_HIDDEN_ROWS: ReadonlySet<string> = new Set();

/** Kapali bolum anahtari (sayfa + satir). */
function groupKey(sheetId: string, rowId: string): string {
  return `${sheetId}${'\u0000'}${rowId}`;
}

/** Sayfada seviyeli (`level`) satir var mi? Varsa acma/kapama seviye tabanlidir. */
function usesLevels(sheet: SpreadsheetSheet): boolean {
  return sheet.rows.some((row) => row.level != null);
}

/** Sol seritte gosterilecek satir numarasi; `hideRowNumber` olan satirlarda bos. */
function rowLabel(row: SpreadsheetRow, index: number): number | string {
  return row.hideRowNumber ? '' : index + 2;
}

/** Kapanabilir satirlar: seviyeli sayfada alt agaci olanlar, degilse `group` satirlari. */
function collapsibleRowIdsOf(sheet: SpreadsheetSheet): Set<string> {
  const ids = new Set<string>();
  if (usesLevels(sheet)) {
    sheet.rows.forEach((row, index) => {
      const next = sheet.rows[index + 1];
      if (row.level == null || !next || next.kind === 'total') {
        return;
      }
      if (next.level == null || next.level > row.level) {
        ids.add(row.id);
      }
    });
    return ids;
  }
  for (const row of sheet.rows) {
    if (row.kind === 'group') {
      ids.add(row.id);
    }
  }
  return ids;
}

/**
 * Kapali satirlarin altindaki satirlarin kimliklerini doner.
 *
 * Seviyeli sayfada bir satirin alt agaci, kendinden sonraki ve seviyesi daha buyuk olan satirlardir
 * (seviyesiz `note` satirlari onlerindeki seviyeli satirin altindadir; `total` satiri agaci bitirir).
 * Seviyesiz sayfada bir bolum, kendinden sonraki `group` ya da `total` satirina kadar surer.
 */
function hiddenRowIdsOf(sheet: SpreadsheetSheet, collapsed: ReadonlySet<string>): Set<string> {
  const hidden = new Set<string>();

  if (usesLevels(sheet)) {
    let hideBelow: number | null = null;
    for (const row of sheet.rows) {
      if (row.kind === 'total') {
        hideBelow = null;
        continue;
      }
      if (row.level == null) {
        if (hideBelow !== null) {
          hidden.add(row.id);
        }
        continue;
      }
      if (hideBelow !== null && row.level > hideBelow) {
        hidden.add(row.id);
        continue;
      }
      hideBelow = collapsed.has(groupKey(sheet.id, row.id)) ? row.level : null;
    }
    return hidden;
  }

  let hiding = false;
  for (const row of sheet.rows) {
    if (row.kind === 'group') {
      hiding = collapsed.has(groupKey(sheet.id, row.id));
    } else if (row.kind === 'total') {
      hiding = false;
    } else if (hiding) {
      hidden.add(row.id);
    }
  }
  return hidden;
}

/**
 * Hucre adresi anahtari ayiricisi.
 *
 * NUL karakteri kullanilir; satir kimligi ve sutun anahtari icinde
 * gecemedigi icin adresler birbirine karisamaz.
 */
const CELL_KEY_SEPARATOR = '\u0000';

/**
 * Excel benzeri tablo bileseni.
 *
 * Sayfalar, sutunlar ve satirlar veriyle beslenir; hucre duzenleme, formuller,
 * secim, geri al/yinele ve yazdirma islevleri bilesende yasar. Satir ekleme ve
 * silme gibi yapisal islemler tuketiciye birakilir; boylece formullerin
 * yeniden uretilmesi (satir kaydinca adresler kayar) kitin sorumlulugunda olmaz.
 */
export function Spreadsheet({
  sheets,
  onChange,
  activeSheetId,
  onActiveSheetChange,
  readOnly = false,
  header,
  toolbar,
  footer,
  status,
  onInsertRow,
  onDeleteRow,
  contextMenuItems,
  onReset,
  allowColumnResize = true,
  numberFormat,
  labels: labelsProp,
  collapsibleGroups = false,
  cellMarks,
  onSelectionChange,
  focusRequest,
  className,
}: SpreadsheetProps): ReactElement {
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelsProp }), [labelsProp]);

  const locale = numberFormat?.locale;
  const currency = numberFormat?.currency;

  const [internalSheetId, setInternalSheetId] = useState<string>(
    () => activeSheetId ?? sheets[0]?.id ?? '',
  );
  const currentSheetId = activeSheetId ?? internalSheetId;
  const activeSheet = sheets.find((sheet) => sheet.id === currentSheetId) ?? sheets[0];

  const [selection, setSelection] = useState<Selection | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  // Duzenleme durumu icin tek kaynak: ref. State yalnizca render icindir.
  const editingRef = useRef<EditingState | null>(null);

  const setEditingState = useCallback((next: EditingState | null) => {
    editingRef.current = next;
    setEditing(next);
  }, []);


  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [past, setPast] = useState<SpreadsheetSheet[][]>([]);
  const [future, setFuture] = useState<SpreadsheetSheet[][]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; target: SpreadsheetContextTarget } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(() => new Set());
  const gutterWidth = collapsibleGroups ? GUTTER_WIDTH_COLLAPSIBLE : GUTTER_WIDTH;

  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const gutterRef = useRef<HTMLTableCellElement>(null);
  const cellRefs = useRef(new Map<string, HTMLTableCellElement>());
  const refInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLInputElement>(null);
  const clipboardRef = useRef<{ raw: string; bold: boolean } | null>(null);
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
    element: HTMLTableCellElement;
  } | null>(null);

  const computed = useMemo(
    () => computeWorkbook(sheets, { locale, currency }),
    [sheets, locale, currency],
  );

  const hiddenRows = useMemo(
    () =>
      collapsibleGroups && activeSheet ? hiddenRowIdsOf(activeSheet, collapsedGroups) : NO_HIDDEN_ROWS,
    [activeSheet, collapsedGroups, collapsibleGroups],
  );

  /* -------------------------------------------------------- sayfa secimi */

  useEffect(() => {
    if (activeSheetId && activeSheetId !== internalSheetId) {
      setInternalSheetId(activeSheetId);
    }
  }, [activeSheetId, internalSheetId]);

  /* ------------------------------------------------------------ secim */

  useEffect(() => {
    if (!activeSheet) {
      return;
    }
    setSelection((previous) => {
      if (
        previous &&
        activeSheet.rows.some((row) => row.id === previous.focus.rowId) &&
        activeSheet.columns.some((column) => column.key === previous.focus.columnKey)
      ) {
        return previous;
      }
      const firstRow = activeSheet.rows[0];
      const firstColumn = activeSheet.columns[0];
      if (!firstRow || !firstColumn) {
        return null;
      }
      const address = { rowId: firstRow.id, columnKey: firstColumn.key };
      return { anchor: address, focus: address };
    });
  }, [activeSheet]);

  const focusAddress = selection?.focus ?? null;

  // Odakli hucre degisince tuketiciye bildir (en son geri cagri ref'te tutulur).
  const selectionCallbackRef = useRef(onSelectionChange);
  selectionCallbackRef.current = onSelectionChange;
  const focusRowId = focusAddress?.rowId;
  const focusColumnKey = focusAddress?.columnKey;
  useEffect(() => {
    selectionCallbackRef.current?.(
      focusRowId && focusColumnKey
        ? { sheetId: currentSheetId, rowId: focusRowId, columnKey: focusColumnKey }
        : null,
    );
  }, [currentSheetId, focusColumnKey, focusRowId]);

  const refLabel = useCallback(
    (sheet: SpreadsheetSheet, rowId: string, columnKey: string): string => {
      const rowIndex = rowIndexOfId(sheet, rowId);
      const columnIndex = columnIndexOfKey(sheet, columnKey);
      if (rowIndex === -1 || columnIndex === -1) {
        return '';
      }
      return `${colName(columnIndex + 1)}${rowNumberOf(rowIndex)}`;
    },
    [],
  );

  const scrollIntoView = useCallback((element: HTMLElement) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const cellRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const headHeight = headRef.current?.offsetHeight ?? 0;
    const gutterWidth = gutterRef.current?.offsetWidth ?? 0;

    if (cellRect.top < containerRect.top + headHeight) {
      container.scrollTop -= containerRect.top + headHeight - cellRect.top;
    } else if (cellRect.bottom > containerRect.bottom) {
      container.scrollTop += cellRect.bottom - containerRect.bottom;
    }

    if (cellRect.left < containerRect.left + gutterWidth) {
      container.scrollLeft -= containerRect.left + gutterWidth - cellRect.left;
    } else if (cellRect.right > containerRect.right) {
      container.scrollLeft += cellRect.right - containerRect.right;
    }
  }, []);

  const focusCell = useCallback(
    (address: CellAddress, options?: { scroll?: boolean }) => {
      const key = `${address.rowId}${CELL_KEY_SEPARATOR}${address.columnKey}`;
      const element = cellRefs.current.get(key);
      if (!element) {
        return;
      }
      // Duzenleyici ayni hucrede acikken odagi hucreye cekme; aksi halde
      // odak duzenleyiciden cikar ve duzenleme kapanir.
      const editing = editingRef.current;
      const editingThisCell =
        editing !== null &&
        editing.rowId === address.rowId &&
        editing.columnKey === address.columnKey;
      if (!editingThisCell) {
        element.focus({ preventScroll: true });
      }
      if (options?.scroll !== false) {
        scrollIntoView(element);
      }
    },
    [scrollIntoView],
  );

  const select = useCallback(
    (address: CellAddress, options?: { extend?: boolean; scroll?: boolean }) => {
      setSelection((previous) => {
        const next: Selection =
          options?.extend && previous
            ? { anchor: previous.anchor, focus: address }
            : { anchor: address, focus: address };
        return next;
      });
      if (options?.scroll !== false) {
        // Odak, DOM guncellendikten sonra tasinir.
        requestAnimationFrame(() => focusCell(address));
      }
    },
    [focusCell],
  );

  const moveFocus = useCallback(
    (deltaRow: number, deltaColumn: number) => {
      if (!activeSheet || !focusAddress) {
        return;
      }
      const rowIndex = rowIndexOfId(activeSheet, focusAddress.rowId);
      const columnIndex = columnIndexOfKey(activeSheet, focusAddress.columnKey);
      if (rowIndex === -1 || columnIndex === -1) {
        return;
      }
      // Gizli (kapali bolum) satirlar atlanir; adim sayisi gorunen satirlar uzerinden sayilir.
      const rowStep = Math.sign(deltaRow);
      let nextRowIndex = rowIndex;
      for (let remaining = Math.abs(deltaRow); remaining > 0; remaining -= 1) {
        let candidate = nextRowIndex + rowStep;
        while (
          candidate >= 0 &&
          candidate < activeSheet.rows.length &&
          hiddenRows.has((activeSheet.rows[candidate] as { id: string }).id)
        ) {
          candidate += rowStep;
        }
        if (candidate < 0 || candidate >= activeSheet.rows.length) {
          break;
        }
        nextRowIndex = candidate;
      }
      const nextColumnIndex = Math.min(
        Math.max(columnIndex + deltaColumn, 0),
        activeSheet.columns.length - 1,
      );
      const nextRow = activeSheet.rows[nextRowIndex];
      const nextColumn = activeSheet.columns[nextColumnIndex];
      if (!nextRow || !nextColumn) {
        return;
      }
      select({ rowId: nextRow.id, columnKey: nextColumn.key });
    },
    [activeSheet, focusAddress, hiddenRows, select],
  );

  /* ---------------------------------------------------------- tarihce */

  const pushHistory = useCallback(() => {
    setPast((previous) => {
      const next = [...previous, sheets];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setFuture([]);
  }, [sheets]);

  const undo = useCallback(() => {
    setPast((previous) => {
      if (previous.length === 0) {
        return previous;
      }
      const target = previous[previous.length - 1] as SpreadsheetSheet[];
      setFuture((forward) => [...forward, sheets]);
      onChange(target, { type: 'undo', sheetId: currentSheetId });
      return previous.slice(0, -1);
    });
    setEditingState(null);
    setAnnouncement('Geri alindi');
  }, [currentSheetId, onChange, setEditingState, sheets]);

  const redo = useCallback(() => {
    setFuture((previous) => {
      if (previous.length === 0) {
        return previous;
      }
      const target = previous[previous.length - 1] as SpreadsheetSheet[];
      setPast((backward) => [...backward, sheets]);
      onChange(target, { type: 'redo', sheetId: currentSheetId });
      return previous.slice(0, -1);
    });
    setEditingState(null);
    setAnnouncement('Yinelendi');
  }, [currentSheetId, onChange, setEditingState, sheets]);

  /* ------------------------------------------------------ hucre duzenleme */

  const updateCell = useCallback(
    (
      sheetId: string,
      rowId: string,
      columnKey: string,
      raw: string,
    ): SpreadsheetSheet[] =>
      sheets.map((sheet) => {
        if (sheet.id !== sheetId) {
          return sheet;
        }
        return {
          ...sheet,
          rows: sheet.rows.map((row) => {
            if (row.id !== rowId) {
              return row;
            }
            const cells = { ...row.cells };
            const existing = normalizeCell(cells[columnKey]);

            if (raw.trim() === '') {
              delete cells[columnKey];
              return { ...row, cells };
            }

            cells[columnKey] = {
              raw,
              ...(existing?.bold ? { bold: true } : {}),
              ...(existing?.format ? { format: existing.format } : {}),
            };
            return { ...row, cells };
          }),
        };
      }),
    [sheets],
  );

  const commitEdit = useCallback(
    (state: EditingState, options?: { move?: 'down' | 'right' | 'left' }) => {
      // Ayni duzenleme iki kez (blur + tiklama) commit edilmeye calisabilir;
      // referans esitligi ile ikinci deneme elenir.
      if (editingRef.current !== state) {
        return;
      }
      // Deger duzenleyicinin DOM'undan okunur; boylece React'in kaçirdigi bir
      // onChange durumunda bile kullanici girdisi kaybolmaz.
      const draft = editorRef.current?.value ?? state.original;
      setEditingState(null);

      if (draft === state.original) {
        return;
      }

      pushHistory();
      const next = updateCell(currentSheetId, state.rowId, state.columnKey, draft);
      onChange(next, {
        type: 'cell',
        sheetId: currentSheetId,
        rowId: state.rowId,
        columnKey: state.columnKey,
      });

      if (options?.move) {
        if (options.move === 'down') {
          moveFocus(1, 0);
        } else {
          moveFocus(0, options.move === 'right' ? 1 : -1);
        }
      }
    },
    [currentSheetId, moveFocus, onChange, pushHistory, setEditingState, updateCell],
  );

  const handleSheetChange = useCallback(
    (sheetId: string) => {
      if (editingRef.current) {
        commitEdit(editingRef.current);
      }
      setMenu(null);
      setInternalSheetId(sheetId);
      onActiveSheetChange?.(sheetId);
    },
    [commitEdit, onActiveSheetChange],
  );

  const startEdit = useCallback(
    (address: CellAddress, seed?: string) => {
      if (!activeSheet || readOnly) {
        return;
      }
      const row = activeSheet.rows.find((entry) => entry.id === address.rowId);
      if (!row || row.readOnly) {
        return;
      }
      if (activeSheet.columns.find((column) => column.key === address.columnKey)?.readOnly) {
        return;
      }
      const cell = normalizeCell(row.cells[address.columnKey]);
      const original = cell ? String(cell.raw) : '';
      const next: EditingState = {
        rowId: address.rowId,
        columnKey: address.columnKey,
        original,
        ...(seed !== undefined ? { seed } : {}),
      };
      setEditingState(next);
    },
    [activeSheet, readOnly, setEditingState],
  );

  /* --------------------------------------------------- formul cubugu */

  const activeCellRaw = useMemo(() => {
    if (!activeSheet || !focusAddress) {
      return '';
    }
    const row = activeSheet.rows.find((entry) => entry.id === focusAddress.rowId);
    const cell = row ? normalizeCell(row.cells[focusAddress.columnKey]) : undefined;
    return cell ? String(cell.raw) : '';
  }, [activeSheet, focusAddress]);

  useEffect(() => {
    if (document.activeElement !== formulaInputRef.current) {
      if (formulaInputRef.current) {
        formulaInputRef.current.value = activeCellRaw;
      }
    }
    if (refInputRef.current && focusAddress && activeSheet) {
      refInputRef.current.value = refLabel(activeSheet, focusAddress.rowId, focusAddress.columnKey);
    }
  }, [activeCellRaw, activeSheet, focusAddress, refLabel]);

  const commitFormulaBar = useCallback(() => {
    if (!focusAddress || readOnly) {
      return;
    }
    const row = activeSheet?.rows.find((entry) => entry.id === focusAddress.rowId);
    if (!row || row.readOnly) {
      return;
    }
    if (activeSheet?.columns.find((column) => column.key === focusAddress.columnKey)?.readOnly) {
      return;
    }
    const cell = normalizeCell(row.cells[focusAddress.columnKey]);
    const original = cell ? String(cell.raw) : '';
    const draft = formulaInputRef.current?.value ?? '';
    if (draft === original) {
      return;
    }
    pushHistory();
    const next = updateCell(currentSheetId, focusAddress.rowId, focusAddress.columnKey, draft);
    onChange(next, {
      type: 'cell',
      sheetId: currentSheetId,
      rowId: focusAddress.rowId,
      columnKey: focusAddress.columnKey,
    });
  }, [activeSheet, currentSheetId, focusAddress, onChange, pushHistory, readOnly, updateCell]);

  const handleRefSubmit = useCallback(() => {
    if (!activeSheet || !refInputRef.current) {
      return;
    }
    const value = refInputRef.current.value.trim().toUpperCase();
    const match = /^([A-Z]+)(\d+)$/.exec(value);
    if (!match) {
      if (focusAddress) {
        refInputRef.current.value = refLabel(activeSheet, focusAddress.rowId, focusAddress.columnKey);
      }
      return;
    }
    const columnIndex = columnIndexOfKey(activeSheet, match[1] as string);
    const rowNumber = Number.parseInt(match[2] as string, 10);
    const rowIndex = rowNumber - 2;
    const row = activeSheet.rows[rowIndex];
    const column = activeSheet.columns[columnIndex];
    if (!row || !column) {
      setAnnouncement(`Hucre yok: ${value}`);
      if (focusAddress) {
        refInputRef.current.value = refLabel(activeSheet, focusAddress.rowId, focusAddress.columnKey);
      }
      return;
    }
    select({ rowId: row.id, columnKey: column.key });
  }, [activeSheet, focusAddress, refLabel, select]);

  /* ------------------------------------------------------ bicimlendirme */

  const toggleBold = useCallback(() => {
    if (!activeSheet || !focusAddress || readOnly) {
      return;
    }
    const row = activeSheet.rows.find((entry) => entry.id === focusAddress.rowId);
    if (!row || row.readOnly) {
      return;
    }
    const cell = normalizeCell(row.cells[focusAddress.columnKey]);
    const nextBold = !(cell?.bold ?? false);

    pushHistory();
    const next = sheets.map((sheet) => {
      if (sheet.id !== activeSheet.id) {
        return sheet;
      }
      return {
        ...sheet,
        rows: sheet.rows.map((entry) => {
          if (entry.id !== row.id) {
            return entry;
          }
          const cells = { ...entry.cells };
          for (const address of rangeAddresses(activeSheet, selection?.anchor ?? focusAddress, focusAddress)) {
            if (address.rowId !== row.id) {
              continue;
            }
            const target = normalizeCell(cells[address.columnKey]);
            cells[address.columnKey] = {
              raw: target?.raw ?? '',
              bold: nextBold,
              ...(target?.format ? { format: target.format } : {}),
            };
          }
          return { ...entry, cells };
        }),
      };
    });
    onChange(next, {
      type: 'format',
      sheetId: activeSheet.id,
      rowId: row.id,
      columnKey: focusAddress.columnKey,
    });
  }, [activeSheet, focusAddress, onChange, pushHistory, readOnly, selection, sheets]);

  const clearSelection = useCallback(() => {
    if (!activeSheet || !focusAddress || readOnly) {
      return;
    }
    const readOnlyColumns = new Set(
      activeSheet.columns.filter((column) => column.readOnly).map((column) => column.key),
    );
    const targets = rangeAddresses(activeSheet, selection?.anchor ?? focusAddress, focusAddress).filter(
      (address) => !readOnlyColumns.has(address.columnKey),
    );
    if (targets.length === 0) {
      return;
    }
    pushHistory();
    const next = sheets.map((sheet) => {
      if (sheet.id !== activeSheet.id) {
        return sheet;
      }
      return {
        ...sheet,
        rows: sheet.rows.map((row) => {
          const cells = { ...row.cells };
          let changed = false;
          for (const address of targets) {
            if (address.rowId === row.id && cells[address.columnKey] !== undefined) {
              delete cells[address.columnKey];
              changed = true;
            }
          }
          return changed ? { ...row, cells } : row;
        }),
      };
    });
    onChange(next, {
      type: 'clear',
      sheetId: activeSheet.id,
      rowId: focusAddress.rowId,
      columnKey: focusAddress.columnKey,
    });
  }, [activeSheet, focusAddress, onChange, pushHistory, readOnly, selection, sheets]);

  /* ---------------------------------------------------------- pano */

  const copySelection = useCallback(() => {
    if (!activeSheet || !focusAddress) {
      return;
    }
    const row = activeSheet.rows.find((entry) => entry.id === focusAddress.rowId);
    const cell = row ? normalizeCell(row.cells[focusAddress.columnKey]) : undefined;
    const raw = cell ? String(cell.raw) : '';
    clipboardRef.current = { raw, bold: Boolean(cell?.bold) };
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(raw).catch(() => undefined);
    }
    setAnnouncement(`Kopyalandi: ${focusAddress.columnKey}`);
  }, [activeSheet, focusAddress]);

  const pasteSelection = useCallback(() => {
    const clipboard = clipboardRef.current;
    if (!clipboard || !activeSheet || !focusAddress || readOnly) {
      return;
    }
    const row = activeSheet.rows.find((entry) => entry.id === focusAddress.rowId);
    if (!row || row.readOnly) {
      return;
    }
    if (activeSheet.columns.find((column) => column.key === focusAddress.columnKey)?.readOnly) {
      return;
    }
    pushHistory();
    const next = sheets.map((sheet) => {
      if (sheet.id !== activeSheet.id) {
        return sheet;
      }
      return {
        ...sheet,
        rows: sheet.rows.map((entry) => {
          if (entry.id !== row.id) {
            return entry;
          }
          const cells = { ...entry.cells };
          const existing = normalizeCell(cells[focusAddress.columnKey]);
          cells[focusAddress.columnKey] = {
            raw: clipboard.raw,
            ...(clipboard.bold ? { bold: true } : {}),
            ...(existing?.format ? { format: existing.format } : {}),
          };
          return { ...entry, cells };
        }),
      };
    });
    onChange(next, {
      type: 'paste',
      sheetId: activeSheet.id,
      rowId: row.id,
      columnKey: focusAddress.columnKey,
    });
  }, [activeSheet, focusAddress, onChange, pushHistory, readOnly, sheets]);

  /* ------------------------------------------------------ durum cubugu */

  const statusSummary = useMemo(() => {
    if (!activeSheet || !focusAddress) {
      return null;
    }
    const sheetComputed = computed.get(activeSheet.id);
    if (!sheetComputed) {
      return null;
    }
    const targets = rangeAddresses(activeSheet, selection?.anchor ?? focusAddress, focusAddress);
    let sum = 0;
    let count = 0;
    for (const address of targets) {
      const cell = sheetComputed.cells.get(address.rowId)?.get(address.columnKey);
      if (!cell || cell.error) {
        continue;
      }
      const value = cell.value;
      if (typeof value === 'number' && Number.isFinite(value)) {
        sum += value;
        count += 1;
      }
    }
    return { sum, count, average: count > 0 ? sum / count : 0 };
  }, [activeSheet, computed, focusAddress, selection]);

  /* ------------------------------------------------------ klavye */

  const handleGridKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (editing) {
        return;
      }
      if (!activeSheet || !focusAddress) {
        return;
      }

      const key = event.key;
      const modifier = event.ctrlKey || event.metaKey;

      if (modifier) {
        const lower = key.toLowerCase();
        if (lower === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
        if (lower === 'y') {
          event.preventDefault();
          redo();
          return;
        }
        if (lower === 'c') {
          event.preventDefault();
          copySelection();
          return;
        }
        if (lower === 'v') {
          event.preventDefault();
          pasteSelection();
          return;
        }
        if (lower === 'b') {
          event.preventDefault();
          toggleBold();
          return;
        }
        if (lower === 'a') {
          event.preventDefault();
          const lastRow = activeSheet.rows[activeSheet.rows.length - 1];
          const lastColumn = activeSheet.columns[activeSheet.columns.length - 1];
          const firstRow = activeSheet.rows[0];
          const firstColumn = activeSheet.columns[0];
          if (lastRow && lastColumn && firstRow && firstColumn) {
            setSelection({
              anchor: { rowId: firstRow.id, columnKey: firstColumn.key },
              focus: { rowId: lastRow.id, columnKey: lastColumn.key },
            });
          }
          return;
        }
        if (lower === 'home') {
          event.preventDefault();
          const firstRow = activeSheet.rows[0];
          const firstColumn = activeSheet.columns[0];
          if (firstRow && firstColumn) {
            select({ rowId: firstRow.id, columnKey: firstColumn.key });
          }
          return;
        }
        return;
      }

      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          moveFocus(-1, 0);
          return;
        case 'ArrowDown':
          event.preventDefault();
          moveFocus(1, 0);
          return;
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus(0, -1);
          return;
        case 'ArrowRight':
          event.preventDefault();
          moveFocus(0, 1);
          return;
        case 'Tab':
          event.preventDefault();
          moveFocus(0, event.shiftKey ? -1 : 1);
          return;
        case 'Enter':
          event.preventDefault();
          moveFocus(1, 0);
          return;
        case 'F2':
          event.preventDefault();
          startEdit(focusAddress);
          return;
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          clearSelection();
          return;
        case 'Home': {
          event.preventDefault();
          const rowIndex = rowIndexOfId(activeSheet, focusAddress.rowId);
          const row = activeSheet.rows[rowIndex];
          const firstColumn = activeSheet.columns[0];
          if (row && firstColumn) {
            select({ rowId: row.id, columnKey: firstColumn.key });
          }
          return;
        }
        case 'End': {
          event.preventDefault();
          const rowIndex = rowIndexOfId(activeSheet, focusAddress.rowId);
          const row = activeSheet.rows[rowIndex];
          const lastColumn = activeSheet.columns[activeSheet.columns.length - 1];
          if (row && lastColumn) {
            select({ rowId: row.id, columnKey: lastColumn.key });
          }
          return;
        }
        default:
          break;
      }

      if (key.length === 1 && !event.altKey) {
        event.preventDefault();
        startEdit(focusAddress, key);
      }
    },
    [
      activeSheet,
      clearSelection,
      copySelection,
      editing,
      focusAddress,
      moveFocus,
      pasteSelection,
      redo,
      select,
      startEdit,
      toggleBold,
      undo,
    ],
  );

  /* -------------------------------------------------- sutun genisligi */

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>, sheet: SpreadsheetSheet, columnKey: string) => {
      if (!allowColumnResize || readOnly) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      const column = sheet.columns.find((entry) => entry.key === columnKey);
      if (!column) {
        return;
      }
      const key = `${sheet.id}::${columnKey}`;
      const startWidth = columnWidths[key] ?? column.width ?? 140;
      resizeRef.current = {
        key,
        startX: event.clientX,
        startWidth,
        element: event.currentTarget.parentElement as HTMLTableCellElement,
      };
    },
    [allowColumnResize, columnWidths, readOnly],
  );

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const state = resizeRef.current;
      if (!state) {
        return;
      }
      const width = Math.min(Math.max(state.startWidth + (event.clientX - state.startX), 48), 520);
      setColumnWidths((previous) => ({ ...previous, [state.key]: width }));
    };
    const handleUp = () => {
      resizeRef.current = null;
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  /* ------------------------------------------------------ satir islemleri */

  const handleInsertRow = useCallback(() => {
    if (!activeSheet || !onInsertRow) {
      return;
    }
    onInsertRow({ sheetId: activeSheet.id, rowId: focusAddress?.rowId });
  }, [activeSheet, focusAddress, onInsertRow]);

  const handleDeleteRow = useCallback(() => {
    if (!activeSheet || !onDeleteRow || !focusAddress) {
      return;
    }
    onDeleteRow({ sheetId: activeSheet.id, rowId: focusAddress.rowId });
  }, [activeSheet, focusAddress, onDeleteRow]);

  /** Secili hucre gizlenen bir satirda kaldiysa secimi bolum satirina tasir. */
  const keepSelectionVisible = useCallback(
    (sheet: SpreadsheetSheet, nextCollapsed: ReadonlySet<string>) => {
      if (!focusAddress) {
        return;
      }
      const hidden = hiddenRowIdsOf(sheet, nextCollapsed);
      if (!hidden.has(focusAddress.rowId)) {
        return;
      }
      // Gizlenen blok, kapanan satirdan hemen sonra baslar: en yakin gorunen onceki satira git.
      const focusIndex = rowIndexOfId(sheet, focusAddress.rowId);
      for (let index = focusIndex - 1; index >= 0; index -= 1) {
        const candidate = sheet.rows[index];
        if (candidate && !hidden.has(candidate.id)) {
          select({ rowId: candidate.id, columnKey: focusAddress.columnKey });
          return;
        }
      }
    },
    [focusAddress, select],
  );

  const toggleGroup = useCallback(
    (sheet: SpreadsheetSheet, rowId: string) => {
      const key = groupKey(sheet.id, rowId);
      const next = new Set(collapsedGroups);
      const collapsing = !next.has(key);
      if (collapsing) {
        next.add(key);
      } else {
        next.delete(key);
      }
      setCollapsedGroups(next);
      setAnnouncement(collapsing ? labels.collapseGroup : labels.expandGroup);
      if (collapsing) {
        keepSelectionVisible(sheet, next);
      }
    },
    [collapsedGroups, keepSelectionVisible, labels.collapseGroup, labels.expandGroup],
  );

  const setAllGroupsCollapsed = useCallback(
    (collapse: boolean) => {
      if (!activeSheet) {
        return;
      }
      const next = new Set(collapsedGroups);
      const collapsible = collapsibleRowIdsOf(activeSheet);
      for (const row of activeSheet.rows) {
        if (!collapsible.has(row.id)) {
          continue;
        }
        const key = groupKey(activeSheet.id, row.id);
        if (collapse) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      setCollapsedGroups(next);
      setAnnouncement(collapse ? labels.collapseAllGroups : labels.expandAllGroups);
      if (collapse) {
        keepSelectionVisible(activeSheet, next);
      }
    },
    [
      activeSheet,
      collapsedGroups,
      keepSelectionVisible,
      labels.collapseAllGroups,
      labels.expandAllGroups,
    ],
  );

  /* -------------------------------------------- disaridan odak istegi */

  const handledFocusToken = useRef<number | null>(null);

  useEffect(() => {
    if (!focusRequest || handledFocusToken.current === focusRequest.token) {
      return;
    }
    const targetSheet = sheets.find((sheet) => sheet.id === (focusRequest.sheetId ?? currentSheetId));
    if (!targetSheet) {
      return;
    }
    const rowIndex = rowIndexOfId(targetSheet, focusRequest.rowId);
    if (rowIndex === -1) {
      // Satir henuz yok (ornegin filtre degisiyor); sayfalar guncellenince yeniden denenir.
      return;
    }
    handledFocusToken.current = focusRequest.token;

    if (targetSheet.id !== currentSheetId) {
      setInternalSheetId(targetSheet.id);
      onActiveSheetChange?.(targetSheet.id);
    }

    // Hedef kapali bir satirin altindaysa, hedefi gizleyen tum satirlari ac (ic ice olabilir).
    if (collapsibleGroups) {
      const next = new Set(collapsedGroups);
      let changed = false;
      let hidden = hiddenRowIdsOf(targetSheet, next);
      while (hidden.has(focusRequest.rowId)) {
        let opened = false;
        for (let index = rowIndex - 1; index >= 0; index -= 1) {
          const candidate = targetSheet.rows[index];
          if (candidate && !hidden.has(candidate.id)) {
            opened = next.delete(groupKey(targetSheet.id, candidate.id));
            break;
          }
        }
        if (!opened) {
          break;
        }
        changed = true;
        hidden = hiddenRowIdsOf(targetSheet, next);
      }
      if (changed) {
        setCollapsedGroups(next);
      }
    }

    const columnKey =
      focusRequest.columnKey && targetSheet.columns.some((column) => column.key === focusRequest.columnKey)
        ? focusRequest.columnKey
        : targetSheet.columns[0]?.key;
    if (columnKey) {
      select({ rowId: focusRequest.rowId, columnKey });
    }
  }, [
    collapsedGroups,
    collapsibleGroups,
    currentSheetId,
    focusRequest,
    onActiveSheetChange,
    select,
    sheets,
  ]);

  const selectedRow = activeSheet?.rows.find((row) => row.id === focusAddress?.rowId);
  // Toplam satiri yapisaldir; silinemez. Bolum (group) satirlari silinebilir: altindaki satirlara ne
  // olacagina tuketici (onDeleteRow) karar verir.
  const canDeleteRow = Boolean(activeSheet && selectedRow && selectedRow.kind !== 'total');

  // Secim araligi her hucre icin yeniden hesaplanmaz; tek seferde kume olusturulur.
  const activeRangeKeys = useMemo(() => {
    if (!selection || !activeSheet) {
      return new Set<string>();
    }
    return new Set(
      rangeAddresses(activeSheet, selection.anchor, selection.focus).map(
        (entry) => `${entry.rowId} ${entry.columnKey}`,
      ),
    );
  }, [activeSheet, selection]);

  /* ------------------------------------------------------------ render */

  const renderSheet = (sheet: SpreadsheetSheet, isActive: boolean) => {
    const sheetComputed = computed.get(sheet.id);
    const hidden = collapsibleGroups ? hiddenRowIdsOf(sheet, collapsedGroups) : NO_HIDDEN_ROWS;
    const collapsible = collapsibleGroups ? collapsibleRowIdsOf(sheet) : NO_HIDDEN_ROWS;
    const isSelected = (address: CellAddress) =>
      selection?.focus.rowId === address.rowId && selection?.focus.columnKey === address.columnKey;

    const isInRange = (address: CellAddress) =>
      isActive
        ? activeRangeKeys.has(`${address.rowId} ${address.columnKey}`)
        : false;

    const columnWidth = (columnKey: string) => {
      const key = `${sheet.id}::${columnKey}`;
      const column = sheet.columns.find((entry) => entry.key === columnKey);
      return columnWidths[key] ?? column?.width ?? 140;
    };

    // Tablo, sutun genislikleri toplamindan dar olamaz; aksi halde sabit
    // yerlesim sutunlari ezerek yatay kaydirma bozulur.
    const tableWidth =
      gutterWidth + sheet.columns.reduce((total, column) => total + columnWidth(column.key), 0);

    return (
      <section
        key={sheet.id}
        className={styles.panel}
        data-active={isActive ? 'true' : 'false'}
        aria-label={sheet.name}
      >
        <div className={styles.printHead}>
          <p className={styles.printTitle}>{sheet.name}</p>
          {sheet.subtitle ? <p className={styles.printMeta}>{sheet.subtitle}</p> : null}
        </div>

        <div className={styles.gridScroll} ref={isActive ? scrollRef : undefined}>
          <div className={styles.gridInner}>
            <table
              className={styles.table}
              style={{ minWidth: `${tableWidth}px` }}
              role="grid"
              aria-label={sheet.name}
              aria-rowcount={sheet.rows.length + 1}
              aria-colcount={sheet.columns.length}
            >
              <colgroup>
                <col className={styles.gutterCol} />
                {sheet.columns.map((column) => (
                  <col key={column.key} style={{ width: `${columnWidth(column.key)}px` }} />
                ))}
              </colgroup>

              <thead ref={isActive ? headRef : undefined}>
                <tr className={styles.lettersRow} aria-hidden="true">
                  <th className={cn(styles.corner, styles.gutterCol)} ref={isActive ? gutterRef : undefined} />
                  {sheet.columns.map((column, index) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={styles.letter}
                      onContextMenu={(event) =>
                        openContextMenu(event, { kind: 'column', sheetId: sheet.id, columnKey: column.key })
                      }
                    >
                      {colName(index + 1)}
                      {allowColumnResize ? (
                        <span
                          className={styles.resizeHandle}
                          onPointerDown={(event) => handleResizeStart(event, sheet, column.key)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ) : null}
                    </th>
                  ))}
                </tr>
                <tr className={styles.titleRow}>
                  <th className={cn(styles.rowHead, styles.gutterCol)} scope="row">
                    1
                  </th>
                  {sheet.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      role="columnheader"
                      className={cn(styles.titleCell, styles[column.align ?? 'left'])}
                      onContextMenu={(event) =>
                        openContextMenu(event, { kind: 'column', sheetId: sheet.id, columnKey: column.key })
                      }
                    >
                      {column.title}
                      {column.formulaHint ? (
                        <span className={styles.titleHint} title={column.formulaHint}>
                          {column.formulaHint}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sheet.rows.length === 0 ? (
                  <tr>
                    <td className={styles.emptyCell} colSpan={sheet.columns.length + 1}>
                      {labels.empty}
                    </td>
                  </tr>
                ) : null}

                {sheet.rows.map((row, rowIndex) => {
                  if (hidden.has(row.id)) {
                    return null;
                  }

                  const rowClass = cn(
                    styles.row,
                    row.kind === 'group' && styles.groupRow,
                    row.kind === 'item' && styles.itemRow,
                    row.kind === 'total' && styles.totalRow,
                    row.kind === 'note' && styles.noteRow,
                  );

                  if (row.content) {
                    return (
                      <tr key={row.id} className={rowClass} data-row-kind={row.kind}>
                        <th
                          className={cn(styles.rowHead, styles.gutterCol)}
                          scope="row"
                          onContextMenu={(event) =>
                            openContextMenu(event, { kind: 'row', sheetId: sheet.id, rowId: row.id })
                          }
                        >
                          {rowLabel(row, rowIndex)}
                        </th>
                        <td className={styles.contentCell} colSpan={sheet.columns.length}>
                          {row.content}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.id} className={rowClass} data-row-kind={row.kind}>
                      <th
                        className={cn(styles.rowHead, styles.gutterCol)}
                        scope="row"
                        onContextMenu={(event) =>
                          openContextMenu(event, { kind: 'row', sheetId: sheet.id, rowId: row.id })
                        }
                      >
                        {collapsibleGroups ? (
                          <span className={styles.rowHeadInner}>
                            <span className={styles.toggleSlot}>
                              {collapsible.has(row.id) ? (
                                <button
                                  type="button"
                                  className={styles.groupToggle}
                                  data-collapsed={collapsedGroups.has(groupKey(sheet.id, row.id))}
                                  aria-expanded={!collapsedGroups.has(groupKey(sheet.id, row.id))}
                                  aria-label={
                                    collapsedGroups.has(groupKey(sheet.id, row.id))
                                      ? labels.expandGroup
                                      : labels.collapseGroup
                                  }
                                  title={
                                    collapsedGroups.has(groupKey(sheet.id, row.id))
                                      ? labels.expandGroup
                                      : labels.collapseGroup
                                  }
                                  onMouseDown={(event) => event.stopPropagation()}
                                  onClick={() => toggleGroup(sheet, row.id)}
                                >
                                  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                                    <path
                                      d="M3 4.5 6 7.5 9 4.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              ) : null}
                            </span>
                            <span>{rowLabel(row, rowIndex)}</span>
                          </span>
                        ) : (
                          rowLabel(row, rowIndex)
                        )}
                      </th>
                      {sheet.columns.map((column) => {
                        const address = { rowId: row.id, columnKey: column.key };
                        const cell = sheetComputed?.cells.get(row.id)?.get(column.key);
                        const active = isSelected(address);
                        const inRange = isInRange(address);
                        const isEditing =
                          editing?.rowId === row.id && editing?.columnKey === column.key;
                        const mark = cellMarks?.[row.id]?.[column.key];

                        return (
                          <td
                            key={column.key}
                            ref={(element) => {
                              const key = `${row.id}${CELL_KEY_SEPARATOR}${column.key}`;
                              if (element) {
                                cellRefs.current.set(key, element);
                              } else {
                                cellRefs.current.delete(key);
                              }
                            }}
                            role="gridcell"
                            aria-selected={active}
                            aria-invalid={mark?.severity === 'error' ? true : undefined}
                            data-mark={mark?.severity}
                            title={mark?.message}
                            data-row-id={row.id}
                            data-column-key={column.key}
                            tabIndex={active ? 0 : -1}
                            className={cn(
                              styles.cell,
                              styles[column.align ?? 'left'],
                              cell?.formula && styles.formulaCell,
                              inRange && styles.inRange,
                              active && styles.activeCell,
                            )}
                            onMouseDown={(event) => {
                              if (event.button !== 0) {
                                return;
                              }
                              // Tarayicinin hucreye odaklanmasini engelle: odak
                              // asagida elle yonetilir. Aksi halde cift tik
                              // duzenleyiciyi kapatir (odak hucreye gecer).
                              event.preventDefault();
                              // Duzenleme devam ediyorsa once onu kaydet; aksi
                              // halde hucre degisimi duzenlemeyi kaybeder.
                              if (editingRef.current) {
                                commitEdit(editingRef.current);
                              }
                              commitFormulaBar();
                              select(address, { extend: event.shiftKey });
                            }}
                            onDoubleClick={() => startEdit(address)}
                            onContextMenu={(event) => {
                              // Sag tik hucreyi secer (secili aralikta degilse); menu satir/hucre ogelerini sunar
                              if (!inRange) {
                                select(address, { extend: false });
                              }
                              openContextMenu(event, {
                                kind: 'cell',
                                sheetId: sheet.id,
                                rowId: row.id,
                                columnKey: column.key,
                              });
                            }}
                          >
                            {isEditing ? (
                              <input
                                key={`${row.id}:${column.key}`}
                                ref={editorRef}
                                className={styles.cellEditor}
                                defaultValue={editing.seed ?? editing.original}
                                list={column.options ? `${sheet.id}-${column.key}-options` : undefined}
                                autoFocus
                                spellCheck={false}
                                aria-label={`${labels.editCell} ${refLabel(sheet, row.id, column.key)}`}
                                onKeyDown={(event) => {
                                  const current = editingRef.current;
                                  if (!current) {
                                    return;
                                  }
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    commitEdit(current, { move: 'down' });
                                  } else if (event.key === 'Escape') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setEditingState(null);
                                  } else if (event.key === 'Tab') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    commitEdit(current, { move: event.shiftKey ? 'left' : 'right' });
                                  }
                                }}
                                onBlur={() => {
                                  const current = editingRef.current;
                                  if (current) {
                                    commitEdit(current);
                                  }
                                }}
                              />
                            ) : (
                              <span className={styles.cellText}>{cell?.text ?? ''}</span>
                            )}
                            {isEditing && column.options ? (
                              <datalist id={`${sheet.id}-${column.key}-options`}>
                                {column.options.map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  /* ------------------------------------------------------ baglam menusu */

  const menuItemsFor = useCallback(
    (target: SpreadsheetContextTarget): Array<SpreadsheetMenuItem & { builtin?: boolean }> => {
      const items: Array<SpreadsheetMenuItem & { builtin?: boolean }> = [];
      const sheet = sheets.find((entry) => entry.id === target.sheetId);

      if (target.kind !== 'column' && !readOnly) {
        const row = sheet?.rows.find((entry) => entry.id === target.rowId);
        if (onInsertRow) {
          items.push({
            id: 'insert-above',
            label: labels.insertRowAbove,
            builtin: true,
            onSelect: () => onInsertRow({ sheetId: target.sheetId, rowId: target.rowId, position: 'above' }),
          });
          items.push({
            id: 'insert-below',
            label: labels.insertRowBelow,
            builtin: true,
            onSelect: () => onInsertRow({ sheetId: target.sheetId, rowId: target.rowId, position: 'below' }),
          });
        }
        if (onDeleteRow) {
          items.push({
            id: 'delete-row',
            label: labels.deleteRow,
            builtin: true,
            danger: true,
            separatorBefore: items.length > 0,
            disabled: row?.kind === 'total',
            onSelect: () => onDeleteRow({ sheetId: target.sheetId, rowId: target.rowId }),
          });
        }
      }

      const extra = contextMenuItems?.(target) ?? [];
      extra.forEach((item, index) => {
        items.push({ ...item, separatorBefore: item.separatorBefore ?? (index === 0 && items.length > 0) });
      });
      return items;
    },
    [contextMenuItems, labels, onDeleteRow, onInsertRow, readOnly, sheets],
  );

  const openContextMenu = useCallback(
    (event: React.MouseEvent, target: SpreadsheetContextTarget) => {
      if (menuItemsFor(target).length === 0) {
        return; // oge yoksa tarayicinin kendi menusu acilir
      }
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY, target });
    },
    [menuItemsFor],
  );

  const menuItems = useMemo(() => (menu ? menuItemsFor(menu.target) : []), [menu, menuItemsFor]);

  useEffect(() => {
    if (!menu) {
      return undefined;
    }
    const close = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setMenu(null);
      }
    };
    window.addEventListener('keydown', close, true);
    return () => window.removeEventListener('keydown', close, true);
  }, [menu]);

  const activeBold = useMemo(() => {
    if (!activeSheet || !focusAddress) {
      return false;
    }
    const row = activeSheet.rows.find((entry) => entry.id === focusAddress.rowId);
    const cell = row ? normalizeCell(row.cells[focusAddress.columnKey]) : undefined;
    return Boolean(cell?.bold);
  }, [activeSheet, focusAddress]);

  return (
    <div
      className={cn(styles.root, className)}
      style={collapsibleGroups ? ({ '--sheet-gutter-width': `${gutterWidth}px` } as CSSProperties) : undefined}
    >
      {header ? <div className={styles.header}>{header}</div> : null}

      <div className={styles.toolbar}>
        <div className={styles.actions} role="group" aria-label={labels.sheetTabs}>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label={labels.undo}
            title={labels.undo}
            disabled={past.length === 0}
            onClick={undo}
          >
            <Icon name="arrow-left" size={16} />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label={labels.redo}
            title={labels.redo}
            disabled={future.length === 0}
            onClick={redo}
          >
            <Icon name="arrow-right" size={16} />
          </IconButton>

          <span className={styles.separator} role="separator" aria-hidden="true" />

          <IconButton
            size="sm"
            variant="ghost"
            aria-label={labels.bold}
            title={labels.bold}
            aria-pressed={activeBold}
            className={activeBold ? styles.pressed : undefined}
            disabled={readOnly}
            onClick={toggleBold}
          >
            <span className={styles.boldGlyph}>B</span>
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label={labels.copy}
            title={labels.copy}
            disabled={readOnly}
            onClick={copySelection}
          >
            <Icon name="paper" size={16} />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label={labels.paste}
            title={labels.paste}
            disabled={readOnly}
            onClick={pasteSelection}
          >
            <Icon name="paper-upload" size={16} />
          </IconButton>

          {onInsertRow ? (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={labels.insertRow}
              title={labels.insertRow}
              disabled={readOnly}
              onClick={handleInsertRow}
            >
              <Icon name="plus" size={16} />
            </IconButton>
          ) : null}
          {onDeleteRow ? (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={labels.deleteRow}
              title={labels.deleteRow}
              disabled={readOnly || !canDeleteRow}
              onClick={handleDeleteRow}
            >
              <Icon name="delete" size={16} />
            </IconButton>
          ) : null}
          {onReset ? (
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
              {labels.reset}
            </Button>
          ) : null}

          {collapsibleGroups ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setAllGroupsCollapsed(true)}>
                {labels.collapseAllGroups}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAllGroupsCollapsed(false)}>
                {labels.expandAllGroups}
              </Button>
            </>
          ) : null}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="paper-download" size={16} />}
            onClick={() => window.print()}
          >
            {labels.print}
          </Button>

          {toolbar ? <div className={styles.extraToolbar}>{toolbar}</div> : null}
        </div>

        <div className={styles.formulaBar}>
          <label className={styles.refField}>
            <span className="ark-visually-hidden">{labels.cellReference}</span>
            <input
              ref={refInputRef}
              className={styles.refInput}
              type="text"
              spellCheck={false}
              autoComplete="off"
              defaultValue=""
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleRefSubmit();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  refInputRef.current?.blur();
                }
              }}
              onBlur={() => {
                if (activeSheet && focusAddress) {
                  refInputRef.current!.value = refLabel(
                    activeSheet,
                    focusAddress.rowId,
                    focusAddress.columnKey,
                  );
                }
              }}
            />
          </label>
          <span className={styles.fxMark} aria-hidden="true">
            fx
          </span>
          <label className={styles.formulaField}>
            <span className="ark-visually-hidden">{labels.cellContents}</span>
            <input
              ref={formulaInputRef}
              className={styles.formulaInput}
              type="text"
              spellCheck={false}
              autoComplete="off"
              disabled={readOnly}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitFormulaBar();
                  formulaInputRef.current?.blur();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  if (formulaInputRef.current) {
                    formulaInputRef.current.value = activeCellRaw;
                  }
                  formulaInputRef.current?.blur();
                }
              }}
              onBlur={commitFormulaBar}
            />
          </label>
        </div>
      </div>

      <div
        className={styles.workspace}
        ref={gridRef}
        onKeyDown={handleGridKeyDown}
        onMouseDown={() => setMenu(null)}
      >
        {sheets.map((sheet) => renderSheet(sheet, sheet.id === activeSheet?.id))}
      </div>

      <div className={styles.footerBar}>
        <div className={styles.tabs} role="tablist" aria-label={labels.sheetTabs}>
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              type="button"
              role="tab"
              aria-selected={sheet.id === activeSheet?.id}
              className={cn(styles.tab, sheet.id === activeSheet?.id && styles.tabActive)}
              onClick={() => handleSheetChange(sheet.id)}
            >
              {sheet.name}
            </button>
          ))}
        </div>

        <div className={styles.status}>
          {status ??
            (statusSummary ? (
              <>
                <span>
                  {labels.statusSum}:{' '}
                  {statusSummary.count > 0 ? statusSummary.sum.toLocaleString('tr-TR') : '0'}
                </span>
                {statusSummary.count > 1 ? (
                  <span>
                    {labels.statusAverage}: {statusSummary.average.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                  </span>
                ) : null}
                {statusSummary.count > 0 ? (
                  <span>
                    {labels.statusCount}: {statusSummary.count}
                  </span>
                ) : null}
              </>
            ) : null)}
        </div>
      </div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}

      {menu && menuItems.length > 0 ? (
        <div
          className={styles.menu}
          role="menu"
          style={{
            left: `${Math.max(4, Math.min(menu.x, window.innerWidth - 240))}px`,
            top: `${Math.max(4, Math.min(menu.y, window.innerHeight - menuItems.length * 38 - 16))}px`,
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.separatorBefore ? <hr className={styles.menuSeparator} /> : null}
              <button
                type="button"
                role="menuitem"
                className={cn(styles.menuItem, item.danger && styles.menuItemDanger)}
                disabled={item.disabled}
                onClick={() => {
                  setMenu(null);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="ark-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={labels.resetTitle}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              {labels.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setResetOpen(false);
                setPast([]);
                setFuture([]);
                onReset?.();
              }}
            >
              {labels.resetConfirm}
            </Button>
          </>
        }
      >
        <p className={styles.modalBody}>{labels.resetBody}</p>
      </Modal>
    </div>
  );
}
