# Nexa Tutorial

Nexa is a next-generation frontend framework in plain JavaScript, designed for
the browser and for projects that do not need a build step.

You write plain JavaScript, import the framework in the browser, and build
interfaces with functions.

## What "ESM-native" Means

Nexa is **ESM-native**: it uses **ECMAScript Modules** (JavaScript's official
module system) directly in the browser, with no tool required to convert or
bundle the code first.

ESM is the standard `import`/`export` syntax of modern JavaScript:

```js
import { h, render } from "/dist/nexa.js";

export function App() {
  /* ... */
}
```

For Nexa, being ESM-native means:

- **The browser loads modules directly** through `<script type="module">`,
  resolving each `import` natively.
- **No bundler** (Webpack, Vite, Rollup, esbuild) is needed to merge or
  transform files before they run.
- **No transpiler** (Babel, TypeScript) and **no JSX** — what is in the file is
  what runs.
- **No required build step**: edit the `.js`, reload the page, and the code
  executes.

Traditional setup vs. ESM-native:

| Traditional approach            | ESM-native (Nexa)                     |
| ------------------------------- | ------------------------------------- |
| Code passes through a bundler   | Browser executes the module directly  |
| Needs `npm run build`           | No build                              |
| JSX compiles to `h()`/elements  | Uses `h()` directly, no transform     |

This is the architectural advantage: fewer tools between the code in the
repository and what runs in production, built on a **native web standard**
(supported by all modern browsers) instead of a proprietary tooling format.

## What "opt-in" Means

**Opt-in** means something you choose to enable or include explicitly, instead
of it being on by default. The opposite is **opt-out** (on by default, and you
have to turn it off).

In Nexa, **"opt-in extensions"** means the extra layers only enter your app if
you import them on purpose. Nothing beyond the core is loaded automatically:

- You **don't pay** the cost (weight, complexity) of an extension you don't use.
- Each `import` is a deliberate decision by the team.

```js
// Core — the minimum for an app to run
import { h, render, useState } from "/dist/nexa.js";

// Opt-in: only loads if you want the UI components
import { Button, Card } from "/dist/nexa-components.js";

// Opt-in: add-ons only enter if imported
import { ZoomStage } from "/dist/nexa-zoom.js";
import { PipelineCanvas } from "/dist/nexa-canvas.js";
```

So the core (`dist/nexa.js`) already sustains a full application on its own,
while the design system, canvas, zoom-stage, and editor are **optional by
choice** — the team includes only what it needs, when it needs it.

## 1. The Main Idea

Nexa does not use JSX or a compiler. Instead, screens are described with the
`h` function:

```js
function App() {
  return h("h1", null, "Hello");
}
```

The signature is:

```js
h(tagOrComponent, props, ...children)
```

Examples:

```js
h("p", null, "Some text")
h("button", { type: "button" }, "Save")
h("section", { className: "box" }, h("h1", null, "Title"))
```

## 2. Minimal HTML

Create an HTML file with a root element and import your app as a module:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Nexa app</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

`type="module"` lets the browser use `import` directly.

### Using the CDN

For quick experiments or apps that do not copy Nexa locally, import the public
GitHub build through jsDelivr:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-ui.css"
/>

<main id="app"></main>

<script type="module">
  import { h, render } from "https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js";

  function App() {
    return h("h1", null, "Hello from Nexa");
  }

  render(App, document.getElementById("app"));
</script>
```

For production, prefer a fixed tag instead of `@main`, such as
`https://cdn.jsdelivr.net/gh/skysegbr/Nexa@v0.1.0/dist/nexa.js`.

## 3. First Component

In `app.js`:

```js
import { h, render } from "./nexa.js";

function App() {
  return h(
    "section",
    { className: "page" },
    h("h1", null, "My first app"),
    h("p", null, "Rendered with plain JavaScript."),
  );
}

render(App, document.getElementById("app"));
```

`render` receives:

- The main component.
- The HTML element where the app will be mounted.

## 4. Components

Components are functions that return Nexa elements.

```js
function Header() {
  return h(
    "header",
    { className: "topbar" },
    h("strong", null, "Nexa"),
  );
}

function App() {
  return h(
    "section",
    null,
    h(Header),
    h("main", null, "Page content"),
  );
}
```

You can also pass props:

```js
function Greeting({ name }) {
  return h("p", null, `Hello, ${name}`);
}

function App() {
  return h(Greeting, { name: "Danilo" });
}
```

## 5. State With `useState`

Use `useState` when a value needs to change and update the screen.

```js
import { h, render, useState } from "./nexa.js";

function Counter() {
  const [count, setCount] = useState(0);

  return h(
    "section",
    null,
    h("p", null, `Clicks: ${count}`),
    h(
      "button",
      { type: "button", onClick: () => setCount(count + 1) },
      "Add",
    ),
  );
}

render(Counter, document.getElementById("app"));
```

When `setCount` runs, Nexa renders the screen again and updates the DOM.

You can also use the functional form:

```js
setCount((value) => value + 1);
```

This form is better when the next value depends on the previous value.

## 6. Events

Events are props that start with `on`.

```js
h("button", { onClick: save }, "Save")
h("input", { onInput: updateText })
h("form", { onSubmit: submitForm })
```

Form example:

```js
function TodoForm({ addTodo }) {
  const [title, setTitle] = useState("");

  const submit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    addTodo(title.trim());
    setTitle("");
  };

  return h(
    "form",
    { onSubmit: submit },
    h("input", {
      value: title,
      onInput: (event) => setTitle(event.target.value),
      placeholder: "New task",
    }),
    h("button", { type: "submit" }, "Add"),
  );
}
```

## 7. Form State With `useForm`

Use `useForm` for controlled fields, validation, touched state, submit loading,
reset, and serialization.

```js
import { h, render, useForm } from "./nexa.js";

function ContactForm() {
  const form = useForm({
    initialValues: { name: "", email: "" },
    validate(values) {
      return {
        name: values.name.trim() ? "" : "Name is required.",
        email: values.email.includes("@") ? "" : "Enter a valid email.",
      };
    },
    onSubmit(values) {
      console.log(values);
    },
  });

  return h(
    "form",
    { onSubmit: form.handleSubmit() },
    h("input", {
      placeholder: "Name",
      ...form.field("name"),
    }),
    form.errors.name && h("p", null, form.errors.name),
    h("input", {
      placeholder: "Email",
      ...form.field("email", { type: "email" }),
    }),
    form.errors.email && h("p", null, form.errors.email),
    h("button", { type: "submit", disabled: form.isSubmitting }, "Send"),
  );
}

render(ContactForm, document.getElementById("app"));
```

`form.field(name)` returns the value and input handlers for a field. For
checkboxes, pass `{ type: "checkbox" }`. For select and textarea controls, pass
`{ type: "select" }` or `{ type: "textarea" }`.

Use `form.serialize()` when you need a plain object with the current values, and
`form.reset()` to return the form to its initial values.

## 8. Effects With `useEffect`

Use `useEffect` to run code after rendering. A common use case is fetching data
from an API.

```js
import { h, render, useEffect, useState } from "./nexa.js";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/todos")
      .then((response) => response.json())
      .then((todos) => setMessage(`Received ${todos.length} tasks from the API.`))
      .catch(() => setMessage("Could not reach the API."));
  }, []);

  return h("p", null, message);
}

render(App, document.getElementById("app"));
```

The second argument, `[]`, means: run once when the component loads.

`useEffect` can also return a cleanup function. Cleanup runs before the effect
runs again and when the root is unmounted with `unmount`.

```js
useEffect(() => {
  const onResize = () => console.log(window.innerWidth);

  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
```

## 9. Lists

Use `map` to render a list.

```js
function TodoList({ todos }) {
  return h(
    "ul",
    null,
    todos.map((todo) => h("li", { key: todo.id }, todo.title)),
  );
}
```

Because `h` accepts array children, the result of `map` can be passed directly.
Use `key` in dynamic lists so Nexa can preserve item identity when items are
filtered, reordered, or removed.

Keys also matter for components that use hooks:

```js
function TodoRow({ todo }) {
  const [open, setOpen] = useState(false);

  return h(
    "li",
    null,
    h("button", { onClick: () => setOpen((value) => !value) }, todo.title),
    open && h("small", null, todo.description),
  );
}

function TodoList({ todos }) {
  return h(
    "ul",
    null,
    todos.map((todo) => h(TodoRow, { key: todo.id, todo })),
  );
}
```

With stable keys, each `TodoRow` keeps its own state even when the list changes.

## 10. Classes And Attributes

Use `className` for CSS classes:

```js
h("p", { className: "status" }, "Ready")
```

For form fields:

```js
h("input", {
  value: title,
  placeholder: "Title",
  maxLength: 120,
})
```

For checkboxes:

```js
h("input", {
  type: "checkbox",
  checked: todo.completed,
  onChange: () => toggleTodo(todo),
})
```

For accessibility, `ariaLabel` becomes `aria-label` in HTML:

```js
h("button", { ariaLabel: "Remove task" }, "Remove")
```

For inline styles, use `style` as an object:

```js
h("span", {
  style: { backgroundColor: "#0f766e", color: "#ffffff" },
})
```

For `data-*` attributes, use `dataset`:

```js
h("article", {
  dataset: { id: todo.id, status: todo.completed ? "done" : "open" },
})
```

Booleans such as `disabled`, `checked`, `required`, and `hidden` can be passed
directly:

```js
h("button", { disabled: title.length === 0 }, "Save")
```

## 11. Refs, Memo, And Fragments

Use `useRef` when you need to keep a mutable reference that should not trigger
rendering. The most common case is accessing a DOM element.

```js
import { h, render, useRef } from "./nexa.js";

function App() {
  const inputRef = useRef(null);

  return h(
    "section",
    null,
    h("input", { ref: inputRef }),
    h(
      "button",
      { type: "button", onClick: () => inputRef.current.focus() },
      "Focus",
    ),
  );
}
```

Use `useMemo` for derived values and `useCallback` for stable functions:

```js
const filteredTodos = useMemo(
  () => todos.filter((todo) => todo.title.includes(query)),
  [todos, query],
);

const clear = useCallback(() => setQuery(""), []);
```

Use `Fragment` when a component needs to return multiple elements without
creating an extra wrapper:

```js
import { Fragment, h } from "./nexa.js";

function Header() {
  return h(
    Fragment,
    null,
    h("h1", null, "Nexa"),
    h("p", null, "Plain JavaScript."),
  );
}
```

## 12. Consuming A Todo API

A separate backend could run at:

```text
http://127.0.0.1:8001
```

Routes:

```text
GET    /api/todos
POST   /api/todos
PATCH  /api/todos/{id}
DELETE /api/todos/{id}
```

Create a task:

```js
fetch("http://127.0.0.1:8001/api/todos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title: "Study Nexa" }),
})
  .then((response) => response.json())
  .then((todo) => console.log(todo));
```

Update a task:

```js
fetch("http://127.0.0.1:8001/api/todos/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ completed: true }),
});
```

Remove a task:

```js
fetch("http://127.0.0.1:8001/api/todos/1", {
  method: "DELETE",
});
```

## 13. Small Complete Example

```js
import { h, render, useEffect, useState } from "./nexa.js";

const API_URL = "http://127.0.0.1:8001/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then(setTodos);
  }, []);

  const addTodo = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then((response) => response.json())
      .then((todo) => {
        setTodos((items) => [...items, todo]);
        setTitle("");
      });
  };

  return h(
    "section",
    null,
    h("h1", null, "My tasks"),
    h(
      "form",
      { onSubmit: addTodo },
      h("input", {
        value: title,
        onInput: (event) => setTitle(event.target.value),
        placeholder: "New task",
      }),
      h("button", { type: "submit" }, "Add"),
    ),
    h(
      "ul",
      null,
      todos.map((todo) => h("li", { key: todo.id }, todo.title)),
    ),
  );
}

render(App, document.getElementById("app"));
```

## 14. What Nexa Covers

Nexa is intentionally small but complete for most production use cases.

**Core engine**
- Function components with local hook state and multiple independent roots.
- Incremental DOM patching with keyed reconciliation and SVG namespace support.
- `useState`, `useReducer`, `useEffect` (with cleanup), `useRef`, `useMemo`, `useCallback`.
- `useErrorBoundary` — catch render errors in a subtree and show fallback UI.
- `useForm` — full form management: validation, touched, dirty, submit, reset, serialize.
- `createContext` + `useContext` — scoped values via `Context.provide(value, renderFn)`.
- `memo`, `createPortal`, `createLazy`, `useId`.

**Utility hooks**
- `useTheme`, `useLocalStorage`, `useRouter`, `useFetch`, `useToast`.
- `useHistory` — undo/redo wrapper around a state value.
- `useDebounce`, `useThrottle`, `useMediaQuery`.
- `useIntersectionObserver`, `useWebSocket`, `useVirtualList`.
- `useTranslation`, `useContextMenu`.

**Mobile hooks**
- `useSwipe`, `useLongPress`, `useNetworkStatus`, `useOrientation`, `useVibrate`.

**38 UI components** — buttons, fields, layout, navigation, overlays, mobile shell.

**CSS framework** — mobile-first grid, spacing, display, and dark mode utilities.

**What Nexa intentionally omits**
- JSX — by design. `h()` is the DSL; no compiler or transpiler needed.
- SSR — Nexa targets the browser directly.
- A bundler — no build step is the core design principle.
