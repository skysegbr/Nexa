import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components.js";

// Quadros de texto simples — capa, território, bússola de regras,
// prancheta de código, marcos numéricos, mapa-múndi e horizonte final.
// Todos compartilham a mesma anatomia (selo + título + corpo), então
// vivem juntos neste arquivo em vez de um arquivo por variante.

export function CoverFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-cover" },
    h("span", { className: "atl-compass-rose", ariaHidden: "true" }, "✦"),
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h1", null, data.heading),
    h("p", { className: "atl-body" }, data.body),
    h(
      "div",
      { className: "atl-meta-row" },
      data.meta.map((item) => h("span", { key: item, className: "atl-meta-chip" }, item)),
    ),
    h("p", { className: "atl-hint" }, data.hint),
  );
}

export function TerritoryFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-territory" },
    h("i", { className: `${data.icon} atl-icon`, ariaHidden: "true" }),
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "atl-body" }, data.body),
    h(
      "ul",
      { className: "atl-list" },
      data.items.map((item) => h("li", { key: item }, item)),
    ),
  );
}

export function RulesFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-rules" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "atl-rose" },
      data.rules.map((rule) =>
        h(
          "section",
          { key: rule.title, className: `atl-rule atl-rule-${rule.tone}` },
          h("span", { className: "atl-rule-dir" }, rule.dir),
          h("i", { className: `${rule.icon} atl-rule-icon`, ariaHidden: "true" }),
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
    { className: "atl-frame atl-frame-code" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "atl-body" }, data.body),
    h("pre", { className: "atl-pre" }, h("code", null, data.code)),
  );
}

export function StatsFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-stats" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "atl-stat-grid" },
      data.stats.map((s) =>
        h(
          "div",
          { key: s.label, className: "atl-stat" },
          h("strong", null, s.value),
          h("span", null, s.label),
        ),
      ),
    ),
  );
}

export function OverviewFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-overview" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "atl-legend-grid" },
      data.legend.map((column) =>
        h(
          "section",
          { key: column.title, className: "atl-legend-card" },
          h("h3", null, column.title),
          h(
            "ul",
            null,
            column.items.map((item) => h("li", { key: item }, item)),
          ),
        ),
      ),
    ),
  );
}

export function CtaFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-cta" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "atl-body" }, data.body),
    h("pre", { className: "atl-pre atl-pre-compact" }, h("code", null, data.code)),
    h("p", { className: "atl-cdn" }, h("i", { className: "bi-globe2", ariaHidden: "true" }), data.cdn),
  );
}
