import { h } from "/dist/nexa.js";
import { Button, Card } from "/dist/nexa-components-core.js";

// Catalog never imports the cart domain — it just calls the callback it was
// handed. Shell.js is the only place that wires this prop to cart.addItem.
export function ProductCard({ product, onAddToCart }) {
  return h(
    Card,
    { className: "sf-product-card" },
    h("img", { className: "sf-product-image", src: product.image, alt: product.title }),
    h("p", { className: "sf-product-category" }, product.category),
    h("strong", { className: "sf-product-title" }, product.title),
    h("div", { className: "sf-product-footer" },
      h("span", { className: "sf-product-price" }, `$${product.price.toFixed(2)}`),
      h(Button, { variant: "tonal", onClick: () => onAddToCart(product) }, "Add to cart"),
    ),
  );
}
