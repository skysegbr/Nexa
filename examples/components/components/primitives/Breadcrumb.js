import { h } from "/dist/nexa.js";

export function Breadcrumb() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Breadcrumb"),

    h("div", { className: "m-stack" },
      h("ol", { className: "m-breadcrumb" },
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Home"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" }, "Dashboard"),
      ),

      h("ol", { className: "m-breadcrumb" },
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Home"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Projects"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Nexa"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" }, "nexa-ui.css"),
      ),
    ),
  );
}
