import { h, useEffect, useRef, useState, useCallback, useTheme, usePalette, useDesign, useMemo, useId } from "./nexa.js";

function startDrag(e, panel) {
  if (!panel || e.button !== 0) return;
  const rect = panel.getBoundingClientRect();
  const offX = e.clientX - rect.left;
  const offY = e.clientY - rect.top;

  panel.style.position = "fixed";
  panel.style.margin = "0";
  panel.style.left = `${rect.left}px`;
  panel.style.top = `${rect.top}px`;
  panel.style.transform = "none";
  panel.style.animation = "none";

  const onMove = (ev) => {
    const x = Math.max(0, Math.min(window.innerWidth  - panel.offsetWidth,  ev.clientX - offX));
    const y = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, ev.clientY - offY));
    panel.style.left = `${x}px`;
    panel.style.top  = `${y}px`;
  };

  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
  e.preventDefault();
}

const buttonVariants = {
  text: "m-button",
  contained: "m-button m-button-contained",
  tonal: "m-button m-button-tonal",
  danger: "m-button m-button-danger",
};

const alertVariants = {
  info: "m-alert m-alert-info",
  success: "m-alert m-alert-success",
  warning: "m-alert m-alert-warning",
  danger: "m-alert m-alert-danger",
};

export function Button({
  variant = "text",
  className = "",
  type = "button",
  children,
  ...props
} = {}) {
  return h(
    "button",
    {
      ...props,
      type,
      className: joinClasses(buttonVariants[variant] || buttonVariants.text, className),
    },
    children,
  );
}

export function IconButton({
  label,
  variant = "tonal",
  className = "",
  children,
  ...props
} = {}) {
  return h(
    Button,
    {
      ...props,
      variant,
      className: joinClasses("m-icon-button", className),
      ariaLabel: label,
      title: props.title || label,
    },
    children,
  );
}

export function Card({ className = "", padded = true, children, ...props } = {}) {
  return h(
    "article",
    {
      ...props,
      className: joinClasses("m-card", padded && "m-card-padded", className),
    },
    children,
  );
}

export function Alert({
  variant = "info",
  title,
  className = "",
  children,
  ...props
} = {}) {
  return h(
    "div",
    {
      ...props,
      className: joinClasses(alertVariants[variant] || alertVariants.info, className),
      role: props.role || "status",
    },
    title && h("strong", { className: "m-alert-title" }, title),
    hasChildren(children) && h("div", { className: "m-alert-body" }, children),
  );
}

export function Badge({ className = "", children, ...props } = {}) {
  return h("span", { ...props, className: joinClasses("m-badge", className) }, children);
}

export function Chip({ active = false, className = "", children, ...props } = {}) {
  return h(
    "span",
    {
      ...props,
      className: joinClasses("m-chip", active && "m-chip-active", className),
    },
    children,
  );
}

export function FormField({
  id,
  label,
  help,
  error,
  required = false,
  className = "",
  children,
  ...props
} = {}) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return h(
    "div",
    { ...props, className: joinClasses("m-form-field", className) },
    label &&
      h(
        "label",
        { className: "m-label", htmlFor: id },
        label,
        required && h("span", { className: "m-required", ariaLabel: "required" }, "*"),
      ),
    children,
    help && h("p", { id: helpId, className: "m-help" }, help),
    error && h("p", { id: errorId, className: "m-error" }, error),
  );
}

export function TextField({
  id,
  label,
  help,
  error,
  required = false,
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  return h(
    FormField,
    { id, label, help, error, required, className },
    h("input", fieldProps({ id, error, help, required, inputClassName, props })),
  );
}

export function Textarea({
  id,
  label,
  help,
  error,
  required = false,
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const { type, ...textareaProps } = props;

  return h(
    FormField,
    { id, label, help, error, required, className },
    h("textarea", fieldProps({ id, error, help, required, inputClassName, props: textareaProps })),
  );
}

export function Select({
  id,
  label,
  help,
  error,
  options = [],
  required = false,
  className = "",
  inputClassName = "",
  children,
  ...props
} = {}) {
  return h(
    FormField,
    { id, label, help, error, required, className },
    h(
      "select",
      fieldProps({ id, error, help, required, inputClassName, props }),
      hasChildren(children)
        ? children
        : options.map((option) =>
            h("option", { value: option.value, disabled: option.disabled }, option.label),
          ),
    ),
  );
}

export function Checkbox({
  id,
  label,
  help,
  error,
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return h(
    "div",
    { className: joinClasses("m-form-field", className) },
    h(
      "label",
      { className: "m-checkbox" },
      h("input", {
        ...props,
        id,
        type: "checkbox",
        className: inputClassName,
        ariaInvalid: error ? "true" : undefined,
        ariaDescribedby: joinClasses(helpId, errorId) || undefined,
      }),
      h("span", null, label),
    ),
    help && h("p", { id: helpId, className: "m-help" }, help),
    error && h("p", { id: errorId, className: "m-error" }, error),
  );
}

export function Tabs({ value, onChange, items = [], className = "" } = {}) {
  return h(
    "div",
    { className: joinClasses("m-tabs", className), role: "tablist" },
    items.map((item) =>
      h(
        "button",
        {
          key: item.value,
          type: "button",
          className: joinClasses("m-tab", item.value === value && "m-tab-active"),
          role: "tab",
          ariaSelected: item.value === value ? "true" : "false",
          disabled: item.disabled,
          onClick: () => onChange?.(item.value),
        },
        item.label,
      ),
    ),
  );
}

export function Spinner({ label = "Loading", className = "", ...props } = {}) {
  return h(
    "span",
    {
      ...props,
      className: joinClasses("m-spinner", className),
      role: "status",
      ariaLabel: label,
    },
  );
}

export function Dialog({
  open = false,
  id = "nexa-dialog",
  title,
  closeLabel = "Close",
  onClose,
  actions,
  size,
  draggable = false,
  className = "",
  children,
  ...props
} = {}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    queueMicrotask(() => focusFirstElement(panelRef.current));

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event, panelRef.current);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const titleId = title ? `${id}-title` : undefined;

  return h(
    "div",
    {
      className: "m-dialog-backdrop",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      },
    },
    h(
      "section",
      {
        ...props,
        ref: panelRef,
        id,
        className: joinClasses("m-dialog", size && `m-dialog-${size}`, className),
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: titleId,
        tabIndex: -1,
      },
      h(
        "header",
        {
          className: joinClasses("m-dialog-header", draggable && "m-dialog-header-draggable"),
          onMouseDown: draggable ? (e) => startDrag(e, panelRef.current) : undefined,
        },
        title && h("h2", { id: titleId }, title),
        h(IconButton, { label: closeLabel, onClick: onClose }, "x"),
      ),
      h("div", { className: "m-dialog-body" }, children),
      hasChildren(actions) && h("footer", { className: "m-dialog-actions" }, actions),
    ),
  );
}

export function EmptyState({
  title = "No results",
  description,
  action,
  className = "",
  children,
  ...props
} = {}) {
  return h(
    "section",
    { ...props, className: joinClasses("m-empty-state", className) },
    h("div", { className: "m-empty-state-mark", ariaHidden: "true" }, "i"),
    h("h2", null, title),
    description && h("p", null, description),
    hasChildren(children) && h("div", { className: "m-empty-state-body" }, children),
    hasChildren(action) && h("div", { className: "m-empty-state-action" }, action),
  );
}

export function Table({
  columns = [],
  rows = [],
  getRowKey = (row, index) => row.id ?? index,
  emptyTitle = "No rows",
  emptyDescription = "Try changing the filters.",
  sortable = false,
  defaultSort,
  onSort,
  className = "",
  ...props
} = {}) {
  const [sort, setSort] = useState(defaultSort ?? { key: null, dir: "asc" });

  const sortedRows = useMemo(() => {
    if (!sortable || !sort.key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, sortable]);

  const handleSort = (key) => {
    if (!sortable) return;
    const next = { key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" };
    setSort(next);
    onSort?.(next);
  };

  return h(
    "div",
    { className: joinClasses("m-table-wrap", className) },
    h(
      "table",
      { ...props, className: "m-table" },
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          columns.map((column) =>
            h(
              "th",
              {
                key: column.key,
                scope: "col",
                className: joinClasses(
                  column.align === "right" && "m-table-cell-right",
                  sortable && column.sortable !== false && "m-table-th-sortable",
                  sortable && sort.key === column.key && "m-table-th-sorted",
                ),
                onClick: sortable && column.sortable !== false
                  ? () => handleSort(column.key)
                  : undefined,
                ariaSort: sort.key === column.key
                  ? sort.dir === "asc" ? "ascending" : "descending"
                  : undefined,
              },
              column.header,
              sortable && column.sortable !== false && h(
                "span",
                { className: "m-table-sort-icon", ariaHidden: "true" },
                sort.key === column.key
                  ? sort.dir === "asc" ? "↑" : "↓"
                  : "↕",
              ),
            ),
          ),
        ),
      ),
      sortedRows.length > 0
        ? h(
            "tbody",
            null,
            sortedRows.map((row, rowIndex) =>
              h(
                "tr",
                { key: getRowKey(row, rowIndex) },
                columns.map((column) =>
                  h(
                    "td",
                    {
                      key: column.key,
                      className: column.align === "right" && "m-table-cell-right",
                    },
                    column.render ? column.render(row, rowIndex) : row[column.key],
                  ),
                ),
              ),
            ),
          )
        : h(
            "tbody",
            null,
            h(
              "tr",
              null,
              h(
                "td",
                { colSpan: columns.length || 1 },
                h(EmptyState, { title: emptyTitle, description: emptyDescription }),
              ),
            ),
          ),
    ),
  );
}

export function Toast({
  open = true,
  variant = "info",
  title,
  message,
  duration = 0,
  onClose,
  action,
  className = "",
  children,
  ...props
} = {}) {
  useEffect(() => {
    if (!open || !duration) {
      return undefined;
    }

    const timeout = window.setTimeout(() => onClose?.(), duration);
    return () => window.clearTimeout(timeout);
  }, [open, duration, onClose]);

  if (!open) {
    return null;
  }

  return h(
    "aside",
    {
      ...props,
      className: joinClasses("m-toast", `m-toast-${variant}`, className),
      role: variant === "danger" ? "alert" : "status",
      ariaLive: variant === "danger" ? "assertive" : "polite",
    },
    h(
      "div",
      { className: "m-toast-content" },
      title && h("strong", null, title),
      message && h("p", null, message),
      hasChildren(children) && children,
    ),
    hasChildren(action) && h("div", { className: "m-toast-action" }, action),
    onClose && h(IconButton, { label: "Dismiss", onClick: onClose }, "x"),
  );
}

export function Progress({
  value = 0,
  max = 100,
  label,
  className = "",
  ...props
} = {}) {
  const numericMax = finiteNumber(max, 100);
  const numericValue = finiteNumber(value, 0);
  const safeMax = numericMax > 0 ? numericMax : 100;
  const safeValue = Math.min(safeMax, Math.max(0, numericValue));
  const percent = (safeValue / safeMax) * 100;

  return h(
    "div",
    {
      ...props,
      className: joinClasses("m-progress", className),
      role: "progressbar",
      ariaValuenow: safeValue,
      ariaValuemin: 0,
      ariaValuemax: safeMax,
      ariaLabel: label,
    },
    h("div", { className: "m-progress-bar", style: { width: `${percent}%` } }),
  );
}

export function Drawer({
  open = false,
  id = "nexa-drawer",
  side = "left",
  width = 280,
  title,
  closeLabel = "Close",
  onClose,
  className = "",
  children,
  ...props
} = {}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    queueMicrotask(() => focusFirstElement(panelRef.current));

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }
      if (event.key === "Tab") {
        trapFocus(event, panelRef.current);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const titleId = title ? `${id}-title` : undefined;

  return h(
    "div",
    {
      className: "m-drawer-backdrop",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      },
    },
    h(
      "aside",
      {
        ...props,
        ref: panelRef,
        id,
        className: joinClasses("m-drawer", `m-drawer-${side}`, className),
        style: { width: typeof width === "number" ? `${width}px` : width },
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: titleId,
        tabIndex: -1,
      },
      h(
        "header",
        { className: "m-drawer-header" },
        title && h("h2", { id: titleId }, title),
        h(IconButton, { label: closeLabel, onClick: onClose }, "x"),
      ),
      h("div", { className: "m-drawer-body" }, children),
    ),
  );
}

export function Dropdown({
  id,
  trigger,
  items = [],
  align = "left",
  className = "",
  ...props
} = {}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = id ? `${id}-menu` : undefined;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    queueMicrotask(() => focusFirstElement(menuRef.current));

    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        focusFirstElement(wrapRef.current);
        return;
      }

      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        moveMenuFocus(event, menuRef.current);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return h(
    "div",
    { ...props, id, ref: wrapRef, className: joinClasses("m-dropdown", className) },
    h(
      "div",
      {
        className: "m-dropdown-trigger",
        onClick: () => setOpen((v) => !v),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        },
        ariaHaspopup: "true",
        ariaExpanded: open ? "true" : "false",
        ariaControls: menuId,
      },
      trigger,
    ),
    open &&
      h(
        "ul",
        {
          ref: menuRef,
          id: menuId,
          className: joinClasses("m-dropdown-menu", `m-dropdown-menu-${align}`),
          role: "menu",
        },
        items.map((item, index) =>
          h(
            "li",
            { key: item.key ?? index, className: "m-dropdown-item", role: "none" },
            item.divider
              ? h("hr", { className: "m-dropdown-divider" })
              : h(
                  "button",
                  {
                    type: "button",
                    className: joinClasses(
                      "m-dropdown-button",
                      item.danger && "m-dropdown-button-danger",
                    ),
                    role: "menuitem",
                    disabled: item.disabled,
                    onClick: () => {
                      if (item.disabled) {
                        return;
                      }
                      setOpen(false);
                      item.onClick?.();
                    },
                  },
                  item.icon && h("span", { className: "m-dropdown-icon", ariaHidden: "true" }, item.icon),
                  item.label,
                ),
          ),
        ),
      ),
  );
}

export function Tooltip({
  content,
  position = "top",
  className = "",
  children,
  ...props
} = {}) {
  return h(
    "span",
    {
      ...props,
      className: joinClasses("m-tooltip-wrap", `m-tooltip-${position}`, className),
      dataset: { tooltip: content },
    },
    children,
  );
}

export function Pagination({
  page = 1,
  total = 1,
  siblings = 1,
  onChange,
  className = "",
} = {}) {
  const safeTotal = Math.max(1, Math.floor(finiteNumber(total, 1)));
  const safePage = Math.min(safeTotal, Math.max(1, Math.floor(finiteNumber(page, 1))));
  const pages = buildPageRange(safePage, safeTotal, siblings);

  return h(
    "nav",
    { className: joinClasses("m-pagination", className), ariaLabel: "Pagination" },
    h(
      "button",
      {
        type: "button",
        className: "m-pagination-item",
        disabled: safePage <= 1,
        onClick: () => onChange?.(safePage - 1),
        ariaLabel: "Previous page",
      },
      "\u2039",
    ),
    pages.map((p, index) =>
      p === null
        ? h("span", { key: `ellipsis-${index}`, className: "m-pagination-ellipsis" }, "\u2026")
        : h(
            "button",
            {
              key: p,
              type: "button",
              className: joinClasses(
                "m-pagination-item",
                p === safePage && "m-pagination-item-active",
              ),
              ariaCurrent: p === safePage ? "page" : undefined,
              onClick: () => onChange?.(p),
            },
            String(p),
          ),
    ),
    h(
      "button",
      {
        type: "button",
        className: "m-pagination-item",
        disabled: safePage >= safeTotal,
        onClick: () => onChange?.(safePage + 1),
        ariaLabel: "Next page",
      },
      "\u203a",
    ),
  );
}

function buildPageRange(page, total, siblings) {
  if (total <= 1) return [1];

  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const range = [1];

  if (showLeftEllipsis) range.push(null);

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== total) range.push(p);
  }

  if (showRightEllipsis) range.push(null);
  if (total > 1) range.push(total);

  return range;
}

function fieldProps({ id, error, help, required, inputClassName, props }) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return {
    ...props,
    id,
    required,
    className: joinClasses("m-field", error && "m-field-error", inputClassName),
    ariaInvalid: error ? "true" : undefined,
    ariaDescribedby: joinClasses(helpId, errorId) || undefined,
  };
}

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function hasChildren(children) {
  return Array.isArray(children) ? children.length > 0 : children !== undefined;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function focusFirstElement(container) {
  if (!container) {
    return;
  }

  const focusable = getFocusableElements(container);
  const target = focusable[0] || container;

  if (typeof target.focus === "function") {
    target.focus();
  }
}

function trapFocus(event, container) {
  const focusable = getFocusableElements(container);

  if (focusable.length === 0) {
    event.preventDefault();
    container?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function moveMenuFocus(event, container) {
  const items = getFocusableElements(container);

  if (items.length === 0) {
    return;
  }

  event.preventDefault();

  if (event.key === "Home") {
    items[0].focus();
    return;
  }

  if (event.key === "End") {
    items[items.length - 1].focus();
    return;
  }

  const currentIndex = Math.max(0, items.indexOf(document.activeElement));
  const direction = event.key === "ArrowUp" ? -1 : 1;
  const nextIndex = (currentIndex + direction + items.length) % items.length;
  items[nextIndex].focus();
}

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    ),
  );
}

// ── Switch ─────────────────────────────────────────────────

export function Switch({
  id,
  label,
  checked = false,
  onChange,
  disabled,
  className = "",
  ...props
} = {}) {
  return h(
    "label",
    { className: joinClasses("m-switch", disabled && "m-switch-disabled", className) },
    h("input", {
      ...props,
      id,
      type: "checkbox",
      className: "m-switch-input",
      checked,
      disabled,
      onChange,
    }),
    h("span", { className: "m-switch-track", ariaHidden: "true" }),
    label && h("span", { className: "m-switch-label" }, label),
  );
}

// ── Collapse ───────────────────────────────────────────────

export function Collapse({
  title,
  defaultOpen = false,
  open,
  onToggle,
  actions,
  badge,
  className = "",
  children,
  ...props
} = {}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : internalOpen;

  const toggle = () => {
    if (open === undefined) setInternalOpen((v) => !v);
    onToggle?.(!isOpen);
  };

  return h(
    "div",
    { ...props, className: joinClasses("m-collapse", isOpen && "m-collapse-open", className) },
    h(
      "button",
      {
        type: "button",
        className: "m-collapse-header",
        onClick: toggle,
        ariaExpanded: isOpen ? "true" : "false",
      },
      h("span", { className: "m-collapse-chevron", ariaHidden: "true" }),
      h("span", { className: "m-collapse-title" }, title),
      badge && h("span", { className: "m-collapse-badge" }, badge),
      hasChildren(actions) &&
        h(
          "span",
          {
            className: "m-collapse-actions",
            onClick: (e) => e.stopPropagation(),
          },
          actions,
        ),
    ),
    h(
      "div",
      { className: "m-collapse-body-wrap" },
      h("div", { className: "m-collapse-body-inner" },
        h("div", { className: "m-collapse-body" }, children),
      ),
    ),
  );
}

// ── Accordion ──────────────────────────────────────────────
//
// Multiple collapsible panels in a single grouped container.
//
// Props:
//   items        [{ key, title, children, disabled? }]
//   multiple     allow several panels open at once (default false)
//   defaultOpen  initially-open key or array of keys (uncontrolled)
//   open         controlled: key | key[] | undefined
//   onToggle     (key, nextOpenKeys) => void
//   className    extra CSS classes
//
// Keyboard: trigger buttons are native <button> elements — Enter and Space
// activate them for free. aria-expanded + aria-controls wire up screen readers.

function normalizeAccordionOpen(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export function Accordion({
  items = [],
  multiple = false,
  defaultOpen,
  open,
  onToggle,
  className = "",
  ...props
} = {}) {
  const [internalOpen, setInternalOpen] = useState(() => normalizeAccordionOpen(defaultOpen));
  const openKeys = open !== undefined ? normalizeAccordionOpen(open) : internalOpen;

  const toggle = (key) => {
    const isOpen = openKeys.includes(key);
    const nextOpenKeys = multiple
      ? isOpen ? openKeys.filter((k) => k !== key) : [...openKeys, key]
      : isOpen ? [] : [key];
    if (open === undefined) setInternalOpen(nextOpenKeys);
    onToggle?.(key, nextOpenKeys);
  };

  return h(
    "div",
    { ...props, className: joinClasses("m-accordion", className) },
    items.map((item) => {
      const isOpen = openKeys.includes(item.key);
      const headerId = `${item.key}-header`;
      const panelId = `${item.key}-panel`;

      return h(
        "div",
        {
          key: item.key,
          className: joinClasses("m-accordion-item", isOpen && "m-accordion-item-open"),
        },
        h(
          "button",
          {
            id: headerId,
            type: "button",
            className: "m-accordion-header",
            disabled: item.disabled,
            ariaExpanded: isOpen ? "true" : "false",
            ariaControls: panelId,
            onClick: item.disabled ? undefined : () => toggle(item.key),
            onKeyDown: item.disabled ? undefined : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(item.key);
              }
            },
          },
          h("span", { className: "m-accordion-chevron", ariaHidden: "true" }),
          h("span", { className: "m-accordion-title" }, item.title),
        ),
        h(
          "div",
          {
            id: panelId,
            role: "region",
            className: "m-accordion-body-wrap",
            ariaLabelledby: headerId,
          },
          h(
            "div",
            { className: "m-accordion-body-inner" },
            h("div", { className: "m-accordion-body" }, item.children),
          ),
        ),
      );
    }),
  );
}

// ── Navbar ─────────────────────────────────────────────────

export function Navbar({
  brand,
  items = [],
  actions,
  defaultOpen = false,
  open,
  onToggle,
  className = "",
  ...props
} = {}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : internalOpen;
  const menuId = useId();
  const navRef = useRef(null);

  const setOpen = (next) => {
    if (open === undefined) setInternalOpen(next);
    onToggle?.(next);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const onMouseDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const hasMenu = items.length > 0 || hasChildren(actions);

  return h(
    "nav",
    {
      ...props,
      ref: navRef,
      className: joinClasses("m-navbar", isOpen && "m-navbar-open", className),
    },
    hasChildren(brand) && h("div", { className: "m-navbar-brand" }, brand),
    hasMenu &&
      h(
        "button",
        {
          type: "button",
          className: "m-navbar-toggle",
          onClick: () => setOpen(!isOpen),
          ariaExpanded: isOpen ? "true" : "false",
          ariaControls: menuId,
          ariaLabel: isOpen ? "Close menu" : "Open menu",
        },
        h("span", { className: "m-navbar-toggle-icon", ariaHidden: "true" }),
      ),
    hasMenu &&
      h(
        "div",
        { className: "m-navbar-menu-wrap" },
        h(
          "div",
          { className: "m-navbar-menu-inner" },
          h(
            "div",
            { id: menuId, className: "m-navbar-menu" },
            items.length > 0 &&
              h(
                "ul",
                { className: "m-navbar-nav", role: "list" },
                items.map((item, i) =>
                  h(
                    "li",
                    { key: item.key ?? i },
                    h(
                      "a",
                      {
                        className: joinClasses(
                          "m-navbar-link",
                          item.active && "m-navbar-link-active",
                        ),
                        href: item.href || "#",
                        onClick: (event) => {
                          setOpen(false);
                          item.onClick?.(event);
                        },
                        ariaCurrent: item.active ? "page" : undefined,
                      },
                      item.icon && h("span", { className: "m-navbar-link-icon", ariaHidden: "true" }, item.icon),
                      item.label,
                    ),
                  ),
                ),
              ),
            hasChildren(actions) && h("div", { className: "m-navbar-actions" }, actions),
          ),
        ),
      ),
  );
}

// ── Combobox ───────────────────────────────────────────────

export function Combobox({
  id,
  label,
  help,
  error,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  required = false,
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return undefined;

    queueMicrotask(() => inputRef.current?.focus());

    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const select = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
    setQuery("");
  };

  return h(
    FormField,
    { id, label, help, error, required, className },
    h(
      "div",
      { ref: wrapRef, className: "m-combobox" },
      h(
        "button",
        {
          ...props,
          type: "button",
          id,
          className: joinClasses(
            "m-field m-combobox-trigger",
            error && "m-field-error",
            inputClassName,
          ),
          onClick: () => setOpen((v) => !v),
          ariaHaspopup: "listbox",
          ariaExpanded: open ? "true" : "false",
        },
        h(
          "span",
          { className: "m-combobox-value" },
          selectedLabel ||
            h("span", { className: "m-combobox-placeholder" }, placeholder),
        ),
        h("span", { className: "m-combobox-chevron", ariaHidden: "true" }, "▾"),
      ),
      open &&
        h(
          "div",
          { className: "m-combobox-dropdown" },
          h(
            "div",
            { className: "m-combobox-search-wrap" },
            h("input", {
              ref: inputRef,
              type: "text",
              className: "m-combobox-search",
              placeholder: searchPlaceholder,
              value: query,
              onInput: (e) => setQuery(e.target.value),
            }),
          ),
          h(
            "ul",
            { className: "m-combobox-list", role: "listbox" },
            filtered.length > 0
              ? filtered.map((opt) =>
                  h(
                    "li",
                    {
                      key: opt.value,
                      className: joinClasses(
                        "m-combobox-option",
                        opt.value === value && "m-combobox-option-selected",
                      ),
                      role: "option",
                      ariaSelected: opt.value === value ? "true" : "false",
                      onMouseDown: (e) => {
                        e.preventDefault();
                        select(opt);
                      },
                    },
                    opt.label,
                  ),
                )
              : h("li", { className: "m-combobox-empty" }, "No results"),
          ),
        ),
    ),
  );
}

// ── ContextMenu ────────────────────────────────────────────

export function ContextMenu({ open = false, x = 0, y = 0, items = [], onClose, className = "" } = {}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose?.();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return h(
    "ul",
    {
      ref: menuRef,
      className: joinClasses("m-context-menu", className),
      role: "menu",
      style: { top: `${y}px`, left: `${x}px` },
    },
    items.map((item, i) =>
      h(
        "li",
        { key: item.key ?? i, className: "m-context-menu-item", role: "none" },
        item.divider
          ? h("hr", { className: "m-context-menu-divider" })
          : h(
              "button",
              {
                type: "button",
                className: joinClasses(
                  "m-context-menu-button",
                  item.danger && "m-context-menu-button-danger",
                ),
                role: "menuitem",
                disabled: item.disabled,
                onClick: () => {
                  onClose?.();
                  item.onClick?.();
                },
              },
              item.icon &&
                h("span", { className: "m-context-menu-icon", ariaHidden: "true" }, item.icon),
              item.label,
            ),
      ),
    ),
  );
}

// ── FileDropZone ───────────────────────────────────────────

export function FileDropZone({
  onFiles,
  accept,
  multiple = false,
  progress,
  label = "Drop files here or click to browse",
  hint,
  disabled = false,
  className = "",
  ...props
} = {}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (files && files.length > 0) onFiles?.(Array.from(files));
  };

  return h(
    "div",
    {
      ...props,
      className: joinClasses(
        "m-dropzone m-file-dropzone",
        dragging && "m-dropzone-active",
        disabled && "m-file-dropzone-disabled",
        className,
      ),
      onClick: () => {
        if (!disabled) inputRef.current?.click();
      },
      onDragOver: (e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      },
      onDragLeave: () => setDragging(false),
      onDrop: (e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      },
    },
    h("input", {
      ref: inputRef,
      type: "file",
      className: "m-file-dropzone-input",
      accept,
      multiple,
      onChange: (e) => handleFiles(e.target.files),
    }),
    h(
      "div",
      { className: "m-file-dropzone-content" },
      h("span", { className: "m-file-dropzone-icon", ariaHidden: "true" }, "↑"),
      h("p", { className: "m-file-dropzone-label" }, label),
      hint && h("p", { className: "m-file-dropzone-hint" }, hint),
    ),
    progress != null &&
      h("div", { className: "m-file-dropzone-progress" }, h(Progress, { value: progress })),
  );
}

// ── CodeEditor ─────────────────────────────────────────────

export function CodeEditor({
  value,
  onChange,
  mode = "javascript",
  theme = "default",
  options = {},
  className = "",
  ...props
} = {}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || editorRef.current) return undefined;

    if (typeof window.CodeMirror !== "undefined") {
      editorRef.current = window.CodeMirror(el, {
        value: value ?? "",
        mode,
        theme,
        lineNumbers: true,
        ...options,
      });
      editorRef.current.on("change", (cm) => {
        const v = cm.getValue();
        valueRef.current = v;
        onChange?.(v);
      });
      return () => {
        editorRef.current?.getWrapperElement?.()?.remove();
        editorRef.current = null;
      };
    }

    if (typeof window.monaco !== "undefined") {
      editorRef.current = window.monaco.editor.create(el, {
        value: value ?? "",
        language: mode,
        theme,
        ...options,
      });
      editorRef.current.onDidChangeModelContent(() => {
        const v = editorRef.current.getValue();
        valueRef.current = v;
        onChange?.(v);
      });
      return () => editorRef.current?.dispose?.();
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!editorRef.current || Object.is(value, valueRef.current)) return;
    valueRef.current = value ?? "";
    if (editorRef.current.setValue) {
      editorRef.current.setValue(value ?? "");
    } else if (editorRef.current.getModel) {
      editorRef.current.getModel()?.setValue(value ?? "");
    }
  }, [value]);

  const hasLib = typeof window !== "undefined" &&
    (typeof window.CodeMirror !== "undefined" || typeof window.monaco !== "undefined");

  if (!hasLib) {
    return h("textarea", {
      ...props,
      className: joinClasses("m-field m-code-editor-fallback", className),
      value: value ?? "",
      onInput: (e) => onChange?.(e.target.value),
      spellcheck: false,
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off",
    });
  }

  return h("div", {
    ...props,
    ref: containerRef,
    className: joinClasses("m-code-editor", className),
  });
}

// ── ToastStack ─────────────────────────────────────────────

export function ToastStack({ toasts = [], onClose, className = "" } = {}) {
  if (!toasts.length) return null;

  return h(
    "div",
    { className: joinClasses("m-toast-stack", className), ariaLive: "polite" },
    toasts.map((t) =>
      h(Toast, {
        key: t.id,
        open: true,
        variant: t.variant,
        title: t.title,
        message: t.message,
        duration: t.duration,
        onClose: () => onClose?.(t.id),
      }),
    ),
  );
}

// ── Mobile components ──────────────────────────────────────

export function AppBar({
  title,
  leading,
  actions,
  className = "",
  ...props
} = {}) {
  return h(
    "header",
    { ...props, className: joinClasses("m-app-bar", className) },
    leading,
    h("h1", { className: "m-app-bar-title" }, title),
    actions && h("div", { className: "m-app-bar-actions" }, actions),
  );
}

export function BottomNav({ items = [], value, onChange, className = "" } = {}) {
  return h(
    "nav",
    { className: joinClasses("m-bottom-nav", className), role: "navigation" },
    items.map((item) =>
      h(
        "button",
        {
          key: item.value,
          type: "button",
          className: joinClasses(
            "m-bottom-nav-item",
            value === item.value && "m-bottom-nav-item-active",
          ),
          onClick: () => onChange?.(item.value),
          ariaLabel: item.label,
          ariaCurrent: value === item.value ? "page" : undefined,
        },
        h(
          "span",
          { className: "m-bottom-nav-icon" },
          item.icon,
          item.badge != null &&
            h("span", { className: "m-bottom-nav-badge" }, item.badge),
        ),
        h("span", null, item.label),
      ),
    ),
  );
}

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  className = "",
} = {}) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return h(
    "div",
    null,
    h("div", {
      className: "m-bottom-sheet-backdrop",
      onClick: onClose,
      ariaHidden: "true",
    }),
    h(
      "div",
      {
        ref: sheetRef,
        className: joinClasses("m-bottom-sheet", className),
        role: "dialog",
        ariaModal: "true",
        ariaLabel: title,
      },
      h("div", { className: "m-bottom-sheet-handle" }),
      h(
        "div",
        { className: "m-bottom-sheet-header" },
        h("h2", null, title),
        onClose &&
          h(
            IconButton,
            { label: "Close", onClick: onClose },
            "✕",
          ),
      ),
      h("div", { className: "m-bottom-sheet-body" }, children),
    ),
  );
}

export function FAB({
  label,
  extended = false,
  aboveNav = false,
  children,
  className = "",
  ...props
} = {}) {
  return h(
    "button",
    {
      ...props,
      type: "button",
      className: joinClasses(
        "m-fab",
        extended && "m-fab-extended",
        aboveNav && "m-fab-above-nav",
        className,
      ),
      ariaLabel: extended ? undefined : label,
      title: extended ? undefined : label,
    },
    children,
    extended && label,
  );
}

// Trigger + expanding row of IconButtons. `orbit: true` stacks the items
// upward above the trigger instead of inline to the side.
export function SpeedDial({
  icon,
  label = "More actions",
  items = [],
  orbit = false,
  className = "",
  ...props
} = {}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return h(
    "div",
    {
      ...props,
      ref: rootRef,
      className: joinClasses("m-speeddial", orbit && "m-speeddial-orbit", open && "is-open", className),
    },
    h(
      IconButton,
      {
        label,
        variant: "contained",
        className: "m-speeddial-trigger",
        onClick: () => setOpen((v) => !v),
      },
      icon,
    ),
    h(
      "div",
      { className: "m-speeddial-menu", role: "menu" },
      items.map((item, i) =>
        h(
          IconButton,
          {
            key: item.key ?? i,
            label: item.label,
            variant: "tonal",
            className: "m-speeddial-item",
            style: { transitionDelay: open ? `${(items.length - i) * 40}ms` : "0ms" },
            onClick: (e) => {
              item.onClick?.(e);
              setOpen(false);
            },
          },
          item.icon,
        ),
      ),
    ),
  );
}

export function SwipeableListItem({
  children,
  actions = [],
  actionWidth = 72,
  className = "",
  ...props
} = {}) {
  const trackRef   = useRef(null);
  const startXRef  = useRef(null);
  const currentRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const maxOffset = useMemo(() => actions.length * actionWidth, [actions.length, actionWidth]);

  const settle = (x) => {
    const snapped = x < -(maxOffset * 0.4) ? -maxOffset : 0;
    currentRef.current = snapped;
    setOffset(snapped);
    setSwiping(false);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      startXRef.current = e.touches[0].clientX;
      setSwiping(true);
    };

    const onTouchMove = (e) => {
      if (startXRef.current === null) return;
      const dx = e.touches[0].clientX - startXRef.current;
      const next = Math.min(0, Math.max(-maxOffset, currentRef.current + dx));
      startXRef.current = e.touches[0].clientX;
      currentRef.current = next;
      setOffset(next);
    };

    const onTouchEnd = () => {
      startXRef.current = null;
      settle(currentRef.current);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: true });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [maxOffset]);

  const close = () => { currentRef.current = 0; setOffset(0); };

  return h(
    "div",
    { ...props, className: joinClasses("m-swipeable", className) },
    h(
      "div",
      {
        ref: trackRef,
        className: joinClasses("m-swipeable-track", swiping && "m-swipeable-swiping"),
        style: { transform: `translateX(${offset}px)` },
      },
      children,
    ),
    h(
      "div",
      { className: "m-swipeable-actions", style: { width: `${maxOffset}px` } },
      actions.map((action, i) =>
        h("button", {
          key: action.key ?? i,
          type: "button",
          className: joinClasses("m-swipeable-action", action.className),
          style: { width: `${actionWidth}px`, ...action.style },
          onClick: () => { close(); action.onClick?.(); },
        }, action.icon ?? action.label),
      ),
    ),
  );
}

function _SunIcon() {
  return h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true" },
    h("circle", { cx: "12", cy: "12", r: "4" }),
    h("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" }),
  );
}

function _MoonIcon() {
  return h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true" },
    h("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }),
  );
}

export function ThemeToggle({ className = "", ...props } = {}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return h(
    IconButton,
    {
      ...props,
      className,
      label: isDark ? "Switch to light theme" : "Switch to dark theme",
      onClick: toggleTheme,
    },
    isDark ? h(_SunIcon, null) : h(_MoonIcon, null),
  );
}

// Representative swatch color per palette (the light-mode --m-primary value);
// shown regardless of the active theme so swatches stay recognizable in dark mode.
const _PALETTE_SWATCH_COLORS = {
  default: "#0f766e",
  violet: "#6d28d9",
  rose: "#be123c",
  blue: "#1d4ed8",
  amber: "#b45309",
  emerald: "#047857",
};

export function PaletteSwitcher({ className = "", ...props } = {}) {
  const { palette, palettes, setPalette, customColor, setCustomColor } = usePalette();

  return h(
    "div",
    {
      ...props,
      className: joinClasses("m-palette-switcher", className),
      role: "radiogroup",
      "aria-label": "Color palette",
    },
    palettes
      .filter((name) => name !== "custom")
      .map((name) =>
        h("button", {
          key: name,
          type: "button",
          role: "radio",
          "aria-checked": name === palette,
          "aria-label": name.charAt(0).toUpperCase() + name.slice(1),
          title: name.charAt(0).toUpperCase() + name.slice(1),
          className: joinClasses("m-palette-swatch", name === palette && "is-active"),
          style: { backgroundColor: _PALETTE_SWATCH_COLORS[name] },
          onClick: () => setPalette(name),
        }),
      ),
    h("input", {
      key: "custom",
      type: "color",
      role: "radio",
      "aria-checked": palette === "custom",
      "aria-label": "Custom color",
      title: "Custom color",
      className: joinClasses("m-palette-swatch", "m-palette-swatch-custom", palette === "custom" && "is-active"),
      value: customColor || "#0f766e",
      onInput: (event) => setCustomColor(event.target.value),
    }),
  );
}

const _DESIGN_LABELS = { nexa: "Nexa", bootstrap: "Bootstrap" };

// Switches data-design via useDesign(). Only visible if dist/nexa-bootstrap.css
// (or another design stylesheet) is loaded — otherwise switching design is a
// no-op, since "bootstrap" has nothing to style against.
export function DesignSwitcher({ className = "", ...props } = {}) {
  const { design, designs, setDesign } = useDesign();

  return h(
    "div",
    {
      ...props,
      className: joinClasses("m-design-switcher", className),
      role: "radiogroup",
      "aria-label": "Design",
    },
    designs.map((name) =>
      h(
        "button",
        {
          key: name,
          type: "button",
          role: "radio",
          "aria-checked": name === design,
          className: joinClasses("m-chip", name === design && "m-chip-active"),
          onClick: () => setDesign(name),
        },
        _DESIGN_LABELS[name] ?? name,
      ),
    ),
  );
}

// TabPanel — companion to Tabs; only renders when id === activeId
export function TabPanel({ id, activeId, className = "", children, ...props } = {}) {
  if (id !== activeId) return null;
  return h("div", { ...props, className: joinClasses("m-tab-panel", className), role: "tabpanel" }, children);
}

// ── Stepper ───────────────────────────────────────────────────────────────────
//
// Props:
//   steps        [{ label, description? }]
//   activeStep   index of the current step (0-based)
//   orientation  "horizontal" | "vertical" (default "horizontal")

export function Stepper({ steps = [], activeStep = 0, orientation = "horizontal", className = "", ...props } = {}) {
  return h("ol", { ...props, className: joinClasses("m-stepper", `m-stepper-${orientation}`, className) },
    steps.map((step, i) => {
      const done    = i < activeStep;
      const current = i === activeStep;
      return h("li", {
        key:       i,
        className: joinClasses("m-step", done && "m-step-done", current && "m-step-current"),
      },
        h("div", { className: "m-step-indicator" },
          done
            ? h("span", { className: "m-step-check", ariaHidden: "true" }, "✓")
            : h("span", { className: "m-step-number" }, i + 1),
        ),
        h("div", { className: "m-step-content" },
          h("span", { className: "m-step-label" }, step.label),
          step.description && h("span", { className: "m-step-desc" }, step.description),
        ),
        i < steps.length - 1 && h("div", { className: "m-step-line", ariaHidden: "true" }),
      );
    }),
  );
}
