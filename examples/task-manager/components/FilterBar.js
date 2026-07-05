import { h } from "/dist/nexa.js";
import { Select, TextField } from "/dist/nexa-components.js";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, SORT_OPTIONS } from "../data.js";

const ALL_STATUSES = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS];
const ALL_PRIORITIES = [{ value: "all", label: "All priorities" }, ...PRIORITY_OPTIONS];

/**
 * Filter bar: text search, status, priority, category and sort.
 * Props: filters, categories, onChange(key, value)
 */
export function FilterBar({ filters, categories, onChange }) {
  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...(categories || []),
  ];

  return h(
    "div",
    { className: "tm-filters" },
    h(TextField, {
      id: "filter-search",
      label: "Search",
      placeholder: "Title or description…",
      value: filters.search,
      onInput: (e) => onChange("search", e.target.value),
    }),
    h(Select, {
      id: "filter-status",
      label: "Status",
      options: ALL_STATUSES,
      value: filters.status,
      onChange: (e) => onChange("status", e.target.value),
    }),
    h(Select, {
      id: "filter-priority",
      label: "Priority",
      options: ALL_PRIORITIES,
      value: filters.priority,
      onChange: (e) => onChange("priority", e.target.value),
    }),
    h(Select, {
      id: "filter-category",
      label: "Category",
      options: categoryOptions,
      value: filters.category,
      onChange: (e) => onChange("category", e.target.value),
    }),
    h(Select, {
      id: "filter-sort",
      label: "Sort by",
      options: SORT_OPTIONS,
      value: filters.sort,
      onChange: (e) => onChange("sort", e.target.value),
    }),
  );
}
