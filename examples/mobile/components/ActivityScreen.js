import { h, useState } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components-core.js";

import { ACTIVITY_ITEMS } from "../data.js";

export function ActivityScreen() {
  return h(
    "ul",
    { className: "m-list" },
    ACTIVITY_ITEMS.map((item) =>
      h(
        "li",
        { key: item.id, className: "m-list-item" },
        h("span", null, item.text),
        h(Badge, null, item.time),
      ),
    ),
  );
}
