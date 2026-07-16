import { h } from "/dist/nexa.js";
import { EmptyState } from "/dist/nexa-components-core.js";

export function RecallStateBars({ byState }) {
  if (byState.length === 0) {
    return h("div", { className: "dr-chart-card dr-chart-empty" },
      h(EmptyState, { title: "No data", description: "No recalls match the current filters." }),
    );
  }

  const max = Math.max(...byState.map((s) => s.count));

  return h(
    "div",
    { className: "dr-chart-card" },
    h("p", { className: "dr-chart-title" }, "Top states"),
    h(
      "ul",
      { className: "dr-bars" },
      byState.map((s) =>
        h(
          "li",
          { key: s.term, className: "dr-bar-row" },
          h("span", { className: "dr-bar-label" }, s.term),
          h(
            "span",
            { className: "dr-bar-track" },
            h("span", { className: "dr-bar-fill", style: { width: `${(s.count / max) * 100}%` } }),
          ),
          h("span", { className: "dr-bar-value" }, s.count.toLocaleString()),
        ),
      ),
    ),
  );
}
