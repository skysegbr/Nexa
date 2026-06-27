import { h } from "/dist/nexa.js";

// A handful of fake "conversion" points, plotted as a smooth-looking line —
// drawn with raw h("svg", ...) / h("path", ...) to lean on Nexa's SVG support.
const POINTS = [
  [0, 92],
  [53, 80],
  [106, 86],
  [159, 62],
  [212, 70],
  [265, 42],
  [318, 26],
];

const STATS = [
  { id: "conversions", value: "+24%", label: "conversions" },
  { id: "events", value: "1.2k", label: "events/min" },
  { id: "uptime", value: "99.98%", label: "uptime" },
];

function linePath(points) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

export function Hero() {
  const line = linePath(POINTS);
  const [firstX] = POINTS[0];
  const [lastX] = POINTS[POINTS.length - 1];
  const area = `${line} L${lastX} 120 L${firstX} 120 Z`;

  return h(
    "section",
    { className: "l-hero", id: "top" },
    h(
      "div",
      { className: "l-hero-inner" },
      h(
        "div",
        { className: "l-hero-copy" },
        h("p", { className: "l-eyebrow" }, "ANALYTICS FOR TEAMS THAT SHIP FAST"),
        h("h1", null, "Better decisions start with data your team trusts"),
        h(
          "p",
          { className: "l-hero-lead" },
          "Orbiq brings scattered metrics into a single dashboard — so you can stop chasing numbers and start acting on them.",
        ),
        h(
          "div",
          { className: "l-hero-actions" },
          h("a", { className: "l-btn l-btn-primary", href: "#pricing" }, "Get started for free"),
          h("a", { className: "l-btn l-btn-ghost", href: "#features" }, "See how it works"),
        ),
        h("p", { className: "l-hero-note" }, "Free forever for teams of up to 3 — no credit card required."),
      ),
      h(
        "div",
        { className: "l-hero-visual" },
        h(
          "div",
          { className: "l-visual-card" },
          h(
            "div",
            { className: "l-visual-head" },
            h("span", { className: "l-visual-dot" }),
            h("span", { className: "l-visual-dot" }),
            h("span", { className: "l-visual-dot" }),
            h("span", { className: "l-visual-title" }, "Conversions — last 30 days"),
          ),
          h(
            "svg",
            { className: "l-visual-chart", viewBox: "0 0 318 120", preserveAspectRatio: "none", role: "img", "aria-label": "Conversion chart trending upward over the last 30 days" },
            h("path", { d: area, fill: "var(--l-accent)", "fill-opacity": "0.12", stroke: "none" }),
            h("path", { d: line, fill: "none", stroke: "var(--l-accent)", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }),
            POINTS.map(([x, y], index) =>
              h("circle", { key: index, cx: x, cy: y, r: "3.5", fill: "var(--l-surface)", stroke: "var(--l-accent)", "stroke-width": "2" }),
            ),
          ),
          h(
            "div",
            { className: "l-visual-stats" },
            STATS.map((stat) =>
              h(
                "div",
                { key: stat.id, className: "l-visual-stat" },
                h("strong", null, stat.value),
                h("span", null, stat.label),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
