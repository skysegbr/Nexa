import { h, useState } from "/dist/nexa.js";
import { Button, Chip } from "/dist/nexa-components-core.js";
import { Switch } from "/dist/nexa-components-forms.js";
import { Dialog } from "/dist/nexa-components-overlay.js";

export function PageToasts({ toast }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [size, setSize]             = useState("md");

  return h(
    "div",
    { className: "m-stack" },
    h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Toasts & Dialog"),

    h(
      "div",
      { className: "demo-section" },
      h("p", { className: "demo-label" }, "useToast - imperative API"),
      h(
        "div",
        { className: "demo-row" },
        h(Button, { variant: "contained", onClick: () => toast.success("Pipeline saved!") },
          h("i", { className: "bi bi-check-circle m-me-2" }), "Success",
        ),
        h(Button, { variant: "danger", onClick: () => toast.error("Failed to run.", { title: "Error" }) },
          h("i", { className: "bi bi-x-circle m-me-2" }), "Error",
        ),
        h(Button, { variant: "tonal", onClick: () => toast.warning("Node limit reached.") },
          h("i", { className: "bi bi-exclamation-triangle m-me-2" }), "Warning",
        ),
        h(Button, { variant: "text", onClick: () => toast.info("Tip: use Ctrl+Z to undo.") },
          h("i", { className: "bi bi-info-circle m-me-2" }), "Info",
        ),
      ),
    ),

    h(
      "div",
      { className: "demo-section" },
      h("p", { className: "demo-label" }, "Dialog - sizes + draggable"),
      h(
        "div",
        { className: "demo-row m-mb-3" },
        ["sm", "md", "lg", "xl"].map((s) =>
          h(Chip, { key: s, active: size === s, onClick: () => setSize(s) }, s),
        ),
      ),
      h(Button, { variant: "contained", onClick: () => setDialogOpen(true) },
        h("i", { className: "bi bi-window m-me-2" }), `Open Dialog (${size})`,
      ),
    ),

    h(Dialog, {
      open:      dialogOpen,
      title:     `Dialog "${size}" - drag from the header`,
      size:      size,
      draggable: true,
      onClose:   () => setDialogOpen(false),
      actions: h(
        "div",
        { className: "demo-row" },
        h(Button, { variant: "text",      onClick: () => setDialogOpen(false) }, "Cancel"),
        h(Button, { variant: "contained", onClick: () => { setDialogOpen(false); toast.success("Confirmed!"); } }, "Confirm"),
      ),
    },
      h("p", null, "Prop ", h("code", null, `size="${size}"`), " controls the width. ", h("code", null, "draggable"), " lets you drag from the header."),
      h("div", { className: "m-stack m-mt-4" },
        h(Switch, { label: "Enable Docker mode" }),
        h(Switch, { label: "Requires manual approval", checked: true }),
      ),
    ),
  );
}
