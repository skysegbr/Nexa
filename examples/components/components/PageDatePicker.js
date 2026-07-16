import { h, useState } from "/dist/nexa.js";
import { DatePicker } from "/dist/nexa-components-forms.js";

export function PageDatePicker() {
  const [date, setDate] = useState(null);
  const [bounded, setBounded] = useState("2026-07-15");

  return h(
    "div",
    null,

    h("h1", { className: "m-page-title" }, "DatePicker"),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Basic"),
      h(
        "div",
        { className: "field-demo-wrap" },
        h(DatePicker, {
          id: "basic-date",
          label: "Start date",
          value: date,
          onChange: setDate,
          placeholder: "Select a date",
        }),
        h(
          "p",
          { style: { marginTop: "var(--m-space-3)", fontSize: "var(--m-font-size-xs)", color: "var(--m-text-muted)" } },
          "Selected: ",
          h("code", null, date ?? "(none)"),
        ),
      ),
    ),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "With min/max bounds (July 2026 only)"),
      h(
        "div",
        { className: "field-demo-wrap" },
        h(DatePicker, {
          id: "bounded-date",
          label: "Appointment date",
          value: bounded,
          onChange: setBounded,
          min: "2026-07-01",
          max: "2026-07-31",
        }),
      ),
    ),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Disabled"),
      h(
        "div",
        { className: "field-demo-wrap" },
        h(DatePicker, { id: "disabled-date", label: "Locked date", value: "2026-01-01", disabled: true }),
      ),
    ),
  );
}
