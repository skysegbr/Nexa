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

// ── matchPath ─────────────────────────────────────────────────────────────────

test("matchPath: static segments match exactly", () => {
  assert(matchPath("/about", "/about") !== null);
  assertEqual(matchPath("/about", "/contact"), null);
  assertEqual(matchPath("/", "/").rest, "");
});

test("matchPath: :param captures a URL-decoded segment", () => {
  const m = matchPath("/users/:id", "/users/42");
  assert(m !== null);
  assertEqual(m.params.id, "42");
  const decoded = matchPath("/tags/:name", "/tags/a%20b");
  assertEqual(decoded.params.name, "a b");
});

test("matchPath: extra segments fail an exact (end) match", () => {
  assertEqual(matchPath("/users/:id", "/users/42/edit"), null);
});

test("matchPath: trailing * captures the remainder", () => {
  const m = matchPath("/files/*", "/files/a/b.png");
  assert(m !== null);
  assertEqual(m.params["*"], "a/b.png");
});

test("matchPath: { end:false } prefix-matches and returns the rest", () => {
  const m = matchPath("/users", "/users/42/edit", { end: false });
  assert(m !== null);
  assertEqual(m.rest, "42/edit");
});

// ── useRoutes ─────────────────────────────────────────────────────────────────

test("useRoutes: renders the matching route by path", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/about";
  await flush();

  const routes = [
    { path: "/", element: h("p", null, "home") },
    { path: "/about", element: h("p", null, "about") },
  ];

  function App() {
    return useRoutes(routes);
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  assertEqual(container.querySelector("p").textContent, "about");

  window.location.hash = prevHash;
  await flush();
});

test("useRoutes: nested routes render the parent's outlet with merged params", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/users/42/posts/7";
  await flush();

  function UsersLayout({ params, outlet }) {
    return h("section", null, h("span", { className: "uid" }, params.id), outlet);
  }
  function Post({ params }) {
    return h("span", { className: "pid" }, params.postId);
  }

  const routes = [
    {
      path: "/users/:id",
      component: UsersLayout,
      children: [{ path: "/posts/:postId", component: Post }],
    },
  ];

  function App() {
    return useRoutes(routes);
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  assertEqual(container.querySelector(".uid").textContent, "42");
  assertEqual(container.querySelector(".pid").textContent, "7");

  window.location.hash = prevHash;
  await flush();
});

test("useRoutes: falls back to notFound when nothing matches", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/nope";
  await flush();

  const routes = [{ path: "/home", element: h("p", null, "home") }];

  function App() {
    return useRoutes(routes, { notFound: h("p", { className: "nf" }, "404") });
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  assertEqual(container.querySelector(".nf").textContent, "404");

  window.location.hash = prevHash;
  await flush();
});

test("useRoutes: lazy route shows fallback then the loaded component", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/lazy";
  await flush();

  function Loaded() {
    return h("p", { className: "loaded" }, "loaded");
  }

  // A deferred promise lets us hold the route in its loading state across a
  // flush, then resolve it deterministically.
  let resolveLoader;
  const loaderPromise = new Promise((resolve) => {
    resolveLoader = resolve;
  });

  const routes = [
    {
      path: "/lazy",
      lazy: () => loaderPromise,
      fallback: h("p", { className: "fallback" }, "loading"),
    },
  ];

  function App() {
    return useRoutes(routes);
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  // still pending → fallback is shown
  assert(container.querySelector(".fallback") !== null, "expected the lazy fallback while pending");
  assert(container.querySelector(".loaded") === null, "did not expect the component before resolve");

  // resolve the loader and let the root re-render
  resolveLoader({ default: Loaded });
  await flush();
  await flush();

  assert(container.querySelector(".loaded") !== null, "expected the loaded component after resolve");
  assert(container.querySelector(".fallback") === null, "expected the fallback gone after resolve");

  window.location.hash = prevHash;
  await flush();
});

test("useRoutes: css + lazy route holds the fallback until both module and stylesheet are ready", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/styled-lazy";
  await flush();

  function Page() {
    return h("p", { className: "cssr-a" }, "styled");
  }

  // The deferred loader makes the pending state deterministic; the stylesheet
  // is a real fixture fetched over HTTP, so Promise.all also gates on it.
  let resolveLoader;
  const loaderPromise = new Promise((resolve) => {
    resolveLoader = resolve;
  });

  const routes = [
    {
      path: "/styled-lazy",
      lazy: () => loaderPromise,
      css: "./css-route-a.fixture.css",
      fallback: h("p", { className: "css-fallback" }, "loading"),
    },
  ];

  function App() {
    return useRoutes(routes);
  }

  const container = mountPoint();
  render(App, container);
  await flush();

  assert(container.querySelector(".css-fallback") !== null, "expected the fallback while pending");
  assert(container.querySelector(".cssr-a") === null, "did not expect the page before resolve");

  resolveLoader({ default: Page });
  // Wait (bounded) for the stylesheet fetch + re-render to settle.
  for (let i = 0; i < 200 && !container.querySelector(".cssr-a"); i += 1) await flush();

  const page = container.querySelector(".cssr-a");
  assert(page !== null, "expected the page after module + stylesheet resolved");
  assert(container.querySelector(".css-fallback") === null, "expected the fallback gone");
  assertEqual(
    getComputedStyle(page).paddingLeft,
    "9px",
    "expected the route CSS to be applied by the time the page shows (no FOUC)",
  );

  window.location.hash = prevHash;
  await flush();
});

test("useRoutes: css on a non-lazy route injects the stylesheet and renders the page styled", async () => {
  const prevHash = window.location.hash;
  window.location.hash = "#/styled-static";
  await flush();

  function Page() {
    return h("p", { className: "cssr-b" }, "styled static");
  }

  const routes = [
    {
      path: "/styled-static",
      component: Page,
      css: "./css-route-b.fixture.css",
      fallback: h("p", { className: "css-fallback" }, "loading"),
    },
  ];

  function App() {
    return useRoutes(routes);
  }

  const container = mountPoint();
  render(App, container);
  // Wait (bounded) for the stylesheet fetch + re-render to settle.
  for (let i = 0; i < 200 && !container.querySelector(".cssr-b"); i += 1) await flush();

  const page = container.querySelector(".cssr-b");
  assert(page !== null, "expected the page once its stylesheet loaded");
  assertEqual(
    getComputedStyle(page).letterSpacing,
    "3px",
    "expected the route CSS to be applied by the time the page shows",
  );

  const url = new URL("./css-route-b.fixture.css", document.baseURI).href;
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
    (link) => link.href === url,
  );
  assertEqual(links.length, 1, "expected the route stylesheet to be injected exactly once");

  window.location.hash = prevHash;
  await flush();
});

