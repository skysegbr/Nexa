import { h } from "/dist/nexa.js";

export function CoverFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-cover" },
    h("span", { className: "arch-hex-mark", ariaHidden: "true" }),
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h1", null, data.heading),
    h("p", { className: "arch-copy" }, data.body),
    h(
      "div",
      { className: "arch-meta" },
      data.meta.map((item) => h("span", { key: item }, item)),
    ),
    h("p", { className: "arch-hint" }, data.hint),
  );
}
