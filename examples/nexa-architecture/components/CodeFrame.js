import { h } from "/dist/nexa.js";

export function CodeFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-code" },
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "arch-copy" }, data.body),
    h("pre", { className: "arch-pre" }, h("code", null, data.code)),
  );
}
