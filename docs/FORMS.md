# Forms in Nexa

Nexa ships a built-in form hook — `useForm` — that manages field values, validation errors,
touched state, and submission lifecycle with no dependencies.

---

## Concept

A controlled form in Nexa follows this pattern:

1. Declare initial values and a validation function.
2. Call `useForm` once at the top of your component.
3. Spread `form.field(name)` onto each input, select, textarea, or checkbox.
4. Wire `form.handleSubmit()` to the `<form>` `onSubmit` event.

Every field helper returned by `field()` provides `value`, `error`, `onBlur`,
`onInput`, and `onChange` — exactly what the built-in `TextField`, `Select`,
`Textarea`, and `Checkbox` components expect.

---

## useForm

```js
import { useForm } from "/dist/nexa.js";

const form = useForm({
  initialValues,     // object — required
  validate,          // (values) => errors object — optional
  validateOnChange,  // boolean — validate on every keystroke (default: false)
  validateOnBlur,    // boolean — validate when a field loses focus (default: true)
  onSubmit,          // async (values, helpers) => void — optional
});
```

CDN import:

```js
import { useForm } from "https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js";
```

### Returned object

| Property | Type | Description |
|---|---|---|
| `values` | `object` | Current field values. |
| `errors` | `object` | Current validation errors (keyed by field name). |
| `touched` | `object` | Which fields have been interacted with. |
| `dirty` | `boolean` | `true` when any value differs from `initialValues`. |
| `isValid` | `boolean` | `true` when there are no non-empty error strings. |
| `isSubmitting` | `boolean` | `true` while the submit handler is running. |
| `submitCount` | `number` | How many submit attempts have been made (reset on `reset()`). |
| `field(name, opts?)` | `function` | Returns props to spread onto a field component. |
| `handleSubmit(fn?)` | `function` | Returns an async `onSubmit` handler for `<form>`. |
| `validateForm(values?)` | `function` | Runs validation, updates `errors`, returns the errors object. |
| `reset(values?)` | `function` | Resets to `initialValues` (or a custom object). |
| `serialize()` | `function` | Returns a shallow copy of current values. |
| `setValue(name, value)` | `function` | Set a single field value programmatically. |
| `setValues(next)` | `function` | Merge multiple values at once (object or updater function). |
| `setFieldTouched(name, v?)` | `function` | Mark a field as touched. |
| `setFieldError(name, msg)` | `function` | Set a single field error (e.g. from a server response). |
| `setErrors(errors)` | `function` | Replace all errors at once. |
| `setTouched(touched)` | `function` | Replace all touched flags at once. |

---

## Validation

The `validate` function receives the current values object and must return an object
of the same shape where each key is either an error string or an empty string.

```js
function validate(values) {
  return {
    name:  values.name.trim()         ? "" : "Name is required.",
    email: values.email.includes("@") ? "" : "Enter a valid email.",
    notes: values.notes.length >= 12  ? "" : "At least 12 characters.",
  };
}
```

Errors only render when a field has been touched **and** has a non-empty error string,
so nothing appears until the user interacts with a field or presses Submit.

### validateOnBlur (default: true)

With `validateOnBlur: true` (the default), the full form validation runs every time a
field loses focus. Errors appear field-by-field as the user moves through the form.

### validateOnChange

Set `validateOnChange: true` to validate on every keystroke. This is suitable for
instant feedback on simple fields (e.g. a search input), but can feel aggressive on
longer forms.

### Server-side errors

Use `helpers.setFieldError` inside `onSubmit` to surface errors that come back from
the server without resetting the whole form:

```js
async onSubmit(values, helpers) {
  const result = await api.post("/contact", values);

  if (result.error === "email_taken") {
    helpers.setFieldError("email", "This email is already registered.");
    return;
  }

  helpers.reset();
}
```

---

## Controlled fields

### TextField

```js
import { TextField } from "/dist/nexa-components.js";

h(TextField, {
  id: "name",
  label: "Name",
  required: true,
  ...form.field("name"),
})
```

### Select

Pass `{ type: "select" }` so the helper omits the `type` attribute (select elements
do not accept it):

```js
h(Select, {
  id: "role",
  label: "Role",
  options: roleOptions,
  ...form.field("role", { type: "select" }),
})
```

### Textarea

```js
h(Textarea, {
  id: "notes",
  label: "Notes",
  rows: 4,
  ...form.field("notes", { type: "textarea" }),
})
```

### Checkbox

```js
h(Checkbox, {
  id: "newsletter",
  label: "Subscribe to updates",
  ...form.field("newsletter", { type: "checkbox" }),
})
```

### RadioGroup

`RadioGroup` is controlled through `value`/`onChange` (one value for the whole
group) rather than per-input events, so wire it to the form state directly
instead of spreading `form.field()`:

```js
h(RadioGroup, {
  id: "size",
  label: "Size",
  value: form.values.size,
  onChange: (v) => form.setValue("size", v),
  error: form.touched.size ? form.errors.size : undefined,
  options: [
    { value: "s", label: "Small" },
    { value: "m", label: "Medium" },
    { value: "l", label: "Large" },
  ],
})
```

The same pattern applies to the other value-based controls: `NumberInput`
(`value`/`onChange` with a number), `DatePicker` and `TimePicker`
(`"YYYY-MM-DD"` / `"HH:MM"` strings).

---

## Submit

`handleSubmit` wraps your `onSubmit` callback (or the one passed to `useForm`) and:

1. Prevents the default browser form submission.
2. Increments `submitCount`.
3. Runs `validateForm`; if there are errors, marks all fields as touched and returns.
4. Sets `isSubmitting = true`.
5. Calls your handler with `(values, helpers)`.
6. Always sets `isSubmitting = false` when the handler resolves or rejects.

```js
h("form", { onSubmit: form.handleSubmit() }, ...)

// Override the handler at call-site:
h("form", { onSubmit: form.handleSubmit(mySubmitFn) }, ...)
```

The `helpers` object passed to your handler exposes every setter on the form
(`reset`, `setFieldError`, `setErrors`, `setValue`, `setValues`, `serialize`, …).

---

## Reset

`reset()` restores every field to `initialValues` and clears errors, touched flags,
`isSubmitting`, and `submitCount`.

Pass a custom object to reset to a different baseline:

```js
// After submit, keep some values but clear the message field.
helpers.reset({ ...values, notes: "" });
```

---

## Complete example

```js
import { h, render, useForm } from "/dist/nexa.js";
import {
  Button, Checkbox, Select, Textarea, TextField, Toast,
} from "/dist/nexa-components.js";

const initialValues = { name: "", email: "", role: "", notes: "", newsletter: true };
const roleOptions   = [
  { value: "",         label: "Choose a role", disabled: true },
  { value: "designer", label: "Designer" },
  { value: "dev",      label: "Developer" },
];

function validate(v) {
  return {
    name:  v.name.trim()         ? "" : "Required.",
    email: v.email.includes("@") ? "" : "Invalid email.",
    role:  v.role                ? "" : "Choose a role.",
    notes: v.notes.length >= 12  ? "" : "At least 12 characters.",
  };
}

function ContactForm() {
  const form = useForm({
    initialValues,
    validate,
    async onSubmit(values, helpers) {
      await fetch("/api/contact", { method: "POST", body: JSON.stringify(values) });
      helpers.reset();
    },
  });

  return h(
    "form",
    { className: "m-stack", onSubmit: form.handleSubmit() },
    h(TextField,  { id: "name",  label: "Name",  required: true, ...form.field("name") }),
    h(TextField,  { id: "email", label: "Email", required: true, ...form.field("email", { type: "email" }) }),
    h(Select,     { id: "role",  label: "Role",  options: roleOptions, ...form.field("role", { type: "select" }) }),
    h(Textarea,   { id: "notes", label: "Notes", rows: 4, ...form.field("notes", { type: "textarea" }) }),
    h(Checkbox,   { id: "nl",    label: "Subscribe", ...form.field("newsletter", { type: "checkbox" }) }),
    h("div", { className: "m-actions" },
      h(Button, { variant: "text",      onClick: () => form.reset() }, "Reset"),
      h(Button, { variant: "contained", type: "submit", disabled: form.isSubmitting },
        form.isSubmitting ? "Sending…" : "Submit",
      ),
    ),
  );
}

render(ContactForm, document.getElementById("app"));
```

See [examples/form/](../examples/form/) for a runnable version.
