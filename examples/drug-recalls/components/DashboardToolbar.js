import { h } from "/dist/nexa.js";
import { ThemeToggle } from "/dist/nexa-components-theme.js";

export function DashboardToolbar() {
  return h(
    "header",
    { className: "dr-topbar" },
    h(
      "div",
      { className: "dr-topbar-brand" },
      h("i", { className: "bi-capsule" }),
      h("span", null, "Drug Recall Dashboard"),
    ),
    h("p", { className: "dr-topbar-hint" }, "Live data from openFDA — not for medical decisions."),
    h(ThemeToggle, null),
  );
}
