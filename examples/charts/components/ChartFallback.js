import { h } from "/dist/nexa.js";

export function ChartFallback({ error, onRecover }) {
  return h(
    "div",
    { className: "c-fallback", role: "alert" },
    h("p", { className: "c-fallback-title" }, "The chart crashed while rendering this period"),
    h("p", { className: "c-fallback-detail" }, error.message),
    h(
      "button",
      { type: "button", className: "c-fallback-btn", onClick: onRecover },
      "Back to valid data",
    ),
  );
}
