import { h, render, useForm, useState } from "/dist/nexa.js";
import { Toast } from "/dist/nexa-components-overlay.js";
import { ContactForm }  from "./components/ContactForm.js";
import { FormHero }     from "./components/FormHero.js";
import { FormSummary }  from "./components/FormSummary.js";
import { CONTACT_INITIAL_VALUES } from "./data.js";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Validation lives with the form wiring (docs/FORMS.md pattern) — data.js
// holds only static data.
function validateContactValues(values) {
  return {
    name:  values.name.trim()               ? "" : "Name is required.",
    email: values.email.includes("@")        ? "" : "Please enter a valid email.",
    role:  values.role                       ? "" : "Please choose a role.",
    notes: values.notes.trim().length >= 12  ? "" : "Write at least 12 characters.",
  };
}

function App() {
  const [toastOpen, setToastOpen]   = useState(false);
  const [submission, setSubmission] = useState(null);

  const form = useForm({
    initialValues: CONTACT_INITIAL_VALUES,
    validate: validateContactValues,
    validateOnBlur: true,
    async onSubmit(values, helpers) {
      await delay(500);

      if (values.email.toLowerCase() === "taken@example.com") {
        helpers.setFieldError("email", "This email is already registered.");
        return;
      }

      setSubmission(helpers.serialize());
      setToastOpen(true);
      helpers.reset({ ...values, notes: "" });
    },
  });

  return h(
    "div",
    null,
    h(
      "div",
      { className: "m-container form-page" },
      h(FormHero),
      h(
        "div",
        { className: "form-layout" },
        h(ContactForm, { form }),
        h(FormSummary, { values: submission ?? form.values }),
      ),
    ),
    h(Toast, {
      open: toastOpen,
      variant: "success",
      title: "Submitted!",
      message: "Form submitted successfully.",
      onClose: () => setToastOpen(false),
    }),
  );
}

render(App, document.getElementById("app"));
