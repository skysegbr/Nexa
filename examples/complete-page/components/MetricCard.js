import { h } from "/dist/nexa.js";
import { Card, Chip } from "/dist/nexa-components.js";

export function MetricCard({ label, value, trend, active }) {
  return h(
    Card,
    { className: "metric-card" },
    h("p", { className: "workspace-kicker" }, label),
    h("strong", null, value),
    h(Chip, { active }, trend),
  );
}
