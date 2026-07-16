import { h } from "/dist/nexa.js";
import { Card, Button } from "/dist/nexa-components-core.js";
import { PRICING_ITEMS } from "../../data.js";

export function CardPricing() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "m-card-pricing"),
    h(
      "div",
      { className: "m-grid-3" },
      PRICING_ITEMS.map((item) =>
        h(
          Card,
          { key: item.id, padded: true, className: "m-card-pricing" },
          h(
            "div",
            { className: "m-card-pricing-badge" },
            h("span", null, "$", item.price),
            h("span", { className: "m-card-pricing-period" }, "/month"),
          ),
          h("div", { className: "m-card-glow-icon", style: { margin: "0 0 var(--m-space-4)" } },
            h("i", { className: `bi ${item.icon}` }),
          ),
          h("span", { className: "m-text-xs m-text-muted" }, item.subtitle),
          h("h3", { className: "m-title", style: { margin: ".25rem 0 1.25rem" } }, item.title),
          h(
            "ul",
            { className: "m-stack", style: { listStyle: "none", padding: 0, margin: "0 0 1.5rem", textAlign: "left", gap: "var(--m-space-2)" } },
            item.features.map((feature) =>
              h("li", { key: feature, className: "m-text-sm" },
                h("i", { className: "bi bi-check-circle-fill", style: { color: "var(--m-primary)", marginRight: "var(--m-space-2)" } }),
                feature,
              ),
            ),
          ),
          h(Button, { variant: "contained" }, "Choose this plan"),
        ),
      ),
    ),
  );
}
