import { h } from "/dist/nexa.js";
import { Card } from "/dist/nexa-components-core.js";

export function FormSummary({ values }) {
  return h(
    Card,
    { className: "form-card form-summary" },
    h("h2", null, "Serialized values"),
    h("pre", null, JSON.stringify(values, null, 2)),
  );
}
