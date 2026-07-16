import { h } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";
import { Menu } from "/dist/nexa-components-overlay.js";

export function PageMenu({ toast }) {
  const notify = (label) => toast.info(`"${label}" clicked`);

  const fileItems = [
    { key: "new", label: "New File", onClick: () => notify("New File") },
    {
      key: "recent",
      label: "Open Recent",
      children: [
        { key: "a", label: "project-a.js", onClick: () => notify("project-a.js") },
        { key: "b", label: "project-b.js", onClick: () => notify("project-b.js") },
        { key: "c", label: "project-c.js", onClick: () => notify("project-c.js") },
      ],
    },
    { divider: true },
    {
      key: "settings",
      label: "Settings",
      children: [
        { key: "prefs", label: "Preferences", onClick: () => notify("Preferences") },
        { key: "keys", label: "Keyboard Shortcuts", onClick: () => notify("Keyboard Shortcuts") },
      ],
    },
    { divider: true },
    { key: "exit", label: "Exit", danger: true, onClick: () => notify("Exit") },
  ];

  const actionsItems = [
    { key: "edit", label: "Edit", onClick: () => notify("Edit") },
    { key: "duplicate", label: "Duplicate", onClick: () => notify("Duplicate") },
    { key: "delete", label: "Delete", danger: true, onClick: () => notify("Delete") },
  ];

  return h(
    "div",
    null,

    h("h1", { className: "m-page-title" }, "Menu"),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Nested submenus"),
      h(
        "div",
        { className: "demo-row" },
        h(Menu, { trigger: h(Button, null, "File"), items: fileItems }),
      ),
    ),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Right-aligned, no submenus"),
      h(
        "div",
        { className: "demo-row", style: { justifyContent: "flex-end" } },
        h(Menu, { trigger: h(Button, { variant: "tonal" }, "Actions"), items: actionsItems, align: "right" }),
      ),
    ),
  );
}
