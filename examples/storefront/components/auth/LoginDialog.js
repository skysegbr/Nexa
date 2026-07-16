import { h, useForm } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";
import { TextField } from "/dist/nexa-components-forms.js";
import { Dialog } from "/dist/nexa-components-overlay.js";

export function LoginDialog({ open, onClose, onLogin }) {
  const { field, handleSubmit } = useForm({
    initialValues: { name: "" },
    validate: (v) => ({ name: !v.name.trim() ? "Tell us your name" : "" }),
    onSubmit: (v) => onLogin(v.name.trim()),
  });

  return h(
    Dialog,
    {
      open,
      title: "Sign in",
      onClose,
      actions: h(
        "div",
        { style: { display: "flex", gap: "8px" } },
        h(Button, { variant: "text", onClick: onClose }, "Cancel"),
        h(Button, { variant: "contained", onClick: handleSubmit() }, "Sign in"),
      ),
    },
    h(
      "form",
      { className: "m-stack", onSubmit: handleSubmit() },
      h("p", { className: "m-text-muted" }, "No password needed — this is a demo account."),
      h(TextField, { ...field("name"), label: "Your name", autoFocus: true }),
    ),
  );
}
