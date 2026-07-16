import { h } from "/dist/nexa.js";
import { Select, TextField } from "/dist/nexa-components-forms.js";
import { CLASSIFICATION_OPTIONS, STATUS_OPTIONS } from "../data.js";

export function RecallFilters({ query, onQueryChange, classification, onClassificationChange, status, onStatusChange }) {
  return h(
    "div",
    { className: "dr-filters" },
    h(TextField, {
      id: "recall-search",
      label: "Search",
      placeholder: "Drug, firm, or reason…",
      value: query,
      onInput: (e) => onQueryChange(e.target.value),
    }),
    h(Select, {
      id: "recall-classification",
      label: "Classification",
      value: classification,
      options: CLASSIFICATION_OPTIONS,
      onChange: (e) => onClassificationChange(e.target.value),
    }),
    h(Select, {
      id: "recall-status",
      label: "Status",
      value: status,
      options: STATUS_OPTIONS,
      onChange: (e) => onStatusChange(e.target.value),
    }),
  );
}
