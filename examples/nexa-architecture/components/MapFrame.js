import { h } from "/dist/nexa.js";

export function MapFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-map" },
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "arch-copy" }, data.body),
    h(
      "div",
      { className: "arch-layer-stack" },
      data.layers.map((layer, index) =>
        h(
          "section",
          { key: layer.name, className: "arch-layer" },
          h("span", { className: "arch-layer-index" }, String(index + 1).padStart(2, "0")),
          h("div", null, h("strong", null, layer.name), h("p", null, layer.role)),
        ),
      ),
    ),
  );
}
