// The Library panel, Flash-style: named symbols saved from stage actors
// (shape + paint, no keyframes), part of the document — saved projects
// carry their library. Clicking a symbol's name places a fresh instance
// on the stage.

import { h } from "/dist/nexa.js";

function swatchStyle(item) {
  if (item.kind === "text") {
    return { color: item.fill };
  }
  return {
    background: item.fill,
    borderRadius: item.kind === "ellipse" ? "50%" : "3px",
  };
}

export function Library({ items, onPlace, onRemove }) {
  return h(
    "section",
    { className: "me-library", ariaLabel: "Library" },
    h("h2", { className: "me-panel-title" }, `Library — ${items.length} item${items.length === 1 ? "" : "s"}`),
    items.length === 0 &&
      h("p", { className: "me-empty" }, "Select an actor and “☆ to library” saves its shape as a reusable symbol."),
    items.map((item) =>
      h(
        "div",
        { key: item.name, className: "me-library-item" },
        h("span", { className: `me-library-swatch me-library-${item.kind}`, style: swatchStyle(item), ariaHidden: "true" }, item.kind === "text" ? "T" : ""),
        h(
          "button",
          {
            type: "button",
            className: "me-library-name",
            title: `Place an instance of “${item.name}” on the stage`,
            onClick: () => onPlace(item),
          },
          item.name,
        ),
        h("span", { className: "me-library-kind" }, item.kind),
        h(
          "button",
          {
            type: "button",
            className: "me-btn me-btn-add me-btn-remove",
            title: `Remove “${item.name}” from the library`,
            onClick: () => onRemove(item.name),
          },
          "✕",
        ),
      ),
    ),
  );
}
