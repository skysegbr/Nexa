import { h } from "/dist/nexa.js";

export function CategoryFilter({ categories, active, onSelect }) {
  return h(
    "div",
    { className: "g-filter", role: "tablist", "aria-label": "Filter photos by category" },
    categories.map((category) =>
      h(
        "button",
        {
          key: category,
          type: "button",
          role: "tab",
          "aria-selected": category === active ? "true" : "false",
          className: `g-filter-btn${category === active ? " is-active" : ""}`,
          onClick: () => onSelect(category),
        },
        category,
      ),
    ),
  );
}
