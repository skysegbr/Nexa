import { h } from "../../../dist/nexa.js";
import { Card, Progress, Spinner } from "../../../dist/nexa-components.js";

/** Displays the 4 summary counters and an overall progress bar. */
export function StatsRow({ stats, loading }) {
  if (loading) {
    return h("div", { className: "tm-loading" }, h(Spinner, { label: "Loading statistics..." }));
  }

  if (!stats) return null;

  const items = [
    { label: "Total", value: stats.total, className: "" },
    { label: "Completed", value: stats.done, className: "tm-stat-value-done" },
    { label: "In progress", value: stats.inProgress, className: "tm-stat-value-prog" },
    { label: "Pending", value: stats.todo, className: "tm-stat-value-todo" },
  ];

  return h(
    "div",
    null,
    h(
      "div",
      { className: "tm-stats" },
      items.map((item) =>
        h(
          Card,
          { key: item.label, className: "tm-stat-card" },
          h("div", { className: `tm-stat-value ${item.className}` }, String(item.value)),
          h("div", { className: "tm-stat-label" }, item.label),
        ),
      ),
    ),
    h(
      Card,
      { className: "tm-progress-section" },
      h(
        "div",
        { className: "tm-progress-label" },
        h("span", null, "Overall progress"),
        h("span", null, `${stats.completion}%`),
      ),
      h(Progress, { value: stats.completion, max: 100, label: "Task progress" }),
    ),
  );
}
