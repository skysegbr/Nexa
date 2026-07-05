import { h } from "/dist/nexa.js";

export function LensFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-lens" },
    h("div", { className: "arch-lens-icon", ariaHidden: "true" }, h("i", { className: data.icon })),
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "arch-copy" }, data.body),
    h(
      "div",
      { className: "arch-point-grid" },
      data.points.map((point) =>
        h(
          "section",
          { key: point.label, className: "arch-point" },
          h("strong", null, point.label),
          h("p", null, point.text),
        ),
      ),
    ),
  );
}
