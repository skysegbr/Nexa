import { h } from "/dist/nexa.js";
import { EmptyState } from "/dist/nexa-components.js";
import { CLASSIFICATION_COLORS } from "../data.js";

const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RecallClassDonut({ byClassification }) {
  const total = byClassification.reduce((sum, c) => sum + c.count, 0);

  if (total === 0) {
    return h("div", { className: "dr-chart-card dr-chart-empty" },
      h(EmptyState, { title: "No data", description: "No recalls match the current filters." }),
    );
  }

  let consumed = 0;
  const arcs = byClassification.map((c) => {
    const dash = (c.count / total) * CIRCUMFERENCE;
    const arc = h("circle", {
      key: c.term,
      cx: 18,
      cy: 18,
      r: RADIUS,
      fill: "none",
      stroke: CLASSIFICATION_COLORS[c.term] || "var(--m-text-muted)",
      "stroke-width": 4,
      "stroke-dasharray": `${dash} ${CIRCUMFERENCE - dash}`,
      "stroke-dashoffset": -consumed,
      transform: "rotate(-90 18 18)",
      className: "dr-donut-arc",
    });
    consumed += dash;
    return arc;
  });

  return h(
    "div",
    { className: "dr-chart-card" },
    h("p", { className: "dr-chart-title" }, "By classification"),
    h(
      "div",
      { className: "dr-donut" },
      h(
        "svg",
        { viewBox: "0 0 36 36", className: "dr-donut-svg", role: "img", "aria-label": "Recalls by classification" },
        h("circle", { cx: 18, cy: 18, r: RADIUS, fill: "none", stroke: "var(--m-border)", "stroke-width": 4 }),
        arcs,
      ),
      h(
        "ul",
        { className: "dr-donut-legend" },
        byClassification.map((c) =>
          h(
            "li",
            { key: c.term },
            h("span", { className: "dr-donut-swatch", style: { background: CLASSIFICATION_COLORS[c.term] || "var(--m-text-muted)" } }),
            `${c.term} — ${c.count.toLocaleString()}`,
          ),
        ),
      ),
    ),
  );
}
