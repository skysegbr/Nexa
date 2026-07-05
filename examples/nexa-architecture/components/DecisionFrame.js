import { h } from "/dist/nexa.js";

export function DecisionFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-decision" },
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "arch-copy" }, data.body),
    h(
      "div",
      { className: "arch-decision-grid" },
      data.decisions.map((decision) =>
        h(
          "section",
          { key: decision.title, className: "arch-decision-item" },
          h("i", { className: decision.icon, ariaHidden: "true" }),
          h("strong", null, decision.title),
          h("p", null, decision.detail),
        ),
      ),
    ),
  );
}
