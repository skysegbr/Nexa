import { h, useEffect, useForm } from "/dist/nexa.js";
import { Alert, Button, Chip } from "/dist/nexa-components-core.js";
import { Checkbox, Select, Textarea, TextField } from "/dist/nexa-components-forms.js";
import { Drawer } from "/dist/nexa-components-overlay.js";
import { PRIORITY_OPTIONS } from "../data.js";

function valuesFromTask(task) {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    category: task?.category ?? "other",
    confirmImportant: false,
  };
}

/**
 * Side drawer for creating or editing a task.
 * Props: open, task (null = new), categories, onClose, onSaved(task)
 */
export function TaskDrawer({ open, task, categories, onClose, onSaved }) {
  const isEdit = Boolean(task);

  const categoryOptions = (categories || []).map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const form = useForm({
    initialValues: valuesFromTask(task),
    validateOnBlur: true,
    validateOnChange: false,
    validate(values) {
      const errors = {};
      if (!values.title.trim()) {
        errors.title = "Title is required.";
      } else if (values.title.trim().length < 3) {
        errors.title = "Title must be at least 3 characters.";
      }
      if (values.priority === "high" && !values.confirmImportant) {
        errors.confirmImportant = "Please confirm this task is truly high priority.";
      }
      return errors;
    },
    async onSubmit(values, helpers) {
      const api =
        window.location.port === "5050" ? window.location.origin : "http://localhost:5050";
      const url = isEdit
        ? `${api}/api/tasks/${task.id}`
        : `${api}/api/tasks`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
          category: values.category,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        helpers.setFieldError("title", data.error || "Title already exists.");
        return;
      }

      if (!res.ok) {
        helpers.setFieldError("title", data.error || "Error saving.");
        return;
      }

      helpers.reset();
      onSaved(data);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(valuesFromTask(task));
    }
  }, [open, task?.id]);

  return h(
    Drawer,
    {
      open,
      side: "right",
      width: 400,
      title: isEdit ? "Edit task" : "New task",
      onClose: () => {
        form.reset();
        onClose();
      },
    },
    h(
      "form",
      { className: "tm-drawer-form", onSubmit: form.handleSubmit() },

      // Form state alert
      form.dirty &&
        h(Alert, { variant: "info" }, "You have unsaved changes."),

      // Title field
      h(TextField, {
        id: "task-title",
        label: "Title",
        required: true,
        placeholder: "Describe the task…",
        ...form.field("title"),
      }),

      // Description field
      h(Textarea, {
        id: "task-desc",
        label: "Description",
        placeholder: "Optional details…",
        rows: 3,
        ...form.field("description", { type: "textarea" }),
      }),

      // Priority
      h(Select, {
        id: "task-priority",
        label: "Priority",
        options: PRIORITY_OPTIONS,
        ...form.field("priority", { type: "select" }),
      }),

      // Category
      h(Select, {
        id: "task-category",
        label: "Category",
        options: categoryOptions,
        ...form.field("category", { type: "select" }),
      }),

      // High priority confirmation (demonstrates Checkbox + conditional error)
      form.values.priority === "high" &&
        h(Checkbox, {
          id: "task-confirm-important",
          label: "I confirm this task is high priority",
          ...form.field("confirmImportant", { type: "checkbox" }),
        }),

      // Footer: dirty/submitCount status + buttons
      h(
        "div",
        { className: "tm-drawer-actions" },
        h(
          "div",
          { style: { display: "flex", gap: "6px", alignItems: "center", marginRight: "auto" } },
          form.submitCount > 0 &&
            h(Chip, null, `${form.submitCount} attempt${form.submitCount > 1 ? "s" : ""}`),
        ),
        h(Button, { variant: "text", onClick: () => { form.reset(); onClose(); } }, "Cancel"),
        h(Button, {
          variant: "contained",
          type: "submit",
          disabled: form.isSubmitting,
        }, form.isSubmitting ? "Saving…" : isEdit ? "Save" : "Create"),
      ),
    ),
  );
}
