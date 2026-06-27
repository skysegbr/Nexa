import { h, useState } from "../../../dist/nexa.js";
import { Badge } from "../../../dist/nexa-components.js";

const ITEMS = [
  { id: 1, text: "Mobile-first grid implemented",  time: "now" },
  { id: 2, text: "Automatic dark mode activated",  time: "2min" },
  { id: 3, text: "AppBar and BottomNav added",      time: "5min" },
  { id: 4, text: "useSwipe and useLongPress created", time: "10min" },
  { id: 5, text: "ThemeToggle with localStorage",  time: "15min" },
];

export function ActivityScreen() {
  return h(
    "ul",
    { className: "m-list" },
    ITEMS.map((item) =>
      h(
        "li",
        { key: item.id, className: "m-list-item" },
        h("span", null, item.text),
        h(Badge, null, item.time),
      ),
    ),
  );
}
