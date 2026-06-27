import { h } from "/dist/nexa.js";

const PERIODS = [
  { key: "q1", label: "Q1" },
  { key: "q2", label: "Q2" },
  { key: "corrupted", label: "Corrupted feed" },
];

export function Toolbar({ datasetKey, onSelect }) {
  return h(
    "div",
    { className: "c-toolbar" },
    PERIODS.map((period) =>
      h(
        "button",
        {
          key: period.key,
          type: "button",
          className: `c-toolbar-btn${period.key === datasetKey ? " is-active" : ""}`,
          onClick: () => onSelect(period.key),
        },
        period.label,
      ),
    ),
  );
}
