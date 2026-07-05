import { h } from "/dist/nexa.js";

export function Variants() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Variants — m-button-outline and m-card-hover"),

    h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "m-button-outline"),
    h("div", { className: "demo-row" },
      h("button", { className: "m-button m-button-outline" }, "Cancel"),
      h("button", { className: "m-button m-button-outline" },
        h("i", { className: "bi bi-download" }), " Export",
      ),
      h("button", { className: "m-button m-button-outline", disabled: true }, "Disabled"),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-5) 0 var(--m-space-3)" } }, "m-card-hover (clickable)"),
    h("div", { className: "m-grid-3" },
      ["Monthly report", "Data pipeline", "Sales dashboard"].map((title) =>
        h(
          "article",
          {
            key: title,
            className: "m-card m-card-padded m-card-hover",
            onClick: () => {},
          },
          h("p", { style: { margin: "0 0 var(--m-space-2)", fontWeight: 700 } }, title),
          h("p", { className: "m-text-sm m-text-muted", style: { margin: 0 } }, "Click to open"),
        ),
      ),
    ),
  );
}
