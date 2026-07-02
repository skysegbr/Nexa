# Nexa

Nexa is a next-generation frontend framework in plain JavaScript. It is designed
for the browser: no Node, no JSX, no Vite, no Babel, and no build step.

Its core ships in three files:

- `dist/nexa.js` — components, state, effects, rendering, and mobile hooks.
- `dist/nexa-components.js` — optional UI helpers built on top of `h`.
- `dist/nexa-ui.css` — mobile-first CSS framework with a 12-column grid,
  responsive utilities, dark mode, and mobile shell components.

Three optional add-ons build on top of that core:

- `dist/nexa-canvas.js` + `dist/nexa-canvas.css` — `PipelineCanvas`, an
  SVG node editor with drag, pan, zoom, mini-map, and undo/redo.
- `dist/nexa-prezi.js` + `dist/nexa-prezi.css` — `PreziStage`, a Prezi-style
  zooming presentation canvas with animated camera pan/zoom/rotate between
  frames.
- `dist/nexa-editor.js` + `dist/nexa-editor.css` (+ `dist/nexa-editor-snippets.js`)
  — `FullCodeEditor`, a [CodeMirror](https://codemirror.net/5/) wrapper with a
  toolbar, snippet browser, and autocomplete. Requires the local CodeMirror
  assets in `assets/codemirror/` (no CDN).
- `dist/nexa-bootstrap.css` — optional Bootstrap 5 visual skin, switched at
  runtime with `useDesign()`. See [Design](#design) below.

## Logo Meaning

The Nexa logo combines the letter **N** with circuit-like paths and connected
nodes, representing a frontend framework that is modular, connected, and built
to run directly in the browser.

The central cyan path suggests the clean flow from plain JavaScript to rendered
interface: no build step, no JSX, and no required tooling chain. The surrounding
paths and nodes represent components, hooks, state, events, and rendering
working together as a small, coherent system. They also echo Nexa's optional
canvas and editor add-ons, where structured nodes, connections, and direct
browser interaction are part of the experience.

The open spaces in the mark reinforce Nexa's lightweight approach: less hidden
machinery between code and UI, more clarity and control for the developer. The
cyan accent brings motion and technology, the lime nodes highlight interaction
points, and the dark or light structural forms keep the mark stable across both
light and dark themes.

## Using The CDN

Nexa is published as a public GitHub repository, so you can load the browser
modules directly through jsDelivr:

```text
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-components.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-ui.css
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-canvas.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-canvas.css
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-prezi.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-prezi.css
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-editor.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-editor.css
```

Minimal page:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-ui.css"
/>

<main id="app"></main>

<script type="module">
  import {
    h,
    render,
    useState,
    useTheme,
  } from "https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js";
  import {
    Button,
    ThemeToggle,
  } from "https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-components.js";

  function App() {
    const [count, setCount] = useState(0);

    return h(
      "section",
      { className: "m-page m-stack" },
      h(ThemeToggle, null),
      h("h1", { className: "m-title-xl" }, "Nexa"),
      h("p", { className: "m-body" }, `Clicks: ${count}`),
      h(Button, { variant: "contained", onClick: () => setCount((v) => v + 1) }, "Add"),
    );
  }

  render(App, document.getElementById("app"));
</script>
```

`@main` always follows the latest pushed code. For production, create a release
tag and pin the CDN URL to it, for example:

```text
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@v0.4.0/dist/nexa.js
```

## Using Locally

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<link rel="stylesheet" href="./dist/nexa-ui.css" />
<script type="module" src="./app.js"></script>
```

```js
import {
  Fragment,
  h,
  render,
  unmount,
  useCallback,
  useEffect,
  useForm,
  useMemo,
  useRef,
  useState,
  // Theme
  useTheme,
  usePalette,
  useDesign,
  // Mobile
  useLongPress,
  useNetworkStatus,
  useOrientation,
  useSwipe,
  useVibrate,
} from "./dist/nexa.js";

import {
  Alert,
  AppBar,
  Badge,
  BottomNav,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Chip,
  DesignSwitcher,
  Dialog,
  Drawer,
  Dropdown,
  EmptyState,
  FAB,
  FormField,
  IconButton,
  Pagination,
  PaletteSwitcher,
  Progress,
  Select,
  Spinner,
  Table,
  Tabs,
  Textarea,
  TextField,
  ThemeToggle,
  Toast,
  Tooltip,
} from "./dist/nexa-components.js";
```

## Documentation

- [Nexa tutorial](./docs/TUTORIAL.md)
- [Nexa UI guide](./docs/NEXA_UI.md)
- [Nexa forms guide](./docs/FORMS.md)

## Examples

Run any example with:

```bash
python -m http.server 8080
```

> **Important:** run from the repository root. Examples import from `dist/`, so
> starting the server inside an example folder will cause a 404.

| Example | What it shows |
|---|---|
| [examples/intro](./examples/intro) | Minimal screen: `h`, `render`, `useState`, `useEffect`, dark mode |
| [examples/basic](./examples/basic) | Counter using `nexa-components.js` and `ThemeToggle` |
| [examples/core](./examples/core) | Engine playground: `useMemo`, `useCallback`, `useRef`, `dataset`, keyed lists |
| [examples/form](./examples/form) | Controlled fields, validation, loading submit, reset, `useForm` |
| [examples/complete-page](./examples/complete-page) | App-shell with sidebar, table, dialog, tabs, and toast |
| [examples/new-components](./examples/new-components) | `Switch`, `Collapse`, `Combobox`, `ContextMenu`, `FileDropZone`, `CodeEditor`, toasts |
| [examples/task-manager](./examples/task-manager) | Full CRUD with Python API, filters, pagination, and drawer editing |
| [examples/mobile](./examples/mobile) | Mobile shell: `AppBar`, `BottomNav`, `BottomSheet`, `FAB`, swipe, long press |
| [examples/charts](./examples/charts) | SVG donut chart drawn with raw `h("svg", ...)`, plus `useErrorBoundary` catching a corrupted dataset and recovering |
| [examples/landing](./examples/landing) | SaaS landing page: sticky nav with mobile menu, SVG hero chart, testimonial carousel, pricing toggle |
| [examples/gallery](./examples/gallery) | Photo gallery: category filter, masonry grid with lazy-load fade-in, keyboard/swipe lightbox with focus trap |
| [examples/mindmap](./examples/mindmap) | Draggable mindmap: free-form card positioning, double-click inline editing, SVG bezier connectors that track card size, branch coloring |
| [examples/drug-recalls](./examples/drug-recalls) | Live dashboard over the openFDA drug recall API: debounced search, classification/status filters, donut + bar charts, sortable table, recall detail dialog |
| [examples/storefront](./examples/storefront) | Domain-componentized architecture: `catalog/`, `cart/`, `auth/` each own their own `createContext` + state hook, composed once in `app.js`, integrated through `Shell.js`. Products fetched live from fakestoreapi.com |
| [examples/designer](./examples/designer) | Visual UI builder: drag components from a palette onto a canvas, edit props/styles/states in an inspector, live CSS + code export |
| [examples/prezi](./examples/prezi) | `PreziStage` basics: per-kind frame components behind a `FrameContent` dispatcher, toolbar with progress dots, keyboard navigation |
| [examples/nexa-prezi](./examples/nexa-prezi) | Full `PreziStage` presentation about Nexa: five frame kinds, rotated frames, a zoomed-out overview frame, `nexa-components` toolbar |
| [examples/nexa-atlas](./examples/nexa-atlas) | Atlas-themed `PreziStage` tour of Nexa: click any background frame to zoom straight to it, plus a live demo frame running real `useState`/`useTheme` mid-presentation |

The task manager requires its own backend:

```bash
python3 examples/task-manager/server.py
# Open: http://localhost:5050/examples/task-manager/
```

## Testing

Nexa stays dependency-free in its tests too: [tests/index.html](./tests) is a
page that imports `dist/nexa.js` directly and runs assertions against the real
DOM — no test framework, no build step.

```bash
python -m http.server 8080
# Open: http://localhost:8080/tests/
```

The same suite also runs headlessly (used by CI — see
`.github/workflows/ci.yml`), driven by Python to keep Node out of the loop:

```bash
pip install playwright && playwright install chromium   # once
python3 scripts/run_browser_tests.py
```

The suite covers state updates, effect ordering/cleanup, memoization, keyed
reconciliation, SVG/HTML namespace switching, `useErrorBoundary`, and all new
APIs: `memo` (including the dirty-descendant heuristic), `createPortal`
(render + update + unmount cleanup), `createLazy`, `useId`, `useDebounce`,
`useThrottle`, `useMediaQuery`, `useIntersectionObserver`, `useWebSocket`, and
`useVirtualList`. A green "N/N passed" summary means the engine's core
contracts still hold; failures list the assertion message inline and log a
stack trace to the console.

## Main API

### Core

| Export | Description |
|---|---|
| `Fragment` | Group children with no extra wrapper |
| `h(tag, props, ...children)` | Create a virtual node |
| `render(Component, container)` | Mount a component into a DOM element |
| `unmount(container)` | Remove a mounted component and clean up |
| `useState(initialValue)` | Local state for a component |
| `useReducer(reducer, initialArg, init?)` | State managed by a reducer function |
| `useEffect(effect, deps)` | Side effects with optional cleanup |
| `useRef(initialValue)` | Mutable ref object; also for DOM access |
| `useMemo(factory, deps)` | Memoized derived value |
| `useCallback(fn, deps)` | Memoized callback |
| `useErrorBoundary()` | `[error, reset, guard]` — catch render errors in a subtree and show fallback UI |
| `useForm(options)` | Controlled form with validation, submit, reset |
| `createContext(defaultValue)` | Create a context with `.provide(value, renderFn)` |
| `useContext(context)` | Read the current value from a context |
| `memo(component, compare?)` | Skip re-renders when props are shallowly equal |
| `createPortal(children, domNode)` | Render children into a different DOM node |
| `createLazy(loader, fallback?)` | Lazily import a component with a loading fallback |
| `useId()` | Stable, unique ID per component instance (for accessibility) |

### `useForm` options

```js
useForm({
  initialValues,      // { [field]: value }
  validate,           // (values) => ({ [field]: errorString })
  validateOnChange,   // boolean (default false)
  validateOnBlur,     // boolean (default true)
  onSubmit,           // async (values, helpers) => void
})
```

Returns: `{ values, errors, touched, dirty, isValid, isSubmitting, submitCount,
field, handleSubmit, reset, serialize, setValues, setValue, setErrors,
setFieldError, setFieldTouched, setTouched, validateForm }`.

### `useReducer`

```js
function reducer(state, action) {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "reset":     return { count: 0 };
    default:          return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return h("button", { onClick: () => dispatch({ type: "increment" }) },
    `Clicks: ${state.count}`
  );
}
```

### `createContext` + `useContext`

Nexa evaluates `h(Child)` eagerly — children render before the parent function
returns. Because of this, the standard `Provider` component pattern would set
the context value _after_ children have already rendered. The solution is
`Context.provide(value, renderFn)`:

```js
const ThemeCtx = createContext("light");

function App() {
  const [theme, setTheme] = useState("dark");

  return ThemeCtx.provide(theme, () =>
    h("div", null, h(Header), h(Main))
  );
}

function Header() {
  const theme = useContext(ThemeCtx); // "dark"
  return h("header", { className: `header-${theme}` }, "…");
}
```

### `useErrorBoundary`

The same eager evaluation that motivates `Context.provide` also means a parent
can't catch a child's render error just by wrapping `h(Child)` in its own
`return` — by the time the parent function runs, the child has already thrown.
`useErrorBoundary` works around this with a *thunk*: hand `guard` a function
that builds the risky subtree, and it runs it inside a `try`/`catch` for you.
A caught error is latched into state, so the boundary swaps in its fallback and
stops retrying the same broken render until you call `reset()`.

```js
function Boundary() {
  const [error, reset, guard] = useErrorBoundary();

  if (error) {
    return h("div", { className: "error" },
      h("p", null, `Something broke: ${error.message}`),
      h("button", { onClick: reset }, "Try again"),
    );
  }

  return guard(() => h(RiskyWidget, props));
}
```

`guard` only catches errors thrown while *building* the subtree (i.e. during
render) — effects, event handlers, and async code run outside of render and
need their own `try`/`catch`. Nexa already isolates those for you: a throwing
effect or cleanup is reported via `console.error` without blocking its
neighbors or skipping the rest of an unmount.

### Theme

| Export | Description |
|---|---|
| `useTheme()` | Returns `{ theme, setTheme, toggleTheme }` |
| `usePalette()` | Returns `{ palette, palettes, setPalette, customColor, setCustomColor }` |

`useTheme` reads the saved preference from `localStorage`, falls back to
`prefers-color-scheme`, and writes `data-theme="dark"` or `data-theme="light"` on
`<html>`. The preference persists across sessions.

```js
const { theme, setTheme, toggleTheme } = useTheme();
// theme: "dark" | "light"
// setTheme("dark")  — set explicitly
// toggleTheme()     — flip between the two
```

`usePalette` switches the accent color independently of light/dark — it writes
`data-palette` on `<html>` and persists to `localStorage`. Each preset palette
defines both a light and a dark variant of `--m-primary`, `--m-primary-hover`,
`--m-primary-soft`, `--m-secondary`, and `--m-focus`, so it composes freely with
`useTheme`.

```js
const { palette, palettes, setPalette, customColor, setCustomColor } = usePalette();
// palette: "default" | "violet" | "rose" | "blue" | "custom"
// palettes: the full list above, handy for building a picker
// setPalette("violet")
// setCustomColor("#7c3aed") — any hex color; switches palette to "custom"
```

`"custom"` is a free-form palette: `setCustomColor(hex)` writes `--m-primary`
directly as an inline style, and `nexa-ui.css` derives `--m-primary-hover`,
`--m-primary-soft`, `--m-secondary`, and `--m-focus` from it with `color-mix()`
— any color works without computing shades by hand. Requires a browser with
`color-mix()` support (all evergreen browsers since 2023).

### Design

| Export | Description |
|---|---|
| `useDesign()` | Returns `{ design, designs, setDesign }` |

Nexa's default look ("nexa") needs nothing beyond `nexa-ui.css`. To offer a
Bootstrap 5 visual skin as an *option*, also load `dist/nexa-bootstrap.css`
and switch `data-design="bootstrap"` at runtime:

```html
<link rel="stylesheet" href="./dist/nexa-ui.css" />
<link rel="stylesheet" href="./dist/nexa-bootstrap.css" />
```

```js
const { design, designs, setDesign } = useDesign();
// design: "nexa" | "bootstrap"
// designs: the full list, for building a picker
// setDesign("bootstrap")
```

This is independent of `useTheme` and `usePalette` — light/dark and accent
color both keep working under either design. `nexa-bootstrap.css` is scoped
entirely under `[data-design="bootstrap"]`; if it isn't loaded, or the design
is left at the default `"nexa"`, nothing changes. It re-points Nexa's
existing `--m-*` tokens (color, radius, shadow, font) at Bootstrap 5's real
values, plus a handful of grouped overrides for the few things that aren't
token-driven (font-weight, focus-ring style, badge shape).

### Mobile hooks

| Export | Description |
|---|---|
| `useSwipe(ref, options)` | Detect swipe gestures on a DOM element |
| `useLongPress(ref, options)` | Fire a callback after a sustained press |
| `useNetworkStatus()` | Returns `true` when the browser is online |
| `useOrientation()` | Returns `"portrait"` or `"landscape"` |
| `useVibrate()` | Returns a `vibrate(pattern)` function |

```js
// useSwipe
useSwipe(ref, {
  onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
  threshold, // px, default 40
});

// useLongPress
useLongPress(ref, {
  onLongPress,
  delay, // ms, default 500
});

// useVibrate
const vibrate = useVibrate();
vibrate(20);          // 20ms pulse
vibrate([100, 50, 100]); // pattern
```

### Utility hooks

| Export | Description |
|---|---|
| `useLocalStorage(key, initialValue)` | `[value, setValue]` persisted to `localStorage`, JSON-encoded |
| `useToast()` | `{ toasts, toast, dismiss }` — `toast.success/error/warning/info(msg, opts)` queues a toast for `ToastStack` |
| `useRouter(options?)` | `{ path, params, navigate }` — router. `{ mode: 'hash' }` (default) or `{ mode: 'history' }` for clean URLs via the History API |
| `useTranslation(dict)` | `{ t }` — `t(key, vars)` looks up `dict[key]` and interpolates `{var}` placeholders |
| `useContextMenu()` | `{ menu, openMenu, closeMenu }` — wires a right-click handler to `ContextMenu` |
| `useHistory(initial, options)` | `{ state, set, undo, redo, canUndo, canRedo }` — undo/redo wrapper around a state value |
| `useFetch(url, options)` | `{ data, loading, error, refetch }` — fetches JSON, aborts in-flight requests, re-fetches on `url` change |
| `useDebounce(value, delay)` | Returns a copy of `value` that only updates after `delay` ms of silence |
| `useThrottle(fn, delay)` | Returns a throttled version of `fn` (trailing call always fires) |
| `useMediaQuery(query)` | `true` while the CSS media query matches, updates reactively |
| `useIntersectionObserver(ref, options?)` | Latest `IntersectionObserverEntry` (null before first observation) |
| `useWebSocket(url, options?)` | `{ status, lastMessage, send }` — managed WebSocket with auto-reconnect |
| `useVirtualList(items, options)` | `{ containerRef, virtualItems, totalHeight }` — render only the visible slice of a large list |

```js
// useToast + ToastStack
const { toasts, toast, dismiss } = useToast();
toast.success("Saved!");
toast.error("Something went wrong", { title: "Error", duration: 5000 });
h(ToastStack, { toasts, onClose: dismiss })

// useHistory — undo/redo wrapper
const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialNodes, { limit: 50 });
set((nodes) => [...nodes, newNode]);
canUndo && h(Button, { onClick: undo }, "Undo")

// useFetch — data fetching with abort + refetch
const { data, loading, error, refetch } = useFetch(`/api/items/${id}`);

// useRouter — hash-based routing (default)
const { path, params, navigate } = useRouter();
navigate("/settings?tab=profile");

// useRouter — history mode: clean URLs, same-origin <a href> clicks are
// intercepted automatically. Requires server-side SPA fallback (serve
// index.html for every route) — see docs/AI_SPEC.md §6.
const router = useRouter({ mode: "history" });

// useDebounce — delay value update
const query = useDebounce(inputValue, 300);
useEffect(() => { search(query); }, [query]);

// useThrottle — rate-limit a function
const onScroll = useThrottle((e) => setScrollY(e.target.scrollTop), 100);

// useMediaQuery
const isMobile = useMediaQuery("(max-width: 768px)");
const prefersMotion = useMediaQuery("(prefers-reduced-motion: no-preference)");

// useIntersectionObserver — lazy load, scroll-triggered animation
function LazyImage({ src }) {
  const ref = useRef(null);
  const entry = useIntersectionObserver(ref, { once: true });
  return h("img", { ref, src: entry?.isIntersecting ? src : null });
}

// useWebSocket
const { status, lastMessage, send } = useWebSocket("wss://api.example.com/ws");
useEffect(() => {
  if (lastMessage) setMessages((m) => [...m, JSON.parse(lastMessage)]);
}, [lastMessage]);
send({ type: "ping" }); // objects are JSON-serialized automatically

// useVirtualList — render 100 000 items without lag
function BigList({ rows }) {
  const { containerRef, virtualItems, totalHeight } = useVirtualList(rows, { itemHeight: 48, overscan: 3 });
  return h("div", { ref: containerRef, style: { height: "600px", overflow: "auto" } },
    h("div", { style: { height: totalHeight, position: "relative" } },
      virtualItems.map(({ item, index, offsetTop }) =>
        h("div", {
          key: index,
          style: { position: "absolute", top: offsetTop, height: 48, width: "100%" },
        }, item.label),
      ),
    ),
  );
}
```

### `memo`

Wraps a component to skip re-renders when its props haven't changed. Uses
shallow (`Object.is` per key) comparison by default. Pass a custom
`compare(prevProps, nextProps) → boolean` (return `true` = equal = skip) to
override. Also skips when no descendant in the memoized tree has called
`setState` since the last render.

```js
// Default: skip when all props are Object.is-equal
const HeavyRow = memo(function HeavyRow({ id, label, value }) {
  return h("tr", null, h("td", null, label), h("td", null, value));
});

// Custom: only compare by id
const Card = memo(
  ({ item }) => h("div", null, item.title),
  (prev, next) => prev.item.id === next.item.id,
);
```

> **Note on children:** `children` is part of props and compared by reference.
> If you pass JSX-like children to a memoized component on every render, they
> will always differ. Either avoid passing children, or memoize them with
> `useMemo`.

### `createPortal`

Renders `children` into `domNode` instead of the component's current parent.
Useful for modals, tooltips, and dropdowns that must escape `overflow: hidden`
or `z-index` stacking contexts. Cleanup is automatic: when the component
unmounts, the portal target is emptied.

```js
function Modal({ title, onClose }) {
  return createPortal(
    h("div", { className: "modal-backdrop" },
      h("div", { className: "modal" },
        h("h2", null, title),
        h("button", { onClick: onClose }, "Close"),
      ),
    ),
    document.body,
  );
}

function App() {
  const [open, setOpen] = useState(false);
  return h("div", null,
    h("button", { onClick: () => setOpen(true) }, "Open modal"),
    open && createPortal(h(Modal, { title: "Hello", onClose: () => setOpen(false) }), document.body),
  );
}
```

### `createLazy`

Lazily imports a component via dynamic `import()`. Shows `fallback` while
loading (defaults to `null`). On load, all active roots are re-rendered so any
lazy component switches from fallback to real. If the import fails, throws the
error — catch it with `useErrorBoundary`.

```js
const Chart = createLazy(
  () => import("./components/Chart.js"),
  h("p", null, "Loading chart..."),
);

// Per-use override:
h(Chart, { data, fallback: h(Spinner, null) })
```

The module must export the component as `default` or as the module itself if
there is no default export.

### `useId`

Returns a stable, unique string ID for the component instance. Generated once
on mount and preserved across re-renders. Use it for `id`/`htmlFor` pairs and
ARIA attributes to avoid hand-crafting IDs.

```js
function Field({ label }) {
  const id = useId();
  return h("div", null,
    h("label", { htmlFor: id }, label),
    h("input", { id }),
  );
}
```

## Dev Server (HMR)

`server.py` is a drop-in replacement for `python -m http.server` that adds
live reload. It polls the working directory for changes to `.js`, `.css`,
`.html`, and `.json` files and notifies all connected browsers via SSE.

```bash
python server.py          # port 8000
python server.py 3000     # custom port
```

Add the HMR client to your HTML (development only):

```html
<script src="/dist/nexa-hmr.js"></script>
```

The browser reconnects automatically if the server restarts. Remove the
`<script>` tag before deploying — it has no effect in production but is a
wasted request.

## Components API

All components are pure functions that return virtual nodes and work with any
version of Nexa.

### General UI

| Component | Key props |
|---|---|
| `Alert` | `variant` (info · success · warning · danger), `title` |
| `Badge` | — |
| `Button` | `variant` (text · contained · tonal · danger), `type`, `disabled` |
| `Card` | `padded` |
| `Checkbox` | `id`, `label`, `checked`, `onChange` |
| `Chip` | `active` |
| `CodeEditor` | `value`, `onChange`, `mode`, `theme` — lightweight CodeMirror wrapper (see also `FullCodeEditor`) |
| `Collapse` | `title`, `defaultOpen`/`open`, `onToggle`, `actions`, `badge` |
| `Combobox` | `id`, `label`, `options`, `value`, `onChange`, `searchPlaceholder` |
| `ContextMenu` | `open`, `x`, `y`, `items`, `onClose` — pairs with `useContextMenu` |
| `Dialog` | `open`, `title`, `onClose`, `actions` |
| `Drawer` | `open`, `side` (left · right), `width`, `title`, `onClose` |
| `Dropdown` | `trigger`, `items` (`{ key, label, onClick, danger, divider }`), `align` |
| `EmptyState` | `title`, `description`, `action` |
| `FileDropZone` | `onFiles`, `accept`, `multiple`, `progress`, `label`, `hint` |
| `FormField` | `id`, `label`, `help`, `error` |
| `IconButton` | `label`, `variant` |
| `Navbar` | `brand`, `items`, `actions`, `defaultOpen`/`open`, `onToggle` — collapses into a hamburger menu below 768px |
| `Pagination` | `page`, `total`, `siblings`, `onChange` |
| `Progress` | `value`, `max`, `label` |
| `Select` | `id`, `label`, `options`, `value`, `onChange` |
| `Spinner` | `label` |
| `Stepper` | `steps`, `activeStep`, `orientation` (horizontal · vertical) |
| `Switch` | `id`, `label`, `checked`, `onChange`, `disabled` |
| `Table` | `columns`, `rows`, `getRowKey` |
| `TabPanel` | `id`, `activeId` — pairs with `Tabs`; renders only while active |
| `Tabs` | `value`, `onChange`, `items` |
| `Textarea` | `id`, `label`, `value`, `onInput`, `error` |
| `TextField` | `id`, `label`, `value`, `onInput`, `error` |
| `Toast` | `open`, `variant`, `title`, `message`, `onClose` |
| `ToastStack` | `toasts`, `onClose` — renders a `useToast()` queue |
| `Tooltip` | `content`, `position` (top · bottom · left · right) |

### Mobile components

| Component | Key props | Notes |
|---|---|---|
| `AppBar` | `title`, `leading`, `actions` | Fixed top bar with safe-area support |
| `BottomNav` | `items`, `value`, `onChange` | `items`: `{ value, label, icon, badge }` |
| `BottomSheet` | `open`, `title`, `onClose` | Slides up from bottom; adapts to dialog on desktop |
| `FAB` | `label`, `extended`, `aboveNav`, `onClick` | Floating action button; `aboveNav` shifts above `BottomNav` |
| `SwipeableListItem` | `actions`, `actionWidth` | Swipe left to reveal action buttons |
| `ThemeToggle` | — | `IconButton` that calls `useTheme().toggleTheme()` internally |
| `PaletteSwitcher` | — | Row of color swatches; calls `usePalette().setPalette()` internally |
| `DesignSwitcher` | — | Chip toggle between designs; calls `useDesign().setDesign()` internally |

```js
// SwipeableListItem — swipe left to reveal actions
h(SwipeableListItem, {
  actions: [
    { key: "delete",  icon: "🗑",  className: "m-swipeable-action",         onClick: () => deleteItem(id) },
    { key: "archive", icon: "📦", className: "m-swipeable-action-info",     onClick: () => archiveItem(id) },
  ],
},
  h("div", { className: "m-list-item" }, "Task title"),
)

// BottomNav example
h(BottomNav, {
  value: activeTab,
  onChange: setActiveTab,
  items: [
    { value: "home",    label: "Home",      icon: "🏠" },
    { value: "search",  label: "Search",    icon: "🔍" },
    { value: "profile", label: "Profile",   icon: "👤", badge: 3 },
  ],
})

// FAB above BottomNav
h(FAB, { label: "New", aboveNav: true, onClick: openSheet }, "+")
```

## Canvas & Editor

Three optional add-ons, each with its own dist files and stylesheet. They are
not included in `nexa-components.js` — import them directly when you need them.

### `PipelineCanvas`

`dist/nexa-canvas.js` + `dist/nexa-canvas.css`. An SVG-based node editor: drag
nodes, draw connections, pan and zoom, mini-map, and built-in undo/redo.

| Prop | Description |
|---|---|
| `nodes` | Array of node descriptors to render |
| `onNodeEdit` / `onNodeDelete` / `onNodeMove` | Node lifecycle callbacks |
| `onNodeConnect` / `onConnectionDelete` | Edge lifecycle callbacks |
| `onContextMenu` | Right-click handler — pair with `useContextMenu` + `ContextMenu` |

```js
import { PipelineCanvas } from "./dist/nexa-canvas.js";

h(PipelineCanvas, {
  nodes,
  onNodeEdit: (node) => openEditDialog(node),
  onNodeMove: (id, x, y) => moveNode(id, x, y),
  onNodeConnect: (fromId, toId) => connect(fromId, toId),
})
```

Drag, pan/zoom, connection drawing, selection, undo/redo, and a mini-map are
all built into the controller — see [dist/nexa-canvas.js](./dist/nexa-canvas.js).

### `PreziStage`

`dist/nexa-prezi.js` + `dist/nexa-prezi.css`. A Prezi-style zooming
presentation: frame content is normal Nexa vdom positioned on one large
canvas, and a single animated camera pans/zooms/rotates between frames.

| Prop | Description |
|---|---|
| `frames` | Array of `{ id, x, y, w, h, rotate?, content }` — world-px geometry plus vdom content |
| `path` | Array of frame ids for navigation order — defaults to `frames` order |
| `index` / `defaultIndex` / `onIndexChange` | Controlled/uncontrolled current frame |
| `duration` / `easing` | Camera animation duration (ms) and easing function |
| `controllerRef` | ref, set to `{ next, prev, goTo, index, frames }` every render |
| `keyboardNav` | Arrow keys / Space navigate (default `true`) |
| `advanceOnClick` | Click the stage background to advance (default `true`) |

```js
import { PreziStage } from "./dist/nexa-prezi.js";

h(PreziStage, {
  frames,
  index,
  onIndexChange: setIndex,
  controllerRef,
})
```

Frames can legitimately overlap in world space — an "overview" frame that
zooms out to show the whole canvas is, by definition, as big as every other
frame combined. `PreziStage` renders frames sorted by descending area
(`w * h`), so larger frames paint *behind* smaller ones automatically; you
don't need to manage `z-index` for this.

Once a deck has more than a couple of frame kinds (title, bullets, code, …),
give each kind its own component under `components/` with a small
dispatcher for `data.kind`, rather than inlining every frame's rendering in
`app.js` — see [examples/prezi](./examples/prezi) for the pattern
(`components/FrameContent.js`) and a full presentation with a toolbar,
progress dots, and keyboard navigation.

### `FullCodeEditor`

`dist/nexa-editor.js` + `dist/nexa-editor.css` (+ `dist/nexa-editor-snippets.js`
for the snippet browser). A [CodeMirror 5](https://codemirror.net/5/) wrapper
with a toolbar, language switcher, snippet browser, and autocomplete.

| Prop | Description |
|---|---|
| `value`, `onChange` | Controlled source code |
| `language`, `onLanguageChange` | Active language (`python`, `cython`, `go`, `rust`, `kotlin`, …) |
| `snippets` | Snippet catalog — see `BOILERPLATES` and friends in `nexa-editor-snippets.js` |
| `onCheckSyntax` | Async `(code) => { ok, message }` — wired to the toolbar's "check" action |
| `showToolbar`, `showSnippets`, `height` | Layout toggles |

```js
import { FullCodeEditor } from "./dist/nexa-editor.js";
import { BOILERPLATES } from "./dist/nexa-editor-snippets.js";

h(FullCodeEditor, {
  value: code,
  onChange: setCode,
  language: "python",
  snippets: BOILERPLATES,
})
```

Requires the local CodeMirror assets (`assets/codemirror/`, vendored — no CDN);
see [examples/new-components/index.html](./examples/new-components/index.html)
for the full list of `<script>`/`<link>` tags to include.

## CSS Framework

`dist/nexa-ui.css` is mobile-first. Base styles target small screens; larger
screens add layout via `min-width` media queries.

### Breakpoints

| Name | Min width |
|---|---|
| sm | 576 px |
| md | 768 px |
| lg | 992 px |
| xl | 1200 px |

### 12-column grid

```html
<!-- Full width on mobile, half on sm+, third on md+ -->
<div class="m-row">
  <div class="m-col-12 m-col-sm-6 m-col-md-4">…</div>
</div>
```

Available: `m-col`, `m-col-{1-12}`, `m-col-sm-{1-12}`, `m-col-md-{1-12}`,
`m-col-lg-{1-12}`, `m-col-xl-{1-12}`, `m-col-auto` (and `sm`/`md`/`lg`/`xl`
variants).

Gutter variants: `m-row-gap-0`, `m-row-gap-2`, `m-row-gap-4`.

### Display utilities

`m-d-none`, `m-d-block`, `m-d-flex`, `m-d-grid` — and responsive variants
`m-d-sm-*`, `m-d-md-*`, `m-d-lg-*`.

### Spacing utilities

`m-m-{0-8}`, `m-mt-{0-8}`, `m-mb-{0-8}`, `m-ms-{0-4}`, `m-me-{0-4}`,
`m-mx-auto`, `m-p-{0-8}`, `m-px-{0-6}`, `m-py-{0-6}`, `m-gap-{0-8}`.

### Text utilities

`m-text-start`, `m-text-center`, `m-text-end` — and responsive `m-text-sm-*`,
`m-text-md-*`. Font size: `m-text-xs` → `m-text-xl`. Weight: `m-fw-normal` →
`m-fw-black`. Color: `m-text-muted`, `m-text-primary`, `m-text-danger`.

### Flex utilities

`m-flex-row`, `m-flex-column`, `m-flex-wrap`, `m-flex-grow`, `m-justify-*`,
`m-align-*`.

### Dark mode

The CSS respects `prefers-color-scheme` automatically. Use `useTheme()` or
`ThemeToggle` to let the user override it manually — the choice is stored in
`localStorage` and applied via `data-theme="dark"` on `<html>`.

### Mobile shell classes

| Class | Purpose |
|---|---|
| `.m-app-bar` | Fixed top bar with safe-area padding |
| `.m-app-bar-offset` | Spacer below the app bar |
| `.m-bottom-nav` | Fixed bottom navigation bar |
| `.m-bottom-nav-offset` | Spacer above the bottom nav |
| `.m-bottom-sheet` | Panel that slides up from the bottom |
| `.m-fab` | Floating action button (56 px) |
| `.m-fab-extended` | FAB with a text label |
| `.m-fab-above-nav` | Shifts FAB above the bottom nav |

## DOM Features

Nexa props cover the most common needs of a real page:

- events: `onClick`, `onInput`, `onSubmit`, `onChange`, `onBlur`, and more
- `className`, `htmlFor`, `ariaLabel`, and other `aria*` aliases
- `style` as a string or object (supports CSS custom properties)
- `dataset` as an object
- boolean props: `disabled`, `checked`, `required`, `hidden`
- `ref` as an object (`ref.current`) or callback function
- `key` for keyed list reconciliation

Function components get their own hook state. Always use `key` when rendering
dynamic lists so state, refs, memoized values, and effects stay bound to the
correct item as rows are added, removed, or reordered.

### SVG

`h()` recognizes SVG elements and creates them with `createElementNS`
automatically — no special syntax, no manual namespace plumbing:

```js
function Donut({ value, color = "#22c55e" }) {
  return h("svg", { viewBox: "0 0 36 36", className: "donut" },
    h("circle", { cx: 18, cy: 18, r: 16, fill: "none", stroke: "#334155", "stroke-width": 2 }),
    h("circle", {
      cx: 18, cy: 18, r: 16, fill: "none", stroke: color, "stroke-width": 2,
      "stroke-dasharray": `${value} ${100 - value}`, transform: "rotate(-90 18 18)",
    }),
  );
}
```

`<svg>` opens the SVG namespace for its descendants, and `<foreignObject>`
steps back into plain HTML for *its* children — exactly like a browser does
when parsing markup. The namespace is read straight off the live DOM tree, so
nesting, patches, and re-renders all stay correct with zero setup. (Earlier,
this gap is what forced `PipelineCanvas` to bypass the virtual DOM entirely
and hand-roll its own `createElementNS` controller — see
[dist/nexa-canvas.js](./dist/nexa-canvas.js).)

SVG attribute names are case-sensitive and mostly hyphenated
(`stroke-width`, `stroke-dasharray`, `clip-path`, `font-size`, …) — pass them
as quoted string keys exactly as the SVG spec writes them, the same way
`dist/nexa-canvas.js` already does internally. CamelCase JSX-style aliases
(`strokeWidth`) are *not* translated for you.

## Status

Nexa `0.3.0` covers:

**Engine**
- Function components with local hook state and multiple independent roots
- Incremental DOM patching with keyed reconciliation, including SVG/HTML
  namespace switching (`<svg>`, `<foreignObject>`, …) inferred straight off the DOM
- `useState`, `useReducer`, `useEffect` (with cleanup), `useRef`, `useMemo`, `useCallback`
- `useErrorBoundary` — catch render errors in a subtree and show fallback UI;
  throwing effects/cleanups are isolated and reported via `console.error` without
  taking down the rest of the tree
- `useForm` — full form management: validation, touched, dirty, submit, reset, serialize
- `createContext` + `useContext` — scoped values via `Context.provide(value, renderFn)`
- `useTheme` — manual dark/light toggle with `localStorage` persistence
- `memo` — skip re-renders when props are shallowly equal; also detects dirty
  state inside the memoized tree so internal `setState` always triggers correctly
- `createPortal` — render a subtree into an arbitrary DOM node; unmount cleans up the target
- `createLazy` — dynamic `import()` with fallback UI; re-renders all roots on load
- `useId` — stable, unique string ID per component instance

**Mobile hooks**
- `useSwipe`, `useLongPress`, `useNetworkStatus`, `useOrientation`, `useVibrate`

**Utility hooks**
- `useLocalStorage`, `useToast`, `useRouter`, `useTranslation`, `useContextMenu`,
  `useHistory`, `useFetch`
- `useDebounce`, `useThrottle` — timing helpers
- `useMediaQuery` — reactive CSS media query matching
- `useIntersectionObserver` — scroll-triggered visibility detection
- `useWebSocket` — managed WebSocket connection with auto-reconnect
- `useVirtualList` — windowed rendering for large lists

**Components (38)**
- General UI: `Alert`, `Badge`, `Button`, `Card`, `Checkbox`, `Chip`, `CodeEditor`,
  `Collapse`, `Combobox`, `ContextMenu`, `Dialog`, `Drawer`, `Dropdown`, `EmptyState`,
  `FileDropZone`, `FormField`, `IconButton`, `Navbar`, `Pagination`, `Progress`,
  `Select`, `Spinner`, `Stepper`, `Switch`, `Table`, `TabPanel`, `Tabs`, `Textarea`,
  `TextField`, `Toast`, `ToastStack`, `Tooltip`
- Mobile shell: `AppBar`, `BottomNav`, `BottomSheet`, `FAB`, `SwipeableListItem`, `ThemeToggle`

**Canvas & Editor add-ons**
- `PipelineCanvas` — SVG node editor with drag, pan, zoom, mini-map, undo/redo
  (`nexa-canvas.js` / `nexa-canvas.css`)
- `PreziStage` — Prezi-style zooming presentation canvas with animated camera
  pan/zoom/rotate (`nexa-prezi.js` / `nexa-prezi.css`)
- `FullCodeEditor` — CodeMirror 5 wrapper with toolbar, snippet browser, and
  autocomplete (`nexa-editor.js` / `nexa-editor.css` / `nexa-editor-snippets.js`)

**CSS framework**
- Mobile-first with `sm / md / lg / xl` breakpoints
- 12-column responsive grid (`m-col-*`, `m-col-sm-*`, …)
- Display, flex, spacing, text, and width utilities
- Animated enter transitions for `Dialog`, `Drawer`, `BottomSheet`, `Dropdown`, `Toast`
- Dark mode via `prefers-color-scheme` + manual `data-theme` override
- Safe-area support for notch and Dynamic Island devices
- `prefers-reduced-motion` support
