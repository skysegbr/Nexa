import { h } from "/dist/nexa.js";

export function ModuleList({ modules }) {
  return h(
    "ul",
    { className: "m-list" },
    modules.map((item) =>
      h(
        "li",
        { key: item.id, className: "m-list-item", dataset: { module: item.id } },
        h(
          "div",
          null,
          h("p", { className: "core-item-title" }, item.title),
          h("p", { className: "core-item-desc" }, item.description),
        ),
        h("span", { className: "m-chip" }, item.id),
      ),
    ),
  );
}
