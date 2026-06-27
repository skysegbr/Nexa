import { h, useState } from "/dist/nexa.js";

function PriceTag({ plan, annual }) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  if (price === null) {
    return h("p", { className: "l-pricing-price" }, h("span", { className: "l-price-custom" }, "Custom pricing"));
  }

  return h(
    "p",
    { className: "l-pricing-price" },
    h("span", { className: "l-price-currency" }, "R$"),
    h("span", { className: "l-price-value" }, String(price)),
    h("span", { className: "l-price-period" }, "/mo"),
  );
}

function PlanCard({ plan, annual }) {
  return h(
    "article",
    { key: plan.id, className: plan.highlighted ? "l-pricing-card is-highlighted" : "l-pricing-card" },
    plan.highlighted && h("span", { className: "l-pricing-badge" }, "Most popular"),
    h("h3", null, plan.name),
    h("p", { className: "l-pricing-tagline" }, plan.tagline),
    h(PriceTag, { plan, annual }),
    h(
      "ul",
      { className: "l-pricing-features" },
      plan.features.map((feature, index) => h("li", { key: index }, h("span", { "aria-hidden": "true" }, "✓"), feature)),
    ),
    h(
      "a",
      { className: plan.highlighted ? "l-btn l-btn-primary l-pricing-cta" : "l-btn l-btn-ghost l-pricing-cta", href: "#" },
      plan.cta,
    ),
  );
}

export function Pricing({ plans }) {
  const [annual, setAnnual] = useState(true);

  return h(
    "section",
    { className: "l-section", id: "pricing" },
    h(
      "div",
      { className: "l-section-inner" },
      h("p", { className: "l-eyebrow l-eyebrow-center" }, "PRICING THAT FITS YOUR TEAM"),
      h("h2", { className: "l-section-title" }, "Start for free, grow when it makes sense"),
      h("p", { className: "l-section-lead" }, "No fine print: cancel any time and take your data with you."),
      h(
        "div",
        { className: "l-billing-toggle" },
        h("span", { className: annual ? "" : "is-active" }, "Monthly"),
        h(
          "button",
          {
            type: "button",
            className: annual ? "l-toggle-switch is-annual" : "l-toggle-switch",
            role: "switch",
            "aria-checked": annual ? "true" : "false",
            "aria-label": "Toggle between monthly and annual billing",
            onClick: () => setAnnual((wasAnnual) => !wasAnnual),
          },
          h("span", { className: "l-toggle-knob" }),
        ),
        h("span", { className: annual ? "is-active" : "" }, "Annual ", h("em", null, "— 2 months free")),
      ),
      h(
        "div",
        { className: "l-pricing-grid" },
        plans.map((plan) => h(PlanCard, { key: plan.id, plan, annual })),
      ),
    ),
  );
}
