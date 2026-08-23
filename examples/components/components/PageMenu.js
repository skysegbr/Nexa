import { h } from "/dist/fluxaway.js";
import { Button } from "/dist/fluxaway-components-core.js";
import { Menu } from "/dist/fluxaway-components-overlay.js";

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

  const hoverIntentItems = [
    {
      key: "database",
      label: "Database",
      children: [
        { key: "sqlite", label: "SQLite query", onClick: () => notify("SQLite query") },
        {
          key: "postgres",
          label: "PostgreSQL",
          children: [
            { key: "select", label: "SELECT template", onClick: () => notify("SELECT template") },
            { key: "explain", label: "EXPLAIN plan", onClick: () => notify("EXPLAIN plan") },
          ],
        },
        { key: "mysql", label: "MySQL query", onClick: () => notify("MySQL query") },
      ],
    },
    {
      key: "data-science",
      label: "Data Science",
      children: [
        { key: "notebook", label: "Notebook", onClick: () => notify("Notebook") },
        { key: "pipeline", label: "Training pipeline", onClick: () => notify("Training pipeline") },
      ],
    },
    {
      key: "reports",
      label: "Reports",
      children: [
        { key: "daily", label: "Daily summary", onClick: () => notify("Daily summary") },
        { key: "audit", label: "Audit report", onClick: () => notify("Audit report") },
      ],
    },
  ];

  return h(
    "div",
    { className: "menu-page" },

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
      h("p", { className: "demo-label" }, "Hover-intent stress test"),
      h(
        "p",
        { className: "menu-intent-note" },
        "Open Database, then move slowly and diagonally toward MySQL query. " +
          "The Database flyout must remain open while the pointer travels across the neighboring rows. " +
          "PostgreSQL also opens a third menu level.",
      ),
      h(
        "div",
        { className: "demo-row menu-intent-stage" },
        h(Menu, {
          id: "hover-intent-menu",
          trigger: h(Button, { variant: "tonal" }, "Query templates"),
          items: hoverIntentItems,
        }),
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
