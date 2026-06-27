import { h, useState } from "../../../dist/nexa.js";
import { Alert, Card, Chip } from "../../../dist/nexa-components.js";

const FILTERS  = ["all", "ui", "hooks", "css", "mobile"];
const BREAKPOINTS = [
  { label: "sm >=576px", desc: "Small tablets" },
  { label: "md >=768px", desc: "Tablets" },
  { label: "lg >=992px", desc: "Desktop" },
  { label: "xl >=1200px", desc: "Wide desktop" },
];

export function ExploreScreen() {
  const [active, setActive] = useState("all");

  return h(
    "div",
    null,
    h(
      "div",
      { className: "m-cluster m-mb-4" },
      FILTERS.map((f) =>
        h(Chip, { key: f, active: active === f, onClick: () => setActive(f) }, f),
      ),
    ),
    h(
      Alert,
      { variant: "info", title: "12-column grid" },
      "Use m-col-12 m-col-sm-6 m-col-md-4 for responsive layouts.",
    ),
    h("div", { className: "m-mt-4" }),
    h(
      "div",
      { className: "m-row" },
      BREAKPOINTS.map((bp) =>
        h(
          "div",
          { key: bp.label, className: "m-col-6 m-col-md-3 m-mb-3" },
          h(
            Card,
            { padded: true, style: { textAlign: "center" } },
            h("code", { className: "mob-breakpoint-label" }, bp.label),
            h("p", { className: "m-text-muted m-mb-0", style: { margin: "4px 0 0", fontSize: "0.78rem" } }, bp.desc),
          ),
        ),
      ),
    ),
  );
}
