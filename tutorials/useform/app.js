// Tutorial player: left = code for the current step, right = live useForm
// demo + state inspector, bottom = caption. The recording driver advances
// steps via window.__setStep(n).

import { h, render, useState, useForm } from "/dist/nexa.js";
import { TextField, Textarea, Button } from "/dist/nexa-components.js";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "",
  },
  {
    title: "1. The hook",
    code: `import { useForm } from "/dist/nexa.js";

function Signup() {
  const form = useForm({
    initialValues: { name: "", email: "", notes: "" },
    validate,            // validation rules
    // validateOnBlur: true  (default)
  });
  // form.values, form.errors, form.dirty, ...
}`,
    caption: "useForm keeps everything in a single hook: values, errors, touched fields and submit state. No dependencies, no build step — straight in the browser.",
  },
  {
    title: "2. Wiring fields",
    code: `h(TextField, {
  id: "name",
  label: "Name",
  ...form.field("name"),   // value + onChange + onBlur
}),

h(TextField, {
  id: "email",
  label: "Email",
  ...form.field("email"),
})`,
    caption: "field(\"name\") returns the field props — value, onChange and onBlur. Just spread them onto the component. Watch the state panel: values and dirty react to every keystroke.",
  },
  {
    title: "3. Validation",
    code: `function validate(values) {
  return {
    name:  values.name.trim()          ? "" : "Name is required.",
    email: values.email.includes("@") &&
           values.email.includes(".")  ? "" : "Invalid email.",
    notes: values.notes.length >= 12   ? "" : "At least 12 characters.",
  };
}`,
    caption: "The validate function returns one error (or an empty string) per field. With validateOnBlur, the error shows up when the field loses focus — never before the user interacts.",
  },
  {
    title: "4. Submitting",
    code: `h("form", { onSubmit: form.handleSubmit() }, ...)

// in useForm:
async onSubmit(values, helpers) {
  await api.post("/signup", values);
  helpers.reset();     // clears the form
}

// handleSubmit validates before calling onSubmit:
// with errors, it marks the fields and does NOT submit.`,
    caption: "handleSubmit prevents the reload, validates everything and only calls your onSubmit when the form is valid. Got errors? The fields get marked and nothing is sent.",
  },
  { // 5 — recap card (overlay)
    title: "", code: "", caption: "",
  },
];

// ── tiny highlighter ─────────────────────────────────────────────────────────

// Built with new RegExp(string) instead of a regex literal: the repo's
// lightweight syntax validator balances brackets and would trip on the
// character classes inside a literal.
const TOKEN_RE = new RegExp(
  ["(\\/\\/[^\\n]*)",                                                    // comment
   "(\"(?:[^\"\\\\]|\\\\.)*\")",                                         // string
   "(\\b(?:import|from|function|const|return|async|await|new|if|true|false)\\b)", // keyword
   "([A-Za-z_$][\\w$]*)(?=\\()",                                         // fn call
  ].join("|"),
  "g",
);

function highlight(code) {
  // tokenize: comments, strings, keywords, function calls — everything else raw
  const tokens = [];
  const re = TOKEN_RE;
  re.lastIndex = 0;
  let last = 0, m;
  while ((m = re.exec(code))) {
    if (m.index > last) tokens.push(code.slice(last, m.index));
    if (m[1]) tokens.push(h("span", { className: "tut-cm" }, m[1]));
    else if (m[2]) tokens.push(h("span", { className: "tut-str" }, m[2]));
    else if (m[3]) tokens.push(h("span", { className: "tut-kw" }, m[3]));
    else tokens.push(h("span", { className: "tut-fn" }, m[4]));
    last = re.lastIndex;
  }
  if (last < code.length) tokens.push(code.slice(last));
  return tokens;
}

// ── validation (the real one used by the live form) ─────────────────────────

function validate(values) {
  return {
    name: values.name.trim() ? "" : "Name is required.",
    email: values.email.includes("@") && values.email.includes(".") ? "" : "Invalid email.",
    notes: values.notes.length >= 12 ? "" : "At least 12 characters.",
  };
}

// ── live demo form ───────────────────────────────────────────────────────────

function StatePanel({ form }) {
  const compact = (obj) =>
    JSON.stringify(obj, null, 1).replace(/\n\s*/g, " ").replace(/^{ | }$/g, "");
  return h("div", { className: "tut-state" },
    h("h4", null, "Form state (live)"),
    h("pre", null,
      "values:  { ", compact(form.values), " }\n",
      "errors:  { ", h("span", { className: "tut-err" }, compact(form.errors)), " }\n",
      "touched: { ", compact(form.touched), " }\n",
      "dirty: ", h("span", { className: form.dirty ? "tut-true" : "" }, String(form.dirty)),
      "   isValid: ", h("span", { className: form.isValid ? "tut-true" : "" }, String(form.isValid)),
      "   submitCount: ", String(form.submitCount),
    ),
  );
}

function Demo() {
  const [sent, setSent] = useState(false);
  const form = useForm({
    initialValues: { name: "", email: "", notes: "" },
    validate,
    async onSubmit(values, helpers) {
      setSent(true);
      helpers.reset();
    },
  });

  return h("div", { className: "tut-demo" },
    h("div", { className: "tut-form-card" },
      h("h3", null, "Signup"),
      h("form", { onSubmit: form.handleSubmit() },
        h(TextField, { id: "name", label: "Name", ...form.field("name") }),
        h(TextField, { id: "email", label: "Email", ...form.field("email") }),
        h(Textarea, { id: "notes", label: "Notes", rows: 2, ...form.field("notes", { type: "textarea" }) }),
        h(Button, { type: "submit", variant: "contained" }, "Submit"),
      ),
      sent && h("div", { className: "tut-success" }, "✓ Signup submitted successfully!"),
    ),
    h(StatePanel, { form }),
  );
}

// ── player shell ─────────────────────────────────────────────────────────────

function App() {
  const [step, setStep] = useState(0);
  window.__setStep = setStep;
  const s = STEPS[step];

  return h("div", { className: "tut-root" },
    step === 0 && h("div", { className: "tut-overlay" },
      h("h1", null, "Forms with ", h("em", null, "useForm")),
      h("p", null, "Nexa — the no-build frontend framework, straight in the browser"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "useForm"), " — recap"),
      h("ul", null,
        h("li", null, "initialValues + field() wire up the fields"),
        h("li", null, "validate() returns one error per field"),
        h("li", null, "errors only show up after interaction"),
        h("li", null, "handleSubmit validates and blocks invalid submits"),
        h("li", null, "dirty, touched and submitCount for free"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — docs/FORMS.md"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · useForm tutorial"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `step ${step} of ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h(Demo, null),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
