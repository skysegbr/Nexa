import { h } from "/dist/nexa.js";
import { Button, Dialog } from "/dist/nexa-components.js";

/**
 * Deletion confirmation dialog.
 * Props: open, taskTitle, onConfirm, onClose
 */
export function DeleteDialog({ open, taskTitle, onConfirm, onClose }) {
  return h(
    Dialog,
    {
      open,
      title: "Delete task",
      onClose,
      actions: h(
        "div",
        { style: { display: "flex", gap: "8px" } },
        h(Button, { variant: "text", onClick: onClose }, "Cancel"),
        h(Button, { variant: "danger", onClick: onConfirm }, "Delete"),
      ),
    },
    h("p", null, 'Do you want to delete the task "', h("strong", null, taskTitle), '"?'),
    h("p", { style: { color: "var(--m-text-muted)", fontSize: "0.875rem" } },
      "This action cannot be undone."),
  );
}
