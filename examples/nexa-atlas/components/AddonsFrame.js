import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components-core.js";

export function AddonsFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-addons" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "atl-addon-grid" },
      data.addons.map((a) =>
        h(
          "section",
          { key: a.name, className: `atl-addon${a.wink ? " atl-addon-wink" : ""}` },
          h("i", { className: `${a.icon} atl-icon`, ariaHidden: "true" }),
          h("strong", null, a.name),
          h("p", null, a.desc),
        ),
      ),
    ),
  );
}
