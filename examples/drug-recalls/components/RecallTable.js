import { h } from "/dist/nexa.js";
import { Button, Table } from "/dist/nexa-components.js";
import { STATUS_BADGE_CLASS } from "../data.js";
import { formatFdaDate } from "./format.js";

export function RecallTable({ recalls, onOpen }) {
  return h(Table, {
    columns: [
      {
        key: "classification", header: "Class",
        render: (r) => h("span", { className: `m-badge dr-badge-${classSlug(r.classification)}` }, r.classification.replace("Class ", "")),
      },
      {
        key: "product_description", header: "Product",
        render: (r) => h("div", { className: "dr-product-cell" },
          h("strong", null, r.recalling_firm),
          h("span", null, r.product_description),
        ),
      },
      { key: "state", header: "State" },
      {
        key: "status", header: "Status",
        render: (r) => h("span", { className: `m-badge ${STATUS_BADGE_CLASS[r.status] || ""}` }, r.status),
      },
      {
        key: "recall_initiation_date", header: "Initiated", align: "right",
        render: (r) => formatFdaDate(r.recall_initiation_date),
      },
      {
        key: "actions", header: "", align: "right",
        render: (r) => h(Button, { variant: "tonal", onClick: () => onOpen(r) }, "Details"),
      },
    ],
    rows: recalls,
    getRowKey: (r) => r.event_id ?? r.recall_number,
    emptyTitle: "No recalls found",
    emptyDescription: "Try a different search term or clear the filters.",
  });
}

function classSlug(classification) {
  if (classification === "Class I") return "danger";
  if (classification === "Class II") return "warning";
  return "info";
}
