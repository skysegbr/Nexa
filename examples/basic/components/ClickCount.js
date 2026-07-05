import { h } from "/dist/nexa.js";

export function ClickCount({ count }) {
  return h("p", { className: "m-body click-count" }, `Clicks: ${count}`);
}
