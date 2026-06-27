import { h } from "/dist/nexa.js";

export function Footer({ columns }) {
  return h(
    "footer",
    { className: "l-footer" },
    h(
      "div",
      { className: "l-footer-inner" },
      h(
        "div",
        { className: "l-footer-brand" },
        h(
          "span",
          { className: "l-logo" },
          h("span", { className: "l-logo-mark" }, "◆"),
          "Orbiq",
        ),
        h("p", null, "Scattered metrics, decisions in one place — built for teams that don't want to guess."),
      ),
      h(
        "div",
        { className: "l-footer-columns" },
        columns.map((column) =>
          h(
            "div",
            { key: column.title, className: "l-footer-column" },
            h("h4", null, column.title),
            h(
              "ul",
              null,
              column.links.map((link) => h("li", { key: link.label }, h("a", { href: link.href }, link.label))),
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      { className: "l-footer-bottom" },
      h("p", null, "© 2026 Orbiq. All rights reserved."),
      h("p", null, "Example built with ", h("a", { href: "/" }, "Nexa"), " — no build, no dependencies."),
    ),
  );
}
