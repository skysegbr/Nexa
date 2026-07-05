import { h } from "/dist/nexa.js";

export function OverviewFrame({ data }) {
  return h(
    "article",
    { className: "arch-frame arch-overview" },
    h("span", { className: "arch-kicker" }, data.eyebrow),
    h("h2", null, data.heading),
    h(
      "div",
      { className: "arch-overview-grid" },
      data.columns.map((column) =>
        h(
          "section",
          { key: column.title, className: "arch-overview-column" },
          h("h3", null, column.title),
          h(
            "ul",
            { className: "arch-list" },
            column.items.map((item) => h("li", { key: item }, item)),
          ),
        ),
      ),
    ),
  );
}
