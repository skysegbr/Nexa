import { h, useContext } from "/dist/nexa.js";
import { Alert, EmptyState, Spinner } from "/dist/nexa-components-core.js";
import { CatalogContext } from "./CatalogContext.js";
import { ProductCard } from "./ProductCard.js";

export function ProductGrid({ onAddToCart }) {
  const { products, loading, error } = useContext(CatalogContext);

  if (loading) return h(Spinner, { label: "Loading products…" });
  if (error) return h(Alert, { variant: "danger", title: "Couldn't reach the catalog" }, error);
  if (products.length === 0) {
    return h(EmptyState, { title: "No products found", description: "Try a different search or category." });
  }

  return h(
    "div",
    { className: "sf-product-grid" },
    products.map((p) => h(ProductCard, { key: p.id, product: p, onAddToCart })),
  );
}
