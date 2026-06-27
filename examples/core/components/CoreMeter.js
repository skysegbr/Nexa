import { h } from "/dist/nexa.js";

export function CoreMeter({ reverse, total, width }) {
  return h(
    "p",
    { className: "core-meter" },
    h("span", {
      className: "core-dot",
      style: { backgroundColor: reverse ? "var(--m-secondary)" : "var(--m-primary)" },
    }),
    `${total} feature${total !== 1 ? "s" : ""} visible — width ${width}px`,
  );
}
