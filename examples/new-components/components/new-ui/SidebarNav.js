import { h, useState } from "/dist/nexa.js";
import { SIDEBAR_NAV_ITEMS } from "../../data.js";

export function SidebarNav() {
  const [active, setActive] = useState("Dashboard");

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Sidebar nav links"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "App shell simulation with sidebar. Click the items.",
    ),
    h(
      "div",
      { className: "sidebar-demo-shell" },
      h(
        "aside",
        { className: "sidebar-demo-pane" },
        h(
          "nav",
          { className: "m-sidebar-section" },
          h("p", { className: "m-sidebar-label" }, "Menu"),
          SIDEBAR_NAV_ITEMS.map(({ icon, label, badge }) =>
            h(
              "a",
              {
                key: label,
                href: "#",
                className: `m-sidebar-link${active === label ? " m-sidebar-link-active" : ""}`,
                onClick: (e) => { e.preventDefault(); setActive(label); },
              },
              h("span", { className: "m-sidebar-link-icon" },
                h("i", { className: `bi ${icon}` }),
              ),
              label,
              badge && h("span", { className: "m-sidebar-link-badge m-badge" }, badge),
            ),
          ),
        ),
      ),
      h(
        "div",
        { className: "sidebar-demo-content" },
        h("p", { className: "m-text-muted m-text-sm" }, `Page: ${active}`),
      ),
    ),
  );
}
