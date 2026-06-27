import { h } from "/dist/nexa.js";

const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Pure SVG built straight through h() — <svg>, <circle>, etc. are created in
// the right namespace automatically. `slices` comes from "the API" with no
// validation, so a malformed payload (the "corrupted" dataset) makes this
// throw a TypeError — exactly the kind of error useErrorBoundary is for.
export function DonutChart({ dataset }) {
  const total = dataset.slices.reduce((sum, slice) => sum + slice.value, 0);

  let consumed = 0;
  const arcs = dataset.slices.map((slice) => {
    const dash = (slice.value / total) * CIRCUMFERENCE;
    const arc = h("circle", {
      key: slice.id,
      className: "donut-arc",
      cx: 18,
      cy: 18,
      r: RADIUS,
      fill: "none",
      stroke: slice.color,
      "stroke-width": 4,
      "stroke-dasharray": `${dash} ${CIRCUMFERENCE - dash}`,
      "stroke-dashoffset": -consumed,
      transform: "rotate(-90 18 18)",
    });
    consumed += dash;
    return arc;
  });

  return h(
    "figure",
    { className: "donut" },
    h(
      "svg",
      { viewBox: "0 0 36 36", className: "donut-svg", role: "img", "aria-label": dataset.label },
      h("circle", {
        className: "donut-track",
        cx: 18,
        cy: 18,
        r: RADIUS,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 4,
      }),
      arcs,
    ),
    h("figcaption", null, dataset.label),
    h(
      "ul",
      { className: "donut-legend" },
      dataset.slices.map((slice) =>
        h(
          "li",
          { key: slice.id },
          h("span", { className: "donut-swatch", style: { background: slice.color } }),
          `${slice.label} — ${slice.value}%`,
        ),
      ),
    ),
  );
}
