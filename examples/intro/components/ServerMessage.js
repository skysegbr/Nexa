import { h } from "/dist/nexa.js";

export function ServerMessage({ message }) {
  return h("p", { className: "i-server-msg" }, message);
}
