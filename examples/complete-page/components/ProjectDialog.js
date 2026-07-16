import { h } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";
import { Checkbox, Select, Textarea, TextField } from "/dist/nexa-components-forms.js";
import { Dialog } from "/dist/nexa-components-overlay.js";
import { STATUS_OPTIONS } from "../data.js";

export function ProjectDialog({ project, open, onClose, onSave }) {
  return h(Dialog, {
    open, title: project ? `Review ${project.name}` : "New review",
    onClose,
    actions: [
      h(Button, { key: "cancel", variant: "text",      onClick: onClose }, "Cancel"),
      h(Button, { key: "save",   variant: "contained", onClick: onSave  }, "Save review"),
    ],
  },
    h("form", { className: "m-stack", onSubmit: (e) => e.preventDefault() },
      h(TextField, { id: "project-name",   label: "Project",      value: project?.name || "",        disabled: true }),
      h(Select,    { id: "project-status", label: "Status",       value: project?.status || "active", options: STATUS_OPTIONS }),
      h(Textarea,  { id: "project-notes",  label: "Review notes", value: project?.description || "", rows: 4 }),
      h(Checkbox,  { id: "project-followup", label: "Create follow-up task", checked: true }),
    ),
  );
}
