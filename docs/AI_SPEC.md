# Nexa — AI Reference Spec

> Comprehensive reference for AI assistants generating Nexa code.
> Read this before writing any Nexa component or app.

---

## 1. What is Nexa

Nexa is a **no-build, ESM-native** JavaScript frontend framework with a React-like
hooks API. It works directly in the browser via `<script type="module">` — no
bundler, transpiler, or `npm install` required.

Core ideas:
- Components are plain JavaScript functions.
- `h()` creates virtual DOM nodes (like React's `createElement`).
- Hooks manage state and side effects inside components.
- **`h(Component, props)` executes the component function IMMEDIATELY** (eager, not deferred).

---

## 2. Files

```
/dist/nexa.js              ← core framework  (h, render, hooks, context)
/dist/nexa-components.js   ← UI component library (~40 components)
/dist/nexa-ui.css          ← design system CSS (required for components to look right)
/dist/nexa-bootstrap.css   ← optional Bootstrap 5 visual skin (opt-in, see §9)
/dist/nexa-hmr.js          ← HMR client (dev only — injected by server.py)
/dist/nexa-canvas.js       ← SVG pipeline canvas (PipelineCanvasController)
/dist/nexa-canvas.css      ← styles for nexa-canvas
/dist/nexa-zoom.js         ← pan/zoom presentation canvas (ZoomStage)
/dist/nexa-zoom.css        ← styles for nexa-zoom
/dist/nexa-editor.js       ← full-featured code editor component
/dist/nexa-editor.css      ← styles for nexa-editor
/dist/nexa-editor-snippets.js ← boilerplate snippet catalog for nexa-editor
```

Public CDN URLs:

```text
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-components.js
https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-ui.css
```

Use `@main` for the latest code during development. For production, pin a
release tag such as `@v0.4.0`.

Typical HTML entry point:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/dist/nexa-ui.css">
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

---

## 3. CRITICAL RULES — READ FIRST

These are the most common mistakes an AI can make with Nexa:

### ❌ NEVER pass `h(App)` to `render`

```js
// WRONG — throws "App can only be used during rendering"
render(h(App), document.getElementById('app'));

// CORRECT — pass the function reference
render(App, document.getElementById('app'));
```

`render` expects a **function reference**, not a call result.

### ❌ Context does NOT use a Provider component

Nexa evaluates `h(Child)` eagerly, so a `<Context.Provider>` component would set
the value AFTER the child has already rendered. Use `ctx.provide(value, fn)` instead:

```js
// WRONG — React pattern doesn't work
return h(ThemeCtx.Provider, { value: theme }, h(App));

// CORRECT — Nexa pattern
return ThemeCtx.provide(theme, () => h(App, null));
```

### ✅ Always use `key` prop for list items

```js
items.map((item) => h(Row, { key: item.id }, item.label))
```

Without `key`, list re-renders lose state and behave incorrectly.

### ✅ Hooks must be called unconditionally at the top of a component

Same rules as React: no hooks inside `if`, loops, or nested functions.

---

## 4. `h()` — Creating elements

```js
h(type, props, ...children)
```

| `type` | Result |
|--------|--------|
| `'div'`, `'p'`, `'button'`, etc. | HTML element |
| A function (component) | Calls the function immediately |
| `Fragment` | Flattens children, no wrapper element |

```js
import { h, Fragment } from '/dist/nexa.js';

// HTML element
h('p', { className: 'intro' }, 'Hello world')

// Component
h(Button, { variant: 'contained', onClick: save }, 'Save')

// Nesting
h('section', { className: 'card' },
  h('h2', null, 'Title'),
  h('p', null, 'Body text'),
  h(Button, { variant: 'tonal' }, 'Action'),
)

// Fragment — multiple roots without a wrapper
h(Fragment, null,
  h('dt', null, 'Term'),
  h('dd', null, 'Definition'),
)

// Conditional rendering
isLoading && h(Spinner, null)
error ? h(Alert, { variant: 'danger' }, error) : h(Content, null)

// List rendering
users.map((u) => h('li', { key: u.id }, u.name))
```

**Children can be passed as props or as 3rd+ args — both are equivalent:**

```js
h(Card, { padded: true }, h('p', null, 'Content'))
// same as:
h(Card, { padded: true, children: h('p', null, 'Content') })
```

---

## 5. `render()` — Mounting

```js
import { h, render } from '/dist/nexa.js';

function App() {
  return h('h1', null, 'Hello');
}

render(App, document.getElementById('app'));
// NOT: render(h(App), ...)
```

`unmount(container)` removes the app and runs all effect cleanups.

---

## 6. Hooks

Import from `/dist/nexa.js`.

### `useState`

```js
const [value, setValue] = useState(initialValue);
const [count, setCount] = useState(0);

// Functional update (safe when new value depends on old)
setCount((prev) => prev + 1);
```

### `useEffect`

```js
useEffect(() => {
  // runs after render when deps change
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, [dep1, dep2]);

useEffect(() => { /* runs once on mount */ }, []);
useEffect(() => { /* runs on every render */ }); // no deps array
```

### `useRef`

```js
const inputRef = useRef(null);
// DOM access: <input ref={inputRef} />
// Read: inputRef.current.focus()

const countRef = useRef(0); // mutable box, changes don't trigger re-render
```

Attach to DOM elements with the `ref` prop:

```js
h('input', { ref: inputRef, type: 'text' })
```

### `useMemo`

```js
const sorted = useMemo(() => [...items].sort(compare), [items]);
```

### `useCallback`

```js
const handleClick = useCallback(() => doSomething(id), [id]);
```

### `useReducer`

```js
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'INCREMENT' });
```

### `useErrorBoundary`

```js
const [error, reset, guard] = useErrorBoundary();

if (error) return h('div', null, 'Error: ', error.message, h('button', { onClick: reset }, 'Retry'));

return guard(() => h(RiskyComponent, null));
// guard() catches render errors from its subtree
```

### `useForm`

```js
const { values, errors, field, handleSubmit, isSubmitting } = useForm({
  initialValues: { email: '', password: '' },
  validate: (v) => ({
    email:    !v.email.includes('@') ? 'Invalid e-mail' : '',
    password: v.password.length < 6 ? 'Minimum 6 characters' : '',
  }),
  onSubmit: async (values) => {
    await api.login(values);
  },
});

// Spread field() into components
h(TextField, { ...field('email'), label: 'E-mail', type: 'email' })
h(TextField, { ...field('password'), label: 'Password', type: 'password' })
h(Button, { onClick: handleSubmit(), disabled: isSubmitting }, 'Sign in')
```

`field(name)` returns `{ name, value, error, onBlur, onInput, onChange }`.

### `useLocalStorage`

```js
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### `useFetch`

```js
const { data, loading, error, refetch } = useFetch('/api/users');
// Pass null/undefined as url to skip fetching
// refetch() re-runs the same request on demand
```

### `useToast`

```js
const { toasts, toast } = useToast();
// toast.success('Saved!')
// toast.error('Failed to save.', { title: 'Error' })
// toast.warning(msg) / toast.info(msg) — same signature
// toast.dismiss(id)
// Render <ToastStack toasts={toasts} onClose={(id) => toast.dismiss(id)} />
// somewhere in the tree (see §9) — useToast only holds the queue, it does
// not render anything itself.
```

### `useRouter`

```js
// Default: mode: 'hash' — "#/path?query". Works on any static host, no
// server configuration. Plain `<a href="#/dashboard">` navigates for free
// (a hash-only href never triggers a real page load).
const { path, navigate, params } = useRouter();
navigate('/dashboard');

// mode: 'history' — clean URLs via pushState/popstate. Same-origin
// `<a href="/dashboard">` clicks are intercepted automatically (no onClick
// needed), except modified clicks (ctrl/cmd/shift/alt, target!="_self",
// download) and same-page fragment links ("#section"), which keep native
// browser behavior.
// Requires the server to serve index.html for every app route — a direct
// load or refresh of e.g. /dashboard must not 404. A plain static file
// server (python -m http.server) does NOT do this; you need a server with
// SPA-fallback/rewrite configured, or stick to hash mode.
const { path, navigate, params } = useRouter({ mode: 'history' });
navigate('/dashboard');
```

### `useTheme`

```js
const { theme, setTheme, toggleTheme } = useTheme();
// theme: 'light' | 'dark'
// Standalone — reads/writes localStorage('nexa-theme') and sets data-theme on <html>
// Does NOT require ThemeProvider. Multiple useTheme() instances stay in sync via
// a 'nexa:themechange' CustomEvent.
```

### `usePalette`

```js
const { palette, palettes, setPalette, customColor, setCustomColor } = usePalette();
// palette: 'default' | 'violet' | 'rose' | 'blue' | 'custom'
// palettes: the full list, for building a picker UI
// Standalone, same pattern as useTheme — reads/writes localStorage('nexa-palette')
// and sets data-palette on <html>. Independent of useTheme: nexa-ui.css pairs
// each preset palette with both a light and a dark variant, so the two compose freely.
// setPalette(x) is a no-op if x isn't in `palettes`.
//
// setCustomColor(hex) accepts any '#rgb' or '#rrggbb' color, switches palette
// to 'custom', and writes --m-primary inline on <html>. nexa-ui.css derives
// --m-primary-hover/-soft/-secondary/-focus from it via color-mix(), so no
// shade computation is needed on the JS side. Invalid hex strings are ignored.
```

### `useDesign`

```js
const { design, designs, setDesign } = useDesign();
// design: 'nexa' | 'bootstrap'
// designs: the full list, for building a picker UI
// Standalone, same pattern as useTheme/usePalette — reads/writes
// localStorage('nexa-design') and sets data-design on <html>.
//
// "nexa" (default) needs nothing beyond nexa-ui.css. "bootstrap" only takes
// visual effect if dist/nexa-bootstrap.css is ALSO loaded — that stylesheet
// is scoped entirely under [data-design="bootstrap"], so it's inert until
// this hook (or a manual data-design="bootstrap" attribute) switches to it.
// Composes freely with useTheme and usePalette.
```

### `useContext` / `createContext`

See §7 below.

### Mobile hooks

```js
useSwipe(ref, { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold });
useLongPress(ref, { onLongPress, delay });
useNetworkStatus() // → { online, type }
useOrientation()   // → { angle, type }
useVibrate()       // → { vibrate(pattern) }

const { state, set, undo, redo, canUndo, canRedo } = useHistory(initial, { limit: 50 });
// Undo/redo stack. set(value) or set(prev => next). canUndo/canRedo are booleans.
```

### Utility hooks

```js
// Stable unique ID (survives re-renders)
const id = useId();

// Debounce — returns a copy of value that only updates after delay ms of silence
const query = useDebounce(inputValue, 300);

// Throttle — returns a function that fires at most once per delay ms
const onScroll = useThrottle((e) => setY(e.target.scrollTop), 100);

// CSS media query — reactive boolean
const isMobile = useMediaQuery('(max-width: 768px)');

// Intersection observer — returns the latest IntersectionObserverEntry
const entry = useIntersectionObserver(ref, { threshold: 0.5, once: true });
// entry.isIntersecting, entry.intersectionRatio, etc.

// WebSocket with auto-reconnect
const { status, lastMessage, send } = useWebSocket('wss://api.example.com/ws');
// status: 'connecting' | 'open' | 'closed' | 'error'
// send(data) — serializes objects to JSON automatically

// Virtual list — renders only visible rows (all items must have equal fixed height)
const { containerRef, virtualItems, totalHeight } = useVirtualList(rows, { itemHeight: 48 });
// attach containerRef to the scrollable wrapper; render virtualItems; use totalHeight for spacer

// i18n
const { t } = useTranslation({ hello: 'Hello, {name}!' });
t('hello', { name: 'Ana' }) // → 'Hello, Ana!'

// Context menu position state (pair with ContextMenu component)
const { menu, openMenu, closeMenu } = useContextMenu();
// openMenu(e) — call on onContextMenu; menu = { open, x, y }
```

### Component utilities

```js
// memo — skip re-render when props are shallowly equal (or pass custom compare fn)
// Also re-renders when a descendant calls setState or when a context value
// read (useContext) anywhere inside the memoized subtree changes. Context
// values compare with Object.is — providers should useMemo their value
// object, or memo boundaries below them will never skip.
const MemoRow = memo(Row);
const MemoRow = memo(Row, (prev, next) => prev.id === next.id);

// createPortal — render children into a different DOM node (escapes overflow/z-index)
return h('div', null,
  h('p', null, 'Normal'),
  createPortal(h(Modal, { onClose }), document.body),
);

// createLazy — lazy-load a component via dynamic import()
const Chart = createLazy(() => import('./components/Chart.js'));
const Chart = createLazy(() => import('./Chart.js'), h(Spinner, null)); // custom fallback
// Shows fallback while loading. On error, throws — catch with useErrorBoundary.
```

---

## 7. Context

Nexa's context works differently from React because children render eagerly.

```js
import { createContext, useContext, h } from '/dist/nexa.js';

// Create
const AuthCtx = createContext({ user: null, login: () => {} });

// Provide — use ctx.provide(value, renderFn), NOT a Provider component.
// The provider must construct its subtree INSIDE the renderFn thunk, so that
// h(Header)/h(Main) execute while `ctx` is on top of the context stack.
function AuthProvider() {
  const [user, setUser] = useState(null);
  const ctx = { user, login: (u) => setUser(u) };

  return AuthCtx.provide(ctx, () =>
    h('div', null, h(Header), h(Main))
  );
}

// Consume
function UserBadge() {
  const { user } = useContext(AuthCtx);
  return h('span', null, user?.name ?? 'Guest');
}
```

### ❌ A "Provider component" that takes `children` as a prop does NOT work

```js
// WRONG — by the time h(ThemeProvider, null, h(App)) can call ThemeProvider,
// JS has already evaluated h(App) as an argument expression — meaning App()
// (and everything inside it) already ran, with nothing on the context stack.
// Wrapping the already-evaluated `children` vnode in `() => children` does
// NOT defer that evaluation; it happened before this function body started.
function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return ThemeCtx.provide({ theme, toggleTheme: () => {} }, () => children);
}
render(() => h(ThemeProvider, null, h(App)), document.getElementById('app'));
// → useContext(ThemeCtx) anywhere inside App always sees the default value.
```

`useTheme()` (§6) is standalone and does NOT need a context — it already
reads/writes `localStorage` directly. Only reach for a custom context like
the one above when you need state that isn't already covered by a hook.

### Composing multiple contexts

Because a provider must own the construction of what it wraps, the way to
combine several contexts is to nest `.provide()` calls in one
composition-root component — typically the function passed to `render()`:

```js
function App() {
  const auth = useAuthState();  // plain hooks, not components — see §12
  const cart = useCartState();

  return AuthCtx.provide(auth, () =>
    CartCtx.provide(cart, () =>
      h(Shell)
    )
  );
}

render(App, document.getElementById('app'));
```

`useAuthState()`/`useCartState()` hold each domain's state and return the
value object for that domain's context. See §12 for where these hooks live
in a domain-componentized project.

---

## 8. Props & DOM Bindings

### Naming conventions

| Nexa prop | HTML/DOM equivalent |
|-----------|---------------------|
| `className` | `class` |
| `htmlFor` | `for` |
| `onClick` | `addEventListener('click', fn)` |
| `onChange` | `addEventListener('change', fn)` |
| `onInput` | `addEventListener('input', fn)` |
| `onMouseDown` | `addEventListener('mousedown', fn)` |
| `onKeyDown` | `addEventListener('keydown', fn)` |
| `ariaLabel` | `aria-label` |
| `ariaHidden` | `aria-hidden` |
| `ariaExpanded` | `aria-expanded` |
| `ariaLive` | `aria-live` |
| `ariaControls` | `aria-controls` |
| `ariaHaspopup` | `aria-haspopup` |
| `ariaCurrent` | `aria-current` |
| `ariaModal` | `aria-modal` |
| `ariaSelected` | `aria-selected` |
| `ariaValuenow/min/max` | `aria-valuenow/min/max` |
| `ref` | DOM ref (see §6 useRef) |
| `key` | Reconciler key (not set on DOM) |
| `dataset` | `data-*` attributes |

Any prop starting with `on` + uppercase letter is treated as an event listener.
`eventName` is derived as `propName.slice(2).toLowerCase()` — so `onClick` → `click`,
`onMouseDown` → `mousedown`, `onInput` → `input`.

`aria*` props are reflected IDL string properties, not booleans — pass the
literal string `"true"` / `"false"`, not a JS boolean:

```js
h('span', { ariaHidden: 'true' })              // CORRECT
h('button', { ariaExpanded: isOpen ? 'true' : 'false' })

h('span', { ariaHidden: true })                 // WRONG — sets aria-hidden=""
```

### `style` prop

Accepts a **camelCase object** or a CSS string:

```js
h('div', { style: { color: 'red', fontSize: '1.25rem', padding: '8px 16px' } })
h('div', { style: 'color: red; font-size: 1.25rem' })

// CSS custom properties:
h('div', { style: { '--m-primary': '#ff6600' } })
```

### `dataset` prop

```js
h('div', { dataset: { id: 'user-42', active: 'true' } })
// → <div data-id="user-42" data-active="true">
```

### `ref` prop

```js
const el = useRef(null);
h('input', { ref: el })          // el.current → the DOM node
h('div',   { ref: (node) => { } }) // callback ref
```

### Boolean props

```js
h('input', { disabled: true })    // sets attribute
h('input', { disabled: false })   // removes attribute
h('input', { required: true })
```

---

## 9. UI Components (`/dist/nexa-components.js`)

~40 components + CSS-only primitives. Import only what you use:

```js
import { Button, Card, TextField } from '/dist/nexa-components.js';
```

### Basic

```js
// Button
h(Button, {
  variant: 'contained',   // 'text' | 'contained' | 'tonal' | 'danger' | 'outline'
  type: 'button',         // 'button' | 'submit' | 'reset'
  disabled: false,
  onClick: fn,
}, 'Label')

// IconButton — round button for icons
h(IconButton, {
  label: 'Close',         // aria-label (required)
  variant: 'tonal',       // same variants as Button
  onClick: fn,
}, '✕')

// Badge
h(Badge, null, 'New')
h(Badge, { className: 'm-badge-success' }, '3')

// Chip — toggleable tag
h(Chip, { active: true, onClick: fn }, 'Design')

// FAB — Floating Action Button
h(FAB, {
  label: 'Add',           // aria-label when not extended
  extended: false,        // true = shows label as text
  onClick: fn,
}, '+')
```

### Layout

```js
// Card
h(Card, { padded: true }, h('p', null, 'Content'))
// CSS: add m-card-hover for a clickable card (pointer + hover border/shadow)

// Divider — CSS-only, no JS component needed
h('hr', { className: 'm-divider' })
h('span', { className: 'm-divider-vertical' })   // inline vertical separator

// Avatar — CSS-only
h('span', { className: 'm-avatar m-avatar-md' }, 'AB')          // initials
h('span', { className: 'm-avatar m-avatar-md' },
  h('img', { src: url, alt: name })                              // photo
)
// Sizes: m-avatar-xs (24px) | m-avatar-sm (32px) | m-avatar-md (40px) | m-avatar-lg (56px) | m-avatar-xl (72px)

// Avatar group (overlapping)
h('div', { className: 'm-avatar-group' },
  h('span', { className: 'm-avatar m-avatar-sm' }, 'A'),
  h('span', { className: 'm-avatar m-avatar-sm' }, 'B'),
  h('span', { className: 'm-avatar m-avatar-sm' }, '+3'),
)

// Skeleton — CSS-only loading placeholder
h('div', { className: 'm-skeleton', style: { width: '100%', height: 20 } })
h('div', { className: 'm-skeleton m-skeleton-text', style: { width: '60%' } })
h('div', { className: 'm-skeleton m-skeleton-circle', style: { width: 40, height: 40 } })

// Breadcrumb — CSS-only
h('ol', { className: 'm-breadcrumb' },
  h('li', { className: 'm-breadcrumb-item' },
    h('a', { className: 'm-breadcrumb-link', href: '/' }, 'Home'),
    h('span', { className: 'm-breadcrumb-sep' }, '/'),
  ),
  h('li', { className: 'm-breadcrumb-item' },
    h('a', { className: 'm-breadcrumb-link', href: '/projects' }, 'Projects'),
    h('span', { className: 'm-breadcrumb-sep' }, '/'),
  ),
  h('li', { className: 'm-breadcrumb-item' }, 'Current page'),
)

// Collapse — accordion section
h(Collapse, {
  title: 'Click to expand',
  defaultOpen: false,
}, h('p', null, 'Hidden content'))

// EmptyState
h(EmptyState, {
  title: 'No results',
  description: 'Try adjusting the filters.',
})

// Table
h(Table, {
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'E-mail' },
    { key: 'role', header: 'Role', align: 'right' },
  ],
  rows: [
    { id: 1, name: 'Ana', email: 'ana@ex.com', role: 'Admin' },
    { id: 2, name: 'Bruno', email: 'b@ex.com', role: 'User' },
  ],
  sortable: true,
  getRowKey: (row) => row.id,
})
```

### Form

```js
// FormField — label + input + help/error wrapper
h(FormField, { label: 'Name', help: 'Optional', error: '' },
  h('input', { className: 'm-field', type: 'text' })
)

// TextField
h(TextField, {
  label: 'E-mail',
  type: 'email',           // 'text' | 'email' | 'password' | 'number' | 'search' | 'tel'
  placeholder: 'Type...',
  value: state,
  onInput: (e) => setState(e.target.value),
  disabled: false,
  required: false,
  error: 'Required field',
  help: 'Help text',
})

// Textarea
h(Textarea, {
  label: 'Description',
  rows: 4,
  value, onInput,
  disabled, error, help,
})

// Select
h(Select, {
  label: 'Plan',
  value: 'pro',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ],
  onChange: (e) => setPlan(e.target.value),
  disabled: false,
  error: '',
})

// Checkbox
h(Checkbox, {
  label: 'I accept the terms',
  checked: agreed,
  onChange: (e) => setAgreed(e.target.checked),
  disabled: false,
})

// Switch
h(Switch, {
  label: 'Notifications',
  checked: enabled,
  onChange: (e) => setEnabled(e.target.checked),
})

// Combobox — searchable select with dropdown
h(Combobox, {
  label: 'Country',
  value: selected,
  onChange: (val) => setSelected(val),
  options: [
    { value: 'br', label: 'Brazil' },
    { value: 'pt', label: 'Portugal' },
  ],
  placeholder: 'Select...',
  searchPlaceholder: 'Search...',
  error: '',
})

// FileDropZone — drag-and-drop file upload area
h(FileDropZone, {
  onFiles: (files) => upload(files),  // files: File[]
  accept: 'image/*',                  // optional MIME filter
  multiple: true,
  label: 'Drop files here or click to browse',
  hint: 'PNG, JPG up to 10 MB',
  progress: 60,                       // 0–100, shows Progress bar when set
  disabled: false,
})

// CodeEditor — thin wrapper for CodeMirror or Monaco (whichever is on window)
h(CodeEditor, {
  value: code,
  onChange: (v) => setCode(v),
  mode: 'javascript',   // language mode
  theme: 'default',
  options: {},          // passed through to the underlying editor
})
```

### Feedback


```js
// Alert
h(Alert, {
  variant: 'info',    // 'info' | 'success' | 'warning' | 'danger'
  title: 'Attention',
}, 'Alert message')

// Spinner
h(Spinner, { label: 'Loading...' })

// Progress
h(Progress, {
  value: 60,
  max: 100,
  label: 'Upload',
  showValue: true,    // shows percentage
})

// Toast — inline notification, always visible when open: true
h(Toast, {
  open: true,
  variant: 'success', // 'info' | 'success' | 'warning' | 'danger'
  title: 'Saved!',
  message: 'Your changes have been saved.',
  onClose: () => setOpen(false),
})

// ToastStack — floating toast container (place once near root)
// Use with useToast() hook
h(ToastStack, { toasts, onClose: (id) => removeToast(id) })
```

### Navigation

```js
// Tabs
h(Tabs, {
  value: activeTab,
  onChange: (val) => setActiveTab(val),
  items: [
    { value: 'overview', label: 'Overview' },
    { value: 'settings', label: 'Settings' },
    { value: 'logs',     label: 'Logs' },
  ],
})
// TabPanel — renders children only when active
h(TabPanel, { id: 'overview', activeId: activeTab },
  h('p', null, 'Overview content')
)

// Navbar
h(Navbar, {
  brand: 'My App',
  items: [
    { label: 'Home',     href: '/',         active: true },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact',  href: '/contact'  },
  ],
  actions: h(Button, { variant: 'tonal' }, 'Login'),
})

// AppBar — sticky top bar
h(AppBar, {
  title: 'Dashboard',
  leading: h(IconButton, { label: 'Menu', onClick: openDrawer }, '☰'),
  actions: h(IconButton, { label: 'Profile' }, '👤'),
})

// BottomNav — mobile bottom navigation
h(BottomNav, {
  value: currentTab,
  onChange: (val) => setCurrentTab(val),
  items: [
    { value: 'home',    label: 'Home',    icon: '🏠' },
    { value: 'search',  label: 'Search',  icon: '🔍' },
    { value: 'profile', label: 'Profile', icon: '👤' },
  ],
})

// ThemeToggle — icon button that calls useTheme().toggleTheme()
h(ThemeToggle)  // no props required; renders sun/moon SVG icon

// PaletteSwitcher — row of color swatches, calls usePalette().setPalette()
h(PaletteSwitcher)  // no props required

// DesignSwitcher — chip toggle, calls useDesign().setDesign()
// Only visually meaningful if dist/nexa-bootstrap.css is also loaded.
h(DesignSwitcher)  // no props required

// Sidebar nav links — CSS-only, use inside .m-sidebar
h('nav', { className: 'm-sidebar-section' },
  h('p', { className: 'm-sidebar-label' }, 'Main'),
  h('a', { className: 'm-sidebar-link m-sidebar-link-active', href: '/dashboard' },
    h('span', { className: 'm-sidebar-link-icon' }, '⊞'),
    'Dashboard',
  ),
  h('a', { className: 'm-sidebar-link', href: '/projects' },
    h('span', { className: 'm-sidebar-link-icon' }, '◫'),
    'Projects',
    h('span', { className: 'm-sidebar-link-badge m-badge' }, '3'),
  ),
)

// SwipeableListItem — mobile swipe-to-reveal actions
h(SwipeableListItem, {
  actions: [
    { label: 'Delete', className: 'm-swipeable-action-danger', onClick: del },
    { label: 'Archive', onClick: archive },
  ],
  actionWidth: 72,  // px per action button
},
  h('div', { className: 'list-row' }, 'Row content')
)

// Stepper
h(Stepper, {
  activeStep: 1,             // 0-based index
  orientation: 'horizontal', // 'horizontal' | 'vertical'
  steps: [
    { label: 'Details',      description: 'Name and e-mail' },
    { label: 'Address',      description: 'Zip code and city' },
    { label: 'Confirmation' },
  ],
})

// Pagination
h(Pagination, {
  page: 3,
  total: 12,
  onChange: (p) => setPage(p),
})
```

### Overlay

```js
// Dialog — modal
h(Dialog, {
  open: isOpen,
  onClose: () => setOpen(false),
  title: 'Confirm deletion',
},
  h('p', null, 'This action cannot be undone.'),
  h(Button, { variant: 'danger', onClick: doDelete }, 'Delete'),
)

// Drawer — side panel
h(Drawer, {
  open: drawerOpen,
  onClose: () => setDrawerOpen(false),
  side: 'left',   // 'left' | 'right'
  title: 'Menu',
},
  h('nav', null, /* nav items */)
)

// BottomSheet
h(BottomSheet, {
  open,
  onClose,
  title: 'Options',
}, /* content */)

// Dropdown
h(Dropdown, {
  open: dropOpen,
  onClose: () => setDropOpen(false),
  trigger: h(Button, { onClick: () => setDropOpen(true) }, 'Actions'),
  items: [
    { label: 'Edit', onClick: edit },
    { label: 'Delete', onClick: del, danger: true },
  ],
})

// Tooltip
h(Tooltip, { content: 'Click to save' },
  h(Button, null, 'Save')
)

// ContextMenu — right-click context menu (pair with useContextMenu hook)
const { menu, openMenu, closeMenu } = useContextMenu();
h('div', { onContextMenu: openMenu },
  'Right-click me',
  h(ContextMenu, {
    open: menu.open,
    x: menu.x,
    y: menu.y,
    onClose: closeMenu,
    items: [
      { label: 'Edit',   icon: '✏️', onClick: edit },
      { divider: true },
      { label: 'Delete', icon: '🗑️', onClick: del, danger: true },
    ],
  }),
)
```

---

## 10. Canvas & Editor Add-ons

Three optional add-ons, each its own `dist/nexa-<name>.js` + `.css` pair —
**not** part of `nexa-components.js`, import them directly. Full prop tables
and a longer walkthrough live in the README's "Canvas & Editor" section;
this is the quick-reference version so an agent that only loads this file
still knows the API exists and how to call it.

### `PipelineCanvas`

`dist/nexa-canvas.js` + `dist/nexa-canvas.css`. An SVG-based node/pipeline
editor: drag nodes, draw connections, pan and zoom, mini-map, undo/redo.

| Prop | Description |
|---|---|
| `nodes` | Array of node descriptors to render |
| `onNodeEdit` / `onNodeDelete` / `onNodeMove` | Node lifecycle callbacks |
| `onNodeConnect` / `onConnectionDelete` | Edge lifecycle callbacks |
| `onContextMenu` | Right-click handler — pair with `useContextMenu` + `ContextMenu` |

```js
import { PipelineCanvas } from "/dist/nexa-canvas.js";

h(PipelineCanvas, {
  nodes,
  onNodeMove: (id, x, y) => moveNode(id, x, y),
  onNodeConnect: (fromId, toId) => connect(fromId, toId),
})
```

### `ZoomStage`

`dist/nexa-zoom.js` + `dist/nexa-zoom.css`. A pan/zoom presentation, in the
style of non-linear zooming presentation tools: every frame's `content` is
normal Nexa vdom, positioned with plain CSS on one large shared canvas (all
frames are mounted at once) — only the *camera* is imperative, easing
pan/zoom/rotate between frames via `requestAnimationFrame`.

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
import { ZoomStage } from "/dist/nexa-zoom.js";

h(ZoomStage, {
  frames,
  index,
  onIndexChange: setIndex,
  controllerRef,
})
```

**Frames can legitimately overlap in world space** — an "overview" frame
that zooms out to show the whole canvas is, by definition, as big as every
other frame combined. `ZoomStage` renders frames sorted by descending area
(`w * h`), so larger frames paint *behind* smaller ones automatically. You
don't need to manage `z-index` yourself, but keep it in mind when authoring
geometry: a frame that's smaller than something it overlaps will always be
the one left visible on top.

**Structuring a multi-frame deck:** once a presentation has more than a
couple of frame *kinds* (title slide, bullet list, code sample, …), give
each kind its own component under `components/` (e.g.
`components/TitleFrame.js`, `components/CodeFrame.js`), with a small
dispatcher component that maps `data.kind` to the right one — the same
domain-componentized rule from §12 applies here. Keep `data.js` holding
plain geometry + content *descriptors* (`{ kind: "title", heading, body }`),
and build the actual `content: h(...)` vdom in `app.js` right before passing
`frames` to `ZoomStage`. See [examples/zoom-stage](../examples/zoom-stage) for
the full pattern (`components/FrameContent.js` dispatches on `data.kind`).

### `FullCodeEditor`

`dist/nexa-editor.js` + `dist/nexa-editor.css` (+ `dist/nexa-editor-snippets.js`
for the snippet browser). A CodeMirror 5 wrapper with a toolbar, language
switcher, snippet browser, and autocomplete. Requires the local CodeMirror
assets in `assets/codemirror/` (no CDN).

| Prop | Description |
|---|---|
| `value`, `onChange` | Controlled source code |
| `language`, `onLanguageChange` | Active language (`python`, `cython`, `go`, `rust`, `kotlin`, …) |
| `snippets` | Snippet catalog — see `BOILERPLATES` in `nexa-editor-snippets.js` |
| `onCheckSyntax` | Async `(code) => { ok, message }` — wired to the toolbar's "check" action |
| `showToolbar`, `showSnippets`, `height` | Layout toggles |

```js
import { FullCodeEditor } from "/dist/nexa-editor.js";
import { BOILERPLATES } from "/dist/nexa-editor-snippets.js";

h(FullCodeEditor, { value: code, onChange: setCode, language: "python", snippets: BOILERPLATES })
```

---

## 11. CSS Design Tokens

All tokens are CSS custom properties set on `:root` by `nexa-ui.css`.

```css
/* Colors */
--m-bg             /* page background #f4f6f8 */
--m-surface        /* card/panel background #ffffff */
--m-surface-soft   /* tinted surface #eef4f2 */
--m-surface-muted  /* subtle surface #f8fafc */
--m-surface-raised /* interactive hover surface #f1f5f9 */
--m-text           /* primary text #18212b */
--m-text-muted     /* secondary text #617080 */
--m-border         /* borders #cbd6e0 */

--m-primary        /* brand teal #0f766e */
--m-primary-hover  /* #115e59 */
--m-primary-soft   /* light tint #d9f3ef */
--m-secondary      /* #3f4f9f */

--m-danger         /* red #b42318 */
--m-danger-soft    /* #fee4e2 */
--m-success        /* green #067647 */
--m-success-soft   /* #dcfae6 */
--m-warning        /* orange #b54708 */
--m-warning-soft   /* #fef0c7 */
--m-info           /* blue #175cd3 */
--m-info-soft      /* #dbeafe */

/* Spacing (4-point scale) */
--m-space-1   /* 4px */
--m-space-2   /* 8px */
--m-space-3   /* 12px */
--m-space-4   /* 16px */
--m-space-5   /* 20px */
--m-space-6   /* 24px */
--m-space-8   /* 32px */
--m-space-10  /* 40px */
--m-space-12  /* 48px */

/* Shape */
--m-radius     /* 8px */
--m-radius-sm  /* 4px */
--m-radius-lg  /* 16px */
--m-radius-xl  /* 24px */

/* Elevation */
--m-shadow-1   /* subtle */
--m-shadow-2   /* medium */
--m-shadow-3   /* strong */

/* Typography */
--m-font              /* Inter stack */
--m-font-size-xs      /* 0.75rem */
--m-font-size-sm      /* 0.875rem */
--m-font-size-base    /* 1rem */
--m-font-size-lg      /* 1.125rem */
--m-font-size-xl      /* 1.25rem */
--m-font-size-2xl     /* 1.5rem */
--m-font-size-3xl     /* 1.875rem */

/* Transitions */
--m-transition-fast   /* 120ms ease */
--m-transition-base   /* 200ms ease */

/* Z-index layers */
--m-z-dropdown  /* 30 */
--m-z-drawer    /* 40 */
--m-z-dialog    /* 50 */
--m-z-toast     /* 60 */
--m-z-tooltip   /* 70 */
--m-z-appbar    /* 20 */
--m-z-bottomnav /* 20 */
```

Override tokens on a scoped element or globally:

```css
:root { --m-primary: #7c3aed; } /* purple brand */
.my-widget { --m-radius: 0; }   /* square corners for this widget */
```

---

## 12. Component Patterns

### Basic component

```js
function UserCard({ name, email, avatar, onEdit }) {
  return h(Card, { padded: true },
    h('div', { style: { display: 'flex', gap: '12px', alignItems: 'center' } },
      h('img', { src: avatar, alt: name, style: { width: 48, height: 48, borderRadius: '50%' } }),
      h('div', null,
        h('strong', null, name),
        h('p', { style: { color: 'var(--m-text-muted)', margin: 0 } }, email),
      ),
    ),
    h(Button, { variant: 'tonal', onClick: onEdit }, 'Edit'),
  );
}
```

### State in parent, data down / events up

```js
function UserList() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);

  return h('div', null,
    users.map((u) =>
      h(UserCard, {
        key: u.id,
        name: u.name,
        email: u.email,
        onEdit: () => setSelected(u),
      })
    ),
    selected && h(EditDialog, {
      user: selected,
      onSave: (updated) => {
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
        setSelected(null);
      },
      onClose: () => setSelected(null),
    }),
  );
}
```

### Derived state (no double useState)

```js
function SearchableList({ items }) {
  const [query, setQuery] = useState('');

  // Compute on every render — no separate state for filtered list
  const visible = query
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  return h('div', null,
    h(TextField, { label: 'Search', value: query, onInput: (e) => setQuery(e.target.value) }),
    visible.map((i) => h('li', { key: i.id }, i.label)),
  );
}
```

### useEffect for data fetching

```js
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setUser(data); setLoading(false); } });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return h(Spinner, { label: 'Loading...' });
  if (!user)   return h(EmptyState, { title: 'User not found' });
  return h(UserCard, { name: user.name, email: user.email });
}
```

### Form with useForm

```js
function LoginForm({ onSuccess }) {
  const { field, handleSubmit, isSubmitting, errors } = useForm({
    initialValues: { email: '', password: '' },
    validate: (v) => ({
      email:    !v.email.includes('@') ? 'Invalid e-mail' : '',
      password: v.password.length < 8  ? 'Minimum 8 characters' : '',
    }),
    onSubmit: async (values) => {
      const user = await api.login(values);
      onSuccess(user);
    },
  });

  return h('form', { onSubmit: handleSubmit() },
    h(TextField, { ...field('email'),    label: 'E-mail',   type: 'email'    }),
    h(TextField, { ...field('password'), label: 'Password', type: 'password' }),
    h(Button, { variant: 'contained', type: 'submit', disabled: isSubmitting },
      isSubmitting ? h(Spinner, { label: 'Please wait' }) : 'Sign in'
    ),
  );
}
```

### Context provider + consumer

```js
const CartCtx = createContext({ items: [], add: () => {}, remove: () => {} });

function CartProvider() {
  const [items, setItems] = useState([]);
  const add    = (item) => setItems((prev) => [...prev, item]);
  const remove = (id)   => setItems((prev) => prev.filter((i) => i.id !== id));

  return CartCtx.provide({ items, add, remove }, () =>
    h('div', null, h(Header), h(ProductGrid), h(CartSidebar))
  );
}

function CartBadge() {
  const { items } = useContext(CartCtx);
  return h(Badge, null, items.length);
}
```

### Error boundary

```js
function SafeWidget({ children }) {
  const [error, reset, guard] = useErrorBoundary();

  if (error) {
    return h(Alert, { variant: 'warning', title: 'Something went wrong' },
      h(Button, { variant: 'tonal', onClick: reset }, 'Try again')
    );
  }

  return guard(() => children);
}

// Usage — wrap risky subtrees:
h(SafeWidget, null, h(ComplexChart, { data }))
```

### Domain-componentized structure

> **This is the Nexa way.** Split by domain (visual section / feature), not by
> type. Every real app beyond a demo should follow this layout.

```
my-app/
  index.html          ← HTML entry point — loads styles.css + app.js
  app.js              ← orchestrator: imports, top-level state, render()
  styles.css          ← global layout + @import for every component CSS
  data.js             ← ALL static/mock/seed data as UPPER_CASE exports
  components/
    Hero.js           ← one component per file
    Hero.css          ← paired CSS — same base name as the JS file
    Features.js
    Features.css
    Footer.js
    Footer.css
    useMyHook.js      ← custom hooks live here too (prefix: use)
```

**Rules — follow all of them:**

| Rule | Detail |
|------|--------|
| **No `src/` wrapper** | Projects live directly in their named folder |
| **No `pages/` / `store/` / `utils/`** | Not used in Nexa — keep it flat |
| **One component per file** | Small, single-purpose function |
| **Paired CSS** | `Hero.js` → `Hero.css` — always a sibling file |
| **CSS imported centrally** | `styles.css` collects all component CSS via `@import`. Components do NOT import CSS themselves |
| **`data.js` at root** | All static data as `UPPER_CASE` named exports. Never hardcode data inside components |
| **`app.js` is orchestrator only** | Imports data + components, holds top-level UI state (open/closed, active tab). Zero business logic |
| **Hooks in `components/`** | `useXxx.js` alongside the components — centralizes fetching and complex state |
| **CSS class prefix** | Pick a short prefix per project (`l-` landing, `tm-` task-manager) to avoid collisions with Nexa's `m-*` classes |

### Scaling to domain subfolders

When an app grows beyond ~6 components, group by feature/domain **inside** `components/`.
Never group by type (`forms/`, `ui/`, `shared/`).

```
my-app/
  index.html
  app.js
  styles.css
  data.js
  components/
    auth/
      LoginForm.js
      LoginForm.css
      RegisterForm.js
      RegisterForm.css
    dashboard/
      MetricsRow.js
      MetricsRow.css
      RevenueChart.js
      RevenueChart.css
      useDashboard.js     ← domain hook lives inside the domain folder
    settings/
      ProfileForm.js
      ProfileForm.css
      BillingSection.js
      BillingSection.css
```

**Rules for domain subfolders:**

| Rule | Detail |
|------|--------|
| **Domain = feature, not type** | `auth/`, `dashboard/`, `settings/` — never `forms/`, `modals/`, `shared/` |
| **Paired CSS stays next to the JS** | `auth/LoginForm.js` → `auth/LoginForm.css` |
| **`styles.css` still collects everything** | Even nested CSS is imported at root — components never import their own CSS |
| **Domain hook lives in its domain** | `dashboard/useDashboard.js`, not a separate `hooks/` folder |
| **`data.js` stays at root** | Unless the project is very large, keep one `data.js`; don't split per domain |
| **Minimum 2 files to justify a folder** | Don't create `auth/` for a single `LoginForm.js` |
| **Flat first, then split** | Start flat. Create a subfolder when you have 3+ files for the same domain |

### Domain-owned context

A domain whose own components need to share state (not just one parent
prop-drilling into its children) gets its own `createContext` call, living
in the domain folder next to the hook that owns the state:

```
components/
  cart/
    CartContext.js     ← createContext(...) + useCartState() hook
    CartButton.js
    CartButton.css
    CartDrawer.js
    CartDrawer.css
  auth/
    AuthContext.js      ← createContext(...) + useAuthState() hook
    AuthMenu.js
    AuthMenu.css
```

```js
// components/cart/CartContext.js
import { createContext, useCallback, useMemo, useState } from '/dist/nexa.js';

export const CartContext = createContext({ items: [], addItem: () => {} });

// A hook, not a component — the actual h(Shell) call that needs this value
// on the stack happens in app.js. See "Composing multiple contexts" in §7.
export function useCartState() {
  const [items, setItems] = useState([]);
  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);
  return useMemo(() => ({ items, addItem }), [items, addItem]);
}
```

```js
// app.js — the one place all domain contexts get composed
import { h, render } from '/dist/nexa.js';
import { CartContext, useCartState } from './components/cart/CartContext.js';
import { AuthContext, useAuthState } from './components/auth/AuthContext.js';
import { Shell } from './components/Shell.js';

function App() {
  const cart = useCartState();
  const auth = useAuthState();

  return CartContext.provide(cart, () =>
    AuthContext.provide(auth, () =>
      h(Shell)
    )
  );
}

render(App, document.getElementById('app'));
```

Each domain's own components consume their own context directly:

```js
// components/cart/CartButton.js
import { h, useContext } from '/dist/nexa.js';
import { Badge, IconButton } from '/dist/nexa-components.js';
import { CartContext } from './CartContext.js';

export function CartButton({ onClick }) {
  const { items } = useContext(CartContext);
  return h(IconButton, { label: 'Cart', onClick },
    h(Badge, null, items.reduce((n, i) => n + i.qty, 0)),
  );
}
```

**Rules for domain-owned context:**

| Rule | Detail |
|------|--------|
| **Context + its hook live together** | `cart/CartContext.js` exports both `CartContext` and `useCartState()` |
| **The hook holds state, the context just carries it** | `useCartState()` is a plain hook (`useState`/`useCallback`/`useMemo`) — not a component |
| **Only `app.js` composes providers** | Nest `.provide()` calls in the root component — never a separate `<XProvider>` component that takes `children` as a prop (see §7) |
| **Domains don't read each other's context** | Cross-domain interaction happens through props/callbacks passed at the composition root (`app.js`), not by importing another domain's context |

CSS imports in `styles.css` for a domain-structured app:

```css
/* styles.css */
@import './components/auth/LoginForm.css';
@import './components/auth/RegisterForm.css';
@import './components/dashboard/MetricsRow.css';
@import './components/dashboard/RevenueChart.css';
@import './components/settings/ProfileForm.css';
@import './components/settings/BillingSection.css';
```

JS imports use the full relative path:

```js
// app.js
import { LoginForm }    from './components/auth/LoginForm.js';
import { MetricsRow }   from './components/dashboard/MetricsRow.js';
import { ProfileForm }  from './components/settings/ProfileForm.js';
```

**Two CSS strategies:**

| Scenario | Approach |
|----------|----------|
| Custom-designed UI (no Nexa components) | Own tokens (`--l-bg`, `--l-accent`, etc.); no `nexa-ui.css` in `<head>` |
| Using Nexa UI components | Load `nexa-ui.css` first; `styles.css` adds layout-only rules; reuse `--m-*` tokens |

**Concrete pattern — data isolation:**

```js
// data.js
export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing',  label: 'Pricing'  },
];

export const FEATURES = [
  { id: 'speed',    icon: '⚡', title: 'Fast',     description: '...' },
  { id: 'secure',   icon: '🔒', title: 'Secure',   description: '...' },
  { id: 'flexible', icon: '🔧', title: 'Flexible', description: '...' },
];
```

**Concrete pattern — `app.js` as orchestrator:**

```js
// app.js
import { h, render } from '/dist/nexa.js';
import { NAV_LINKS, FEATURES } from './data.js';
import { Header }   from './components/Header.js';
import { Features } from './components/Features.js';
import { Footer }   from './components/Footer.js';

function App() {
  return h('div', { className: 'l-page' },
    h(Header,   { navLinks: NAV_LINKS }),
    h('main', null,
      h(Features, { features: FEATURES }),
    ),
    h(Footer, null),
  );
}

render(App, document.getElementById('app'));
```

**Concrete pattern — component + paired CSS:**

```js
// components/Features.js
import { h } from '/dist/nexa.js';

export function Features({ features }) {
  return h('section', { className: 'l-features' },
    h('h2', { className: 'l-section-title' }, 'Features'),
    h('div', { className: 'l-feature-grid' },
      features.map((f) =>
        h('article', { key: f.id, className: 'l-feature-card' },
          h('span', { className: 'l-feature-icon' }, f.icon),
          h('h3', null, f.title),
          h('p', null, f.description),
        )
      ),
    ),
  );
}
```

```css
/* components/Features.css — imported by styles.css, not by Features.js */
.l-features { padding: 4rem 1.5rem; }

.l-feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.l-feature-card { background: var(--l-surface); border-radius: 12px; padding: 1.5rem; }
.l-feature-icon { font-size: 2rem; display: block; margin-bottom: 0.75rem; }
```

```css
/* styles.css — central CSS entry point */
@import './components/Header.css';
@import './components/Features.css';
@import './components/Footer.css';

:root {
  --l-bg:      #f8fafc;
  --l-surface: #ffffff;
  --l-accent:  #4f46e5;
}

* { box-sizing: border-box; }

.l-page { min-height: 100vh; background: var(--l-bg); }
```

**Concrete pattern — custom hook:**

```js
// components/useProducts.js
import { useCallback, useEffect, useState } from '/dist/nexa.js';

export function useProducts() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      setItems(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  return { items, loading, error, refresh: load };
}
```

---

## 13. Complete minimal app (single-file demo only)

> **Single-file apps are for quick demos and prototypes.**
> For any real project — landing page, dashboard, form flow — use the
> domain-componentized structure from §12. Never generate a multi-section
> UI in a single `app.js`.

A working counter with a Navbar, Tabs, and form:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/dist/nexa-ui.css">
  <title>Demo</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

```js
// app.js
import { h, render, useState } from '/dist/nexa.js';
import {
  Navbar, Tabs, TabPanel, Card, Button, TextField, Alert,
} from '/dist/nexa-components.js';

function CounterTab() {
  const [count, setCount] = useState(0);
  return h(Card, { padded: true },
    h('p', { style: { fontSize: '2rem', textAlign: 'center' } }, count),
    h('div', { style: { display: 'flex', gap: '8px' } },
      h(Button, { variant: 'tonal',      onClick: () => setCount((n) => n - 1) }, '-'),
      h(Button, { variant: 'contained',  onClick: () => setCount((n) => n + 1) }, '+'),
      h(Button, { variant: 'text',       onClick: () => setCount(0) }, 'Reset'),
    ),
  );
}

function FormTab() {
  const [name, setName]   = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => { if (name.trim()) setSaved(true); };

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    saved && h(Alert, { variant: 'success' }, `Hello, ${name}!`),
    h(TextField, {
      label: 'Your name',
      value: name,
      onInput: (e) => { setName(e.target.value); setSaved(false); },
      error: saved || name.trim() ? '' : 'Name is required',
    }),
    h(Button, { variant: 'contained', onClick: save }, 'Save'),
  );
}

function App() {
  const [tab, setTab] = useState('counter');

  return h('div', null,
    h(Navbar, {
      brand: 'Demo App',
      items: [{ label: 'Home', href: '#', active: true }],
    }),
    h('div', { style: { padding: '24px', maxWidth: 480, margin: '0 auto' } },
      h(Tabs, {
        value: tab,
        onChange: (v) => setTab(v),
        items: [
          { value: 'counter', label: 'Counter' },
          { value: 'form',    label: 'Form' },
        ],
      }),
      h(TabPanel, { id: 'counter', activeId: tab }, h(CounterTab)),
      h(TabPanel, { id: 'form',    activeId: tab }, h(FormTab)),
    ),
  );
}

render(App, document.getElementById('app'));
```

---

## 14. Complete multi-file app (domain-componentized)

A landing page split across `data.js` + two components + paired CSS.
This is the structure to use for any real app.

**`index.html`**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="./styles.css">
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

**`data.js`** — all static data, UPPER_CASE exports
```js
export const PLANS = [
  { id: 'free',  name: 'Free', price: 0,  features: ['1 project', 'Basic support'] },
  { id: 'pro',   name: 'Pro',  price: 49, features: ['Unlimited', 'Priority support'] },
];

export const NAV_LINKS = [
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];
```

**`components/Navbar.js`** — receives data as props, uses prefix `a-`
```js
import { h, useState } from '/dist/nexa.js';

export function Navbar({ links }) {
  return h('header', { className: 'a-navbar' },
    h('span', { className: 'a-brand' }, 'My App'),
    h('nav', null,
      links.map((l) => h('a', { key: l.href, href: l.href, className: 'a-nav-link' }, l.label))
    ),
  );
}
```

**`components/Navbar.css`** — paired, imported by `styles.css`
```css
.a-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--a-surface);
  border-bottom: 1px solid var(--a-border);
}
.a-brand   { font-weight: 700; font-size: 1.25rem; }
.a-nav-link { color: var(--a-text); text-decoration: none; margin-left: 1.5rem; }
```

**`components/Pricing.js`** — maps over props data
```js
import { h } from '/dist/nexa.js';

export function Pricing({ plans }) {
  return h('section', { className: 'a-pricing', id: 'pricing' },
    h('h2', { className: 'a-pricing-title' }, 'Plans'),
    h('div', { className: 'a-pricing-grid' },
      plans.map((plan) =>
        h('div', { key: plan.id, className: 'a-plan-card' },
          h('h3', null, plan.name),
          h('p', { className: 'a-plan-price' }, plan.price === 0 ? 'Free' : `$${plan.price}/mo`),
          h('ul', null,
            plan.features.map((f) => h('li', { key: f }, f))
          ),
          h('a', { className: 'a-plan-cta', href: '#contact' }, 'Get started'),
        )
      ),
    ),
  );
}
```

**`components/Pricing.css`** — paired CSS
```css
.a-pricing       { padding: 5rem 1.5rem; text-align: center; }
.a-pricing-title { font-size: 2rem; margin-bottom: 2.5rem; }
.a-pricing-grid  { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; max-width: 800px; margin: 0 auto; }
.a-plan-card     { background: var(--a-surface); border: 1px solid var(--a-border); border-radius: 12px; padding: 2rem; }
.a-plan-price    { font-size: 1.75rem; font-weight: 700; color: var(--a-accent); margin: 0.5rem 0 1.5rem; }
.a-plan-cta      { display: inline-block; margin-top: 1.5rem; padding: 0.6rem 1.5rem; background: var(--a-accent); color: #fff; border-radius: 6px; text-decoration: none; }
```

**`styles.css`** — central entry point, collects all component CSS
```css
@import './components/Navbar.css';
@import './components/Pricing.css';

:root {
  --a-bg:      #f8fafc;
  --a-surface: #ffffff;
  --a-text:    #0f172a;
  --a-border:  #e2e8f0;
  --a-accent:  #4f46e5;
}

* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: var(--a-bg); color: var(--a-text); }

.a-page { min-height: 100vh; }
```

**`app.js`** — orchestrator: imports data + components, calls render
```js
import { h, render } from '/dist/nexa.js';
import { NAV_LINKS, PLANS } from './data.js';
import { Navbar }  from './components/Navbar.js';
import { Pricing } from './components/Pricing.js';

function App() {
  return h('div', { className: 'a-page' },
    h(Navbar,  { links: NAV_LINKS }),
    h('main', null,
      h(Pricing, { plans: PLANS }),
    ),
  );
}

render(App, document.getElementById('app'));
```

---

## 15. Quick gotcha checklist

Before submitting any Nexa code, verify:

**Nexa runtime rules**
- [ ] `render(App, container)` — function ref, not `h(App)`
- [ ] Context uses `ctx.provide(value, () => h(...))`, not a Provider component
- [ ] Every list has `key` props
- [ ] No hooks inside `if` / loops / nested functions
- [ ] Events are camelCase: `onClick`, `onChange`, `onInput`
- [ ] CSS classes use `className`, not `class`
- [ ] `for` attribute uses `htmlFor`
- [ ] aria-* attributes use camelCase: `ariaLabel`, `ariaHidden`, etc.
- [ ] aria-* boolean-ish values are the string `"true"`/`"false"`, not a JS boolean
- [ ] Style is a camelCase object: `{ fontSize: '1rem' }` not `{ 'font-size': '1rem' }`
- [ ] `useEffect` cleanup returns a function (not a Promise)
- [ ] Conditional rendering uses `&&` or ternary — no returning `undefined` without `null`

**Project structure (multi-section apps)**
- [ ] Each visual section / feature is its own component file in `components/`
- [ ] Each component has a paired `.css` file with the same base name
- [ ] `styles.css` collects component CSS via `@import` — components don't import CSS
- [ ] Static/mock data lives in `data.js` as `UPPER_CASE` named exports
- [ ] `app.js` only imports, orchestrates top-level state, and calls `render()`
- [ ] No `src/` wrapper, no `pages/`, no `store/`, no `utils/` directories
- [ ] For 6+ components, group by domain inside `components/` (e.g. `components/auth/`, `components/dashboard/`) — never by type
- [ ] Domain hooks live inside their domain folder (`components/auth/useAuth.js`), not a top-level `hooks/`
- [ ] A domain needing shared state owns its own `createContext` next to its hook (`cart/CartContext.js`) — providers are composed by nesting `.provide()` calls in `app.js`, never via a separate component that takes `children` as a prop
- [ ] CSS class names use a project-wide prefix (e.g. `l-`, `tm-`, `a-`) not `m-*`
