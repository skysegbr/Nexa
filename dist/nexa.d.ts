/**
 * Type declarations for /dist/nexa.js
 *
 * Generated from the real runtime source — every signature here matches an
 * actual `export function` or `export const` in nexa.js.
 */

// ── Core types ─────────────────────────────────────────────────────────────

/** The unique symbol used as the Fragment type in h(). */
export declare const Fragment: unique symbol;

/** Mutable ref object — the same shape that useRef() returns. */
export interface Ref<T = unknown> {
  current: T;
}

/**
 * A virtual DOM node returned by h() or a Nexa component.
 *
 * Nexa evaluates h(Component, props) eagerly — the component function runs
 * immediately and its return value (a VNode) is inlined into the parent
 * tree. Plain DOM vnodes carry type + props; components produce whatever
 * their function body returns.
 */
export type VNode =
  | { type: string | typeof Fragment | ((...args: unknown[]) => VNode); props: Record<string, unknown> }
  | VNode[]
  | string
  | number
  | boolean
  | null
  | undefined;

/** Any Nexa component function. */
export type Component<P extends Record<string, unknown> = Record<string, unknown>> = (
  props: P,
) => VNode;

// ── h ─────────────────────────────────────────────────────────────────────

/**
 * Create a virtual DOM node.
 *
 * - String `type` → plain DOM element.
 * - Function `type` → calls the component **immediately** (eager evaluation).
 * - `Fragment` → flattens children with no wrapper element.
 *
 * @example
 * h('p', { className: 'intro' }, 'Hello world')
 * h(Button, { variant: 'contained', onClick: save }, 'Save')
 * h(Fragment, null, h('dt', null, 'Term'), h('dd', null, 'Definition'))
 */
export declare function h(
  type: string | typeof Fragment | Component<any>,
  props?: Record<string, unknown> | null,
  ...children: unknown[]
): VNode;

// ── render / unmount ───────────────────────────────────────────────────────

/**
 * Mount a component into a DOM container.
 *
 * Pass the **function reference** — never `h(App)`.
 *
 * @example
 * render(App, document.getElementById('app'));
 */
export declare function render(component: Component<any>, container: Element): void;

/**
 * Unmount the Nexa tree rooted at `container` and run all effect cleanups.
 */
export declare function unmount(container: Element): void;

// ── useState ───────────────────────────────────────────────────────────────

/**
 * Local state for the current component.
 *
 * Accepts an initial value or a lazy initializer function.
 * Returns `[currentValue, setter]`; the setter accepts a new value
 * or an updater function `(prev) => next`.
 */
export declare function useState<T>(
  initialValue: T | (() => T),
): [T, (nextValue: T | ((prev: T) => T)) => void];

// ── useReducer ─────────────────────────────────────────────────────────────

/** useReducer without init transform. */
export declare function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S,
): [S, (action: A) => void];

/** useReducer with an `init(initialArg)` transform. */
export declare function useReducer<S, A, I>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init: (arg: I) => S,
): [S, (action: A) => void];

// ── useRef ─────────────────────────────────────────────────────────────────

/**
 * Returns a mutable ref object whose `.current` is initialized to
 * `initialValue`. The same object persists for the component's lifetime.
 *
 * Attach to a DOM element via the `ref` prop:
 * @example
 * const el = useRef(null);
 * return h('div', { ref: el });
 */
export declare function useRef<T = undefined>(initialValue?: T): Ref<T>;
export declare function useRef<T>(initialValue: T | null): Ref<T | null>;

// ── useMemo ────────────────────────────────────────────────────────────────

/**
 * Memoizes the result of `factory` and recomputes only when `dependencies`
 * change (shallow `Object.is` comparison per element).
 * Omit `dependencies` to recompute every render (identical to calling
 * `factory()` directly — rarely useful).
 */
export declare function useMemo<T>(factory: () => T, dependencies?: unknown[]): T;

// ── useCallback ────────────────────────────────────────────────────────────

/**
 * Returns a stable reference to `callback` that only changes when
 * `dependencies` change — equivalent to `useMemo(() => callback, deps)`.
 */
export declare function useCallback<T extends (...args: any[]) => unknown>(
  callback: T,
  dependencies?: unknown[],
): T;

// ── useEffect ──────────────────────────────────────────────────────────────

/**
 * Run a side effect after the render is committed to the DOM.
 * Return a cleanup function to cancel subscriptions / timers.
 *
 * - No `dependencies` → runs after every render.
 * - Empty array `[]` → runs once on mount.
 * - Array with values → runs when any value changes (shallow comparison).
 */
export declare function useEffect(
  effect: () => void | (() => void),
  dependencies?: unknown[],
): void;

// ── useErrorBoundary ───────────────────────────────────────────────────────

/**
 * Wraps a risky subtree so render errors don't crash the whole app.
 *
 * `guard(fn)` calls `fn()` inside a try/catch; on error it latches the error
 * into state (causing a re-render that shows fallback UI) and returns null
 * until `reset()` is called.
 *
 * @example
 * const [error, reset, guard] = useErrorBoundary();
 * if (error) return h('p', null, 'Something went wrong');
 * return guard(() => h(RiskyComponent, props));
 */
export declare function useErrorBoundary(): [
  error: unknown,
  reset: () => void,
  guard: (render: () => VNode) => VNode,
];

// ── memo ───────────────────────────────────────────────────────────────────

/**
 * Wraps a component to skip re-renders when props (and no descendant state)
 * have changed. Uses shallow `Object.is` per-key comparison by default;
 * pass a custom `compare(prev, next) → boolean` (true = equal = skip) to
 * override.
 *
 * @example
 * const HeavyRow = memo(function HeavyRow({ label, value }) { ... });
 * const HeavyRow = memo(Row, (a, b) => a.id === b.id);
 */
export declare function memo<P extends Record<string, unknown>>(
  component: Component<P>,
  compare?: (prevProps: P, nextProps: P) => boolean,
): Component<P>;

// ── createPortal ───────────────────────────────────────────────────────────

/**
 * Renders `children` into `domNode` instead of the current parent.
 * Useful for modals, tooltips, and dropdowns that must escape
 * `overflow:hidden` or z-index stacking contexts.
 *
 * @example
 * return createPortal(h(Modal, { onClose }), document.body);
 */
export declare function createPortal(children: VNode, domNode: Element): VNode;

// ── createLazy ─────────────────────────────────────────────────────────────

/**
 * Lazily loads a component via a dynamic `import()`.
 * Shows `fallback` (default `null`) while loading.
 * The returned component also accepts a per-use `fallback` prop.
 *
 * @example
 * const Chart = createLazy(() => import('./components/Chart.js'));
 * const Chart = createLazy(() => import('./Chart.js'), h(Spinner, null));
 */
export declare function createLazy<P extends Record<string, unknown>>(
  loader: () => Promise<{ default: Component<P> } | Component<P>>,
  fallback?: VNode,
): Component<P & { fallback?: VNode }>;

// ── loadCSS ────────────────────────────────────────────────────────────────

/**
 * Loads a stylesheet once by injecting `<link rel="stylesheet">`; resolves
 * when it has loaded. Deduped by resolved URL — repeat calls return the same
 * promise, and a `<link>` already in the document counts as loaded. On error
 * the promise rejects and the entry is evicted so a later call can retry.
 * In a DOM-less runtime (renderToString on a server) it resolves immediately.
 *
 * @example
 * await loadCSS("/components/reports/reports.css");
 * await loadCSS(new URL("./reports.css", import.meta.url));
 */
export declare function loadCSS(href: string | URL): Promise<void>;

// ── useId ──────────────────────────────────────────────────────────────────

/**
 * Returns a stable, unique ID string scoped to the component instance.
 * Useful for linking `<label htmlFor>` with `<input id>`, `aria-labelledby`, etc.
 *
 * @example
 * const id = useId();
 * return h('div', null,
 *   h('label', { htmlFor: id }, 'Name'),
 *   h('input', { id }),
 * );
 */
export declare function useId(): string;

// ── useForm ────────────────────────────────────────────────────────────────

/** Props returned by `field(name)` ready to spread onto an input/select/textarea. */
export interface FieldProps {
  name: string;
  type?: string;
  value?: string;
  checked?: boolean;
  /** Error message for this field — shown only after the field was touched. */
  error?: string;
  onBlur: (event: Event) => void;
  onInput?: (event: Event) => void;
  onChange?: (event: Event) => void;
  [key: string]: unknown;
}

/** Submit-time helpers passed as the second argument to `onSubmit`. */
export interface FormHelpers<V extends Record<string, unknown>> {
  event: Event | null;
  errors: Partial<Record<keyof V, string>>;
  field: (name: keyof V & string, options?: Record<string, unknown>) => FieldProps;
  reset: (nextValues?: V) => void;
  serialize: () => V;
  setErrors: (errors: Partial<Record<keyof V, string>>) => void;
  setFieldError: (name: keyof V & string, message: string) => void;
  setFieldTouched: (name: keyof V & string, value?: boolean) => void;
  setValue: (name: keyof V & string, value: unknown) => void;
  setValues: (nextValues: Partial<V> | ((prev: V) => Partial<V>)) => void;
  touched: Partial<Record<keyof V, boolean>>;
  values: V;
}

export interface UseFormOptions<V extends Record<string, unknown>> {
  initialValues?: V;
  validate?: (values: V) => Partial<Record<keyof V, string>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: V, helpers: FormHelpers<V>) => void | Promise<void>;
}

export interface UseFormReturn<V extends Record<string, unknown>> {
  dirty: boolean;
  errors: Partial<Record<keyof V, string>>;
  field: (name: keyof V & string, options?: Record<string, unknown>) => FieldProps;
  handleSubmit: (
    submit?: (values: V, helpers: FormHelpers<V>) => void | Promise<void>,
  ) => (event: Event | null) => Promise<boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  reset: (nextValues?: V) => void;
  serialize: () => V;
  setErrors: (errors: Partial<Record<keyof V, string>>) => void;
  setFieldError: (name: keyof V & string, message: string) => void;
  setFieldTouched: (name: keyof V & string, value?: boolean) => void;
  setTouched: (touched: Partial<Record<keyof V, boolean>>) => void;
  setValue: (name: keyof V & string, value: unknown) => void;
  setValues: (
    nextValues: Partial<V> | ((prev: V) => Partial<V>),
  ) => void;
  submitCount: number;
  touched: Partial<Record<keyof V, boolean>>;
  validateForm: (values?: V) => Partial<Record<keyof V, string>>;
  values: V;
}

/**
 * Full-featured form state manager: values, errors, touched tracking,
 * validation, and submit handling.
 *
 * @example
 * const { values, errors, field, handleSubmit } = useForm({
 *   initialValues: { email: '' },
 *   validate: ({ email }) => email ? {} : { email: 'Required' },
 *   onSubmit: (values) => api.signIn(values),
 * });
 * return h('form', { onSubmit: handleSubmit() },
 *   h('input', field('email')),
 *   errors.email && h('p', null, errors.email),
 * );
 */
export declare function useForm<
  V extends Record<string, unknown> = Record<string, unknown>,
>(options?: UseFormOptions<V>): UseFormReturn<V>;

// ── createContext / useContext ─────────────────────────────────────────────

/**
 * Context object created by `createContext()`.
 * Use `ctx.provide(value, () => h(Child, null))` instead of a
 * `<Context.Provider>` component — Nexa evaluates children eagerly.
 */
export interface NexaContext<T> {
  /**
   * Makes `value` available to `useContext(ctx)` calls inside `renderFn`.
   * Returns whatever `renderFn()` returns.
   *
   * @example
   * return ThemeCtx.provide(theme, () => h(App, null));
   */
  provide<R>(value: T, renderFn: () => R): R;
  /** Current context value (top of the internal stack). */
  readonly _value: T;
}

/**
 * Create a context with a default value.
 * Call `.provide(value, fn)` on the returned context to scope a new value.
 *
 * @example
 * const ThemeCtx = createContext('light');
 */
export declare function createContext<T>(defaultValue: T): NexaContext<T>;

/**
 * Consume the nearest `.provide()` value for `context`.
 * Must be called unconditionally at the top of a component.
 */
export declare function useContext<T>(context: NexaContext<T>): T;

// ── Mobile hooks ───────────────────────────────────────────────────────────

/** Directional swipe delta passed to onSwipe* callbacks. */
export interface SwipeDelta {
  dx: number;
  dy: number;
}

/**
 * Attach touch-swipe gesture listeners to `ref.current`.
 * Fires the matching callback when the gesture exceeds `threshold` px.
 * Safe to call unconditionally — silently skips if the element hasn't mounted yet.
 */
export declare function useSwipe(
  ref: Ref<Element | null>,
  options?: {
    onSwipeLeft?: (delta: SwipeDelta) => void;
    onSwipeRight?: (delta: SwipeDelta) => void;
    onSwipeUp?: (delta: SwipeDelta) => void;
    onSwipeDown?: (delta: SwipeDelta) => void;
    threshold?: number;
  },
): void;

/**
 * Fire `onLongPress` after the pointer/touch has been held for `delay` ms.
 * Cancels on release, move, or mouseleave.
 */
export declare function useLongPress(
  ref: Ref<Element | null>,
  options?: {
    onLongPress?: (event: Event) => void;
    delay?: number;
  },
): void;

/** Reactively tracks `navigator.onLine`. Returns `true` when online. */
export declare function useNetworkStatus(): boolean;

/** Reactively tracks the screen orientation. */
export declare function useOrientation(): "landscape" | "portrait";

/** Returns a function that calls `navigator.vibrate()` when available. */
export declare function useVibrate(): (pattern?: number | number[]) => void;

// ── useLocalStorage ────────────────────────────────────────────────────────

/**
 * Persists state in `localStorage` under `key`.
 * Falls back to `initialValue` when the key is absent or the stored JSON
 * cannot be parsed.
 */
export declare function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void];

// ── useToast ───────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  variant: "success" | "danger" | "warning" | "info";
  message: string;
  title?: string;
  duration: number;
}

export interface ToastActions {
  success: (message: string, options?: { title?: string; duration?: number }) => string;
  error: (message: string, options?: { title?: string; duration?: number }) => string;
  warning: (message: string, options?: { title?: string; duration?: number }) => string;
  info: (message: string, options?: { title?: string; duration?: number }) => string;
  dismiss: (id: string) => void;
}

/**
 * In-component toast queue. Pair with `<ToastStack>` to render the toasts.
 *
 * @example
 * const { toasts, toast } = useToast();
 * toast.success('Saved!');
 * return h(ToastStack, { toasts, onClose: (id) => dismiss(id) });
 */
export declare function useToast(): {
  toasts: ToastItem[];
  toast: ToastActions;
  dismiss: (id: string) => void;
};

// ── useRouter ─────────────────────────────────────────────────────────────

/**
 * Client-side router.
 *
 * - `mode: "hash"` (default) — `#/path?query`; works on any static host.
 * - `mode: "history"` — clean URLs via the History API; requires server-side
 *   SPA fallback (all routes must serve `index.html`).
 *
 * Returns `{ path, params, navigate }`.
 *
 * @example
 * const { path, navigate } = useRouter();
 * return path === '/about' ? h(About, null) : h(Home, null);
 */
export declare function useRouter(options?: { mode?: "hash" | "history" }): {
  path: string;
  params: Record<string, string>;
  navigate: (to: string) => void;
};

// ── matchPath / useRoutes ──────────────────────────────────────────────────

/** Result of a successful matchPath(): captured params plus any remainder. */
export interface RouteMatch {
  params: Record<string, string>;
  rest: string;
}

/**
 * Segment-based path matcher.
 *
 * - `:name` captures one URL-decoded segment into `params`.
 * - a trailing `*` segment captures the remaining segments into `params["*"]`.
 * - `{ end: false }` prefix-matches and returns the remainder in `rest`.
 *
 * @example
 * matchPath("/users/:id", "/users/42")            // { params: { id: "42" }, rest: "" }
 * matchPath("/users", "/users/42", { end: false }) // { params: {}, rest: "42" }
 */
export declare function matchPath(
  pattern: string,
  path: string,
  options?: { end?: boolean },
): RouteMatch | null;

/** A single (possibly nested) route definition for useRoutes(). */
export interface RouteObject {
  /** Path pattern relative to the parent route (supports `:param` and `*`). */
  path?: string;
  /** Matches the parent's exact path (empty remainder). */
  index?: boolean;
  /** Component rendered with `{ params, outlet }`. */
  component?: Component<{ params: Record<string, string>; outlet: VNode }>;
  /** Static vnode, or a builder called with `(params, outlet)`. */
  element?: VNode | ((params: Record<string, string>, outlet: VNode) => VNode);
  /** Dynamic import loader; resolved via createLazy and cached per route. */
  lazy?: () => Promise<{ default: Component } | Component>;
  /**
   * Stylesheet href(s) loaded via loadCSS() on first activation; the fallback
   * holds until the CSS (and lazy JS, if any) are ready.
   */
  css?: string | URL | Array<string | URL>;
  /** Fallback shown while a `lazy` or `css` route loads. */
  fallback?: VNode;
  /** Nested routes; the parent renders its matched child as `outlet`. */
  children?: RouteObject[];
}

/**
 * Resolves the current router path against a nested route config and returns
 * the element to render. First matching sibling wins.
 *
 * @example
 * const routes = [
 *   { path: "/", element: h(Home, null) },
 *   { path: "/users/:id", component: UserLayout, children: [
 *     { index: true, component: Profile },
 *     { path: "/posts/:postId", lazy: () => import("./Post.js") },
 *   ]},
 * ];
 * function App() { return useRoutes(routes, { notFound: h(NotFound, null) }); }
 */
export declare function useRoutes(
  routes: RouteObject[],
  options?: { mode?: "hash" | "history"; notFound?: VNode },
): VNode;

// ── useTranslation ─────────────────────────────────────────────────────────

/**
 * Minimal i18n: looks up `key` in `dict` and interpolates `{variable}`
 * placeholders from `vars`. Returns `key` verbatim when not found.
 *
 * @example
 * const { t } = useTranslation({ greeting: 'Hello, {name}!' });
 * t('greeting', { name: 'Alice' }); // 'Hello, Alice!'
 */
export declare function useTranslation(dict?: Record<string, string>): {
  t: (key: string, vars?: Record<string, unknown>) => string;
};

// ── useContextMenu ─────────────────────────────────────────────────────────

/**
 * Manages a context-menu position state.
 * Pair with the `<ContextMenu>` component.
 *
 * @example
 * const { menu, openMenu, closeMenu } = useContextMenu();
 * return h('div', { onContextMenu: openMenu },
 *   h(ContextMenu, { ...menu, items, onClose: closeMenu }),
 * );
 */
export declare function useContextMenu(): {
  menu: { open: boolean; x: number; y: number };
  openMenu: (event: MouseEvent) => void;
  closeMenu: () => void;
};

// ── useTheme ───────────────────────────────────────────────────────────────

/**
 * Reads and sets the `data-theme` attribute on `<html>`.
 * Persists the choice in `localStorage`; multiple instances stay in sync via
 * a `nexa:themechange` custom event.
 */
export declare function useTheme(): {
  theme: "light" | "dark";
  setTheme: (next: "light" | "dark") => void;
  toggleTheme: () => void;
};

// ── usePalette ─────────────────────────────────────────────────────────────

export type Palette = "default" | "violet" | "rose" | "blue" | "amber" | "emerald" | "custom";

/**
 * Switches the accent color palette via `data-palette` on `<html>`.
 * `setCustomColor(hex)` sets `--m-primary` directly and switches to the
 * `"custom"` palette.
 */
export declare function usePalette(): {
  palette: Palette;
  palettes: Palette[];
  setPalette: (next: Palette) => void;
  customColor: string | null;
  setCustomColor: (hex: string) => void;
};

// ── useDesign ──────────────────────────────────────────────────────────────

export type Design = "nexa" | "bootstrap";

/**
 * Switches the overall visual design via `data-design` on `<html>`.
 * `"bootstrap"` requires `dist/nexa-bootstrap.css` to also be loaded.
 */
export declare function useDesign(): {
  design: Design;
  designs: Design[];
  setDesign: (next: Design) => void;
};

// ── useHistory ─────────────────────────────────────────────────────────────

/**
 * Wraps a state value with undo/redo history up to `limit` entries.
 *
 * @example
 * const { state, set, undo, redo, canUndo, canRedo } = useHistory('');
 */
export declare function useHistory<T>(
  initial: T | (() => T),
  options?: { limit?: number },
): {
  state: T;
  set: (next: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

// ── useFetch ───────────────────────────────────────────────────────────────

/**
 * Fetch JSON from `url`; re-fetches whenever `url` changes.
 * Pass `null`/`undefined` to skip fetching entirely.
 * `options` is forwarded to `fetch()` (stringified once to prevent
 * infinite-loop re-renders caused by object reference churn).
 *
 * @example
 * const { data, loading, error, refetch } = useFetch<User[]>('/api/users');
 */
export declare function useFetch<T = unknown>(
  url: string | null | undefined,
  options?: RequestInit,
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

// ── useDebounce ────────────────────────────────────────────────────────────

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of silence.
 *
 * @example
 * const query = useDebounce(inputValue, 300);
 * useEffect(() => { search(query); }, [query]);
 */
export declare function useDebounce<T>(value: T, delay: number): T;

// ── useThrottle ────────────────────────────────────────────────────────────

/**
 * Returns a throttled version of `fn` that fires at most once per `delay` ms.
 * The trailing call is always executed so the last invocation is never dropped.
 *
 * @example
 * const onScroll = useThrottle((e) => setScrollY(e.target.scrollTop), 100);
 */
export declare function useThrottle<T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number,
): T;

// ── useMediaQuery ──────────────────────────────────────────────────────────

/**
 * Returns `true` while the CSS media query matches; updates reactively.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export declare function useMediaQuery(query: string): boolean;

// ── useIntersectionObserver ────────────────────────────────────────────────

/**
 * Observes when `ref.current` enters or leaves the viewport (or a custom
 * `root`). Returns the latest `IntersectionObserverEntry` (or `null` before
 * the first observation).
 *
 * @example
 * const entry = useIntersectionObserver(ref, { once: true });
 * return h('img', { ref, src: entry?.isIntersecting ? realSrc : null });
 */
export declare function useIntersectionObserver(
  ref: Ref<Element | null>,
  options?: {
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
    once?: boolean;
  },
): IntersectionObserverEntry | null;

// ── useWebSocket ───────────────────────────────────────────────────────────

/**
 * Manages a WebSocket connection with automatic reconnection.
 * `send(data)` serializes objects to JSON automatically.
 *
 * @example
 * const { status, lastMessage, send } = useWebSocket('wss://api.example.com/ws');
 */
export declare function useWebSocket(
  url: string,
  options?: {
    onMessage?: (event: MessageEvent) => void;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    /** Auto-reconnect on close — default `true`. */
    reconnect?: boolean;
    /** Delay in ms between reconnect attempts — default `3000`. */
    reconnectDelay?: number;
  },
): {
  status: "connecting" | "open" | "closed" | "error";
  lastMessage: string | null;
  send: (data: string | object) => void;
};

// ── useVirtualList ─────────────────────────────────────────────────────────

/** A single virtualized row ready to render. */
export interface VirtualItem<T> {
  item: T;
  index: number;
  offsetTop: number;
}

/**
 * Renders only the visible slice of a large list.
 * All items must have the same fixed `itemHeight` (px).
 *
 * @example
 * const { containerRef, virtualItems, totalHeight } = useVirtualList(rows, { itemHeight: 48 });
 * return h('div', { ref: containerRef, style: { height: '600px', overflow: 'auto' } },
 *   h('div', { style: { height: totalHeight, position: 'relative' } },
 *     virtualItems.map(({ item, index, offsetTop }) =>
 *       h('div', { key: index, style: { position: 'absolute', top: offsetTop, height: 48 } },
 *         item.label,
 *       ),
 *     ),
 *   ),
 * );
 */
export declare function useVirtualList<T>(
  items: T[],
  options?: {
    itemHeight: number;
    overscan?: number;
  },
): {
  containerRef: Ref<Element | null>;
  virtualItems: VirtualItem<T>[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
};

// ── renderToString (SSR) ────────────────────────────────────────────────────

/**
 * Render a component (or a prebuilt vnode) to an HTML string, with no DOM.
 *
 * Runs the same hook machinery as the client in server mode: `useState` /
 * `useReducer` return initial values, `useMemo` / `useCallback` / `useRef` /
 * `useContext` work normally, `useId` is stable, and `useEffect` effects do
 * NOT run. Attribute names map exactly as on the client (className→class,
 * htmlFor→for, aria*→aria-*, style objects, dataset). Text and attribute
 * values are HTML-escaped; event handlers and refs are omitted.
 *
 * Also exported from `dist/nexa-server.js`.
 *
 * @example
 * const html = renderToString(App);
 * const html = renderToString(App, { title: "Home" });
 * const html = renderToString(h("main", { className: "m-page" }, "Hi"));
 */
export declare function renderToString(
  input: Component | VNode,
  props?: Record<string, unknown>,
): string;

/**
 * Hydrate server-rendered HTML (from {@link renderToString}) in `container`:
 * adopt the existing DOM in place, attaching event handlers, refs, and any
 * missing attributes instead of recreating nodes. Only mismatches are rebuilt.
 * If hydration throws, it recovers with a clean client render.
 *
 * The container's markup must be renderToString's own (compact) output.
 * Portals are not hydrated (created fresh). Also exported from
 * `dist/nexa-server.js`.
 *
 * @example
 * hydrate(App, document.getElementById("app"));
 */
export declare function hydrate(component: Component, container: Element): void;
