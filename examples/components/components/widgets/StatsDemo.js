import { h } from "/dist/nexa.js";
import { Stat, StatGrid } from "/dist/nexa-components-data.js";
import { KPI_STATS } from "../../data.js";

export function StatsDemo() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Stat / StatGrid — KPI tiles"),
    h(
      StatGrid,
      null,
      KPI_STATS.map((stat) => h(Stat, { key: stat.label, ...stat })),
    ),
  );
}
