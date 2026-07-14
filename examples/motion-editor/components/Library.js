// The Library panel: linked artwork definitions stored with the document.
// Clicking places an instance; its own box/timeline stay independent.

import { h } from "/dist/nexa.js";
import { isVectorKind } from "./vectorGeometry.js";

function swatchStyle(item) {
  if (item.kind === "text") {
    return { color: item.fill };
  }
  if (isVectorKind(item.kind)) return { color: item.stroke };
  return {
    background: item.fill,
    borderRadius: item.kind === "ellipse" ? "50%" : "3px",
  };
}

export function Library({ items, usage, blockedSymbolIds = [], onPlace, onEdit, onRemove }) {
  return h(
    "section",
    { className: "me-library", ariaLabel: "Library" },
    h("h2", { className: "me-panel-title" }, `Library — ${items.length} item${items.length === 1 ? "" : "s"}`),
    items.length === 0 &&
      h("p", { className: "me-empty" }, "Select an actor and choose “☆ convert to symbol” to create linked artwork."),
    items.map((item) =>
      h(
        "div",
        { key: item.name, className: "me-library-item" },
        h(
          "span",
          { className: `me-library-swatch me-library-${item.kind}`, style: swatchStyle(item), ariaHidden: "true" },
          item.kind === "text" ? "T" : item.kind === "line" ? "╱" : item.kind === "pencil" ? "〰" : "",
        ),
        h(
          "button",
          {
            type: "button",
            className: "me-library-name",
            disabled: blockedSymbolIds.includes(item.id),
            title: blockedSymbolIds.includes(item.id) ? "A MovieClip cannot contain itself or an ancestor" : `Place an instance of “${item.name}” on the stage`,
            onClick: () => onPlace(item),
          },
          item.name,
        ),
        h("span", { className: "me-library-kind", title: "Linked instances on stage" }, `${item.kind} · ${usage[item.id] || 0}×`),
        h(
          "button",
          { type: "button", className: "me-btn me-btn-add", disabled: blockedSymbolIds.includes(item.id), title: `Edit “${item.name}”`, onClick: () => onEdit(item.id) },
          "✎",
        ),
        h(
          "button",
          {
            type: "button",
            className: "me-btn me-btn-add me-btn-remove",
            disabled: blockedSymbolIds.includes(item.id),
            title: `Remove “${item.name}” (instances become independent artwork)`,
            onClick: () => onRemove(item.id),
          },
          "✕",
        ),
      ),
    ),
  );
}
