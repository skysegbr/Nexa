import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components.js";

export function HookCloudFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-hooks" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "atl-cloud" },
      data.words.map((w) =>
        h("span", { key: w.text, className: `atl-word atl-word-${w.size}` }, w.text),
      ),
    ),
    h("p", { className: "atl-caption" }, data.caption),
  );
}
