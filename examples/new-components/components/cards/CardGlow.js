import { h } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components.js";
import { GLOW_ITEMS } from "../../data.js";

export function CardGlow() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "m-card-glow"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Gradient border card with a soft blur burst behind the icon on hover.",
    ),
    h(
      "div",
      { className: "m-grid-3" },
      GLOW_ITEMS.map((item) =>
        h(
          "article",
          { key: item.id, className: `m-card-glow ${item.variant}` },
          h("div", { className: "m-card-glow-blur-1" }),
          h("div", { className: "m-card-glow-blur-2" }),
          h(
            "div",
            { className: "m-card-glow-body" },
            h("div", { className: "m-card-glow-icon" }, h("i", { className: `bi ${item.icon}` })),
            h("h3", { style: { margin: "0 0 .5rem" } }, item.title),
            h("p", { className: "m-text-sm m-text-muted", style: { margin: "0 0 1.5rem" } },
              "Gradient card with bright edges for a cool look.",
            ),
            h(Button, { variant: "contained" }, "Continue learning"),
          ),
        ),
      ),
    ),
  );
}
