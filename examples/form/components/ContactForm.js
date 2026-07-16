import { h } from "/dist/nexa.js";
import { Alert, Badge, Button, Card, Chip } from "/dist/nexa-components-core.js";
import { Checkbox, Select, Textarea, TextField } from "/dist/nexa-components-forms.js";
import { ROLE_OPTIONS } from "../data.js";

export function ContactForm({ form }) {
  return h(
    Card,
    { className: "form-card contact-form" },
    h(
      Alert,
      { variant: "info", title: "useForm" },
      "validateOnBlur shows errors on field blur. Use ",
      h("code", null, "taken@example.com"),
      " to test setFieldError.",
    ),
    h(
      "form",
      { className: "m-stack", onSubmit: form.handleSubmit() },
      h(
        "div",
        { className: "contact-form-grid" },
        h(TextField, { id: "name",  label: "Name",   placeholder: "Ada Lovelace",      required: true, ...form.field("name") }),
        h(TextField, { id: "email", label: "E-mail", placeholder: "ada@example.com",   required: true, ...form.field("email", { type: "email" }) }),
      ),
      h(Select,   { id: "role",  label: "Role", options: ROLE_OPTIONS, required: true, ...form.field("role", { type: "select" }) }),
      h(Textarea, { id: "notes", label: "Project notes", help: "Describe what you want to build.", rows: 5, required: true, ...form.field("notes", { type: "textarea" }) }),
      h(Checkbox, { id: "newsletter", label: "Receive Nexa updates", ...form.field("newsletter", { type: "checkbox" }) }),
      h(
        "div",
        { className: "m-actions" },
        h(Button, { variant: "text", onClick: () => form.reset() }, "Reset"),
        h(Button, { variant: "contained", type: "submit", disabled: form.isSubmitting },
          form.isSubmitting ? "Submitting…" : "Submit",
        ),
      ),
      h(
        "div",
        { className: "m-row form-meta" },
        h(Chip, { active: form.dirty }, form.dirty ? "Modified" : "No changes"),
        form.submitCount > 0 &&
          h(Badge, null, `${form.submitCount} attempt${form.submitCount !== 1 ? "s" : ""}`),
      ),
    ),
  );
}
