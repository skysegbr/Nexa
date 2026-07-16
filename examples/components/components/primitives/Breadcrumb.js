import { h } from "/dist/nexa.js";
import { Divider } from "/dist/nexa-components-core.js";
import { Breadcrumb as BreadcrumbComponent } from "/dist/nexa-components-nav.js";

export function Breadcrumb() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Breadcrumb & Divider"),

    h("div", { className: "m-stack" },
      h(BreadcrumbComponent, {
        items: [
          { label: "Home", href: "#" },
          { label: "Dashboard" },
        ],
      }),

      h(BreadcrumbComponent, {
        items: [
          { label: "Home", href: "#" },
          { label: "Projects", href: "#" },
          { label: "Nexa", href: "#" },
          { label: "nexa-ui.css" },
        ],
      }),

      h(Divider),

      h("div", { className: "m-cluster" },
        h("span", { className: "m-text-sm" }, "Inline"),
        h(Divider, { vertical: true }),
        h("span", { className: "m-text-sm" }, "separated"),
        h(Divider, { vertical: true }),
        h("span", { className: "m-text-sm" }, "content"),
      ),
    ),
  );
}
