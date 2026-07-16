import { h } from "/dist/nexa.js";
import { Card } from "/dist/nexa-components-core.js";

export function RecallMetrics({ total, byClassification, byStatus }) {
  const classCount = (label) => byClassification.find((c) => c.term === label)?.count ?? 0;
  const statusCount = (label) => byStatus.find((c) => c.term === label)?.count ?? 0;

  const metrics = [
    { label: "Matching recalls", value: total, tone: "" },
    { label: "Class I — most serious", value: classCount("Class I"), tone: "dr-metric-danger" },
    { label: "Class II — moderate", value: classCount("Class II"), tone: "dr-metric-warning" },
    { label: "Ongoing right now", value: statusCount("Ongoing"), tone: "" },
  ];

  return h(
    "div",
    { className: "dr-metrics" },
    metrics.map((m) =>
      h(
        Card,
        { key: m.label, className: `dr-metric ${m.tone}`.trim() },
        h("strong", null, m.value.toLocaleString()),
        h("span", null, m.label),
      ),
    ),
  );
}
