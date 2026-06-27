import { h } from "/dist/nexa.js";

export function Counter({ count, setCount }) {
  return h(
    "div",
    { className: "i-counter-group" },
    h("div", { className: "i-counter" }, h("span", null, count)),
    h(
      "div",
      { className: "i-counter-actions" },
      h("button", { type: "button", className: "i-counter-btn", onClick: () => setCount((v) => v - 1) }, "−"),
      h("button", { type: "button", className: "i-counter-btn", onClick: () => setCount((v) => v + 1) }, "+"),
    ),
  );
}
