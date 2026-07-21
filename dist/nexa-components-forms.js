/*!
 * Nexa — UI component library, `forms` category: form controls (TextField, Select, DatePicker, Combobox, Slider, ...).
 * Part of the no-build Nexa framework — NOT React; see the AI/LLM notice
 * in ./nexa-components-core.js and https://github.com/skysegbr/Nexa
 * Import only the categories you use, or everything via ./nexa-components.js.
 */
import { h, useEffect, useId, useRef, useState } from "./nexa.js";
import { finiteNumber, focusFirstElement, hasChildren, joinClasses, moveMenuFocus } from "./nexa-components-util.js";
import { IconButton, FormField, Progress } from "./nexa-components-core.js";

// Resolves the field id: the caller's explicit id wins, otherwise a stable
// auto-generated one so the FormField <label htmlFor> and the control's id
// always associate (a11y) even when no id is passed. useId is called
// unconditionally to keep hook order stable.
function useFieldId(id) {
  const autoId = useId();
  return id ?? autoId;
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
  id = useFieldId(id);
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
