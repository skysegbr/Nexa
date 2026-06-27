import { h } from "/dist/nexa.js";

export function Features({ features }) {
  return h(
    "section",
    { className: "l-section", id: "features" },
    h(
      "div",
      { className: "l-section-inner" },
      h("p", { className: "l-eyebrow l-eyebrow-center" }, "EVERYTHING YOUR TEAM NEEDS"),
      h("h2", { className: "l-section-title" }, "One dashboard, without losing what makes each tool great"),
      h(
        "p",
        { className: "l-section-lead" },
        "Orbiq doesn't replace your team's tools — it brings what they know into one place, easy to read and act on.",
      ),
      h(
        "div",
        { className: "l-feature-grid" },
        features.map((feature) =>
          h(
            "article",
            { key: feature.id, className: "l-feature-card" },
            h("span", { className: "l-feature-icon", "aria-hidden": "true" }, feature.icon),
            h("h3", null, feature.title),
            h("p", null, feature.description),
          ),
        ),
      ),
    ),
  );
}
