// The editor's top bar: brand, undo/redo, the project bar (save/load/new)
// and the context-sensitive hint line.

import { h } from "/dist/nexa.js";
import { ProjectBar } from "./ProjectBar.js";

export function EditorHeader({ editor, drawing, onLoad, onNew }) {
  return h(
    "header",
    { className: "me-header" },
    h("h1", { className: "me-brand" }, "⬡ Nexa ", h("em", null, "Motion Editor")),
    h(
      "div",
      { className: "me-history" },
      h("button", { type: "button", className: "me-btn", disabled: !editor.canUndo, onClick: editor.undo }, "↩ undo"),
      h("button", { type: "button", className: "me-btn", disabled: !editor.canRedo, onClick: editor.redo }, "↪ redo"),
    ),
    h(ProjectBar, { doc: editor.doc, onLoad, onNew }),
    h(
      "p",
      { className: "me-hint" },
      drawing
        ? "DRAWING GUIDE: click points on the stage · finish in the inspector · Esc cancels"
        : "dragging an actor keys its position at the playhead · drag diamonds (shift = multi) · Ctrl+C/V copies · Ctrl+D duplicates · Del deletes · Ctrl+Z undo",
    ),
  );
}
