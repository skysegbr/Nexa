import { h } from "/dist/nexa.js";
import { Card, Button } from "/dist/nexa-components-core.js";
import { MEDIA_ITEMS } from "../../data.js";

export function CardMedia() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "m-card-media + m-card-reveal"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Hover a card (or focus the corner button) to expand the clip-path info panel.",
    ),
    h(
      "div",
      { className: "m-grid-3" },
      MEDIA_ITEMS.map((item) =>
        h(
          Card,
          {
            key: item.id,
            padded: false,
            className: "m-card-media m-card-media-zoom m-card-reveal",
            style: { height: "300px" },
          },
          h("img", { className: "m-card-media-img", src: item.image, alt: item.name }),
          h("div", { className: "m-card-media-shadow" }),
          h(
            "div",
            { className: "m-card-media-body" },
            h("h3", { style: { margin: "0 0 .25rem", fontSize: "var(--m-font-size-lg)" } }, item.name),
            h("span", { className: "m-text-sm" }, item.role),
          ),
          h("button", { className: "m-card-reveal-trigger", type: "button", "aria-label": "Show details" },
            h("i", { className: "bi bi-grid-3x3-gap-fill" }),
          ),
          h(
            "div",
            { className: "m-card-reveal-panel" },
            h("h3", { style: { margin: "0 0 .5rem" } }, item.name),
            h("p", { className: "m-text-sm", style: { margin: "0 0 1rem" } },
              "Frontend developer building UI/UX interfaces, with years of experience shipping happy clients.",
            ),
            h(Button, { variant: "contained" }, "Follow"),
          ),
        ),
      ),
    ),
  );
}
