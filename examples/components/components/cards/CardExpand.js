import { h, useState } from "/dist/nexa.js";
import { EXPAND_ITEMS } from "../../data.js";

export function CardExpand() {
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
          h("img", { className: "m-card-expand-img", src: item.image, alt: item.title }),
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
