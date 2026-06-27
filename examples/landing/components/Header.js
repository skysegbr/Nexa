import { h, useState } from "/dist/nexa.js";

export function Header({ navLinks }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return h(
    "header",
    { className: "l-header" },
    h(
      "div",
      { className: "l-header-inner" },
      h(
        "a",
        { className: "l-logo", href: "#top", onClick: close },
        h("span", { className: "l-logo-mark" }, "◆"),
        "Orbiq",
      ),
      h(
        "nav",
        { className: open ? "l-nav is-open" : "l-nav" },
        navLinks.map((link) =>
          h("a", { key: link.href, className: "l-nav-link", href: link.href, onClick: close }, link.label),
        ),
        h("a", { className: "l-nav-cta", href: "#pricing", onClick: close }, "Get started free"),
      ),
      h(
        "button",
        {
          type: "button",
          className: "l-menu-btn",
          "aria-label": open ? "Close menu" : "Open menu",
          "aria-expanded": open ? "true" : "false",
          onClick: () => setOpen((wasOpen) => !wasOpen),
        },
        h("span", { className: "l-menu-bar" }),
        h("span", { className: "l-menu-bar" }),
        h("span", { className: "l-menu-bar" }),
      ),
    ),
  );
}
