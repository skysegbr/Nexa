import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components.js";

export function TokensFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-tokens" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "atl-swatch-grid" },
      data.swatches.map((s) =>
        h(
          "div",
          { key: s.varName, className: "atl-swatch" },
          h("span", { className: "atl-swatch-color", style: { background: `var(${s.varName})` } }),
          h("code", null, s.varName),
        ),
      ),
    ),
    h(
      "div",
      { className: "atl-spacing-scale" },
      data.spacing.map((v) =>
        h("span", { key: v, className: "atl-spacing-bar", style: { width: `var(${v})` } }),
      ),
    ),
    h("p", { className: "atl-caption" }, data.caption),
  );
}
