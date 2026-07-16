import { h } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";
import { Dialog } from "/dist/nexa-components-overlay.js";
import { formatFdaDate } from "./format.js";

export function RecallDetailDialog({ recall, onClose }) {
  return h(
    Dialog,
    {
      open: !!recall,
      title: recall?.recalling_firm ?? "Recall details",
      onClose,
      actions: h(Button, { variant: "text", onClick: onClose }, "Close"),
    },
    recall && h(
      "div",
      { className: "dr-detail m-stack" },
      h(DetailRow, { label: "Recall number", value: recall.recall_number }),
      h(DetailRow, { label: "Classification", value: recall.classification }),
      h(DetailRow, { label: "Status", value: recall.status }),
      h(DetailRow, { label: "Product", value: recall.product_description }),
      h(DetailRow, { label: "Reason for recall", value: recall.reason_for_recall }),
      h(DetailRow, { label: "Quantity", value: recall.product_quantity }),
      h(DetailRow, { label: "Distribution", value: recall.distribution_pattern }),
      h(DetailRow, { label: "Location", value: [recall.city, recall.state, recall.country].filter(Boolean).join(", ") }),
      h(DetailRow, { label: "Initiated", value: formatFdaDate(recall.recall_initiation_date) }),
      h(DetailRow, { label: "Code info", value: recall.code_info }),
    ),
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return h(
    "div",
    { className: "dr-detail-row" },
    h("span", { className: "dr-detail-label" }, label),
    h("p", null, value),
  );
}
