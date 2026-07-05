import { h } from "/dist/nexa.js";
import { FLOAT_ITEMS } from "../../data.js";

export function CardFloat() {
  return h(
    "div",
    { className: "demo-section", style: { paddingBottom: "var(--m-space-12)" } },
    h("p", { className: "demo-label" }, "m-card-float"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-6)" } },
      "The info panel is clipped away below the image at rest. On hover it grows up out of the card's base with a rise-then-settle bounce; on exit it rises once more, then sinks back into the card.",
    ),
    h(
      "div",
      { className: "m-grid-3" },
      FLOAT_ITEMS.map((item) =>
        h(
          "article",
          { key: item.id, className: "m-card-float" },
          h("img", { className: "m-card-float-img", src: item.image, alt: item.title }),
          h(
            "div",
            { className: "m-card-float-panel" },
            h("span", { className: "m-text-xs m-text-muted" }, item.place),
            h("h3", { className: "m-title", style: { margin: ".25rem 0 .75rem", fontSize: "var(--m-font-size-lg)" } }, item.title),
            h("a", { href: "#", className: "m-text-sm", style: { color: "var(--m-primary)", fontWeight: 600 } }, "Read More"),
          ),
        ),
      ),
    ),
  );
}
