/**
 * Type declarations for /dist/nexa-components.js
 *
 * All 41 component functions. Signatures derived from the actual source.
 */

import type { VNode, Ref, ToastItem } from "./nexa.js";

/** Convenience alias — every component accepts arbitrary extra props via spread. */
type ExtraProps = Record<string, unknown>;

// ── Button ─────────────────────────────────────────────────────────────────

export declare function Button(props?: {
  variant?: "text" | "outlined" | "tonal" | "contained";
  className?: string;
  type?: "button" | "submit" | "reset";
  children?: VNode;
} & ExtraProps): VNode;

// ── IconButton ─────────────────────────────────────────────────────────────

export declare function IconButton(props?: {
  label: string;
  variant?: "text" | "outlined" | "tonal" | "contained";
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Card ───────────────────────────────────────────────────────────────────

export declare function Card(props?: {
  className?: string;
  padded?: boolean;
  children?: VNode;
} & ExtraProps): VNode;

// ── Alert ──────────────────────────────────────────────────────────────────

export declare function Alert(props?: {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Badge ──────────────────────────────────────────────────────────────────

export declare function Badge(props?: {
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Chip ───────────────────────────────────────────────────────────────────

export declare function Chip(props?: {
  active?: boolean;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── FormField ──────────────────────────────────────────────────────────────

export declare function FormField(props?: {
  id?: string;
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── TextField ──────────────────────────────────────────────────────────────

export declare function TextField(props?: {
  id?: string;
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
} & ExtraProps): VNode;

// ── Textarea ───────────────────────────────────────────────────────────────

export declare function Textarea(props?: {
  id?: string;
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
} & ExtraProps): VNode;

// ── Select ─────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export declare function Select(props?: {
  id?: string;
  label?: string;
  help?: string;
  error?: string;
  options?: SelectOption[];
  required?: boolean;
  className?: string;
  inputClassName?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Checkbox ───────────────────────────────────────────────────────────────

export declare function Checkbox(props?: {
  id?: string;
  label?: string;
  help?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
} & ExtraProps): VNode;

// ── Tabs ───────────────────────────────────────────────────────────────────

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export declare function Tabs(props?: {
  value?: string;
  onChange?: (value: string) => void;
  items?: TabItem[];
  className?: string;
}): VNode;

// ── Spinner ────────────────────────────────────────────────────────────────

export declare function Spinner(props?: {
  label?: string;
  className?: string;
} & ExtraProps): VNode;

// ── Dialog ─────────────────────────────────────────────────────────────────

export declare function Dialog(props?: {
  open?: boolean;
  id?: string;
  title?: string;
  closeLabel?: string;
  onClose?: () => void;
  actions?: VNode;
  size?: "sm" | "lg" | "xl" | string;
  draggable?: boolean;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── EmptyState ─────────────────────────────────────────────────────────────

export declare function EmptyState(props?: {
  title?: string;
  description?: string;
  action?: VNode;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Table ──────────────────────────────────────────────────────────────────

export interface TableColumn<R = Record<string, unknown>> {
  key: string;
  header: string;
  align?: "left" | "right";
  sortable?: boolean;
  render?: (row: R, index: number) => VNode;
}

export interface TableSort {
  key: string | null;
  dir: "asc" | "desc";
}

export declare function Table<R extends Record<string, unknown> = Record<string, unknown>>(
  props?: {
    columns?: TableColumn<R>[];
    rows?: R[];
    getRowKey?: (row: R, index: number) => string | number;
    emptyTitle?: string;
    emptyDescription?: string;
    sortable?: boolean;
    defaultSort?: TableSort;
    onSort?: (sort: TableSort) => void;
    className?: string;
  } & ExtraProps,
): VNode;

// ── Toast ──────────────────────────────────────────────────────────────────

export declare function Toast(props?: {
  open?: boolean;
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  action?: VNode;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Progress ───────────────────────────────────────────────────────────────

export declare function Progress(props?: {
  value?: number;
  max?: number;
  label?: string;
  className?: string;
} & ExtraProps): VNode;

// ── Drawer ─────────────────────────────────────────────────────────────────

export declare function Drawer(props?: {
  open?: boolean;
  id?: string;
  side?: "left" | "right";
  width?: number | string;
  title?: string;
  closeLabel?: string;
  onClose?: () => void;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Dropdown ───────────────────────────────────────────────────────────────

export interface DropdownItem {
  key?: string | number;
  label?: string;
  icon?: VNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export declare function Dropdown(props?: {
  id?: string;
  trigger?: VNode;
  items?: DropdownItem[];
  align?: "left" | "right";
  className?: string;
} & ExtraProps): VNode;

// ── Tooltip ────────────────────────────────────────────────────────────────

export declare function Tooltip(props?: {
  content?: string;
  position?: "top" | "bottom" | "left" | "right";
  /** Prefix for the generated tooltip bubble id (`${id}-bubble`). Defaults to "nexa-tooltip". */
  id?: string;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Pagination ─────────────────────────────────────────────────────────────

export declare function Pagination(props?: {
  page?: number;
  total?: number;
  siblings?: number;
  onChange?: (page: number) => void;
  className?: string;
}): VNode;

// ── Switch ─────────────────────────────────────────────────────────────────

export declare function Switch(props?: {
  id?: string;
  label?: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  className?: string;
} & ExtraProps): VNode;

// ── Collapse ───────────────────────────────────────────────────────────────

export declare function Collapse(props?: {
  title?: string;
  defaultOpen?: boolean;
  /** Controlled open state — omit for uncontrolled. */
  open?: boolean;
  onToggle?: (nextOpen: boolean) => void;
  actions?: VNode;
  badge?: string | number;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Accordion ──────────────────────────────────────────────────────────────

export interface AccordionItem {
  key: string;
  title: string;
  children?: VNode;
  disabled?: boolean;
}

export declare function Accordion(props?: {
  items?: AccordionItem[];
  /** Allow multiple panels open simultaneously — default `false`. */
  multiple?: boolean;
  /** Initially-open key(s) for the uncontrolled mode. */
  defaultOpen?: string | string[];
  /** Controlled: current open key(s). Omit to use uncontrolled mode. */
  open?: string | string[];
  /** Called when a panel is toggled: `(key, nextOpenKeys) => void`. */
  onToggle?: (key: string, nextOpenKeys: string[]) => void;
  className?: string;
} & ExtraProps): VNode;

// ── Navbar ─────────────────────────────────────────────────────────────────

export interface NavbarItem {
  key?: string | number;
  label: string;
  href?: string;
  icon?: VNode;
  active?: boolean;
  onClick?: (event: Event) => void;
}

export declare function Navbar(props?: {
  brand?: VNode;
  items?: NavbarItem[];
  actions?: VNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (nextOpen: boolean) => void;
  className?: string;
} & ExtraProps): VNode;

// ── Combobox ───────────────────────────────────────────────────────────────

export interface ComboboxOption {
  value: string | number;
  label: string;
}

export declare function Combobox(props?: {
  id?: string;
  label?: string;
  help?: string;
  error?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  options?: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
} & ExtraProps): VNode;

// ── ContextMenu ────────────────────────────────────────────────────────────

export interface ContextMenuItem {
  key?: string | number;
  label?: string;
  icon?: VNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export declare function ContextMenu(props?: {
  open?: boolean;
  x?: number;
  y?: number;
  items?: ContextMenuItem[];
  onClose?: () => void;
  /** Accessible name for the menu (no trigger element to derive one from). Defaults to "Context menu". */
  ariaLabel?: string;
  className?: string;
}): VNode;

// ── FileDropZone ───────────────────────────────────────────────────────────

export declare function FileDropZone(props?: {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  progress?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
} & ExtraProps): VNode;

// ── CodeEditor ─────────────────────────────────────────────────────────────

export declare function CodeEditor(props?: {
  value?: string;
  onChange?: (value: string) => void;
  mode?: string;
  theme?: string;
  options?: Record<string, unknown>;
  className?: string;
} & ExtraProps): VNode;

// ── ToastStack ─────────────────────────────────────────────────────────────

export declare function ToastStack(props?: {
  toasts?: ToastItem[];
  onClose?: (id: string) => void;
  className?: string;
}): VNode;

// ── AppBar ─────────────────────────────────────────────────────────────────

export declare function AppBar(props?: {
  title?: string;
  leading?: VNode;
  actions?: VNode;
  className?: string;
} & ExtraProps): VNode;

// ── BottomNav ──────────────────────────────────────────────────────────────

export interface BottomNavItem {
  value: string;
  label: string;
  icon?: VNode;
  badge?: string | number;
}

export declare function BottomNav(props?: {
  items?: BottomNavItem[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}): VNode;

// ── BottomSheet ────────────────────────────────────────────────────────────

export declare function BottomSheet(props?: {
  open?: boolean;
  title?: string;
  onClose?: () => void;
  children?: VNode;
  className?: string;
}): VNode;

// ── FAB ────────────────────────────────────────────────────────────────────

export declare function FAB(props?: {
  label?: string;
  extended?: boolean;
  aboveNav?: boolean;
  children?: VNode;
  className?: string;
} & ExtraProps): VNode;

// ── SpeedDial ──────────────────────────────────────────────────────────────

export interface SpeedDialItem {
  key?: string | number;
  label: string;
  icon?: VNode;
  onClick?: (event: Event) => void;
}

export declare function SpeedDial(props?: {
  icon?: VNode;
  label?: string;
  items?: SpeedDialItem[];
  /** Stack items upward above the trigger instead of inline. */
  orbit?: boolean;
  className?: string;
} & ExtraProps): VNode;

// ── SwipeableListItem ──────────────────────────────────────────────────────

export interface SwipeableAction {
  key?: string | number;
  label?: string;
  icon?: VNode;
  className?: string;
  style?: Record<string, string>;
  onClick?: () => void;
}

export declare function SwipeableListItem(props?: {
  children?: VNode;
  actions?: SwipeableAction[];
  actionWidth?: number;
  className?: string;
} & ExtraProps): VNode;

// ── ThemeToggle ────────────────────────────────────────────────────────────

export declare function ThemeToggle(props?: {
  className?: string;
} & ExtraProps): VNode;

// ── PaletteSwitcher ────────────────────────────────────────────────────────

export declare function PaletteSwitcher(props?: {
  className?: string;
} & ExtraProps): VNode;

// ── DesignSwitcher ─────────────────────────────────────────────────────────

export declare function DesignSwitcher(props?: {
  className?: string;
} & ExtraProps): VNode;

// ── TabPanel ───────────────────────────────────────────────────────────────

export declare function TabPanel(props?: {
  id?: string;
  activeId?: string;
  className?: string;
  children?: VNode;
} & ExtraProps): VNode;

// ── Stepper ────────────────────────────────────────────────────────────────

export interface StepperStep {
  label: string;
  description?: string;
}

export declare function Stepper(props?: {
  steps?: StepperStep[];
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
} & ExtraProps): VNode;
