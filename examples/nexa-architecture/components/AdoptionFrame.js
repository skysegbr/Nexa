import { h } from "/dist/nexa.js";

export function AdoptionFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-adoption" },
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "ol",
      { className: "arch-step-list" },
      data.steps.map((step) =>
        h(
          "li",
          { key: step.title },
          h("strong", null, step.title),
          h("p", null, step.text),
        ),
      ),
    ),
  );
}
