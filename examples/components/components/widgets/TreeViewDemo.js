import { h, useState } from "/dist/nexa.js";
import { TreeView } from "/dist/nexa-components-data.js";
import { PROJECT_TREE } from "../../data.js";

export function TreeViewDemo() {
  const [selected, setSelected] = useState("appjs");

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "TreeView"),
    h(
      "div",
      { className: "demo-row", style: { alignItems: "flex-start" } },
      h(
        "div",
        { style: { minWidth: 260 } },
        h(TreeView, {
          items: PROJECT_TREE,
          defaultExpanded: ["app"],
          selected,
          onSelect: setSelected,
          ariaLabel: "Project files",
        }),
      ),
      h(
        "p",
        { className: "m-text-sm m-text-muted" },
        "Full keyboard nav: ↑↓ walk, → expands/enters, ← collapses/climbs, Enter selects. ",
        `Selected: ${selected}`,
      ),
    ),
  );
}
