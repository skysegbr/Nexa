import { h, useContext } from "/dist/nexa.js";
import { Select, TextField } from "/dist/nexa-components.js";
import { CatalogContext } from "./CatalogContext.js";

export function CatalogFilters() {
  const { categories, category, setCategory, query, setQuery } = useContext(CatalogContext);

  return h(
    "div",
    { className: "sf-filters" },
    h(TextField, {
      id: "catalog-search",
      label: "Search",
      placeholder: "Find a product…",
      value: query,
      onInput: (e) => setQuery(e.target.value),
    }),
    h(Select, {
      id: "catalog-category",
      label: "Category",
      value: category,
      options: categories.map((c) => ({ value: c, label: c === "all" ? "All categories" : c })),
      onChange: (e) => setCategory(e.target.value),
    }),
  );
}
