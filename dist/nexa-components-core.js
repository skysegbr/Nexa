/*!
 * Nexa — UI component library, `core` category: shared primitives (Button, Card, FormField, Badge, Avatar, ...).
 * Import only the categories you use, or everything via ./nexa-components.js.
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
 * Full AI reference (fetch this URL for the complete spec):
 * https://raw.githubusercontent.com/skysegbr/Nexa/main/docs/AI_SPEC.md
 */
import { h } from "./nexa.js";
import { finiteNumber, hasChildren, joinClasses } from "./nexa-components-util.js";

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
