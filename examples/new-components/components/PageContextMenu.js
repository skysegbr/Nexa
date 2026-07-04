import { h, useState, useContextMenu } from "/dist/nexa.js";
import { ContextMenu, Alert } from "/dist/nexa-components.js";

export function PageContextMenu() {
  const { menu, openMenu, closeMenu } = useContextMenu();
  const [lastAction, setLastAction]   = useState(null);

  const act = (label) => { setLastAction(label); closeMenu(); };

  return h(
    "div",
    { className: "m-stack" },
    h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Context Menu"),
    h(Alert, { variant: "info" }, "Right-click the area below."),
    h(
      "div",
      {
        onContextMenu: openMenu,
        style: {
          height: 200,
          border: "2px dashed var(--m-border)",
          borderRadius: "var(--m-radius-lg)",
          background: "var(--m-surface)",
          display: "grid",
          placeItems: "center",
          cursor: "context-menu",
          userSelect: "none",
        },
      },
      h("span", { className: "m-text-muted m-text-sm" },
        h("i", { className: "bi bi-mouse2 m-me-2" }),
        "Right-click here",
      ),
    ),
    lastAction && h(Alert, { variant: "success" }, `Action executed: "${lastAction}"`),
    h(ContextMenu, {
      open:    menu.open,
      x:       menu.x,
      y:       menu.y,
      onClose: closeMenu,
      items: [
        { label: "Edit node",       icon: h("i", { className: "bi bi-pencil"      }), onClick: () => act("Edit node")       },
        { label: "Add child",       icon: h("i", { className: "bi bi-plus-circle" }), onClick: () => act("Add child")       },
        { label: "Duplicate",       icon: h("i", { className: "bi bi-copy"        }), onClick: () => act("Duplicate")       },
        { divider: true },
        { label: "Delete", danger: true, icon: h("i", { className: "bi bi-trash"  }), onClick: () => act("Delete") },
      ],
    }),
  );
}
