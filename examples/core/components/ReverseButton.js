import { h } from "/dist/nexa.js";

export function ReverseButton({ reverse, setReverse }) {
  return h("button", {
    className: "m-button m-button-tonal reverse-button",
    type: "button",
    onClick: () => setReverse((v) => !v),
  }, reverse ? "Normal order" : "Reverse");
}
