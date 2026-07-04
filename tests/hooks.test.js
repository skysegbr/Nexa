// Tests for useForm and useRouter hooks.

import {
  h,
  render,
  useState,
  useForm,
  useRouter,
  useRoutes,
  matchPath,
} from "../dist/nexa.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

// ── useForm ───────────────────────────────────────────────────────────────────

test("useForm: values reflect initialValues on first render", async () => {
  let capturedValues;

  function Form() {
    const { values } = useForm({ initialValues: { name: "Alice", age: 30 } });
    capturedValues = values;
    return h("div", null);
  }

  const container = mountPoint();
  render(Form, container);
  await flush();

  assertEqual(capturedValues.name, "Alice");
  assertEqual(capturedValues.age, 30);
});

test("useForm: setValue updates a single field and triggers re-render", async () => {
  let capturedValues;
  let setValueFn;

  function Form() {
    const { values, setValue } = useForm({ initialValues: { name: "Alice" } });
    capturedValues = values;
    setValueFn = setValue;
    return h("div", null);
  }

  const container = mountPoint();
  render(Form, container);
  await flush();
  assertEqual(capturedValues.name, "Alice");

  setValueFn("name", "Bob");
  await flush();
  assertEqual(capturedValues.name, "Bob");
});

test("useForm: field onChange handler updates the field value", async () => {
  let capturedValues;
  let capturedField;

  function Form() {
    const { values, field } = useForm({
      initialValues: { email: "" },
      validateOnChange: true,
    });
    capturedValues = values;
    capturedField = field("email");
    return h("div", null);
  }

  const container = mountPoint();
  render(Form, container);
  await flush();
  assertEqual(capturedValues.email, "");

  capturedField.onChange({ target: { value: "user@example.com" } });
  await flush();
  assertEqual(capturedValues.email, "user@example.com");
});

test("useForm: validate causes error to appear then disappear when field is corrected", async () => {
  let capturedErrors;
  let setValueFn;
  let validateFn;

  function Form() {
    const { errors, setValue, validateForm } = useForm({
      initialValues: { name: "" },
      validate: ({ name }) => (name ? {} : { name: "Required" }),
    });
    capturedErrors = errors;
    setValueFn = setValue;
    validateFn = validateForm;
    return h("div", null);
  }

  const container = mountPoint();
  render(Form, container);
  await flush();
  // No errors before validation
  assertEqual(capturedErrors.name, undefined);

  // Validate with empty value → error should appear
  validateFn({ name: "" });
  await flush();
  assertEqual(capturedErrors.name, "Required");

  // Fix the value → error should disappear
  setValueFn("name", "Alice");
  validateFn({ name: "Alice" });
  await flush();
  assertEqual(capturedErrors.name, undefined, "error should clear when value becomes valid");
});

test("useForm: handleSubmit blocks and returns false when validation fails", async () => {
  let submitCalled = false;
  let handleSubmitFn;

  function Form() {
    const { handleSubmit } = useForm({
      initialValues: { name: "" },
      validate: ({ name }) => (name ? {} : { name: "Required" }),
      onSubmit: () => {
        submitCalled = true;
      },
    });
    handleSubmitFn = handleSubmit();
    return h("div", null);
  }

  const container = mountPoint();
  render(Form, container);
  await flush();

  const result = await handleSubmitFn(null);
  await flush();

  assertEqual(result, false, "handleSubmit should return false when form is invalid");
  assert(!submitCalled, "onSubmit should not be called when validation fails");
});

test("useForm: handleSubmit calls onSubmit and returns true when form is valid", async () => {
  let submittedValues = null;
  let handleSubmitFn;

  function Form() {
    const { handleSubmit } = useForm({
      initialValues: { name: "Alice" },
      validate: ({ name }) => (name ? {} : { name: "Required" }),
      onSubmit: (values) => {
        submittedValues = values;
      },
    });
    handleSubmitFn = handleSubmit();
    return h("div", null);
  }

  const container = mountPoint();
  render(Form, container);
  await flush();

  const result = await handleSubmitFn(null);
  await flush();

  assertEqual(result, true, "handleSubmit should return true when form is valid");
  assertEqual(submittedValues.name, "Alice");
});

// ── useRouter (hash mode) ─────────────────────────────────────────────────────

test("useRouter hash: path defaults to '/' when no hash is set", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "";
  await flush();

  let capturedPath;

  function App() {
    const { path } = useRouter({ mode: "hash" });
    capturedPath = path;
    return h("div", null);
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  assertEqual(capturedPath, "/");

  window.location.hash = prevHash;
  await flush();
});

test("useRouter hash: navigate updates path and re-renders dependent UI", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/home";
  await flush();

  let capturedPath;
  let navigateFn;

  function App() {
    const { path, navigate } = useRouter({ mode: "hash" });
    capturedPath = path;
    navigateFn = navigate;
    return h("div", null, path === "/home" ? "Home" : "Other");
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  assertEqual(capturedPath, "/home");
  assertEqual(container.querySelector("div").textContent, "Home");

  navigateFn("/about");
  await flush();

  assertEqual(capturedPath, "/about");
  assertEqual(container.querySelector("div").textContent, "Other");

  window.location.hash = prevHash;
  await flush();
});
