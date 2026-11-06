/*
 * CSS Modules tip bildirimi, kiti dogrudan kaynaktan (source-export) tuketen
 * uygulamalarin TypeScript programina eklenmelidir; bu yuzden referans yoluyla
 * baglanir.
 */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./types/css.d.ts" />
/* eslint-enable @typescript-eslint/triple-slash-reference */

export { Alert } from './components/Alert/Alert';
export type { AlertProps, AlertVariant } from './components/Alert/Alert';

export { Avatar } from './components/Avatar/Avatar';
export type { AvatarProps, AvatarSize } from './components/Avatar/Avatar';

export { Badge } from './components/Badge/Badge';
export type { BadgeProps, BadgeSize, BadgeVariant } from './components/Badge/Badge';

export { Breadcrumbs } from './components/Breadcrumbs/Breadcrumbs';
export type { BreadcrumbItem, BreadcrumbsProps } from './components/Breadcrumbs/Breadcrumbs';

export { Button } from './components/Button/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/Button';

export { ButtonGroup } from './components/ButtonGroup/ButtonGroup';
export type { ButtonGroupProps } from './components/ButtonGroup/ButtonGroup';

export { Card, CardBody, CardFooter, CardHeader } from './components/Card/Card';
export type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
} from './components/Card/Card';

export { Checkbox } from './components/Checkbox/Checkbox';
export type { CheckboxProps } from './components/Checkbox/Checkbox';

export { IconButton } from './components/IconButton/IconButton';
export type { IconButtonProps } from './components/IconButton/IconButton';

export { Input } from './components/Input/Input';
export type { InputProps, InputSize } from './components/Input/Input';

export { Modal } from './components/Modal/Modal';
export type { ModalProps, ModalSize } from './components/Modal/Modal';

export { Pagination } from './components/Pagination/Pagination';
export type { PaginationProps } from './components/Pagination/Pagination';

export { Select } from './components/Select/Select';
export type { SelectOption, SelectProps, SelectSize } from './components/Select/Select';

export { Spinner } from './components/Spinner/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner/Spinner';

export { Spreadsheet } from './components/Spreadsheet/Spreadsheet';
export type {
  SpreadsheetAlign,
  SpreadsheetCell,
  SpreadsheetCellMark,
  SpreadsheetCellValue,
  SpreadsheetChange,
  SpreadsheetChangeType,
  SpreadsheetColumn,
  SpreadsheetContextTarget,
  SpreadsheetFocusRequest,
  SpreadsheetLabels,
  SpreadsheetMarkSeverity,
  SpreadsheetMenuItem,
  SpreadsheetNumberFormat,
  SpreadsheetNumberFormatOptions,
  SpreadsheetProps,
  SpreadsheetRow,
  SpreadsheetRowCommand,
  SpreadsheetRowKind,
  SpreadsheetSelectionAddress,
  SpreadsheetSheet,
} from './components/Spreadsheet/types';
export {
  colIndex,
  colName,
  evaluateFormulaSafe,
  formatNumber,
  normalizeRef,
  parseRef,
} from './components/Spreadsheet/formula';
export type { SpreadsheetErrorCode } from './components/Spreadsheet/formula';

export { Switch } from './components/Switch/Switch';
export type { SwitchProps, SwitchSize } from './components/Switch/Switch';

export { Table } from './components/Table/Table';
export type { TableColumn, TableProps } from './components/Table/Table';

export { Tabs } from './components/Tabs/Tabs';
export type { TabItem, TabsProps } from './components/Tabs/Tabs';

export { Textarea } from './components/Textarea/Textarea';
export type { TextareaProps } from './components/Textarea/Textarea';

/* --- Calisma alani (workspace) bilesenleri: pencere, izgara, menu, grafik --- */
export { WorkWindow } from './components/WorkWindow/WorkWindow';
export type { WorkWindowProps } from './components/WorkWindow/WorkWindow';

export { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarSpacer } from './components/Toolbar/Toolbar';
export type { ToolbarButtonProps, ToolbarProps, ToolbarTone } from './components/Toolbar/Toolbar';

export { Menu } from './components/Menu/Menu';
export type { MenuItem, MenuProps } from './components/Menu/Menu';
export { ContextMenu } from './components/Menu/ContextMenu';
export type { ContextMenuPosition, ContextMenuProps } from './components/Menu/ContextMenu';
export { MenuBar } from './components/Menu/MenuBar';
export type { MenuBarItem, MenuBarProps } from './components/Menu/MenuBar';

export { DataGrid } from './components/DataGrid/DataGrid';
export type {
  DataGridAlign,
  DataGridCellTone,
  DataGridColumn,
  DataGridHeaderGroup,
  DataGridLevel,
  DataGridProps,
  DataGridRowSpan,
  DataGridRowTone,
} from './components/DataGrid/DataGrid';

export { FunctionKeyBar } from './components/FunctionKeyBar/FunctionKeyBar';
export type {
  FunctionKey,
  FunctionKeyBarProps,
  FunctionKeyTone,
} from './components/FunctionKeyBar/FunctionKeyBar';
export { SheetPager } from './components/FunctionKeyBar/SheetPager';
export type { SheetPagerProps } from './components/FunctionKeyBar/SheetPager';

export { StatusBar, StatusBarItem, StatusBarSpacer } from './components/StatusBar/StatusBar';
export type {
  StatusBarItemProps,
  StatusBarProps,
  StatusBarTone,
} from './components/StatusBar/StatusBar';

export { ModuleNav } from './components/ModuleNav/ModuleNav';
export type { ModuleNavItem, ModuleNavProps } from './components/ModuleNav/ModuleNav';

export { DualListPicker } from './components/DualListPicker/DualListPicker';
export type { DualListItem, DualListPickerProps } from './components/DualListPicker/DualListPicker';

export { NavPanel } from './components/NavPanel/NavPanel';
export type { NavPanelGroup, NavPanelItem, NavPanelProps } from './components/NavPanel/NavPanel';

export { TreeView } from './components/TreeView/TreeView';
export type { TreeNode, TreeViewProps } from './components/TreeView/TreeView';

export { DonutChart } from './components/DonutChart/DonutChart';
export type { DonutChartProps } from './components/DonutChart/DonutChart';
export { computeDonutSegments } from './components/DonutChart/donut';
export type { DonutDatum, DonutSegment } from './components/DonutChart/donut';

export { GanttChart } from './components/GanttChart/GanttChart';
export type { GanttChartProps, GanttRow, GanttTone } from './components/GanttChart/GanttChart';
export {
  addDays,
  buildMonthSpans,
  computeRange,
  diffInDays,
  isWeekend,
  parseIsoDate,
} from './components/GanttChart/gantt';
export type { MonthSpan } from './components/GanttChart/gantt';

export { FieldGroup, FieldRow } from './components/FieldGroup/FieldGroup';
export type { FieldGroupProps, FieldRowProps } from './components/FieldGroup/FieldGroup';

export { PromptDialog } from './components/PromptDialog/PromptDialog';
export type { PromptAction, PromptDialogProps, PromptTone } from './components/PromptDialog/PromptDialog';

export { ProgressBar } from './components/ProgressBar/ProgressBar';
export type { ProgressBarProps, ProgressSize, ProgressTone } from './components/ProgressBar/ProgressBar';

export { cn } from './lib/cn';
export type { ClassValue } from './lib/cn';

export { getInitials } from './lib/initials';

export { Icon } from './icons/Icon';
export type { IconProps } from './icons/Icon';
export { ICON_NAMES, ICON_NAME_BY_NODE, ICON_NAME_BY_SOURCE } from './icons/iconNames';
export type { IconName } from './icons/iconNames';

export { THEME_TOKEN_NAMES } from './styles/tokens';
export type { ThemeName, ThemeTokenMap, ThemeTokenName } from './styles/tokens';
