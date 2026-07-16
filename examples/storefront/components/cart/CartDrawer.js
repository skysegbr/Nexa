import { h, useContext } from "/dist/nexa.js";
import { Button, EmptyState, IconButton } from "/dist/nexa-components-core.js";
import { Drawer } from "/dist/nexa-components-overlay.js";
import { CartContext } from "./CartContext.js";

// onCheckout is a prop, not something CartDrawer figures out itself — whether
// checkout requires sign-in is decided in Shell.js, which is the only place
// allowed to know about both the cart and auth domains at once.
export function CartDrawer({ open, onClose, onCheckout }) {
  const { items, subtotal, setQty, removeItem } = useContext(CartContext);

  return h(
    Drawer,
    { open, onClose, side: "right", title: "Your cart" },
    items.length === 0
      ? h(EmptyState, { title: "Cart is empty", description: "Add a product to get started." })
      : h(
          "div",
          { className: "sf-cart-list" },
          items.map((item) =>
            h(
              "div",
              { key: item.id, className: "sf-cart-row" },
              h("img", { className: "sf-cart-row-image", src: item.image, alt: item.title }),
              h(
                "div",
                { className: "sf-cart-row-body" },
                h("strong", null, item.title),
                h(
                  "div",
                  { className: "sf-cart-row-controls" },
                  h(IconButton, { label: "Decrease quantity", variant: "text", onClick: () => setQty(item.id, item.qty - 1) }, "−"),
                  h("span", null, item.qty),
                  h(IconButton, { label: "Increase quantity", variant: "text", onClick: () => setQty(item.id, item.qty + 1) }, "+"),
                  h("span", { className: "sf-cart-row-price" }, `$${(item.price * item.qty).toFixed(2)}`),
                ),
              ),
              h(IconButton, { label: "Remove item", variant: "text", onClick: () => removeItem(item.id) }, h("i", { className: "bi-trash" })),
            ),
          ),
        ),
    items.length > 0 && h(
      "div",
      { className: "sf-cart-footer" },
      h("span", null, "Subtotal"),
      h("strong", null, `$${subtotal.toFixed(2)}`),
      h(Button, { variant: "contained", onClick: onCheckout }, "Checkout"),
    ),
  );
}
