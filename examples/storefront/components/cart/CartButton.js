import { h, useContext } from "/dist/nexa.js";
import { Badge, IconButton } from "/dist/nexa-components.js";
import { CartContext } from "./CartContext.js";

export function CartButton({ onClick }) {
  const { itemCount } = useContext(CartContext);

  return h(
    "span",
    { className: "sf-cart-button" },
    h(IconButton, { label: "Open cart", variant: "tonal", onClick }, h("i", { className: "bi-cart3" })),
    itemCount > 0 && h(Badge, { className: "sf-cart-badge" }, itemCount),
  );
}
