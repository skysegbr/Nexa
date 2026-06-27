import { h } from "../../../dist/nexa.js";
import { Select, TextField } from "../../../dist/nexa-components.js";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Creation date" },
  { value: "title", label: "Title (A-Z)" },
  { value: "priority", label: "Priority" },
];

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
      options: STATUS_OPTIONS,
      value: filters.status,
      onChange: (e) => onChange("status", e.target.value),
    }),
    h(Select, {
      id: "filter-priority",
      label: "Priority",
      options: PRIORITY_OPTIONS,
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
