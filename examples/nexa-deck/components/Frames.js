import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components-core.js";

// Frame components for every data.kind — title, point, rules, code and the
// zoomed-out overview. They all share the same anatomy (badge + heading +
// body), so they live together in this file instead of one file per kind.

function SplitList({ title, items }) {
  return h(
    "section",
    { className: "nx-split-list" },
    h("h3", null, title),
    h(
      "ul",
      null,
      items.map((item) => h("li", { key: item }, item)),
    ),
  );
}

export function TitleFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-title" },
    h("img", { className: "nx-logo", src: "/assets/nexa-logo-transparent.png", alt: "Nexa" }),
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h1", null, data.heading),
    h("p", null, data.body),
    h("div", { className: "nx-title-meta" }, data.meta.map((item) => h("span", { key: item }, item))),
  );
}

export function PointFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-point" },
    h("i", { className: `${data.icon} nx-icon`, ariaHidden: "true" }),
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", null, data.body),
    data.items && h(
      "ul",
      { className: "nx-list" },
      data.items.map((item) => h("li", { key: item }, item)),
    ),
  );
}

export function RuleFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-rules" },
    h("i", { className: `${data.icon} nx-icon`, ariaHidden: "true" }),
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("div", { className: "nx-rule-grid" },
      data.rules.map((rule) =>
        h("section", { key: rule.title, className: `nx-rule nx-rule-${rule.tone}` },
          h("strong", null, rule.title),
          h("p", null, rule.body),
        ),
      ),
    ),
  );
}

export function CodeFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-code" },
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", null, data.body),
    h("pre", null, h("code", null, data.code)),
  );
}

export function OverviewFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-overview" },
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("div", { className: "nx-overview-grid" },
      data.columns.map((column) => h(SplitList, { key: column.title, ...column })),
    ),
  );
}
