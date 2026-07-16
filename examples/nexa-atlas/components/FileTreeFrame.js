import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components-core.js";

export function FileTreeFrame({ data }) {
  return h(
    "article",
    { className: "atl-frame atl-frame-filetree" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "pre",
      { className: "atl-tree" },
      data.tree.map((row) =>
        h(
          "div",
          { key: row.label, className: "atl-tree-row", style: { paddingLeft: `${row.depth * 20}px` } },
          h("span", { className: "atl-tree-branch" }, row.depth === 0 ? "" : "└─ "),
          h("span", { className: "atl-tree-label" }, row.label),
          row.note ? h("span", { className: "atl-tree-note" }, ` — ${row.note}`) : null,
        ),
      ),
    ),
    h("p", { className: "atl-caption" }, data.caption),
  );
}
