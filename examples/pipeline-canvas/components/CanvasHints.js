import { h } from "/dist/nexa.js";

const HINTS = [
  { icon: "bi-cursor-fill",            label: "Drag node"                     },
  { icon: "bi-arrows-move",            label: "Background: pan"               },
  { icon: "bi-zoom-in",                label: "Scroll: zoom"                  },
  { icon: "bi-diagram-3",              label: "Port down to up: connect"      },
  { icon: "bi-mouse2-fill",            label: "Double-click line: disconnect" },
  { icon: "bi-trash",                  label: "Del: delete"                   },
  { icon: "bi-arrow-counterclockwise", label: "Ctrl+Z: undo"                  },
];

export function CanvasHints() {
  return h("div", { className: "canvas-hints" },
    HINTS.map(({ icon, label }) =>
      h("span", { key: icon },
        h("i", { className: `bi ${icon}` }),
        label,
      ),
    ),
  );
}
