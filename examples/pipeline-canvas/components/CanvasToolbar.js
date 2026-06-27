import { h } from "/dist/nexa.js";
import { Button, Badge } from "/dist/nexa-components.js";

export function CanvasToolbar({
  nodes = [],
  running = false,
  canUndo = false,
  canRedo = false,
  onAdd,
  onRun,
  onStop,
  onUndo,
  onRedo,
  onExport,
  onImport,
} = {}) {
  const nRunning = nodes.filter(n => n.status === "running").length;
  const nSuccess = nodes.filter(n => n.status === "success").length;
  const nErrors  = nodes.filter(n => n.status === "error").length;

  return h("div", { className: "canvas-toolbar" },
    h("span", { className: "canvas-brand" }, "⬡ Pipeline Canvas"),
    h("div",  { className: "canvas-sep" }),

    h(Button, { variant: "tonal",     onClick: onAdd },
      h("i", { className: "bi bi-plus-lg m-me-1" }), "New Node"),
    h(Button, { variant: "contained", onClick: onRun, disabled: running },
      h("i", { className: "bi bi-play-fill m-me-1" }), "Run"),
    h(Button, { variant: "text",      onClick: onStop },
      h("i", { className: "bi bi-stop-fill m-me-1" }), "Stop"),

    h("div", { className: "canvas-sep" }),

    h(Button, { variant: "text", onClick: onUndo, disabled: !canUndo, title: "Undo (Ctrl+Z)" },
      h("i", { className: "bi bi-arrow-counterclockwise" })),
    h(Button, { variant: "text", onClick: onRedo, disabled: !canRedo, title: "Redo (Ctrl+Y)" },
      h("i", { className: "bi bi-arrow-clockwise" })),

    h("div", { className: "canvas-sep" }),

    h(Button, { variant: "text", onClick: onExport, title: "Export JSON" },
      h("i", { className: "bi bi-download" })),
    h(Button, { variant: "text", onClick: onImport, title: "Import JSON" },
      h("i", { className: "bi bi-upload" })),

    h("div", { className: "canvas-toolbar-end" },
      nRunning > 0 && h("span", { className: "status-dot running" }, `${nRunning} running`),
      nSuccess > 0 && h("span", { className: "status-dot success" }, `${nSuccess} ok`),
      nErrors  > 0 && h("span", { className: "status-dot error"   }, `${nErrors} error`),
      h(Badge, null, `${nodes.length} nodes`),
    ),
  );
}
