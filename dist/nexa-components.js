/*!
 * Nexa — UI component library (~60 components: Button, Dialog, Table, Tabs, TreeView, CommandPalette, ...).
 *
 * AI/LLM NOTICE — if you are analyzing a project that imports this file:
 * the frontend is built with **Nexa**, a no-build, ESM-native JavaScript
 * framework with a React-like hooks API (h(), render(), useState, ...).
 * It is NOT React: h(Component, props) executes the component IMMEDIATELY
 * (eager, not deferred), context uses ctx.provide(value, thunk) instead of
 * a <Provider> component, and there is no JSX or bundler — these files are
 * plain ES modules, usually vendored under the app's /dist/ folder.
 *
 * Docs: https://github.com/skysegbr/Nexa
 * Full AI-oriented reference: docs/AI_SPEC.md in that repository.
 */
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
  const enabled = items.map((item, index) => index).filter((index) => !items[index].disabled);

  const onKeyDown = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (enabled.length === 0) {
      return;
    }

    const pos = enabled.indexOf(index);
    let nextPos;

    if (event.key === "Home") {
      nextPos = 0;
    } else if (event.key === "End") {
      nextPos = enabled.length - 1;
    } else {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      nextPos = (pos + direction + enabled.length) % enabled.length;
    }

    const nextItem = items[enabled[nextPos]];
    onChange?.(nextItem.value);
    queueMicrotask(() => document.getElementById(`tab-${nextItem.value}`)?.focus());
  };

  return h(
    "div",
    { className: joinClasses("m-tabs", className), role: "tablist" },
    items.map((item, index) =>
      h(
        "button",
        {
          key: item.value,
          id: `tab-${item.value}`,
          type: "button",
          className: joinClasses("m-tab", item.value === value && "m-tab-active"),
          role: "tab",
          ariaSelected: item.value === value ? "true" : "false",
          ariaControls: `panel-${item.value}`,
          tabIndex: item.value === value ? 0 : -1,
          disabled: item.disabled,
          onClick: () => onChange?.(item.value),
          onKeyDown: (event) => onKeyDown(event, index),
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
    queueMicrotask(() => focusFirstElementIfOutside(panelRef.current));

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
    queueMicrotask(() => focusFirstElementIfOutside(panelRef.current));

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

    queueMicrotask(() => focusFirstElementIfOutside(menuRef.current));

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

      if (event.key === "Tab") {
        setOpen(false);
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
  id = "nexa-tooltip",
  className = "",
  children,
  ...props
} = {}) {
  const [dismissed, setDismissed] = useState(false);
  const bubbleId = `${id}-bubble`;

  // Nexa evaluates function components eagerly (h() calls them immediately),
  // so a single wrapped element already arrives here as a resolved
  // `{ type, props }` DOM vnode — "TEXT_NODE" is the internal sentinel `h()`
  // uses for bare text/null/boolean children, never a real tag name.
  const [only] = children;
  const canClone =
    children.length === 1 && only && typeof only === "object" && only.type !== "TEXT_NODE";

  const wrappedChildren = canClone
    ? [{ ...only, props: { ...only.props, ariaDescribedby: joinClasses(only.props.ariaDescribedby, bubbleId) } }]
    : children;

  return h(
    "span",
    {
      ...props,
      className: joinClasses(
        "m-tooltip-wrap",
        `m-tooltip-${position}`,
        dismissed && "m-tooltip-dismissed",
        className,
      ),
      ariaDescribedby: canClone ? undefined : bubbleId,
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          setDismissed(true);
        }
      },
      onMouseLeave: () => setDismissed(false),
      onBlur: () => setDismissed(false),
    },
    wrappedChildren,
    h("span", { id: bubbleId, role: "tooltip", className: "m-tooltip-bubble" }, content),
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

// Open-path variant: used when an overlay OPENS. If focus is already inside
// (e.g. the user is typing in an input within the dialog and the opening
// effect re-ran), stealing it to the first focusable would interrupt them.
// Close-path refocusing (Escape → focus the trigger inside the wrap) must NOT
// use this: there, focus being inside the wrap is exactly the situation the
// call exists to fix.
function focusFirstElementIfOutside(container) {
  if (!container || container.contains(document.activeElement)) {
    return;
  }
  focusFirstElement(container);
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
  id = "nexa-combobox",
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
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  const listId = `${id}-list`;
  const optionId = (opt) => `${id}-option-${opt.value}`;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // `filtered` is a fresh array every render, so it can't sit in the effect's
  // dependency array below without re-attaching the listeners (and re-stealing
  // focus) on every keystroke — mirror Dialog's onCloseRef pattern instead.
  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

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
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const active = filteredRef.current[activeIndexRef.current];
        if (active) {
          select(active);
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const count = filteredRef.current.length;
        if (count === 0) return;
        const direction = e.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((i) => (i + direction + count) % count);
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(Math.max(0, filteredRef.current.length - 1));
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
    triggerRef.current?.focus();
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
          ref: triggerRef,
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
          ariaControls: listId,
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
              role: "combobox",
              className: "m-combobox-search",
              placeholder: searchPlaceholder,
              value: query,
              ariaExpanded: "true",
              ariaControls: listId,
              ariaAutocomplete: "list",
              ariaActivedescendant: filtered[activeIndex] ? optionId(filtered[activeIndex]) : undefined,
              onInput: (e) => setQuery(e.target.value),
            }),
          ),
          h(
            "ul",
            { id: listId, className: "m-combobox-list", role: "listbox" },
            filtered.length > 0
              ? filtered.map((opt, index) =>
                  h(
                    "li",
                    {
                      key: opt.value,
                      id: optionId(opt),
                      className: joinClasses(
                        "m-combobox-option",
                        opt.value === value && "m-combobox-option-selected",
                        index === activeIndex && "m-combobox-option-active",
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

export function ContextMenu({
  open = false,
  x = 0,
  y = 0,
  items = [],
  onClose,
  ariaLabel = "Context menu",
  className = "",
} = {}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousActive = document.activeElement;
    queueMicrotask(() => focusFirstElementIfOutside(menuRef.current));

    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose?.();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Tab") {
        onClose?.();
        return;
      }

      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        moveMenuFocus(e, menuRef.current);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);

      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return h(
    "ul",
    {
      ref: menuRef,
      className: joinClasses("m-context-menu", className),
      role: "menu",
      ariaLabel,
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
    if (!open) return undefined;

    const previousActive = document.activeElement;
    queueMicrotask(() => focusFirstElementIfOutside(sheetRef.current));

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key === "Tab") {
        trapFocus(e, sheetRef.current);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);

      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
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
        tabIndex: -1,
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
  return h(
    "div",
    {
      ...props,
      id: `panel-${id}`,
      className: joinClasses("m-tab-panel", className),
      role: "tabpanel",
      ariaLabelledby: `tab-${id}`,
      tabIndex: 0,
    },
    children,
  );
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

// ── Slider / RangeSlider ────────────────────────────────────
//
// Thin wrapper around native <input type="range"> (keeps free keyboard
// support — arrow keys/Home/End/PageUp/PageDown all work without extra
// code) plus FormField's label/help/error chrome and an optional live
// value readout.

export function Slider({
  id,
  label,
  help,
  error,
  required = false,
  showValue = false,
  min = 0,
  max = 100,
  step = 1,
  value,
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return h(
    FormField,
    { id, label, help, error, required, className },
    h(
      "div",
      { className: "m-slider" },
      h("input", {
        ...props,
        id,
        type: "range",
        min,
        max,
        step,
        value,
        required,
        className: joinClasses("m-slider-input", inputClassName),
        ariaInvalid: error ? "true" : undefined,
        ariaDescribedby: joinClasses(helpId, errorId) || undefined,
      }),
      showValue && h("output", { className: "m-slider-value", htmlFor: id }, String(value)),
    ),
  );
}

// RangeSlider — two native range inputs stacked in the same track (the
// standard dual-thumb trick: both span the full width, and CSS gives
// pointer-events only to each thumb so either one can be dragged
// independently). value/onChange use a [lower, upper] tuple; each input
// clamps against the other so lower can never cross upper.
export function RangeSlider({
  id,
  label,
  help,
  error,
  required = false,
  showValue = false,
  min = 0,
  max = 100,
  step = 1,
  value = [min, max],
  onChange,
  minLabel = "Minimum",
  maxLabel = "Maximum",
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const [lower, upper] = value;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = joinClasses(helpId, errorId) || undefined;

  return h(
    FormField,
    { id, label, help, error, required, className },
    h(
      "div",
      { className: "m-slider m-slider-range" },
      h(
        "div",
        { className: "m-slider-range-track" },
        h("input", {
          ...props,
          id,
          type: "range",
          min,
          max,
          step,
          value: lower,
          ariaLabel: minLabel,
          ariaInvalid: error ? "true" : undefined,
          ariaDescribedby: describedBy,
          className: joinClasses("m-slider-input", inputClassName),
          onInput: (e) => onChange?.([Math.min(Number(e.target.value), upper), upper]),
        }),
        h("input", {
          ...props,
          type: "range",
          min,
          max,
          step,
          value: upper,
          ariaLabel: maxLabel,
          ariaInvalid: error ? "true" : undefined,
          ariaDescribedby: describedBy,
          className: joinClasses("m-slider-input", inputClassName),
          onInput: (e) => onChange?.([lower, Math.max(Number(e.target.value), lower)]),
        }),
      ),
      showValue && h("output", { className: "m-slider-value" }, `${lower} – ${upper}`),
    ),
  );
}

// ── Menu ─────────────────────────────────────────────────────
//
// Like Dropdown, but items may nest a `children` array to open a flyout
// submenu (any number of levels deep). Each level tracks which single child
// submenu is open (Accordion-style single-open), so hovering or arrowing
// into a sibling closes the previous one.
//
// Props:
//   trigger   element that opens the root menu on click
//   items     [{ label, onClick?, children?, icon?, danger?, disabled?, divider? }]
//   align     'left' | 'right' (root menu only)
//   className extra classes
//
// Keyboard (per level): ArrowUp/ArrowDown/Home/End move between siblings;
// ArrowRight (or Enter/click) opens a submenu and focuses its first item;
// ArrowLeft closes the current submenu and returns focus to its parent
// item. Escape/Tab close the whole menu, same as Dropdown.

function getMenuItemButtons(list) {
  if (!list) return [];
  return Array.from(list.querySelectorAll(":scope > li > .m-menu-button"));
}

function MenuItemNode({ item, index, isOpen, onOpenChange, onLeafSelect, listRef, submenu, onCloseToParent }) {
  const hasSubmenu = hasChildren(item.children);
  const key = item.key ?? index;
  const submenuRef = useRef(null);
  const buttonRef = useRef(null);

  const openSubmenu = () => onOpenChange(key);
  const closeSubmenu = () => onOpenChange((current) => (current === key ? null : current));

  return h(
    "li",
    {
      className: "m-menu-item",
      role: "none",
      onMouseEnter: hasSubmenu ? openSubmenu : undefined,
      onMouseLeave: hasSubmenu ? closeSubmenu : undefined,
    },
    h(
      "button",
      {
        ref: buttonRef,
        type: "button",
        className: joinClasses("m-menu-button", item.danger && "m-menu-button-danger"),
        role: "menuitem",
        disabled: item.disabled,
        ariaHaspopup: hasSubmenu ? "true" : undefined,
        ariaExpanded: hasSubmenu ? (isOpen ? "true" : "false") : undefined,
        onClick: () => {
          if (item.disabled) return;
          if (hasSubmenu) {
            onOpenChange((current) => (current === key ? null : key));
            return;
          }
          onLeafSelect(item);
        },
        onKeyDown: (event) => {
          const buttons = getMenuItemButtons(listRef.current);

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const currentIndex = Math.max(0, buttons.indexOf(buttonRef.current));
            buttons[(currentIndex + direction + buttons.length) % buttons.length]?.focus();
          } else if (event.key === "Home") {
            event.preventDefault();
            buttons[0]?.focus();
          } else if (event.key === "End") {
            event.preventDefault();
            buttons[buttons.length - 1]?.focus();
          } else if (event.key === "ArrowRight" && hasSubmenu) {
            event.preventDefault();
            openSubmenu();
            queueMicrotask(() => focusFirstElementIfOutside(submenuRef.current));
          } else if (event.key === "ArrowLeft" && submenu) {
            event.preventDefault();
            onCloseToParent?.();
          }
        },
      },
      item.icon && h("span", { className: "m-menu-icon", ariaHidden: "true" }, item.icon),
      h("span", { className: "m-menu-label" }, item.label),
      hasSubmenu && h("span", { className: "m-menu-caret", ariaHidden: "true" }, "›"),
    ),
    hasSubmenu &&
      isOpen &&
      h(MenuList, {
        items: item.children,
        listRef: submenuRef,
        onLeafSelect,
        submenu: true,
        onCloseToParent: () => {
          closeSubmenu();
          buttonRef.current?.focus();
        },
      }),
  );
}

function MenuList({ items, listRef, onLeafSelect, submenu = false, onCloseToParent, id, className = "" }) {
  const [openKey, setOpenKey] = useState(null);

  return h(
    "ul",
    {
      ref: listRef,
      id,
      className: joinClasses("m-menu-list", submenu && "m-menu-list-submenu", className),
      role: "menu",
    },
    items.map((item, index) =>
      item.divider
        ? h(
            "li",
            { key: `divider-${index}`, className: "m-menu-divider-wrap", role: "none" },
            h("hr", { className: "m-menu-divider" }),
          )
        : h(MenuItemNode, {
            key: item.key ?? index,
            item,
            index,
            isOpen: openKey === (item.key ?? index),
            onOpenChange: setOpenKey,
            onLeafSelect,
            listRef,
            submenu,
            onCloseToParent,
          }),
    ),
  );
}

export function Menu({
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

    queueMicrotask(() => focusFirstElementIfOutside(menuRef.current));

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
      if (event.key === "Tab") {
        setOpen(false);
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
    { ...props, id, ref: wrapRef, className: joinClasses("m-menu", className) },
    h(
      "div",
      {
        className: "m-menu-trigger",
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
      h(MenuList, {
        id: menuId,
        items,
        listRef: menuRef,
        submenu: false,
        className: `m-menu-list-${align}`,
        onLeafSelect: (item) => {
          if (item.disabled) return;
          setOpen(false);
          item.onClick?.();
        },
      }),
  );
}

// ── DataTable ────────────────────────────────────────────────
//
// Table + Pagination combined: sorts the full row set, then renders only
// the current page. Table alone can't do this — its sort state lives
// entirely inside it, invisible to whatever would need to slice by page —
// so DataTable owns sorting itself and renders its own header/body (same
// markup/classes as Table) instead of wrapping it. Column shape and the
// sort algorithm match Table exactly.
//
// Props:
//   columns      [{ key, header, align?, render?, sortable? }]
//   rows         full (unsliced) row data
//   pageSize     rows per page (default 10)
//   page         controlled current page (1-based); omit for uncontrolled
//   onPageChange (page) => void
//   sortable     enable header sort (default true)
//   defaultSort  { key, dir } — initial sort, uncontrolled
//   onSort       ({ key, dir }) => void
//   getRowKey    (row, index) => key

export function DataTable({
  columns = [],
  rows = [],
  pageSize = 10,
  page,
  onPageChange,
  sortable = true,
  defaultSort,
  onSort,
  getRowKey = (row, index) => row.id ?? index,
  emptyTitle = "No rows",
  emptyDescription = "Try changing the filters.",
  className = "",
  ...props
} = {}) {
  const [sort, setSort] = useState(defaultSort ?? { key: null, dir: "asc" });
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = page !== undefined ? page : internalPage;

  const setPage = (next) => {
    if (page === undefined) setInternalPage(next);
    onPageChange?.(next);
  };

  const sortedRows = useMemo(() => {
    if (!sortable || !sort.key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, sortable]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, currentPage));
  const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    const next = { key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" };
    setSort(next);
    onSort?.(next);
    setPage(1);
  };

  return h(
    "div",
    { className: joinClasses("m-data-table", className) },
    h(
      "div",
      { className: "m-table-wrap" },
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
        pageRows.length > 0
          ? h(
              "tbody",
              null,
              pageRows.map((row, rowIndex) =>
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
    ),
    sortedRows.length > pageSize &&
      h(Pagination, {
        className: "m-data-table-pagination",
        page: safePage,
        total: totalPages,
        onChange: setPage,
      }),
  );
}

// ── DatePicker ───────────────────────────────────────────────
//
// Trigger button (labeled via FormField, like the other form controls)
// that opens a one-month calendar grid. Dates are plain "YYYY-MM-DD"
// strings in/out — parsed to local-midnight Date objects internally so
// comparisons never drift across a timezone's DST boundary. Keyboard:
// roving tabindex over the day grid — ArrowLeft/Right/Up/Down move by
// day/week (crossing into an adjacent month pans the calendar), Home/End
// jump to the start/end of the focused week, Enter/Space selects the
// focused day, Escape closes and returns focus to the trigger.

const DATE_PICKER_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DATE_PICKER_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseISODate(value) {
  const match = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function sameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildCalendarGrid(viewDate) {
  const first = startOfMonth(viewDate);
  const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, outside: date.getMonth() !== viewDate.getMonth() };
  });
}

export function DatePicker({
  id,
  label,
  help,
  error,
  required = false,
  disabled = false,
  value,
  onChange,
  min,
  max,
  placeholder = "Select a date",
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const selected = parseISODate(value);
  const minDate = parseISODate(min);
  const maxDate = parseISODate(max);
  const isDisabledDate = (date) => (minDate && date < minDate) || (maxDate && date > maxDate);

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => startOfMonth(selected ?? new Date()));
  const [focusedDate, setFocusedDate] = useState(() => selected ?? new Date());

  const wrapRef = useRef(null);
  const gridRef = useRef(null);
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const menuId = id ? `${id}-calendar` : undefined;

  const focusRovingCell = () => {
    queueMicrotask(() => gridRef.current?.querySelector('[tabindex="0"]')?.focus());
  };

  useEffect(() => {
    if (!open) return undefined;

    focusRovingCell();

    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        focusFirstElement(wrapRef.current);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openCalendar = () => {
    setViewDate(startOfMonth(selected ?? focusedDate));
    setFocusedDate(selected ?? focusedDate);
    setOpen(true);
  };

  const selectDate = (date) => {
    if (isDisabledDate(date)) return;
    onChange?.(toISODate(date));
    setOpen(false);
  };

  const moveFocus = (days) => {
    const next = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), focusedDate.getDate() + days);
    setFocusedDate(next);
    setViewDate(startOfMonth(next));
  };

  const onGridKeyDown = (event) => {
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

    if (event.key in deltas) {
      event.preventDefault();
      moveFocus(deltas[event.key]);
      focusRovingCell();
    } else if (event.key === "Home") {
      event.preventDefault();
      const start = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), focusedDate.getDate() - focusedDate.getDay());
      setFocusedDate(start);
      setViewDate(startOfMonth(start));
      focusRovingCell();
    } else if (event.key === "End") {
      event.preventDefault();
      const end = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), focusedDate.getDate() + (6 - focusedDate.getDay()));
      setFocusedDate(end);
      setViewDate(startOfMonth(end));
      focusRovingCell();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDate(focusedDate);
    }
  };

  const grid = buildCalendarGrid(viewDate);

  return h(
    FormField,
    { id, label, help, error, required, className },
    h(
      "div",
      { ...props, ref: wrapRef, className: "m-datepicker" },
      h(
        "button",
        {
          id,
          type: "button",
          className: joinClasses("m-datepicker-trigger", inputClassName),
          disabled,
          onClick: () => {
            if (disabled) return;
            if (open) setOpen(false);
            else openCalendar();
          },
          ariaHaspopup: "true",
          ariaExpanded: open ? "true" : "false",
          ariaControls: menuId,
          ariaInvalid: error ? "true" : undefined,
          ariaDescribedby: joinClasses(helpId, errorId) || undefined,
        },
        selected ? toISODate(selected) : placeholder,
      ),
      open &&
        h(
          "div",
          { className: "m-datepicker-calendar", id: menuId },
          h(
            "div",
            { className: "m-datepicker-header" },
            h(IconButton, { label: "Previous month", onClick: () => setViewDate((v) => addMonths(v, -1)) }, "‹"),
            h(
              "span",
              { className: "m-datepicker-month", ariaLive: "polite" },
              `${DATE_PICKER_MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`,
            ),
            h(IconButton, { label: "Next month", onClick: () => setViewDate((v) => addMonths(v, 1)) }, "›"),
          ),
          h(
            "div",
            { className: "m-datepicker-weekdays", ariaHidden: "true" },
            DATE_PICKER_WEEKDAYS.map((wd) => h("span", { key: wd }, wd)),
          ),
          h(
            "div",
            {
              ref: gridRef,
              className: "m-datepicker-grid",
              role: "group",
              ariaLabel: `${DATE_PICKER_MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`,
              onKeyDown: onGridKeyDown,
            },
            grid.map(({ date, outside }) => {
              const isSelected = sameDay(date, selected);
              const isFocusTarget = sameDay(date, focusedDate);
              const dayDisabled = isDisabledDate(date);

              return h(
                "button",
                {
                  key: toISODate(date),
                  type: "button",
                  className: joinClasses(
                    "m-datepicker-day",
                    outside && "m-datepicker-day-outside",
                    isSelected && "m-datepicker-day-selected",
                  ),
                  tabIndex: isFocusTarget ? 0 : -1,
                  disabled: dayDisabled,
                  ariaCurrent: isSelected ? "date" : undefined,
                  ariaLabel: date.toDateString(),
                  onClick: () => selectDate(date),
                },
                date.getDate(),
              );
            }),
          ),
        ),
    ),
  );
}

// ── Radio / RadioGroup ───────────────────────────────────────
//
// Radio mirrors Checkbox (label-wrapped native input); RadioGroup is the
// form-level control — a labeled fieldset-like group of options sharing a
// `name`, controlled via value/onChange. Native radios already give the
// correct Arrow-key roving behavior for free, so there is no custom
// keyboard handling here.

export function Radio({
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
      { className: "m-radio" },
      h("input", {
        ...props,
        id,
        type: "radio",
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

export function RadioGroup({
  id,
  label,
  help,
  error,
  required = false,
  disabled = false,
  name,
  options = [],
  value,
  onChange,
  inline = false,
  className = "",
  ...props
} = {}) {
  const groupName = name ?? id;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const labelId = label ? `${id}-label` : undefined;

  return h(
    "div",
    { className: joinClasses("m-form-field", className) },
    label &&
      h(
        "span",
        { id: labelId, className: "m-label" },
        label,
        required && h("span", { className: "m-required", ariaLabel: "required" }, "*"),
      ),
    h(
      "div",
      {
        ...props,
        id,
        role: "radiogroup",
        className: joinClasses("m-radio-group", inline && "m-radio-group-inline"),
        ariaLabelledby: labelId,
        ariaInvalid: error ? "true" : undefined,
        ariaDescribedby: joinClasses(helpId, errorId) || undefined,
      },
      options.map((option) =>
        h(
          "label",
          { key: option.value, className: "m-radio" },
          h("input", {
            type: "radio",
            name: groupName,
            value: option.value,
            checked: option.value === value,
            disabled: disabled || option.disabled,
            required,
            onChange: () => onChange?.(option.value),
          }),
          h("span", null, option.label),
        ),
      ),
    ),
    help && h("p", { id: helpId, className: "m-help" }, help),
    error && h("p", { id: errorId, className: "m-error" }, error),
  );
}

// ── Divider ──────────────────────────────────────────────────

export function Divider({ vertical = false, className = "", ...props } = {}) {
  if (vertical) {
    return h("span", {
      ...props,
      className: joinClasses("m-divider-vertical", className),
      role: "separator",
      ariaOrientation: "vertical",
    });
  }

  return h("hr", { ...props, className: joinClasses("m-divider", className) });
}

// ── Skeleton ─────────────────────────────────────────────────
//
// Loading placeholder. Purely decorative (ariaHidden) — pair it with a
// visually-hidden status message or ariaBusy on the region being loaded.

export function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className = "",
  ...props
} = {}) {
  const toSize = (v) => (typeof v === "number" ? `${v}px` : v);
  const style = {};
  if (width !== undefined) style.width = toSize(width);
  if (height !== undefined) style.height = toSize(height);

  if (variant === "text" && lines > 1) {
    return h(
      "div",
      { ...props, className: joinClasses("m-skeleton-lines", className), ariaHidden: "true" },
      Array.from({ length: lines }, (_, i) =>
        h("span", {
          key: i,
          className: "m-skeleton m-skeleton-text",
          // Shorter last line reads as a natural paragraph stub.
          style: i === lines - 1 ? { ...style, width: "60%" } : style,
        }),
      ),
    );
  }

  return h("span", {
    ...props,
    className: joinClasses(
      "m-skeleton",
      variant === "text" && "m-skeleton-text",
      variant === "circle" && "m-skeleton-circle",
      className,
    ),
    style,
    ariaHidden: "true",
  });
}

// ── Avatar / AvatarGroup ─────────────────────────────────────

function avatarInitials(name) {
  const words = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className = "",
  children,
  ...props
} = {}) {
  const fallback = hasChildren(children) ? children : avatarInitials(name);

  return h(
    "span",
    {
      ...props,
      className: joinClasses("m-avatar", `m-avatar-${size}`, className),
      role: src ? undefined : "img",
      ariaLabel: src ? undefined : name,
    },
    src ? h("img", { src, alt: alt || name || "" }) : fallback,
  );
}

export function AvatarGroup({
  avatars = [],
  max = 4,
  size = "md",
  className = "",
  ...props
} = {}) {
  const visible = avatars.slice(0, max);
  const extra = avatars.length - visible.length;

  // .m-avatar-group is row-reverse so earlier avatars paint on top of later
  // ones without z-index bookkeeping — which means the DOM order must be the
  // reverse of the display order (overflow counter first, then the visible
  // avatars back-to-front).
  const rendered = [];
  if (extra > 0) {
    rendered.push(
      h(Avatar, { key: "m-avatar-overflow", size, name: `${extra} more`, className: "m-avatar-overflow" }, `+${extra}`),
    );
  }
  for (let i = visible.length - 1; i >= 0; i -= 1) {
    const item = visible[i];
    rendered.push(h(Avatar, { key: item.name ?? item.src ?? i, size, ...item }));
  }

  return h(
    "span",
    { ...props, className: joinClasses("m-avatar-group", className), role: "group" },
    rendered,
  );
}

// ── Breadcrumb ───────────────────────────────────────────────

export function Breadcrumb({
  items = [],
  separator = "/",
  ariaLabel = "Breadcrumb",
  className = "",
  ...props
} = {}) {
  const last = items.length - 1;

  return h(
    "nav",
    { ...props, ariaLabel, className },
    h(
      "ol",
      { className: "m-breadcrumb" },
      items.map((item, index) =>
        h(
          "li",
          // item.key ?? index (not href/label): several crumbs can share the
          // same placeholder href, and duplicate keys corrupt reconciliation.
          { key: item.key ?? index, className: "m-breadcrumb-item" },
          index > 0 && h("span", { className: "m-breadcrumb-sep", ariaHidden: "true" }, separator),
          index === last || (!item.href && !item.onClick)
            ? h("span", { ariaCurrent: index === last ? "page" : undefined }, item.icon, item.label)
            : h(
                "a",
                { className: "m-breadcrumb-link", href: item.href, onClick: item.onClick },
                item.icon,
                item.label,
              ),
        ),
      ),
    ),
  );
}

// ── Stat / StatGrid ──────────────────────────────────────────
//
// KPI tile: big value + small label, with an optional delta ("+12%" / "-3%")
// that colors itself by its leading sign. StatGrid is the auto-fit wrapper.

export function Stat({
  value,
  label,
  icon,
  delta,
  help,
  className = "",
  ...props
} = {}) {
  const deltaDown = typeof delta === "string" && delta.trim().startsWith("-");

  return h(
    "div",
    { ...props, className: joinClasses("m-stat", className) },
    icon && h("span", { className: "m-stat-icon", ariaHidden: "true" }, icon),
    h("strong", { className: "m-stat-value" }, value),
    h(
      "span",
      { className: "m-stat-label" },
      label,
      delta &&
        h(
          "span",
          { className: joinClasses("m-stat-delta", deltaDown ? "m-stat-delta-down" : "m-stat-delta-up") },
          ` ${delta}`,
        ),
    ),
    help && h("p", { className: "m-stat-help" }, help),
  );
}

export function StatGrid({ className = "", children, ...props } = {}) {
  return h("div", { ...props, className: joinClasses("m-stat-grid", className) }, children);
}

// ── NumberInput ──────────────────────────────────────────────
//
// TextField's numeric sibling: native number input flanked by −/+ stepper
// buttons. Controlled with a number (or null when cleared). The steppers
// are tabIndex -1 — keyboard users already have ArrowUp/Down on the input
// itself, so the buttons only need to serve pointer users.

export function NumberInput({
  id,
  label,
  help,
  error,
  required = false,
  disabled = false,
  min,
  max,
  step = 1,
  value,
  onChange,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const lo = finiteNumber(min, -Infinity);
  const hi = finiteNumber(max, Infinity);
  const stepValue = finiteNumber(step, 1);
  // Rounding to the step's own precision keeps repeated 0.1 steps from
  // accumulating float drift (0.30000000000000004).
  const decimals = (String(stepValue).split(".")[1] || "").length;
  const clamp = (n) => Number(Math.min(hi, Math.max(lo, n)).toFixed(decimals));

  // Careful: Number(null) and Number("") are both 0, so empty must be
  // detected before coercing — otherwise a cleared field reads as 0 and
  // wrongly disables the stepper at min=0.
  const current =
    value === null || value === undefined || value === "" ? null : finiteNumber(value, null);
  const stepFrom = current ?? (Number.isFinite(lo) ? lo : 0);

  const nudge = (direction) => {
    if (disabled) return;
    onChange?.(clamp(current === null ? stepFrom : current + direction * stepValue));
  };

  return h(
    FormField,
    { id, label, help, error, required, className },
    h(
      "div",
      { className: "m-number-input" },
      h(
        "button",
        {
          type: "button",
          className: "m-number-input-btn",
          ariaLabel: decrementLabel,
          tabIndex: -1,
          disabled: disabled || (current !== null && current <= lo),
          onClick: () => nudge(-1),
        },
        "−",
      ),
      h("input", {
        ...fieldProps({ id, error, help, required, inputClassName, props }),
        type: "number",
        min,
        max,
        step,
        disabled,
        value: current === null ? "" : current,
        onInput: (event) => {
          const raw = event.target.value;
          onChange?.(raw === "" ? null : finiteNumber(raw, current));
        },
      }),
      h(
        "button",
        {
          type: "button",
          className: "m-number-input-btn",
          ariaLabel: incrementLabel,
          tabIndex: -1,
          disabled: disabled || (current !== null && current >= hi),
          onClick: () => nudge(1),
        },
        "+",
      ),
    ),
  );
}

// ── TimePicker ───────────────────────────────────────────────
//
// DatePicker's sibling for "HH:MM" strings: a trigger that opens a listbox
// of times generated between min/max at `step`-minute intervals (the
// Google-Calendar pattern). Opening focuses the selected option; ArrowUp/
// Down walk the list (moveMenuFocus), Enter picks (native button click),
// Escape closes and refocuses the trigger.

function parseHHMM(value) {
  const match = typeof value === "string" ? /^(\d{2}):(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes < 24 * 60 ? minutes : null;
}

function toHHMM(minutes) {
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
}

export function TimePicker({
  id,
  label,
  help,
  error,
  required = false,
  disabled = false,
  value,
  onChange,
  min = "00:00",
  max = "23:59",
  step = 30,
  placeholder = "Select a time",
  className = "",
  inputClassName = "",
  ...props
} = {}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const selected = parseHHMM(value);
  const lo = parseHHMM(min) ?? 0;
  const hi = parseHHMM(max) ?? 24 * 60 - 1;
  const stepValue = Math.max(1, finiteNumber(step, 30));

  const options = [];
  for (let m = Math.ceil(lo / stepValue) * stepValue; m <= hi; m += stepValue) {
    options.push(m);
  }

  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const menuId = id ? `${id}-listbox` : undefined;

  useEffect(() => {
    if (!open) return undefined;

    queueMicrotask(() => {
      const list = listRef.current;
      (list?.querySelector('[aria-selected="true"]') ?? list?.querySelector("button"))?.focus();
    });

    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        focusFirstElement(wrapRef.current);
        return;
      }
      if (event.key === "Tab") {
        setOpen(false);
        return;
      }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        moveMenuFocus(event, listRef.current);
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
    FormField,
    { id, label, help, error, required, className },
    h(
      "div",
      { ...props, ref: wrapRef, className: "m-timepicker" },
      h(
        "button",
        {
          id,
          type: "button",
          className: joinClasses("m-timepicker-trigger", inputClassName),
          disabled,
          onClick: () => {
            if (!disabled) setOpen((v) => !v);
          },
          ariaHaspopup: "listbox",
          ariaExpanded: open ? "true" : "false",
          ariaControls: menuId,
          ariaInvalid: error ? "true" : undefined,
          ariaDescribedby: joinClasses(helpId, errorId) || undefined,
        },
        selected !== null ? toHHMM(selected) : placeholder,
      ),
      open &&
        h(
          "ul",
          { ref: listRef, id: menuId, className: "m-timepicker-list", role: "listbox" },
          options.map((minutes) =>
            h(
              "li",
              { key: minutes, role: "none" },
              h(
                "button",
                {
                  type: "button",
                  role: "option",
                  className: joinClasses(
                    "m-timepicker-option",
                    minutes === selected && "m-timepicker-option-selected",
                  ),
                  ariaSelected: minutes === selected ? "true" : "false",
                  onClick: () => {
                    onChange?.(toHHMM(minutes));
                    setOpen(false);
                    focusFirstElement(wrapRef.current);
                  },
                },
                toHHMM(minutes),
              ),
            ),
          ),
        ),
    ),
  );
}

// ── Popover ──────────────────────────────────────────────────
//
// Generic anchored panel — the primitive Tooltip/Dropdown/Menu don't cover:
// arbitrary interactive content next to a trigger. Unlike Dialog it does
// not trap Tab (the panel is part of the page flow); Escape and outside
// clicks close it, Escape also restores focus to the trigger.

export function Popover({
  id,
  trigger,
  placement = "bottom",
  title,
  className = "",
  children,
  ...props
} = {}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = id ? `${id}-panel` : undefined;
  const titleId = id && title ? `${id}-title` : undefined;

  useEffect(() => {
    if (!open) return undefined;

    queueMicrotask(() => focusFirstElementIfOutside(panelRef.current));

    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        focusFirstElement(wrapRef.current);
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
    "span",
    { ...props, id, ref: wrapRef, className: joinClasses("m-popover", className) },
    h(
      "span",
      {
        className: "m-popover-trigger",
        onClick: () => setOpen((v) => !v),
        ariaHaspopup: "dialog",
        ariaExpanded: open ? "true" : "false",
        ariaControls: panelId,
      },
      trigger,
    ),
    open &&
      h(
        "div",
        {
          ref: panelRef,
          id: panelId,
          className: joinClasses("m-popover-panel", `m-popover-${placement}`),
          role: "dialog",
          ariaLabelledby: titleId,
        },
        title && h("h3", { id: titleId, className: "m-popover-title" }, title),
        children,
      ),
  );
}

// ── TreeView ─────────────────────────────────────────────────
//
// WAI-ARIA tree: nodes are `{ id, label, icon?, children? }`. Expansion is
// uncontrolled by default (defaultExpanded) or controlled via `expanded` +
// onExpandedChange; selection is always controlled (selected/onSelect).
// Keyboard follows the ARIA authoring pattern with a roving tabindex over
// the *visible* nodes: ArrowUp/Down walk, ArrowRight expands / enters a
// branch, ArrowLeft collapses / climbs to the parent, Home/End jump,
// Enter/Space select.

function flattenVisibleTree(items, isExpanded, parent = null, out = []) {
  for (const node of items) {
    out.push({ node, parent });
    if (node.children?.length && isExpanded(node.id)) {
      flattenVisibleTree(node.children, isExpanded, node, out);
    }
  }
  return out;
}

export function TreeView({
  items = [],
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  selected,
  onSelect,
  ariaLabel = "Tree",
  className = "",
  ...props
} = {}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [focusedId, setFocusedId] = useState(null);
  const treeRef = useRef(null);

  const expandedIds = expanded ?? internalExpanded;
  const isExpanded = (nodeId) => expandedIds.includes(nodeId);

  const setExpandedIds = (next) => {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const toggleNode = (nodeId) => {
    setExpandedIds(
      isExpanded(nodeId) ? expandedIds.filter((x) => x !== nodeId) : [...expandedIds, nodeId],
    );
  };

  const visible = flattenVisibleTree(items, isExpanded);
  // The roving stop falls back to the selected node (or the first root) when
  // focus never entered the tree, or when the focused node was hidden by a
  // collapse.
  const rovingId = visible.some(({ node }) => node.id === focusedId)
    ? focusedId
    : visible.find(({ node }) => node.id === selected)?.node.id ?? visible[0]?.node.id;

  const focusNode = (nodeId) => {
    setFocusedId(nodeId);
    queueMicrotask(() =>
      treeRef.current?.querySelector(`[data-id="${CSS.escape(String(nodeId))}"]`)?.focus(),
    );
  };

  const onTreeKeyDown = (event) => {
    const index = visible.findIndex(({ node }) => node.id === rovingId);
    if (index === -1) return;
    const { node, parent } = visible[index];
    const hasKids = node.children?.length > 0;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = visible[index + (event.key === "ArrowDown" ? 1 : -1)];
      if (next) focusNode(next.node.id);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (hasKids && !isExpanded(node.id)) toggleNode(node.id);
      else if (hasKids) focusNode(node.children[0].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (hasKids && isExpanded(node.id)) toggleNode(node.id);
      else if (parent) focusNode(parent.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (visible.length) focusNode(visible[0].node.id);
    } else if (event.key === "End") {
      event.preventDefault();
      if (visible.length) focusNode(visible[visible.length - 1].node.id);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(node.id, node);
    }
  };

  const renderNode = (node) => {
    const hasKids = node.children?.length > 0;
    const nodeOpen = hasKids && isExpanded(node.id);

    return h(
      "li",
      {
        key: node.id,
        role: "treeitem",
        className: joinClasses("m-tree-item", node.id === selected && "m-tree-item-selected"),
        dataset: { id: node.id },
        tabIndex: node.id === rovingId ? 0 : -1,
        ariaExpanded: hasKids ? String(nodeOpen) : undefined,
        ariaSelected: node.id === selected ? "true" : "false",
      },
      h(
        "div",
        {
          className: "m-tree-row",
          onClick: (event) => {
            event.stopPropagation();
            focusNode(node.id);
            onSelect?.(node.id, node);
          },
        },
        h(
          "span",
          {
            className: joinClasses(
              "m-tree-caret",
              nodeOpen && "m-tree-caret-open",
              !hasKids && "m-tree-caret-leaf",
            ),
            ariaHidden: "true",
            onClick: hasKids
              ? (event) => {
                  event.stopPropagation();
                  toggleNode(node.id);
                }
              : undefined,
          },
          "▸",
        ),
        node.icon && h("span", { className: "m-tree-icon", ariaHidden: "true" }, node.icon),
        h("span", { className: "m-tree-label" }, node.label),
      ),
      nodeOpen &&
        h("ul", { role: "group", className: "m-tree-group" }, node.children.map(renderNode)),
    );
  };

  return h(
    "ul",
    {
      ...props,
      ref: treeRef,
      role: "tree",
      ariaLabel,
      className: joinClasses("m-tree", className),
      onKeyDown: onTreeKeyDown,
    },
    items.map(renderNode),
  );
}

// ── CommandPalette ───────────────────────────────────────────
//
// Ctrl/Cmd-K style launcher. Controlled like Dialog (open/onClose) — bind
// the global shortcut in the app, not here. Commands are
// `{ id, label, hint?, icon?, section?, keywords?, onSelect }`; filtering
// is a case-insensitive substring match over label/hint/section/keywords.
// The text input keeps focus the whole time and drives an
// aria-activedescendant listbox, so ArrowUp/Down/Enter never move focus.

export function CommandPalette({
  open = false,
  id = "nexa-command",
  onClose,
  commands = [],
  placeholder = "Type a command…",
  emptyLabel = "No matching commands",
  className = "",
  ...props
} = {}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    setQuery("");
    setActive(0);

    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => inputRef.current?.focus());

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

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filtered = commands.filter((cmd) => {
    if (!q) return true;
    return [cmd.label, cmd.hint, cmd.section, ...(cmd.keywords ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
  const activeIndex = Math.max(0, Math.min(active, filtered.length - 1));
  const listId = `${id}-listbox`;

  const runCommand = (cmd) => {
    cmd.onSelect?.(cmd);
    onCloseRef.current?.();
  };

  const moveActive = (next) => {
    setActive(next);
    queueMicrotask(() =>
      document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: "nearest" }),
    );
  };

  const onInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length) moveActive(Math.min(activeIndex + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length) moveActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) runCommand(filtered[activeIndex]);
    }
  };

  let lastSection;
  const listChildren = [];
  filtered.forEach((cmd, index) => {
    if (cmd.section && cmd.section !== lastSection) {
      lastSection = cmd.section;
      listChildren.push(
        h("li", { key: `section-${cmd.section}`, className: "m-command-section", role: "presentation" }, cmd.section),
      );
    }
    listChildren.push(
      h(
        "li",
        {
          key: cmd.id ?? cmd.label,
          id: `${id}-option-${index}`,
          role: "option",
          ariaSelected: index === activeIndex ? "true" : "false",
          className: joinClasses("m-command-option", index === activeIndex && "m-command-option-active"),
          onMouseEnter: () => setActive(index),
          onClick: () => runCommand(cmd),
        },
        cmd.icon && h("span", { className: "m-command-icon", ariaHidden: "true" }, cmd.icon),
        h("span", { className: "m-command-label" }, cmd.label),
        cmd.hint && h("span", { className: "m-command-hint" }, cmd.hint),
      ),
    );
  });
  if (filtered.length === 0) {
    listChildren.push(h("li", { key: "empty", className: "m-command-empty", role: "presentation" }, emptyLabel));
  }

  return h(
    "div",
    {
      className: "m-command-backdrop",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      },
    },
    h(
      "section",
      {
        ...props,
        ref: panelRef,
        id,
        className: joinClasses("m-command", className),
        role: "dialog",
        ariaModal: "true",
        ariaLabel: "Command palette",
      },
      h("input", {
        ref: inputRef,
        type: "text",
        className: "m-command-input",
        placeholder,
        value: query,
        role: "combobox",
        ariaExpanded: "true",
        ariaControls: listId,
        ariaActivedescendant: filtered.length ? `${id}-option-${activeIndex}` : undefined,
        ariaAutocomplete: "list",
        onInput: (event) => {
          setQuery(event.target.value);
          setActive(0);
        },
        onKeyDown: onInputKeyDown,
      }),
      h("ul", { id: listId, className: "m-command-list", role: "listbox" }, listChildren),
    ),
  );
}
