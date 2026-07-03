import { h } from "../../../dist/nexa.js";

export function TopBar({ page, setPage, cartCount }) {
  const pages = [
    { id: "cardapio",   label: "Cardápio" },
    { id: "pedido",     label: "🛒 Pedido" },
    { id: "acompanhar", label: "Acompanhar" },
    { id: "admin",      label: "⚙️ Admin" },
  ];

  return h("header", { className: "burguer-topbar" },
    h("span", { className: "logo" }, "🍔"),
    h("div", null,
      h("div", { className: "brand" }, "Burguer"),
      h("div", { className: "tagline" }, "Smash • Grill • Craft"),
    ),
    h("div", { className: "spacer" }),
    h("nav", { className: "topbar-nav" },
      pages.map((p) =>
        p.id === "pedido"
          ? h("div", { key: p.id, className: "cart-btn-wrap" },
              h("button", {
                className: page === p.id ? "active" : "",
                onClick: () => setPage(p.id),
              }, p.label),
              cartCount > 0 && h("span", { className: "cart-badge" }, cartCount),
            )
          : h("button", {
              key: p.id,
              className: page === p.id ? "active" : "",
              onClick: () => setPage(p.id),
            }, p.label)
      )
    ),
  );
}
