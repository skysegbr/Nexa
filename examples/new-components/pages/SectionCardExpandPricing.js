import { h, useState } from "/dist/nexa.js";
import { Card, Button } from "/dist/nexa-components.js";

/* ── Expand group ──────────────────────────────────────── */

const EXPAND_ITEMS = [
  { id: "fog",    title: "Majestic Fog",    icon: "bi-cloud-fog2-fill", gradient: "linear-gradient(160deg, #64748b, #1e293b)" },
  { id: "autumn", title: "Autumn Trees",    icon: "bi-tree-fill",       gradient: "linear-gradient(160deg, #f59e0b, #78350f)" },
  { id: "winter", title: "Winter Forest",   icon: "bi-snow2",           gradient: "linear-gradient(160deg, #60a5fa, #1e3a8a)" },
  { id: "lake",   title: "Hidden Lake",     icon: "bi-water",           gradient: "linear-gradient(160deg, #22d3ee, #164e63)" },
];

export function SectionCardExpand() {
  const [active, setActive] = useState("winter");

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "m-card-expand-group"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Hover (or click) a strip to expand it — active state driven by useState, not a CSS-only trick.",
    ),
    h(
      "div",
      { className: "m-card-expand-group" },
      EXPAND_ITEMS.map((item) =>
        h(
          "article",
          {
            key: item.id,
            className: `m-card-expand${item.id === active ? " is-active" : ""}`,
            onMouseEnter: () => setActive(item.id),
            onClick: () => setActive(item.id),
          },
          h("div", { className: "m-card-expand-img", style: { background: item.gradient } }),
          h("div", { className: "m-card-expand-shadow" }),
          h(
            "div",
            { className: "m-card-expand-data" },
            h("span", { className: "m-card-expand-icon" }, h("i", { className: `bi ${item.icon}` })),
            h(
              "div",
              null,
              h("h3", { style: { margin: "0 0 .1rem", fontSize: "var(--m-font-size-lg)" } }, item.title),
              h("p", { className: "m-text-sm", style: { margin: 0 } }, "Beautiful scenery to enjoy."),
            ),
          ),
        ),
      ),
    ),
  );
}

/* ── Pricing ───────────────────────────────────────────── */

const PRICING_ITEMS = [
  { id: "basic", subtitle: "Free plan", title: "Basic", price: "0", icon: "bi-box-seam",
    features: ["3 user requests", "10 downloads per day", "Daily content updates"] },
  { id: "pro", subtitle: "Most popular", title: "Professional", price: "19", icon: "bi-rocket-takeoff-fill",
    features: ["100 user requests", "Unlimited downloads", "Unlock all features", "Daily content updates"] },
  { id: "enterprise", subtitle: "For agencies", title: "Enterprise", price: "29", icon: "bi-building-fill-gear",
    features: ["Unlimited user requests", "Unlimited downloads", "Unlock all features", "Fully editable files"] },
];

export function SectionCardPricing() {
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
