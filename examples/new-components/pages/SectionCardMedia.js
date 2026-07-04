import { h } from "/dist/nexa.js";
import { Card, Button } from "/dist/nexa-components.js";

/* ── Media + reveal ────────────────────────────────────── */

const MEDIA_ITEMS = [
  { id: "jinx", name: "Jinx", role: "Frontend Developer", gradient: "linear-gradient(160deg, #f59e0b, #7c2d12)" },
  { id: "yaik", name: "Yaik", role: "Web Designer",        gradient: "linear-gradient(160deg, #34d399, #064e3b)" },
  { id: "xima", name: "Xima", role: "Data Analytics",      gradient: "linear-gradient(160deg, #f472b6, #831843)" },
];

export function SectionCardMedia() {
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
          h("div", { className: "m-card-media-img", style: { background: item.gradient } }),
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

/* ── Glow (gradient border) ────────────────────────────── */

const GLOW_ITEMS = [
  { id: "default", variant: "", icon: "bi-lightning-charge-fill", title: "Awesome Card 01" },
  { id: "amber",   variant: "m-card-glow-amber",   icon: "bi-fire",         title: "Awesome Card 02" },
  { id: "emerald", variant: "m-card-glow-emerald", icon: "bi-stars",        title: "Awesome Card 03" },
];

export function SectionCardGlow() {
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

/* ── Float (image with slide-up panel) ─────────────────── */

const FLOAT_ITEMS = [
  { id: "path",   place: "Vancouver Mountains, Canada", title: "The Great Path",  gradient: "linear-gradient(160deg, #93c5fd, #1e3a8a)" },
  { id: "night",  place: "Poon Hill, Nepal",             title: "Starry Night",    gradient: "linear-gradient(160deg, #a78bfa, #312e81)" },
  { id: "peace",  place: "Bojcin Forest, Serbia",        title: "Path Of Peace",   gradient: "linear-gradient(160deg, #86efac, #14532d)" },
];

export function SectionCardFloat() {
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
          h("div", { className: "m-card-float-img", style: { background: item.gradient } }),
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
