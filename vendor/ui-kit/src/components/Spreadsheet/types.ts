import type { ReactNode } from 'react';

/** Hucre iceriginin yatay hizasi. */
export type SpreadsheetAlign = 'left' | 'center' | 'right';

/**
 * Satir tipi; tablonun gorunumunu belirler.
 *
 * - `default` — normal satir
 * - `group`   — bolum basligi (orn. metraj kalemi grubu)
 * - `item`    — kalem satiri
 * - `total`   — toplam satiri (ters kontrast)
 * - `note`    — aciklama / yorum satiri (soluk, italik); onceki satirin devami gibi okunur
 */
export type SpreadsheetRowKind = 'default' | 'group' | 'item' | 'total' | 'note';

/** Sayi bicimi. */
export type SpreadsheetNumberFormat = 'text' | 'integer' | 'number' | 'currency' | 'percent';

/** Tek hucre. */
export interface SpreadsheetCell {
  /**
   * Ham icerik. `=` ile basliyorsa formul olarak degerlendirilir; aksi halde
   * duz metin ya da sayidir.
   */
  raw: string | number;
  /** Kalin yazim. */
  bold?: boolean;
  /** Hucreye ozgu bicim (sutun varsayilanini gecersiz kilar). */
  format?: SpreadsheetNumberFormat;
}

/** Hucre degeri: kisayol (`'Aciklama'`) ya da tam hucre nesnesi. */
export type SpreadsheetCellValue = SpreadsheetCell | string | number;

/** Sutun tanimi. */
export interface SpreadsheetColumn {
  /**
   * Benzersiz anahtar. Sutunun sirasi, tablo adresini (A, B, C) belirler;
   * formuller bu harflerle referans verir.
   */
  key: string;
  /** Baslik icerigi. */
  title: ReactNode;
  /** Sabit genislik (px). */
  width?: number;
  /** Yatay hizalama. Varsayilan: `left`. */
  align?: SpreadsheetAlign;
  /** Varsayilan sayi bicimi. */
  format?: SpreadsheetNumberFormat;
  /** Sutun basliginin erisilebilirlik aciklamasi. */
  description?: string;
  /**
   * Sutun duzenlenemez: hesaplanan sutunlar icin. Hucre duzenleme, silme ve yapistirma bu sutunda
   * yok sayilir.
   */
  readOnly?: boolean;
  /**
   * Onerilen degerler: hucre duzenlenirken acilir liste olarak gosterilir (serbest yazim da kabul
   * edilir; listede olmayan degeri tuketici dogrulamayla isaretleyebilir).
   */
  options?: string[];
  /** Baslikta basligin altinda gosterilen kisa formul / aciklama (ornegin "Miktar × Birim Fiyat"). */
  formulaHint?: string;
}

/** Satir tanimi. */
export interface SpreadsheetRow {
  /**
   * Satir kimligi. React anahtari ve secim adresi olarak kullanilir; satir
   * ekleme/silme sonrasi secimin kaybolmamasi icin stabildir.
   */
  id: string;
  /** Satir tipi. */
  kind?: SpreadsheetRowKind;
  /** Sutun anahtari -> hucre. */
  cells: Record<string, SpreadsheetCellValue>;
  /** Satirin tamamini kaplayan ozel icerik (grafik, aciklama). */
  content?: ReactNode;
  /** Duzenlenemez satir. */
  readOnly?: boolean;
  /**
   * Hiyerarsi seviyesi (1-9). Sayfadaki satirlardan en az birinde verilirse acma/kapama seviye
   * tabanli olur: bir satirin alt agaci, kendinden sonraki ve seviyesi daha buyuk olan satirlardir
   * (seviyesi olmayan `note` satirlari, onlerindeki seviyeli satirin altindadir). Boylece her
   * seviyedeki satir (baslik ya da poz) kapatilabilir.
   */
  level?: number;
  /** Sol seritte satir numarasi gosterilmesin (ornegin yorum satirlari). Adreslemeyi etkilemez. */
  hideRowNumber?: boolean;
}

/** Sayfa (sheet). */
export interface SpreadsheetSheet {
  /** Benzersiz kimlik. */
  id: string;
  /** Sekme etiketi ve formul referansi (`'Sayfa'!A1`). */
  name: string;
  /** Sutunlar. Sira, A/B/C adreslerini belirler. */
  columns: SpreadsheetColumn[];
  /** Veri satirlari. */
  rows: SpreadsheetRow[];
  /** Alt baslik; yazdirma basliginda ve durum cubugunda kullanilir. */
  subtitle?: string;
}

/** Veri degisikliginin kaynagi. */
export type SpreadsheetChangeType =
  | 'cell'
  | 'clear'
  | 'format'
  | 'paste'
  | 'rows'
  | 'reset'
  | 'undo'
  | 'redo';

/** Degisiklik bilgisi; `onChange` ile birlikte verilir. */
export interface SpreadsheetChange {
  /** Degisikligin turu. */
  type: SpreadsheetChangeType;
  /** Degisen sayfa. */
  sheetId: string;
  /** Degisen satirin kimligi (varsa). */
  rowId?: string;
  /** Degisen sutunun anahtari (varsa). */
  columnKey?: string;
}

/** Satir ekleme/silme komutunun baglami. */
export interface SpreadsheetRowCommand {
  /** Komutun uygulanacagi sayfa. */
  sheetId: string;
  /** Hedef satirin kimligi. Satir eklemede referans, silmede silinecek satir. */
  rowId?: string;
  /**
   * Satir eklemede yeni satirin referans satira gore konumu: baglam menusunden `above` (uste) ya da
   * `below` (alta); arac cubugu dugmesinde verilmez (alta eklenir).
   */
  position?: 'above' | 'below';
}

/** Sayi bicimi ayarlari. */
export interface SpreadsheetNumberFormatOptions {
  /** `Intl` yereli. Varsayilan: `tr-TR`. */
  locale?: string;
  /** Para birimi (yalnizca `currency` biciminde). Varsayilan: `TRY`. */
  currency?: string;
}

/** Kullaniciya gorunen metinler. */
export interface SpreadsheetLabels {
  undo: string;
  redo: string;
  bold: string;
  copy: string;
  paste: string;
  print: string;
  insertRow: string;
  deleteRow: string;
  reset: string;
  cellReference: string;
  cellContents: string;
  sheetTabs: string;
  editCell: string;
  statusSum: string;
  statusAverage: string;
  statusCount: string;
  empty: string;
  resetTitle: string;
  resetBody: string;
  resetConfirm: string;
  cancel: string;
  collapseGroup: string;
  expandGroup: string;
  collapseAllGroups: string;
  expandAllGroups: string;
  insertRowAbove: string;
  insertRowBelow: string;
}

/** Sag tik (baglam) menusunun acildigi yer. */
export type SpreadsheetContextTarget =
  | { kind: 'cell'; sheetId: string; rowId: string; columnKey: string }
  | { kind: 'row'; sheetId: string; rowId: string }
  | { kind: 'column'; sheetId: string; columnKey: string };

/** Baglam menusune tuketicinin ekledigi oge. */
export interface SpreadsheetMenuItem {
  /** Benzersiz kimlik. */
  id: string;
  /** Gorunen ad. */
  label: string;
  /** Secilince cagrilir; menu once kapanir. */
  onSelect: () => void;
  /** Pasif oge. */
  disabled?: boolean;
  /** Yikici eylem (kirmizi). */
  danger?: boolean;
  /** Ogenin ustune ayirici cizgi. */
  separatorBefore?: boolean;
}

/** Hucre isaretinin onemi. */
export type SpreadsheetMarkSeverity = 'error' | 'warning';

/**
 * Hucre isareti: dogrulama gibi disaridan gelen bilgiyi hucrede gosterir
 * (kose isareti, renkli cerceve ve ipucu metni). Veriyi degistirmez.
 */
export interface SpreadsheetCellMark {
  /** Isaretin onemi; renk ve `aria-invalid` buna gore belirlenir. */
  severity: SpreadsheetMarkSeverity;
  /** Hucreye gelinince gosterilen aciklama. */
  message: string;
}

/** Secili hucrenin adresi (`onSelectionChange` ile bildirilir). */
export interface SpreadsheetSelectionAddress {
  sheetId: string;
  rowId: string;
  columnKey: string;
}

/**
 * Disaridan odak istegi: tuketici belirli bir hucreye gidilmesini ister
 * (ornegin dogrulama sorununa tiklayinca). Ayni hucreye tekrar gitmek icin
 * `token` degistirilir.
 */
export interface SpreadsheetFocusRequest {
  /** Hedef sayfa; verilmezse etkin sayfa. */
  sheetId?: string;
  /** Hedef satirin kimligi. Satir henuz yoksa istek, satir gelene kadar bekler. */
  rowId: string;
  /** Hedef sutun anahtari; verilmezse ilk sutun. */
  columnKey?: string;
  /** Her yeni istek icin farkli bir deger (sayac). */
  token: number;
}

/** Bilesen prop'lari. */
export interface SpreadsheetProps {
  /** Sayfalar. */
  sheets: SpreadsheetSheet[];
  /** Veri degistiginde cagrilir. */
  onChange: (sheets: SpreadsheetSheet[], change: SpreadsheetChange) => void;
  /** Aktif sayfa kimligi. Verilmezse ilk sayfa kullanilir. */
  activeSheetId?: string;
  /** Aktif sayfa degistiginde cagrilir. */
  onActiveSheetChange?: (sheetId: string) => void;
  /** Salt okunur mod; hucre duzenleme ve satir islemleri kapanir. */
  readOnly?: boolean;
  /** Ust bolum (belge basligi, ozet). */
  header?: ReactNode;
  /** Arac cubuguna eklenen ogeler. */
  toolbar?: ReactNode;
  /** Alt bolum. */
  footer?: ReactNode;
  /**
   * Durum cubugu icerigi. Verilmezse secim ozeti (toplam / ortalama / sayi)
   * gosterilir.
   */
  status?: ReactNode;
  /**
   * Satir ekleme istegi. Verilmezse "satir ekle" dugmesi gosterilmez.
   * Yeni satirlari tuketici uretir; bilesen yalnizca istegi iletir.
   */
  onInsertRow?: (command: SpreadsheetRowCommand) => void;
  /** Satir silme istegi. Verilmezse "satir sil" dugmesi gosterilmez. */
  onDeleteRow?: (command: SpreadsheetRowCommand) => void;
  /** Sifirlama istegi; onay diyalogu bilesende gosterilir. */
  onReset?: () => void;
  /** Sutun genisligi degistirilebilir mi. Varsayilan: `true`. */
  allowColumnResize?: boolean;
  /** Sayi bicimi ayarlari. */
  numberFormat?: SpreadsheetNumberFormatOptions;
  /**
   * Sag tik menusune eklenecek ogeler. Hucre, satir basligi ve sutun basligi uzerinde cagrilir; bos dizi
   * doner ve yerlesik oge yoksa menu acilmaz. Hucre ve satir basliginda yerlesik "satir ekle / sil" ogeleri
   * (`onInsertRow` / `onDeleteRow` verilmisse) once gelir.
   */
  contextMenuItems?: (target: SpreadsheetContextTarget) => SpreadsheetMenuItem[];
  /** Kullaniciya gorunen metinler. */
  labels?: Partial<SpreadsheetLabels>;
  /**
   * Satirlarin acilip kapanmasini etkinlestirir. Satirlarda `level` varsa seviye tabanli (her
   * seviyedeki satir kapanabilir), yoksa bolum (`group`) tabanli: kapali bir bolumun altindaki satirlar
   * (sonraki `group` ya da `total` satirina kadar) gizlenir. Gizleme yalnizca gorseldir;
   * formuller ve satir numaralari degismez.
   * Varsayilan: `false`.
   */
  collapsibleGroups?: boolean;
  /**
   * Hucre isaretleri: satir kimligi -> sutun anahtari -> isaret. Verilmeyen hucreler
   * isaretsizdir. Sayfalar yeniden uretilse de satir kimlikleri stabil oldugu surece korunur.
   */
  cellMarks?: Record<string, Record<string, SpreadsheetCellMark>>;
  /**
   * Odakli hucre degistiginde cagrilir (secim yoksa `null`). Tuketicinin "secili satirin
   * altina ekle" gibi komutlari icin satir bilgisini disaridan bilmesini saglar.
   */
  onSelectionChange?: (address: SpreadsheetSelectionAddress | null) => void;
  /**
   * Belirli bir hucreye gitme istegi. Hucre secilir ve gorunume kaydirilir; hedef satir
   * kapali bir bolumun altindaysa bolum acilir.
   */
  focusRequest?: SpreadsheetFocusRequest;
  /** Ek sinif. */
  className?: string;
}
