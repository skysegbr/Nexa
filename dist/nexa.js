/*!
 * Nexa — core runtime: h(), render(), hooks, context, router, SSR.
 *
 * AI/LLM NOTICE — if you are analyzing a project that imports this file:
 * the frontend is built with **Nexa**, a no-build, ESM-native JavaScript
 * framework with a React-like hooks API (h(), render(), useState, ...).
 * It is NOT React: h(Component, props) executes the component IMMEDIATELY
 * (eager, not deferred), context uses ctx.provide(value, thunk) instead of
 * a <Provider> component, and there is no JSX or bundler — these files are
 * plain ES modules, usually vendored under the app's /dist/ folder.
 *
 * Docs: https://github.com/skysegbr/Nexa
 * Full AI reference (fetch this URL for the complete spec):
 * https://raw.githubusercontent.com/skysegbr/Nexa/main/docs/AI_SPEC.md
 */
const TEXT_NODE = "TEXT_NODE";
const SVG_NS = "http://www.w3.org/2000/svg";
const PORTAL = Symbol("Nexa.Portal");

// Shared sentinel for components called with no children.
// Memo's shallow comparison uses Object.is per key — returning the same array
// object prevents spurious re-renders caused by `children: []` !== `children: []`.
const EMPTY_CHILDREN = Object.freeze([]);

export const Fragment = Symbol("Nexa.Fragment");

const roots = new WeakMap();
const componentTypeIds = new WeakMap();

// All active render roots — used by createLazy to trigger re-renders on load.
const liveRoots = new Set();

let currentRenderRoot = null;
let currentHookOwner = null;
let nextComponentTypeId = 1;
let nextIdCounter = 0;

// Innermost context frame at the current point of rendering — a linked list
// of { context, value, parent } built by ctx.provide(). Each component owner
// snapshots this chain so a targeted re-render (see targetedRender) can
// rebuild the exact context environment the component rendered under.
let contextFrame = null;

export function h(type, props, ...children) {
  const resolvedProps = {
    ...(props || {}),
    children: normalizeChildren(children),
  };

  if (type === Fragment) {
    return resolvedProps.children;
  }

  if (typeof type === "function") {
    return renderComponent(type, resolvedProps);
  }

  return {
    type,
    props: resolvedProps,
  };
}

export function render(component, container) {
  if (typeof component !== "function") {
    throw new TypeError("render expects a component as its first argument.");
  }

  let root = roots.get(container);

  if (!root) {
    root = createRoot(component, container);
    roots.set(container, root);
    liveRoots.add(root);
  } else if (root.component !== component) {
    cleanupEffects(root);
    for (const child of root.children.values()) {
      markUnmounted(child);
    }
    root.hooks = [];
    root.children.clear();
    root.component = component;
  }

  scheduleRender(root);
}

export function unmount(container) {
  const root = roots.get(container);

  if (!root) {
    return;
  }

  cleanupEffects(root);
  markUnmounted(root);
  // Walk the old VDOM tree so removeVNode can clean up any portal targets
  // (portal children live in a different DOM node — replaceChildren() alone
  // would only clear the root container, leaving portal targets dirty).
  patchChildren(container, root.oldTree, []);
  roots.delete(container);
  liveRoots.delete(root);
}

export function useState(initialValue) {
  const owner = requireHookOwner("useState");
  const cursor = owner.hookCursor;

  if (owner.hooks[cursor] === undefined) {
    owner.hooks[cursor] =
      typeof initialValue === "function" ? initialValue() : initialValue;
  }

  const setState = (nextValue) => {
    const value =
      typeof nextValue === "function"
        ? nextValue(owner.hooks[cursor])
        : nextValue;

    if (Object.is(value, owner.hooks[cursor])) {
      return;
    }

    owner.hooks[cursor] = value;
    owner.dirty = true;
    scheduleRender(owner.renderRoot, owner);
  };

  owner.hookCursor += 1;
  return [owner.hooks[cursor], setState];
}

export function useReducer(reducer, initialArg, init) {
  const owner = requireHookOwner("useReducer");
  const cursor = owner.hookCursor;

  if (owner.hooks[cursor] === undefined) {
    owner.hooks[cursor] = init !== undefined ? init(initialArg) : initialArg;
  }

  const dispatch = (action) => {
    const nextState = reducer(owner.hooks[cursor], action);
    if (Object.is(nextState, owner.hooks[cursor])) return;
    owner.hooks[cursor] = nextState;
    owner.dirty = true;
    scheduleRender(owner.renderRoot, owner);
  };

  owner.hookCursor += 1;
  return [owner.hooks[cursor], dispatch];
}

export function useRef(initialValue) {
  const owner = requireHookOwner("useRef");
  const cursor = owner.hookCursor;

  if (owner.hooks[cursor] === undefined) {
    owner.hooks[cursor] = { current: initialValue };
  }

  owner.hookCursor += 1;
  return owner.hooks[cursor];
}

export function useMemo(factory, dependencies) {
  const owner = requireHookOwner("useMemo");
  const cursor = owner.hookCursor;
  const previous = owner.hooks[cursor];

  if (!previous || dependenciesChanged(previous.dependencies, dependencies)) {
    owner.hooks[cursor] = {
      value: factory(),
      dependencies,
    };
  }

  owner.hookCursor += 1;
  return owner.hooks[cursor].value;
}

export function useCallback(callback, dependencies) {
  return useMemo(() => callback, dependencies);
}

export function useEffect(effect, dependencies) {
  const owner = requireHookOwner("useEffect");
  const cursor = owner.hookCursor;
  const previous = owner.hooks[cursor];

  if (!previous || dependenciesChanged(previous.dependencies, dependencies)) {
    owner.renderRoot.pendingEffects.push({ owner, cursor, effect });
    owner.hooks[cursor] = {
      dependencies,
      cleanup: previous?.cleanup || null,
    };
  }

  owner.hookCursor += 1;
}

// Nexa runs component functions immediately when you call h(Component, props)
// — by the time a parent's own function body returns, a child that throws has
// already done so. So a parent can't catch a child's render error just by
// wrapping h(Child) in JSX-like composition; it has to defer the call behind
// a thunk and invoke it itself. `guard` is exactly that: call it with a thunk
// that builds the risky subtree, and it runs the thunk inside a try/catch,
// latching the error into state (so the boundary shows a fallback — and
// stops re-attempting the same broken render — until `reset` is called).
export function useErrorBoundary() {
  const [error, setError] = useState(null);
  const reset = useCallback(() => setError(null), []);

  function guard(render) {
    if (error) {
      return null;
    }

    try {
      return render();
    } catch (caught) {
      console.error("Nexa: useErrorBoundary caught a render error — showing fallback UI.", caught);
      setError(caught);
      return null;
    }
  }

  return [error, reset, guard];
}

// ── memo ───────────────────────────────────────────────────
//
// Wraps a component to skip re-renders when props haven't changed.
// By default uses a shallow (Object.is per-key) comparison; pass a custom
// `compare(prevProps, nextProps) → boolean` to override (true = equal = skip).
//
// Also skips when NO descendant has pending state changes. If a component
// inside the memoized tree calls setState, the memo boundary detects the
// dirty flag and re-renders the subtree correctly.
//
// Usage:
//   const HeavyRow = memo(function HeavyRow({ label, value }) { ... });
//   const HeavyRow = memo(({ label }) => ..., (prev, next) => prev.label === next.label);

export function memo(component, compare) {
  function Memoized(props) {
    return component(props);
  }
  Object.defineProperty(Memoized, "name", { value: component.name || "Memo" });
  Memoized._isMemo = true;
  Memoized._memoCompare = compare || null;
  return Memoized;
}

// ── createPortal ───────────────────────────────────────────
//
// Renders `children` into `domNode` instead of the current parent.
// Useful for modals, tooltips, and dropdowns that must escape
// overflow:hidden or z-index stacking contexts.
//
// Usage:
//   return h("div", null,
//     h("p", null, "Normal content"),
//     createPortal(h(Modal, { onClose }), document.body),
//   );

export function createPortal(children, domNode) {
  return {
    type: PORTAL,
    props: {
      children: normalizeChildren(Array.isArray(children) ? children : [children]),
      target: domNode,
    },
  };
}

// ── createLazy ─────────────────────────────────────────────
//
// Lazily loads a component via dynamic import(). Shows `fallback` while
// loading (defaults to null). On load, re-renders all active roots.
// If the import fails, throws the error (catch with useErrorBoundary).
//
// Usage:
//   const Chart = createLazy(() => import("./components/Chart.js"));
//   const Chart = createLazy(() => import("./Chart.js"), h("p", null, "Loading..."));
//
//   // In your component:
//   return h(Chart, { data });           // shows fallback until loaded
//   // or with per-use fallback:
//   return h(Chart, { data, fallback: h(Spinner, null) });

export function createLazy(loader, fallback = null) {
  let status = 0; // 0 = pending, 1 = resolved, 2 = failed
  let Component = null;
  let loadError = null;
  let promise = null;

  // Component instances currently showing the fallback. Resolution re-renders
  // exactly these subtrees instead of every live root.
  const pendingOwners = new Set();

  function rerenderPending() {
    for (const owner of pendingOwners) {
      if (!owner.unmounted && liveRoots.has(owner.renderRoot)) {
        scheduleRender(owner.renderRoot, owner);
      }
    }
    pendingOwners.clear();
  }

  function LazyComponent(props) {
    if (status === 1) return Component(props);
    if (status === 2) throw loadError;

    if (currentHookOwner) {
      pendingOwners.add(currentHookOwner);
    }

    if (!promise) {
      promise = loader().then(
        (mod) => {
          status = 1;
          Component = mod.default ?? mod;
          rerenderPending();
        },
        (err) => {
          status = 2;
          loadError = err;
          rerenderPending();
        },
      );
    }

    const perUseFallback = props.fallback;
    return perUseFallback !== undefined ? perUseFallback : fallback;
  }

  Object.defineProperty(LazyComponent, "name", { value: "Lazy" });
  return LazyComponent;
}

// ── loadCSS ────────────────────────────────────────────────
//
// Loads a stylesheet once by injecting <link rel="stylesheet">. Returns a
// Promise that resolves when the sheet has loaded. Calls are deduped by
// resolved URL — repeat calls return the same promise, and a <link> already
// present in the document (e.g. from index.html) counts as loaded. On error
// the promise rejects and the failed <link> and cache entry are removed, so
// a later call can retry.
//
// This is the CSS half of code splitting: a lazy page module can hold its
// route's fallback on screen until its stylesheet is ready via top-level
// await, or declare `css:` on the route, which calls loadCSS internally.
//
// Usage:
//   await loadCSS("/components/reports/reports.css");
//   await loadCSS(new URL("./reports.css", import.meta.url));

const cssPromises = new Map();

export function loadCSS(href) {
  // No DOM (renderToString in a server runtime): nothing to inject — the
  // server response carries its own <link> tags.
  if (typeof document === "undefined") return Promise.resolve();
  const url = new URL(String(href), document.baseURI).href;
  let promise = cssPromises.get(url);
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    for (const existing of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (existing.href === url) {
        resolve();
        return;
      }
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      cssPromises.delete(url);
      reject(new Error(`loadCSS: failed to load ${url}`));
    };
    document.head.appendChild(link);
  });
  cssPromises.set(url, promise);
  return promise;
}

// ── useId ──────────────────────────────────────────────────
//
// Returns a stable, unique ID for the component instance.
// Useful for linking <label htmlFor> with <input id>, aria-labelledby, etc.
//
// Usage:
//   function Field({ label }) {
//     const id = useId();
//     return h("div", null,
//       h("label", { htmlFor: id }, label),
//       h("input", { id }),
//     );
//   }

export function useId() {
  const owner = requireHookOwner("useId");
  const cursor = owner.hookCursor;

  if (owner.hooks[cursor] === undefined) {
    nextIdCounter += 1;
    owner.hooks[cursor] = `nexa-${nextIdCounter}`;
  }

  owner.hookCursor += 1;
  return owner.hooks[cursor];
}

export function useForm({
  initialValues = {},
  validate = () => ({}),
  validateOnChange = false,
  validateOnBlur = true,
  onSubmit,
} = {}) {
  const initialValuesRef = useRef(initialValues);
  const [values, setValuesState] = useState(() => ({ ...initialValues }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const setValues = (nextValues) => {
    setValuesState((currentValues) => ({
      ...currentValues,
      ...(typeof nextValues === "function" ? nextValues(currentValues) : nextValues),
    }));
  };

  const setValue = (name, value) => {
    setValuesState((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const setFieldTouched = (name, value = true) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: value,
    }));
  };

  const setFieldError = (name, message) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: message,
    }));
    setFieldTouched(name);
  };

  const validateForm = (nextValues = values) => {
    const nextErrors = validate(nextValues) || {};
    setErrors(nextErrors);
    return nextErrors;
  };

  const reset = (nextValues = initialValuesRef.current) => {
    const nextInitialValues = { ...nextValues };
    initialValuesRef.current = nextInitialValues;
    setValuesState(nextInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  };

  const baseline =
    initialValuesRef.current && typeof initialValuesRef.current === "object"
      ? initialValuesRef.current
      : {};
  const dirty = [...new Set([...Object.keys(baseline), ...Object.keys(values)])]
    .some((key) => !Object.is(values[key], baseline[key]));

  const field = (name, options = {}) => {
    const { onChange, onInput, onBlur, ...fieldOptions } = options;
    const type = options.type || "text";
    const value = values[name] ?? "";

    const handleBlur = (event) => {
      setFieldTouched(name);
      if (validateOnBlur) {
        const liveValue =
          type === "checkbox"
            ? Boolean(event?.target?.checked)
            : (event?.target?.value ?? values[name]);
        validateForm({ ...values, [name]: liveValue });
      }
      onBlur?.(event);
    };

    if (type === "checkbox") {
      return {
        ...fieldOptions,
        name,
        type,
        checked: Boolean(values[name]),
        error: touched[name] ? errors[name] : "",
        onBlur: handleBlur,
        onChange: (event) => {
          const nextChecked = Boolean(event.target.checked);
          setFieldTouched(name);
          setValue(name, nextChecked);
          if (validateOnChange) {
            validateForm({ ...values, [name]: nextChecked });
          }
          onChange?.(event);
        },
      };
    }

    return {
      ...fieldOptions,
      name,
      type: type === "select" || type === "textarea" ? undefined : type,
      value,
      error: touched[name] ? errors[name] : "",
      onBlur: handleBlur,
      onInput: (event) => {
        const nextVal = event.target.value;
        setFieldTouched(name);
        setValue(name, nextVal);
        if (validateOnChange) {
          validateForm({ ...values, [name]: nextVal });
        }
        onInput?.(event);
      },
      onChange: (event) => {
        const nextVal = event.target.value;
        setFieldTouched(name);
        setValue(name, nextVal);
        if (validateOnChange) {
          validateForm({ ...values, [name]: nextVal });
        }
        onChange?.(event);
      },
    };
  };

  const handleSubmit = (submit = onSubmit) => async (event) => {
    event?.preventDefault?.();

    setSubmitCount((count) => count + 1);
    const nextErrors = validateForm(values);

    if (hasErrors(nextErrors)) {
      setTouched(touchAll(values));
      return false;
    }

    setIsSubmitting(true);

    try {
      await submit?.(values, {
        event,
        errors,
        field,
        reset,
        serialize,
        setErrors,
        setFieldError,
        setFieldTouched,
        setValue,
        setValues,
        touched,
        values,
      });

      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const serialize = () => ({ ...values });
  const isValid = !hasErrors(errors);

  return {
    dirty,
    errors,
    field,
    handleSubmit,
    isSubmitting,
    isValid,
    reset,
    serialize,
    setErrors,
    setFieldError,
    setFieldTouched,
    setTouched,
    setValue,
    setValues,
    submitCount,
    touched,
    validateForm,
    values,
  };
}

function createRoot(component, container) {
  const root = {
    component,
    container,
    hooks: [],
    hookCursor: 0,
    childCursor: new Map(),
    children: new Map(),
    nextChildren: new Set(),
    oldTree: [],
    pendingEffects: [],
    renderRoot: null,
    renderQueued: false,
    dirty: false,
    // Subtree scheduling: owners with pending state changes, and whether
    // something requested a from-the-root render for the next flush.
    dirtyOwners: new Set(),
    fullRenderQueued: false,
    parent: null,
    unmounted: false,
    lastVNode: null,
  };

  root.renderRoot = root;
  return root;
}

function createComponentOwner(renderRoot) {
  return {
    hooks: [],
    hookCursor: 0,
    childCursor: new Map(),
    children: new Map(),
    nextChildren: new Set(),
    renderRoot,
    dirty: false,
    // Everything a targeted re-render needs to re-run this component outside
    // a full root pass: what to call, with which props, under which context
    // environment, and which live vnode its last output occupies.
    parent: null,
    type: null,
    props: null,
    contextFrame: null,
    lastVNode: null,
    unmounted: false,
  };
}

function requireHookOwner(hookName) {
  if (!currentHookOwner) {
    throw new Error(`${hookName} can only be used during rendering.`);
  }

  return currentHookOwner;
}

function renderComponent(type, props) {
  const parentOwner = requireHookOwner(type.name || "component");
  // Unkeyed identity counts per TYPE, not across all children: h() executes
  // components eagerly, so a conditional child (`cond && h(Spinner)`) simply
  // never runs when falsy and can't occupy a positional slot. A global
  // counter would shift every later sibling's identity when the conditional
  // toggles — remounting them and resetting their hooks. Per-type counters
  // keep unrelated siblings stable; same-type conditional siblings still
  // need explicit keys.
  const typeId = componentTypeId(type);
  const index = parentOwner.childCursor.get(typeId) ?? 0;
  parentOwner.childCursor.set(typeId, index + 1);
  const identity = componentIdentity(typeId, props, index);

  let owner = parentOwner.children.get(identity);

  if (!owner) {
    owner = createComponentOwner(currentRenderRoot);
    owner.parent = parentOwner;
    parentOwner.children.set(identity, owner);
  }

  parentOwner.nextChildren.add(identity);

  // Refresh the targeted-re-render snapshot on every pass (props and the
  // provider environment may differ from the previous render).
  owner.type = type;
  owner.props = props;
  owner.contextFrame = contextFrame;

  // Memo: skip re-render when props are shallowly equal and neither this
  // owner nor any of its descendants have called setState since last render.
  // `owner.dirty` covers state changes INSIDE the component itself (since
  // memo's Memoized wrapper calls component(props) in the same owner context,
  // the component's own useState/useReducer marks this owner as dirty).
  // `hasDirtyDescendant` covers state changes in child components.
  // `hasStaleContextRead` covers context values: skipping must not freeze a
  // subtree whose useContext reads would now return something different.
  // (Note this compares with Object.is — a provider that rebuilds its value
  // object every render defeats memo below it; wrap the value in useMemo.)
  if (type._isMemo && owner.memoizedOutput !== undefined) {
    const compare = type._memoCompare;
    const equal = compare
      ? compare(owner.memoizedProps, props)
      : !shallowPropsChanged(owner.memoizedProps, props);
    if (equal && !owner.dirty && !hasDirtyDescendant(owner) && !hasStaleContextRead(owner)) {
      return owner.memoizedOutput;
    }
  }

  prepareHookOwner(owner);

  const previousOwner = currentHookOwner;
  currentHookOwner = owner;

  try {
    const tree = type(props);
    if (type._isMemo) {
      owner.memoizedOutput = tree;
      owner.memoizedProps = props;
    }
    cleanupUnusedChildren(owner);
    // A single vnode output can be swapped in place by targetedRender.
    // Anything else (fragment array, portal, primitive — the parent wraps
    // primitives in its own text vnode) forces a full render on this owner's
    // next state change.
    owner.lastVNode =
      tree && typeof tree === "object" && !Array.isArray(tree) && tree.type !== PORTAL
        ? tree
        : null;
    return tree;
  } finally {
    currentHookOwner = previousOwner;
  }
}

function prepareHookOwner(owner) {
  owner.hookCursor = 0;
  owner.childCursor = new Map();
  owner.nextChildren = new Set();
  owner.dirty = false;
  owner.contextReads = null;
}

function cleanupUnusedChildren(owner) {
  for (const [identity, child] of owner.children) {
    if (!owner.nextChildren.has(identity)) {
      cleanupEffects(child);
      markUnmounted(child);
      owner.children.delete(identity);
    }
  }
}

// A state change on an unmounted component must not schedule work: its owner
// was dropped from the tree, so there is nothing on screen to update.
function markUnmounted(owner) {
  owner.unmounted = true;
  for (const child of owner.children.values()) {
    markUnmounted(child);
  }
}

function componentIdentity(typeId, props, index) {
  return `${typeId}:${props.key ?? `index-${index}`}`;
}

function componentTypeId(type) {
  let id = componentTypeIds.get(type);

  if (!id) {
    id = nextComponentTypeId;
    nextComponentTypeId += 1;
    componentTypeIds.set(type, id);
  }

  return id;
}

function dependenciesChanged(previous, next) {
  if (!previous || !next || previous.length !== next.length) {
    return true;
  }

  return next.some((dependency, index) => !Object.is(dependency, previous[index]));
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

function touchAll(values) {
  return Object.keys(values).reduce((nextTouched, name) => {
    nextTouched[name] = true;
    return nextTouched;
  }, {});
}

// Returns true if any component in the owner's subtree has pending state
// (called setState/dispatch since the last render). Used by memo to decide
// whether to skip re-rendering even when the component's own props are equal.
function hasDirtyDescendant(owner) {
  for (const child of owner.children.values()) {
    if (child.dirty || hasDirtyDescendant(child)) {
      return true;
    }
  }
  return false;
}

// Returns true if any component in the owner's subtree read a context value
// (via useContext) that differs from what the context would provide right
// now. Used by memo: a skipped subtree keeps its last output, so it must not
// be skipped when a provider above it changed the value its consumers read.
function hasStaleContextRead(owner) {
  if (owner.contextReads) {
    for (const [context, seenValue] of owner.contextReads) {
      if (!Object.is(context._value, seenValue)) {
        return true;
      }
    }
  }
  for (const child of owner.children.values()) {
    if (hasStaleContextRead(child)) {
      return true;
    }
  }
  return false;
}

// Shallow prop comparison for memo: returns true when props differ.
// Compares all keys (including children) by Object.is — same as React.memo.
function shallowPropsChanged(prev, next) {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return true;
  return prevKeys.some((k) => !Object.is(prev[k], next[k]));
}

function scheduleRender(root, dirtyOwner) {
  if (!dirtyOwner || dirtyOwner === root) {
    root.fullRenderQueued = true;
  } else if (dirtyOwner.unmounted) {
    // State set on an unmounted component — nothing on screen depends on it.
    return;
  } else {
    root.dirtyOwners.add(dirtyOwner);
  }

  if (root.renderQueued) {
    return;
  }

  root.renderQueued = true;
  queueMicrotask(() => flushRender(root));
}

function flushRender(root) {
  root.renderQueued = false;

  // The root may have been unmounted (or its container re-rendered with a
  // different root) between scheduling and this microtask — rendering now
  // would resurrect DOM inside a dead container.
  if (root.container !== null && roots.get(root.container) !== root) {
    root.dirtyOwners.clear();
    root.fullRenderQueued = false;
    return;
  }

  if (root.fullRenderQueued) {
    root.fullRenderQueued = false;
    root.dirtyOwners.clear();
    fullRender(root);
    return;
  }

  const batch = new Set(root.dirtyOwners);
  root.dirtyOwners.clear();

  for (const owner of batch) {
    if (owner.unmounted) {
      continue;
    }

    // An ancestor in the same batch re-renders this whole subtree anyway.
    if (hasDirtyAncestorInBatch(owner, batch)) {
      continue;
    }

    if (!targetedRender(root, owner)) {
      // No usable tracking for this owner (first update after hydration,
      // primitive output, detached vnode) — reconcile from the root instead.
      fullRender(root);
      return;
    }
  }
}

function hasDirtyAncestorInBatch(owner, batch) {
  for (let parent = owner.parent; parent; parent = parent.parent) {
    if (batch.has(parent)) {
      return true;
    }
  }
  return false;
}

function fullRender(root, carriedEffects) {
  prepareHookOwner(root);
  root.pendingEffects = carriedEffects || [];
  currentRenderRoot = root;
  currentHookOwner = root;

  try {
    const newTree = normalizeTree(root.component());
    cleanupUnusedChildren(root);
    currentRenderRoot = null;
    currentHookOwner = null;
    root.oldTree = patchChildren(root.container, root.oldTree, newTree);
    runEffects(root);
  } catch (error) {
    currentRenderRoot = null;
    currentHookOwner = null;
    // Render threw outside of any useErrorBoundary guard. The DOM still
    // reflects the last successful tree (patchChildren never ran), so the
    // safest move is to keep that on screen and report loudly rather than
    // rethrow into an unhandled rejection — which would both hide the
    // error behind "Uncaught (in promise)" noise and fire again on every
    // future render attempt that touches the same broken state.
    console.error("Nexa: render failed — keeping the last successful UI on screen.", error);
  }
}

// Re-renders a single component in place: re-runs it with its last props
// under its snapshotted context environment, then patches its previous
// output vnode against the new one directly in the parent DOM node — no
// other component runs and no other DOM subtree is touched.
//
// Returns false when this owner cannot be re-rendered in isolation (the
// caller falls back to fullRender).
function targetedRender(root, owner) {
  const oldVNode = owner.lastVNode;
  const containerArray = oldVNode?._containerArray;
  const parentDom = oldVNode?._dom?.parentNode;

  if (!oldVNode || !containerArray || !parentDom) {
    return false;
  }

  const index = containerArray.indexOf(oldVNode);
  if (index === -1) {
    return false;
  }

  // Rebuild the provider environment this component rendered under, so
  // useContext reads inside the subtree see provided values, not defaults.
  const frames = [];
  for (let frame = owner.contextFrame; frame; frame = frame.parent) {
    frames.unshift(frame);
  }
  for (const frame of frames) {
    frame.context._push(frame.value);
  }

  const previousRoot = currentRenderRoot;
  const previousOwner = currentHookOwner;
  const previousFrame = contextFrame;

  prepareHookOwner(owner);
  root.pendingEffects = [];
  currentRenderRoot = root;
  currentHookOwner = owner;
  contextFrame = owner.contextFrame;

  let tree;
  let failed = false;

  try {
    tree = owner.type(owner.props);
    cleanupUnusedChildren(owner);
  } catch {
    failed = true;
  } finally {
    currentRenderRoot = previousRoot;
    currentHookOwner = previousOwner;
    contextFrame = previousFrame;
    for (let i = frames.length - 1; i >= 0; i -= 1) {
      frames[i].context._pop();
    }
  }

  if (failed) {
    // A targeted run executes outside any useErrorBoundary guard's
    // try/catch — only a root pass re-enters the guard thunks. Re-render
    // from the root so a boundary above this component can catch the throw
    // (and, without one, fullRender's own catch keeps the last good UI).
    fullRender(root, root.pendingEffects);
    return true;
  }

  if (owner.type._isMemo) {
    owner.memoizedOutput = tree;
    owner.memoizedProps = owner.props;
  }

  const newChildren = normalizeTree(tree);

  if (newChildren.length !== 1 || newChildren[0].type === PORTAL) {
    // The output changed shape (fragment/portal) — only a root pass can
    // splice that into the parent. The component already ran and its
    // useEffect hooks already recorded their new deps, so carry the queued
    // effects over or they would be lost (the re-run would see equal deps).
    fullRender(root, root.pendingEffects);
    return true;
  }

  const patched = patch(parentDom, oldVNode, newChildren[0]);
  containerArray[index] = patched;
  patched._containerArray = containerArray;
  owner.lastVNode = patched;
  runEffects(root);
  return true;
}

function runEffects(root) {
  for (const { owner, cursor, effect } of root.pendingEffects) {
    const hook = owner.hooks[cursor];

    if (typeof hook.cleanup === "function") {
      runSafely(hook.cleanup, "Nexa: an effect's cleanup threw before re-running.");
    }

    const cleanup = runSafely(effect, "Nexa: an effect threw.");
    hook.cleanup = typeof cleanup === "function" ? cleanup : null;
  }
}

function cleanupEffects(root) {
  for (const hook of root.hooks) {
    if (typeof hook?.cleanup === "function") {
      runSafely(hook.cleanup, "Nexa: an effect's cleanup threw during unmount.");
    }
  }

  for (const child of root.children.values()) {
    cleanupEffects(child);
  }
}

// Effects and cleanups run outside of any component's call stack, so a
// useErrorBoundary guard further up can't catch them — and one throwing
// must not stop its neighbors from running (that would leak subscriptions,
// timers, listeners, ... for components that did nothing wrong).
function runSafely(fn, message) {
  try {
    return fn();
  } catch (error) {
    console.error(message, error);
    return undefined;
  }
}

function normalizeTree(tree) {
  return normalizeChildren([tree]);
}

function normalizeChildren(children) {
  const flat = children.flat(Infinity).map(toChild);
  return flat.length === 0 ? EMPTY_CHILDREN : flat;
}

function toChild(child) {
  if (child === null || child === undefined || child === false || child === true) {
    return text("");
  }

  if (typeof child === "string" || typeof child === "number") {
    return text(String(child));
  }

  return child;
}

function text(value) {
  return {
    type: TEXT_NODE,
    props: {
      nodeValue: value,
      children: [],
    },
  };
}

function createDom(vnode, parentDom) {
  if (vnode.type === TEXT_NODE) {
    const dom = document.createTextNode(vnode.props.nodeValue);
    vnode._dom = dom;
    return dom;
  }

  // A portal child inside a regular element reaches createDom directly (not
  // through patch), so handle it here: render children into the target and
  // return a comment placeholder for the current parent.
  if (vnode.type === PORTAL) {
    const placeholder = document.createComment("nexa-portal");
    vnode._dom = placeholder;
    vnode._portalChildren = patchChildren(vnode.props.target, [], vnode.props.children);
    return placeholder;
  }

  const dom = isSvgElement(vnode.type, parentDom)
    ? document.createElementNS(SVG_NS, vnode.type)
    : document.createElement(vnode.type);

  vnode._dom = dom;
  updateDom(dom, {}, vnode.props);

  for (const child of vnode.props.children) {
    child._containerArray = vnode.props.children;
    dom.appendChild(createDom(child, dom));
  }

  // A <select>'s `value` can only take effect once its <option> children
  // exist in the DOM — setting it above, before they're appended, is
  // silently ignored by the browser (it falls back to the first option).
  // Re-apply now that the options are in place.
  if (vnode.type === "select" && "value" in vnode.props) {
    dom.value = vnode.props.value;
  }

  return dom;
}

// `<svg>` always opens the SVG namespace. Everything else inherits its
// parent's namespace — except children of `<foreignObject>`, which step
// back into regular HTML (foreignObject is itself an SVG element; only its
// content is foreign). Reading the namespace straight off the parent DOM
// node means no extra context needs threading through render/patch.
function isSvgElement(type, parentDom) {
  if (type === "svg") {
    return true;
  }

  if (parentDom?.namespaceURI !== SVG_NS) {
    return false;
  }

  return parentDom.localName !== "foreignObject";
}

function patch(parent, oldVNode, newVNode) {
  // Route portals through a dedicated handler.
  if (newVNode?.type === PORTAL || oldVNode?.type === PORTAL) {
    return patchPortal(parent, oldVNode, newVNode);
  }

  if (!oldVNode) {
    parent.appendChild(createDom(newVNode, parent));
    return newVNode;
  }

  if (!newVNode) {
    removeVNode(parent, oldVNode);
    return null;
  }

  if (oldVNode.type !== newVNode.type) {
    const dom = createDom(newVNode, parent);
    parent.replaceChild(dom, oldVNode._dom);
    // createDom() above already ran setRef(newVNode.props.ref, dom) for the
    // new element. If the same ref object is bound to both the old and new
    // vnode (a common pattern when the element's tag changes but the ref
    // stays put), clearing it unconditionally here would wipe out the value
    // createDom just set — only clear when it's actually a different ref.
    if (oldVNode.props.ref !== newVNode.props.ref) {
      clearRef(oldVNode.props.ref);
    }
    return newVNode;
  }

  newVNode._dom = oldVNode._dom;

  if (newVNode.type === TEXT_NODE) {
    if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
      newVNode._dom.nodeValue = newVNode.props.nodeValue;
    }

    return newVNode;
  }

  updateDom(newVNode._dom, oldVNode.props, newVNode.props);
  newVNode.props.children = patchChildren(
    newVNode._dom,
    oldVNode.props.children,
    newVNode.props.children,
  );

  // Same reasoning as in createDom: if this patch is what adds the <option>
  // matching the new value (e.g. options and value change together), the
  // `.value` assignment above ran before patchChildren created it and was
  // ignored. Re-apply now that the options reflect this render.
  if (newVNode.type === "select" && "value" in newVNode.props) {
    newVNode._dom.value = newVNode.props.value;
  }

  return newVNode;
}

// Portals render their children into a separate DOM node (props.target)
// while leaving a lightweight comment placeholder in the current position
// so patchChildren can track order. The placeholder has no visual effect.
function patchPortal(parent, oldVNode, newVNode) {
  // Transition: old was a portal, new is not (or null) — tear down old target.
  if (oldVNode?.type === PORTAL && newVNode?.type !== PORTAL) {
    patchChildren(oldVNode.props.target, oldVNode._portalChildren || [], []);
    if (oldVNode._dom?.parentNode === parent) {
      parent.removeChild(oldVNode._dom);
    }
    if (!newVNode) return null;
    parent.appendChild(createDom(newVNode, parent));
    return newVNode;
  }

  // Portal removed entirely.
  if (!newVNode) {
    if (oldVNode?.type === PORTAL) {
      patchChildren(oldVNode.props.target, oldVNode._portalChildren || [], []);
    }
    if (oldVNode?._dom?.parentNode === parent) {
      parent.removeChild(oldVNode._dom);
    }
    return null;
  }

  const target = newVNode.props.target;
  const sameTarget = oldVNode?.type === PORTAL && oldVNode.props.target === target;

  // If target changed, tear down the old target first.
  if (oldVNode?.type === PORTAL && !sameTarget) {
    patchChildren(oldVNode.props.target, oldVNode._portalChildren || [], []);
  }

  const oldPortalChildren = sameTarget ? (oldVNode._portalChildren || []) : [];
  newVNode._portalChildren = patchChildren(target, oldPortalChildren, newVNode.props.children);

  // Reuse the comment placeholder or create a new one.
  if (sameTarget) {
    newVNode._dom = oldVNode._dom;
  } else {
    const placeholder = document.createComment("nexa-portal");
    newVNode._dom = placeholder;
    if (oldVNode?._dom?.parentNode === parent) {
      parent.replaceChild(placeholder, oldVNode._dom);
    } else {
      parent.appendChild(placeholder);
    }
  }

  return newVNode;
}

function patchChildren(parent, oldChildren, newChildren) {
  const oldKeyed = new Map();
  const oldFree = [];
  const used = new Set();
  const patchedChildren = [];

  for (const child of oldChildren) {
    const key = getKey(child);

    if (key === null) {
      oldFree.push(child);
    } else {
      oldKeyed.set(key, child);
    }
  }

  let freeIndex = 0;

  for (let index = 0; index < newChildren.length; index += 1) {
    const newChild = newChildren[index];
    const key = getKey(newChild);
    const oldChild = key === null ? oldFree[freeIndex] : oldKeyed.get(key);

    if (key === null) {
      freeIndex += 1;
    }

    if (oldChild) {
      used.add(oldChild);
    }

    const patchedChild = patch(parent, oldChild, newChild);

    if (!patchedChild) {
      continue;
    }

    const referenceNode = parent.childNodes[index];

    if (patchedChild._dom !== referenceNode) {
      parent.insertBefore(patchedChild._dom, referenceNode || null);
    }

    // Track which live array holds each vnode so targetedRender can swap a
    // component's output in place without walking the tree.
    patchedChild._containerArray = patchedChildren;
    patchedChildren.push(patchedChild);
  }

  for (const oldChild of oldChildren) {
    if (!used.has(oldChild)) {
      removeVNode(parent, oldChild);
    }
  }

  return patchedChildren;
}

function removeVNode(parent, vnode) {
  if (vnode.type === PORTAL) {
    patchChildren(vnode.props.target, vnode._portalChildren || [], []);
  }

  clearRef(vnode.props.ref);

  if (vnode._dom?.parentNode === parent) {
    parent.removeChild(vnode._dom);
  }
}

function getKey(vnode) {
  const key = vnode?.props?.key;
  return key === null || key === undefined ? null : String(key);
}

let warnedInnerHTMLChildren = false;

function updateDom(dom, previousProps, nextProps) {
  if (
    !warnedInnerHTMLChildren &&
    nextProps.innerHTML != null &&
    nextProps.children?.some((c) => c.type !== TEXT_NODE || c.props.nodeValue !== "")
  ) {
    warnedInnerHTMLChildren = true;
    console.warn(
      "Nexa: an element received both `innerHTML` and children — the two overwrite each other. Give the element only one of them.",
    );
  }

  for (const name of Object.keys(previousProps)) {
    if (name === "children" || name === "key") {
      continue;
    }

    if (!(name in nextProps)) {
      setProp(dom, name, previousProps[name], null);
    }
  }

  for (const name of Object.keys(nextProps)) {
    if (name === "children" || name === "key") {
      continue;
    }

    if (!Object.is(previousProps[name], nextProps[name])) {
      setProp(dom, name, previousProps[name], nextProps[name]);
    }
  }
}

function setProp(dom, name, previousValue, nextValue) {
  if (name === "ref") {
    if (previousValue && previousValue !== nextValue) {
      clearRef(previousValue);
    }

    if (nextValue) {
      setRef(nextValue, dom);
    }

    return;
  }

  if (name.startsWith("on") && typeof previousValue === "function") {
    dom.removeEventListener(eventName(name), previousValue);
  }

  if (name === "style") {
    setStyle(dom, previousValue, nextValue);
    return;
  }

  if (name === "dataset") {
    setDataset(dom, previousValue, nextValue);
    return;
  }

  // Raw HTML injection. The string is assigned as-is — callers are
  // responsible for sanitizing untrusted input. Removal (nextValue null/
  // undefined) clears the injected content; the generic removal branch
  // below would only call removeAttribute, which leaves innerHTML intact.
  if (name === "innerHTML") {
    dom.innerHTML = nextValue ?? "";
    return;
  }

  const attributeName = attributeAlias(name);

  if (nextValue === null || nextValue === undefined || nextValue === false) {
    if (name in dom && typeof dom[name] === "boolean") {
      dom[name] = false;
    }

    dom.removeAttribute(attributeName);
    return;
  }

  if (name.startsWith("on") && typeof nextValue === "function") {
    dom.addEventListener(eventName(name), nextValue);
    return;
  }

  if (name in dom) {
    try {
      dom[name] = nextValue;
      return;
    } catch {
      // Some DOM properties, such as HTMLTextAreaElement.type, are read-only.
      // Fall through and write them as attributes instead.
    }
  }

  if (nextValue === true) {
    dom.setAttribute(attributeName, "");
    return;
  }

  dom.setAttribute(attributeName, nextValue);
}

function setStyle(dom, previousValue, nextValue) {
  if (!nextValue) {
    dom.removeAttribute("style");
    return;
  }

  if (typeof nextValue === "string") {
    dom.setAttribute("style", nextValue);
    return;
  }

  if (previousValue && typeof previousValue === "object") {
    for (const name of Object.keys(previousValue)) {
      if (!(name in nextValue)) {
        if (name.startsWith("--")) {
          dom.style.removeProperty(name);
        } else {
          dom.style[name] = "";
        }
      }
    }
  }

  for (const [name, value] of Object.entries(nextValue)) {
    if (value === null || value === undefined) {
      dom.style.removeProperty(name);
    } else if (name.startsWith("--")) {
      dom.style.setProperty(name, value);
    } else {
      dom.style[name] = value;
    }
  }
}

function setDataset(dom, previousValue, nextValue) {
  if (previousValue && typeof previousValue === "object") {
    for (const name of Object.keys(previousValue)) {
      if (!nextValue || !(name in nextValue)) {
        delete dom.dataset[name];
      }
    }
  }

  if (!nextValue) {
    return;
  }

  for (const [name, value] of Object.entries(nextValue)) {
    dom.dataset[name] = value;
  }
}

function setRef(ref, dom) {
  if (typeof ref === "function") {
    ref(dom);
    return;
  }

  ref.current = dom;
}

function clearRef(ref) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(null);
    return;
  }

  ref.current = null;
}

function attributeAlias(name) {
  if (name === "className") {
    return "class";
  }

  if (name === "htmlFor") {
    return "for";
  }

  if (name === "ariaLabel") {
    return "aria-label";
  }

  if (name === "ariaInvalid") {
    return "aria-invalid";
  }

  if (name === "ariaDescribedby") {
    return "aria-describedby";
  }

  if (name === "ariaSelected") {
    return "aria-selected";
  }

  if (name === "ariaModal") {
    return "aria-modal";
  }

  if (name === "ariaLabelledby") {
    return "aria-labelledby";
  }

  if (name === "ariaHidden") {
    return "aria-hidden";
  }

  if (name === "ariaLive") {
    return "aria-live";
  }

  if (name === "ariaExpanded") {
    return "aria-expanded";
  }

  if (name === "ariaControls") {
    return "aria-controls";
  }

  if (name === "ariaHaspopup") {
    return "aria-haspopup";
  }

  if (name === "ariaCurrent") {
    return "aria-current";
  }

  if (name === "ariaValuenow") {
    return "aria-valuenow";
  }

  if (name === "ariaValuemin") {
    return "aria-valuemin";
  }

  if (name === "ariaValuemax") {
    return "aria-valuemax";
  }

  if (name === "ariaActivedescendant") {
    return "aria-activedescendant";
  }

  if (name === "ariaAutocomplete") {
    return "aria-autocomplete";
  }

  return name;
}

function eventName(propName) {
  return propName.slice(2).toLowerCase();
}

// ── Context ────────────────────────────────────────────────

/*
 * Nexa evaluates h(Child) eagerly — children render before their parent
 * component function returns. Because of this, the standard React Provider
 * pattern (h(Context.Provider, { value }, h(Child))) would set the context
 * value AFTER the child has already rendered.
 *
 * The solution is provide(value, renderFn): push the value, call renderFn()
 * (which renders the subtree synchronously), then pop.
 *
 *   return ThemeCtx.provide(theme, () =>
 *     h("div", null, h(Header), h(Main))
 *   );
 */

export function createContext(defaultValue) {
  const stack = [defaultValue];

  const context = {
    provide(value, renderFn) {
      stack.push(value);
      contextFrame = { context, value, parent: contextFrame };
      try {
        return renderFn();
      } finally {
        stack.pop();
        contextFrame = contextFrame.parent;
      }
    },
    get _value() {
      return stack[stack.length - 1];
    },
    // Used by targetedRender to temporarily re-enter a snapshotted provider
    // environment outside of a full root render.
    _push(value) {
      stack.push(value);
    },
    _pop() {
      stack.pop();
    },
  };

  return context;
}

export function useContext(context) {
  const owner = requireHookOwner("useContext");

  // Record what this owner read so memo boundaries can tell whether a
  // skipped subtree would observe a different context value (see the
  // hasStaleContextRead check in renderComponent).
  if (!owner.contextReads) {
    owner.contextReads = new Map();
  }
  owner.contextReads.set(context, context._value);

  return context._value;
}

// ── Mobile hooks ───────────────────────────────────────────

export function useSwipe(ref, { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 40 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < threshold && absDy < threshold) return;

      if (absDx >= absDy) {
        if (dx < 0) onSwipeLeft?.({ dx, dy });
        else onSwipeRight?.({ dx, dy });
      } else {
        if (dy < 0) onSwipeUp?.({ dx, dy });
        else onSwipeDown?.({ dx, dy });
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // No dependency array — deliberately re-runs after every render (cleans
    // up and reattaches every time). A `[ref.current]` dep looks equivalent
    // but isn't: the array is evaluated during THIS render's tree-building
    // phase, before this same render's patch has updated `ref.current` — so
    // it always compares the value against itself and never detects a
    // change. A ref reconnecting later (conditional mount, key/type swap)
    // would silently never reattach. Re-running unconditionally also means
    // onSwipeLeft/Right/Up/Down and threshold never go stale, which the old
    // dependency array didn't cover either.
  });
}

export function useLongPress(ref, { onLongPress, delay = 500 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer = null;

    const start = (e) => {
      timer = setTimeout(() => {
        onLongPress?.(e);
        timer = null;
      }, delay);
    };

    const cancel = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", cancel, { passive: true });
    el.addEventListener("touchmove", cancel, { passive: true });
    el.addEventListener("mousedown", start);
    el.addEventListener("mouseup", cancel);
    el.addEventListener("mouseleave", cancel);

    return () => {
      cancel();
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", cancel);
      el.removeEventListener("touchmove", cancel);
      el.removeEventListener("mousedown", start);
      el.removeEventListener("mouseup", cancel);
      el.removeEventListener("mouseleave", cancel);
    };
    // No dependency array — see the comment in useSwipe above for why
    // `[ref.current]` doesn't actually detect the ref's target changing.
  });
}

export function useNetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return online;
}

export function useOrientation() {
  const getOrientation = () =>
    window.screen?.orientation?.type?.startsWith("landscape") ||
    window.matchMedia("(orientation: landscape)").matches
      ? "landscape"
      : "portrait";

  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const handler = () => setOrientation(getOrientation());

    window.addEventListener("orientationchange", handler);
    window.matchMedia("(orientation: landscape)").addEventListener("change", handler);

    return () => {
      window.removeEventListener("orientationchange", handler);
      window.matchMedia("(orientation: landscape)").removeEventListener("change", handler);
    };
  }, []);

  return orientation;
}

export function useVibrate() {
  return (pattern = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
}

// ── useLocalStorage ────────────────────────────────────────

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Route through useState's updater so functional updates always see the
  // LATEST value — a closure over `stored` would apply every update in a
  // same-render burst (e.g. drag-resize mousemoves) to the same stale base,
  // keeping only the last one.
  const setValue = (value) => {
    setStored((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return [stored, setValue];
}

// ── useToast ───────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant, message, opts = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((list) => [
      ...list,
      { id, variant, message, title: opts.title, duration: opts.duration ?? 3500 },
    ]);
    return id;
  }, []);

  const toast = useMemo(
    () => ({
      success: (msg, opts) => push("success", msg, opts),
      error:   (msg, opts) => push("danger",  msg, opts),
      warning: (msg, opts) => push("warning", msg, opts),
      info:    (msg, opts) => push("info",    msg, opts),
      dismiss,
    }),
    [push, dismiss],
  );

  return { toasts, toast, dismiss };
}

// ── useRouter ──────────────────────────────────────────────
//
// mode: "hash" (default) — `#/path?query`, works on any static host, no
//       server configuration needed.
// mode: "history" — clean URLs via the History API (pushState/popstate).
//       Requires the server to serve index.html for every app route (a
//       direct load or refresh of e.g. /settings must not 404) — a static
//       file server alone won't do this; see server.py or your host's
//       "SPA fallback" / rewrite setting.

export function useRouter({ mode = "hash" } = {}) {
  const isHistory = mode === "history";

  const getPath = () => {
    if (isHistory) {
      return window.location.pathname || "/";
    }
    const hash = window.location.hash.slice(1) || "/";
    const q = hash.indexOf("?");
    return q === -1 ? hash : hash.slice(0, q);
  };

  const getParams = () => {
    if (isHistory) {
      return Object.fromEntries(new URLSearchParams(window.location.search));
    }
    const hash = window.location.hash.slice(1) || "";
    const q = hash.indexOf("?");
    return q === -1 ? {} : Object.fromEntries(new URLSearchParams(hash.slice(q + 1)));
  };

  const [path, setPath] = useState(getPath);
  const [params, setParams] = useState(getParams);

  const sync = useCallback(() => {
    setPath(getPath());
    setParams(getParams());
  }, [isHistory]);

  useEffect(() => {
    const eventName = isHistory ? "popstate" : "hashchange";
    window.addEventListener(eventName, sync);
    return () => window.removeEventListener(eventName, sync);
  }, [isHistory, sync]);

  // History mode only: pushState() never fires popstate (browsers only fire
  // it for back/forward and other history-stack navigation), so navigate()
  // below must call sync() itself. It also doesn't intercept plain <a href>
  // clicks the way a "#/path" href naturally does in hash mode — without
  // this listener, every anchor would trigger a full page reload. Skips
  // modified clicks (new-tab/download intent), cross-origin links, and
  // same-page fragment links (so native #anchor scrolling still works).
  useEffect(() => {
    if (!isHistory) return undefined;

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest?.("a[href]");
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;

      const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (samePage && url.hash) return;

      e.preventDefault();
      window.history.pushState(null, "", url.pathname + url.search + url.hash);
      sync();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [isHistory, sync]);

  const navigate = useCallback(
    (to) => {
      if (isHistory) {
        window.history.pushState(null, "", to);
        sync();
        return;
      }
      window.location.hash = to;
    },
    [isHistory, sync],
  );

  return { path, params, navigate };
}

// ── matchPath / useRoutes ──────────────────────────────────
//
// matchPath(pattern, path, { end })  → { params, rest } | null
//   Segment-based matcher. A `:name` segment captures one path segment
//   (URL-decoded) into params. A trailing `*` segment captures the remaining
//   segments into params["*"]. With { end: false } a prefix match succeeds and
//   returns the still-encoded remainder in `rest` (used for nested routes).
//
//   matchPath("/users/:id", "/users/42")        → { params: { id: "42" }, rest: "" }
//   matchPath("/users/:id", "/users/42/edit")   → null
//   matchPath("/users", "/users/42", { end:false }) → { params:{}, rest: "42" }
//   matchPath("/files/*", "/files/a/b.png")     → { params:{ "*": "a/b.png" }, rest:"" }
//
// useRoutes(routes, { mode, notFound })  → vnode
//   Resolves the current router path against a nested route config and returns
//   the element to render. Route objects:
//     { path, component, element, lazy, css, children, index, fallback }
//   - component: (props) => vnode, called with { params, outlet }.
//   - element:   a vnode, or (params, outlet) => vnode.
//   - lazy:      () => import(...) — resolved via createLazy, cached per route
//                object so its load state survives re-renders. `fallback` is
//                shown while loading.
//   - css:       stylesheet href (or array of hrefs) loaded via loadCSS() on
//                first activation; the fallback holds until CSS (and lazy JS,
//                if any) are ready. Works with or without `lazy`.
//   - children:  nested routes. The parent route's component renders its
//                `outlet` prop where the matched child element belongs.
//   - index:     matches the parent's exact path (empty remainder).
//   First matching sibling wins, so define specific routes before catch-alls.
//   A parent with children whose own path matches renders even if no child
//   matches (outlet = null); add an index child or a `path: "*"` catch-all
//   child to control that case.

export function matchPath(pattern, path, { end = true } = {}) {
  const patternSegments = String(pattern).split("/").filter(Boolean);
  const pathSegments = String(path).split("/").filter(Boolean);
  const params = {};

  let i = 0;
  for (; i < patternSegments.length; i += 1) {
    const segment = patternSegments[i];
    if (segment === "*") {
      params["*"] = pathSegments.slice(i).map(decodeURIComponent).join("/");
      return { params, rest: "" };
    }
    if (i >= pathSegments.length) return null;
    if (segment[0] === ":") {
      params[segment.slice(1)] = decodeURIComponent(pathSegments[i]);
    } else if (segment !== pathSegments[i]) {
      return null;
    }
  }

  if (i < pathSegments.length) {
    if (end) return null;
    return { params, rest: pathSegments.slice(i).join("/") };
  }
  return { params, rest: "" };
}

// createLazy() holds internal load state, so a route's lazy component must be
// created once and reused — keyed by the route object, which apps define as a
// stable module constant.
const lazyRouteCache = new WeakMap();

function renderStaticRoute(route, props) {
  if (route.component) return h(route.component, props);
  if (typeof route.element === "function") return route.element(props.params, props.outlet);
  if (route.element !== undefined) return route.element;
  return props.outlet;
}

function renderRouteElement(route, params, outlet) {
  const props = { params, outlet };
  if (route.lazy || route.css) {
    let Lazy = lazyRouteCache.get(route);
    if (!Lazy) {
      const hrefs = route.css == null ? [] : Array.isArray(route.css) ? route.css : [route.css];
      // A css-only route still goes through createLazy so the fallback holds
      // until its stylesheet is ready; the "module" is the static renderer.
      const Static = (p) => renderStaticRoute(route, p);
      const loader = () =>
        Promise.all([route.lazy ? route.lazy() : Static, ...hrefs.map(loadCSS)]).then(
          ([mod]) => mod,
        );
      Lazy = createLazy(loader, route.fallback ?? null);
      lazyRouteCache.set(route, Lazy);
    }
    return h(Lazy, props);
  }
  return renderStaticRoute(route, props);
}

function resolveRoutes(routes, path, parentParams) {
  for (const route of routes) {
    const hasChildren = Array.isArray(route.children) && route.children.length > 0;
    const matched = route.index
      ? matchPath("/", path, { end: true })
      : matchPath(route.path ?? "/", path, { end: !hasChildren });
    if (!matched) continue;

    const params = { ...parentParams, ...matched.params };
    const outlet = hasChildren
      ? resolveRoutes(route.children, "/" + (matched.rest || ""), params)
      : null;
    return renderRouteElement(route, params, outlet);
  }
  return null;
}

export function useRoutes(routes, { mode = "hash", notFound = null } = {}) {
  const { path } = useRouter({ mode });
  const element = resolveRoutes(routes ?? [], path, {});
  return element === null ? notFound : element;
}

// ── useTranslation ─────────────────────────────────────────

export function useTranslation(dict = {}) {
  const t = useCallback(
    (key, vars = {}) => {
      const template = dict[key] ?? key;
      return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
    },
    [dict],
  );

  return { t };
}

// ── useHead ────────────────────────────────────────────────
//
// Declares document metadata (title + meta tags) from a component — the
// missing piece for per-route SEO. The last component to render a given
// field wins, so route pages naturally override app-level defaults.
//
//   useHead({
//     title: "Dashboard — Acme",
//     meta: [
//       { name: "description", content: "Sales overview" },
//       { property: "og:title", content: "Dashboard" },
//     ],
//   });
//
// Client: applied after the render commits (an effect). Meta tags managed by
// useHead carry data-nexa-head and are updated in place — one tag per
// name/property. Nothing is removed on unmount: like document.title itself,
// metadata persists until another component declares a new value.
//
// Server: renderToString() collects every useHead call from the rendered
// tree; call renderHeadToString() afterwards to get the <title>/<meta>
// markup for the document <head>. Server-emitted tags also carry
// data-nexa-head, so the client render finds and reuses them.

let ssrHeadEntries = [];

export function useHead(head) {
  const owner = requireHookOwner("useHead");

  // Server render (synthetic root, no container): effects never run there,
  // so collect synchronously during the render pass instead.
  if (owner.renderRoot.container === null) {
    ssrHeadEntries.push(head || {});
    return;
  }

  useEffect(() => {
    applyHead(head || {});
  }, [JSON.stringify(head ?? null)]);
}

function applyHead(head) {
  if (head.title !== undefined && document.title !== head.title) {
    document.title = head.title;
  }

  for (const entry of head.meta || []) {
    const keyAttr = entry.name != null ? "name" : entry.property != null ? "property" : null;
    if (!keyAttr) continue;

    const keyValue = String(entry.name ?? entry.property);
    let tag = null;

    // Attribute values are matched in JS instead of via a CSS selector so
    // arbitrary strings (quotes, brackets) need no escaping.
    for (const candidate of document.head.querySelectorAll("meta")) {
      if (candidate.getAttribute(keyAttr) === keyValue) {
        tag = candidate;
        break;
      }
    }

    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(keyAttr, keyValue);
      document.head.appendChild(tag);
    }

    tag.setAttribute("data-nexa-head", "");
    tag.setAttribute("content", String(entry.content ?? ""));
  }
}

export function renderHeadToString() {
  let title;
  const metaByKey = new Map();

  for (const head of ssrHeadEntries) {
    if (head.title !== undefined) title = head.title;
    for (const entry of head.meta || []) {
      const keyAttr = entry.name != null ? "name" : entry.property != null ? "property" : null;
      if (!keyAttr) continue;
      metaByKey.set(`${keyAttr}:${entry.name ?? entry.property}`, entry);
    }
  }

  ssrHeadEntries = [];

  const parts = [];
  if (title !== undefined) {
    parts.push(`<title>${escapeText(String(title))}</title>`);
  }
  for (const entry of metaByKey.values()) {
    const keyAttr = entry.name != null ? "name" : "property";
    const keyValue = escapeAttribute(String(entry.name ?? entry.property));
    const content = escapeAttribute(String(entry.content ?? ""));
    parts.push(`<meta ${keyAttr}="${keyValue}" content="${content}" data-nexa-head>`);
  }

  return parts.join("\n");
}

// ── useContextMenu ─────────────────────────────────────────

export function useContextMenu() {
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0 });

  const openMenu = useCallback((e) => {
    e.preventDefault();
    setMenu({ open: true, x: e.clientX, y: e.clientY });
  }, []);

  const closeMenu = useCallback(() => {
    setMenu((m) => ({ ...m, open: false }));
  }, []);

  return { menu, openMenu, closeMenu };
}

// ── useTheme ───────────────────────────────────────────────

export function useTheme() {
  const getResolved = () => {
    try {
      const stored = localStorage.getItem("nexa-theme");
      if (stored === "dark" || stored === "light") return stored;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setThemeState] = useState(getResolved);

  // Apply to DOM and persist.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("nexa-theme", theme); } catch {}
  }, [theme]);

  // Stay in sync when another useTheme instance changes the theme.
  useEffect(() => {
    const handler = (e) => setThemeState(e.detail);
    window.addEventListener("nexa:themechange", handler);
    return () => window.removeEventListener("nexa:themechange", handler);
  }, []);

  const _apply = (next) => {
    setThemeState(next);
    window.dispatchEvent(new CustomEvent("nexa:themechange", { detail: next }));
  };

  const setTheme = (next) => _apply(next);

  const toggleTheme = () =>
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.dispatchEvent(new CustomEvent("nexa:themechange", { detail: next }));
      return next;
    });

  return { theme, setTheme, toggleTheme };
}

// ── usePalette ─────────────────────────────────────────────
//
// Switches the accent color palette independently of light/dark theme.
// Sets data-palette on <html>; nexa-ui.css pairs each palette with both a
// light and a dark variant, so palette and theme compose freely.
//
// "custom" is a free-form palette: setCustomColor(hex) writes --m-primary
// directly as an inline style on <html>, and nexa-ui.css derives
// --m-primary-hover/-soft/-secondary/-focus from it with color-mix(), so any
// color works without the caller computing shades by hand.
//
// Usage:
//   const { palette, palettes, setPalette, customColor, setCustomColor } = usePalette();
//   setPalette("violet");
//   setCustomColor("#7c3aed"); // switches palette to "custom"

const PALETTES = ["default", "violet", "rose", "blue", "amber", "emerald", "custom"];
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function usePalette() {
  const getResolved = () => {
    try {
      const stored = localStorage.getItem("nexa-palette");
      if (PALETTES.includes(stored)) return stored;
    } catch {}
    return "default";
  };

  const getResolvedCustomColor = () => {
    try {
      const stored = localStorage.getItem("nexa-palette-custom-color");
      if (HEX_COLOR_RE.test(stored)) return stored;
    } catch {}
    return null;
  };

  const [palette, setPaletteState] = useState(getResolved);
  const [customColor, setCustomColorState] = useState(getResolvedCustomColor);

  // Apply to DOM and persist.
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    try { localStorage.setItem("nexa-palette", palette); } catch {}

    if (palette === "custom" && customColor) {
      document.documentElement.style.setProperty("--m-primary", customColor);
    } else {
      document.documentElement.style.removeProperty("--m-primary");
    }
  }, [palette, customColor]);

  // Stay in sync when another usePalette instance changes the palette.
  useEffect(() => {
    const handler = (e) => {
      setPaletteState(e.detail.palette);
      setCustomColorState(e.detail.customColor);
    };
    window.addEventListener("nexa:palettechange", handler);
    return () => window.removeEventListener("nexa:palettechange", handler);
  }, []);

  const _apply = (nextPalette, nextCustomColor) => {
    setPaletteState(nextPalette);
    setCustomColorState(nextCustomColor);
    window.dispatchEvent(
      new CustomEvent("nexa:palettechange", {
        detail: { palette: nextPalette, customColor: nextCustomColor },
      }),
    );
  };

  const setPalette = (next) => {
    if (!PALETTES.includes(next)) return;
    _apply(next, next === "custom" ? customColor : null);
  };

  const setCustomColor = (hex) => {
    if (!HEX_COLOR_RE.test(hex)) return;
    try { localStorage.setItem("nexa-palette-custom-color", hex); } catch {}
    _apply("custom", hex);
  };

  return { palette, palettes: PALETTES, setPalette, customColor, setCustomColor };
}

// ── useDesign ──────────────────────────────────────────────
//
// Switches the overall visual design, independent of theme and palette.
// Sets data-design on <html>; "nexa" (default) needs no stylesheet beyond
// nexa-ui.css. "bootstrap" only takes effect if the optional
// dist/nexa-bootstrap.css is also loaded — it's scoped entirely under
// [data-design="bootstrap"], so loading it changes nothing until this hook
// (or a manual data-design="bootstrap" attribute) switches to it.
//
// Usage:
//   const { design, designs, setDesign } = useDesign();
//   setDesign("bootstrap");

const DESIGNS = ["nexa", "bootstrap"];

export function useDesign() {
  const getResolved = () => {
    try {
      const stored = localStorage.getItem("nexa-design");
      if (DESIGNS.includes(stored)) return stored;
    } catch {}
    return "nexa";
  };

  const [design, setDesignState] = useState(getResolved);

  // Apply to DOM and persist.
  useEffect(() => {
    document.documentElement.setAttribute("data-design", design);
    try { localStorage.setItem("nexa-design", design); } catch {}
  }, [design]);

  // Stay in sync when another useDesign instance changes the design.
  useEffect(() => {
    const handler = (e) => setDesignState(e.detail);
    window.addEventListener("nexa:designchange", handler);
    return () => window.removeEventListener("nexa:designchange", handler);
  }, []);

  const setDesign = (next) => {
    if (!DESIGNS.includes(next)) return;
    setDesignState(next);
    window.dispatchEvent(new CustomEvent("nexa:designchange", { detail: next }));
  };

  return { design, designs: DESIGNS, setDesign };
}

// ── useHistory ─────────────────────────────────────────────
//
// Wraps a state value with undo/redo history.
// Usage:
//   const { state, set, undo, redo, canUndo, canRedo } = useHistory(initial, { limit: 50 });

export function useHistory(initial, { limit = 50 } = {}) {
  const [snap, setSnap] = useState(() => ({
    past:    [],
    present: typeof initial === "function" ? initial() : initial,
    future:  [],
  }));

  const set = useCallback((next) => {
    setSnap((s) => {
      const value  = typeof next === "function" ? next(s.present) : next;
      const past   = [...s.past, s.present].slice(-limit);
      return { past, present: value, future: [] };
    });
  }, [limit]);

  const undo = useCallback(() => {
    setSnap((s) => {
      if (!s.past.length) return s;
      const past    = s.past.slice(0, -1);
      const present = s.past[s.past.length - 1];
      return { past, present, future: [s.present, ...s.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setSnap((s) => {
      if (!s.future.length) return s;
      const [present, ...future] = s.future;
      return { past: [...s.past, s.present], present, future };
    });
  }, []);

  return {
    state:   snap.present,
    set,
    undo,
    redo,
    canUndo: snap.past.length > 0,
    canRedo: snap.future.length > 0,
  };
}

// ── useFetch ───────────────────────────────────────────────
//
// Data fetching with loading / error / data states.
// Re-fetches whenever `url` changes. Pass null/undefined to skip.
// `options` is any fetch() init object (Headers, FormData, and functions are
// passed through untouched). Each request reads the latest render's options,
// but changing options alone does NOT trigger a new request — call refetch()
// or change `url` for that. A user-supplied options.signal is honored: it is
// chained into the internal AbortController, so either can cancel.
// Usage:
//   const { data, loading, error, refetch } = useFetch("/api/nodes");

export function useFetch(url, options = {}) {
  const [state, setState] = useState({ data: null, loading: !!url, error: null });
  const abortRef   = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const run = useCallback((targetUrl) => {
    if (!targetUrl) { setState({ data: null, loading: false, error: null }); return; }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const { signal: userSignal, ...init } = optionsRef.current ?? {};
    if (userSignal) {
      if (userSignal.aborted) ctrl.abort();
      else userSignal.addEventListener("abort", () => ctrl.abort(), { once: true });
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(targetUrl, { ...init, signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ data: null, loading: false, error: err.message ?? String(err) });
      });
  }, []);

  useEffect(() => { run(url); return () => abortRef.current?.abort(); }, [url]);

  return { ...state, refetch: () => run(url) };
}

// ── useDebounce ────────────────────────────────────────────
//
// Returns a debounced copy of `value` that only updates after `delay` ms
// of silence. Useful for search inputs, resize handlers, etc.
//
// Usage:
//   const query = useDebounce(inputValue, 300);
//   useEffect(() => { search(query); }, [query]);

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ── useThrottle ────────────────────────────────────────────
//
// Returns a throttled version of `fn` that fires at most once per `delay` ms.
// Trailing call is always executed so the last invocation is never dropped.
//
// Usage:
//   const onScroll = useThrottle((e) => setScrollY(e.target.scrollTop), 100);

export function useThrottle(fn, delay) {
  const lastRun = useRef(0);
  const timer = useRef(null);

  // Cancel a pending trailing call on unmount — otherwise `fn` (usually a
  // setState) fires against a dead component.
  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (...args) => {
      const now = Date.now();
      const remaining = delay - (now - lastRun.current);

      clearTimeout(timer.current);

      if (remaining <= 0) {
        lastRun.current = now;
        fn(...args);
      } else {
        timer.current = setTimeout(() => {
          lastRun.current = Date.now();
          timer.current = null;
          fn(...args);
        }, remaining);
      }
    },
    [fn, delay],
  );
}

// ── usePresence ────────────────────────────────────────────
//
// Keeps elements mounted through their exit animation. Nexa removes a DOM
// node the instant its vnode disappears, so a CSS exit transition never gets
// a chance to play — usePresence delays the removal by `duration` ms and
// tells you which items are on their way out so you can apply an exit class.
//
// Boolean form (single element — dialogs, banners, tooltips):
//
//   const { mounted, exiting } = usePresence(open, { duration: 200 });
//   return mounted
//     ? h("div", { className: exiting ? "banner banner-exit" : "banner" }, "Saved!")
//     : null;
//
// List form (items animating out of a collection):
//
//   const rows = usePresence(todos, { duration: 200, getKey: (t) => t.id });
//   return rows.map(({ key, item, exiting }) =>
//     h("li", { key, className: exiting ? "row row-exit" : "row" }, item.label));
//
// Exiting items keep their position in the returned list. Re-adding an item
// while it is exiting cancels the exit. Pair the exit class with the
// animation utility classes in nexa-ui.css or your own CSS transition.

export function usePresence(source, { duration = 300, getKey = defaultPresenceKey } = {}) {
  const isList = Array.isArray(source);
  const [, bump] = useState(0);
  const state = useRef(null);

  if (!state.current) {
    state.current = { entries: new Map(), timers: new Map() };
  }

  const { entries, timers } = state.current;
  const forceRender = () => bump((n) => n + 1);

  // Normalize both forms onto the keyed-entries machinery: the boolean form
  // is a one-item list under a fixed key.
  const items = isList ? source : source ? [true] : [];
  const keyOf = isList ? getKey : () => "presence";

  const liveKeys = new Map();
  for (const item of items) {
    liveKeys.set(String(keyOf(item)), item);
  }

  const result = [];
  for (const [key, item] of liveKeys) {
    result.push({ key, item, exiting: false });
  }

  // Present → absent: mark as exiting, remembering where the item sat in the
  // last returned list so it holds its position while animating out.
  for (const [key, entry] of entries) {
    if (liveKeys.has(key)) continue;
    const exitingEntry = { key, item: entry.item, exiting: true, index: entry.index };
    entries.set(key, exitingEntry);
    result.splice(Math.min(exitingEntry.index ?? result.length, result.length), 0, exitingEntry);
  }

  // Refresh bookkeeping for live items (also cancels an in-flight exit when
  // an item comes back before its timer fires).
  for (let index = 0; index < result.length; index += 1) {
    const slot = result[index];
    slot.index = index;
    if (!slot.exiting) {
      entries.set(slot.key, slot);
      const timer = timers.get(slot.key);
      if (timer) {
        clearTimeout(timer);
        timers.delete(slot.key);
      }
    }
  }

  useEffect(() => {
    for (const [key, entry] of entries) {
      if (!entry.exiting || timers.has(key)) continue;
      timers.set(key, setTimeout(() => {
        timers.delete(key);
        entries.delete(key);
        forceRender();
      }, duration));
    }
  });

  // Clear every pending timer when the owning component unmounts.
  useEffect(() => () => {
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();
  }, []);

  if (!isList) {
    const entry = result[0];
    return { mounted: Boolean(entry), exiting: Boolean(entry?.exiting) };
  }

  return result;
}

function defaultPresenceKey(item) {
  if (item && typeof item === "object") {
    return item.key ?? item.id;
  }
  return item;
}

// ── useMediaQuery ──────────────────────────────────────────
//
// Returns true while the CSS media query matches and updates reactively.
//
// Usage:
//   const isMobile = useMediaQuery("(max-width: 768px)");
//   const prefersMotion = useMediaQuery("(prefers-reduced-motion: no-preference)");

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// ── useIntersectionObserver ────────────────────────────────
//
// Observes when `ref.current` enters or leaves the viewport (or a custom root).
// Returns the latest IntersectionObserverEntry (null before first observation).
//
// Options:
//   threshold  — 0–1 or array of values (default 0)
//   root       — ancestor element to use as viewport (default null = browser viewport)
//   rootMargin — CSS margin string, e.g. "0px 0px -100px 0px" (default "0px")
//   once       — stop observing after first intersection (default false)
//
// Usage:
//   function LazyImage({ src }) {
//     const ref = useRef(null);
//     const entry = useIntersectionObserver(ref, { once: true });
//     return h("img", { ref, src: entry?.isIntersecting ? src : null });
//   }

export function useIntersectionObserver(ref, {
  threshold = 0,
  root = null,
  rootMargin = "0px",
  once = false,
} = {}) {
  const [entry, setEntry] = useState(null);
  const attached = useRef({ el: null, root: null, key: "", observer: null });

  // A `[ref.current]` dependency can't detect the target changing: deps are
  // evaluated while building THIS render's tree, before THIS render's patch
  // has updated ref.current. And re-creating the observer every render would
  // re-fire the initial observation → setEntry → render → infinite loop.
  // So the effect runs every render but only reattaches when the target
  // element (or an option) actually changed.
  const key = JSON.stringify([threshold, rootMargin, once]);
  useEffect(() => {
    const a = attached.current;
    const el = ref.current;
    if (el === a.el && root === a.root && key === a.key) return;

    a.observer?.disconnect();
    a.el = el;
    a.root = root;
    a.key = key;
    if (!el) { a.observer = null; return; }

    const observer = new IntersectionObserver(
      ([e]) => {
        setEntry(e);
        if (once && e.isIntersecting) observer.disconnect();
      },
      { threshold, root, rootMargin },
    );
    a.observer = observer;
    observer.observe(el);
  });

  useEffect(() => () => attached.current.observer?.disconnect(), []);

  return entry;
}

// ── useWebSocket ───────────────────────────────────────────
//
// Manages a WebSocket connection with auto-reconnect.
// Returns { status, lastMessage, send }.
//
// status: "connecting" | "open" | "closed" | "error"
// send(data) — serializes objects to JSON automatically.
//
// Options:
//   onMessage(event)     — called on every incoming message
//   onOpen(event)        — called when connection opens
//   onClose(event)       — called when connection closes
//   onError(event)       — called on error
//   reconnect            — auto-reconnect on close (default true)
//   reconnectDelay       — ms between reconnect attempts (default 3000)
//
// Usage:
//   const { status, lastMessage, send } = useWebSocket("wss://api.example.com/ws");
//   useEffect(() => {
//     if (lastMessage) setMessages(m => [...m, JSON.parse(lastMessage)]);
//   }, [lastMessage]);

export function useWebSocket(url, {
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectDelay = 3000,
} = {}) {
  const [status, setStatus] = useState(url ? "connecting" : "closed");
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const optsRef = useRef(null);
  optsRef.current = { onMessage, onOpen, onClose, onError, reconnect, reconnectDelay };

  useEffect(() => {
    if (!url) { setStatus("closed"); return; }
    // `alive` is scoped to THIS effect run, so each connection generation has
    // its own flag. A shared ref would race: the old socket's close event
    // arrives asynchronously, after a url change has already re-armed the
    // shared flag — and would schedule a reconnect to the OLD url.
    let alive = true;
    let timer = null;

    const connect = () => {
      if (!alive) return;
      setStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (e) => {
        if (!alive) return;
        setStatus("open");
        optsRef.current.onOpen?.(e);
      };

      ws.onmessage = (e) => {
        if (!alive) return;
        setLastMessage(e.data);
        optsRef.current.onMessage?.(e);
      };

      ws.onerror = (e) => {
        if (!alive) return;
        setStatus("error");
        optsRef.current.onError?.(e);
      };

      ws.onclose = (e) => {
        if (!alive) return;
        setStatus("closed");
        optsRef.current.onClose?.(e);
        if (optsRef.current.reconnect) {
          timer = setTimeout(connect, optsRef.current.reconnectDelay);
        }
      };
    };

    connect();
    return () => {
      alive = false;
      clearTimeout(timer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [url]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }, []);

  return { status, lastMessage, send };
}

// ── useVirtualList ─────────────────────────────────────────
//
// Renders only the visible slice of a large list, keeping memory and DOM
// nodes proportional to the viewport rather than the full dataset.
//
// All items must have the same fixed `itemHeight` (in px).
// `overscan` (default 3) — extra rows to render above and below the visible
// window to smooth fast scrolling.
//
// Returns:
//   containerRef  — attach to the scrollable wrapper
//   virtualItems  — [{ item, index, offsetTop }] — render these
//   totalHeight   — set as the inner spacer's height to preserve scroll range
//
// Usage:
//   function BigList({ rows }) {
//     const { containerRef, virtualItems, totalHeight } = useVirtualList(rows, { itemHeight: 48 });
//     return h("div", { ref: containerRef, style: { height: "600px", overflow: "auto" } },
//       h("div", { style: { height: totalHeight, position: "relative" } },
//         virtualItems.map(({ item, index, offsetTop }) =>
//           h("div", {
//             key: index,
//             style: { position: "absolute", top: offsetTop, height: 48, width: "100%" },
//           }, item.label),
//         ),
//       ),
//     );
//   }

export function useVirtualList(items, { itemHeight, overscan = 3 } = {}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
    // No dependency array — see the comment in useSwipe above for why
    // `[containerRef.current]` doesn't actually detect the ref's target
    // changing (e.g. if the scrollable element is conditionally rendered
    // and mounts on a later render).
  });

  const containerHeight = containerRef.current?.clientHeight ?? 0;
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = containerHeight > 0
    ? Math.ceil(containerHeight / itemHeight) + overscan * 2
    : overscan * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  const virtualItems = [];
  for (let i = startIndex; i < endIndex; i++) {
    virtualItems.push({ item: items[i], index: i, offsetTop: i * itemHeight });
  }

  return { containerRef, virtualItems, totalHeight, startIndex, endIndex };
}

// ── renderToString (server-side rendering) ─────────────────
//
// Renders a component (or a prebuilt vnode) to an HTML string, without a DOM.
// It runs the same component + hook machinery the client uses, in a server
// mode where:
//   - useState / useReducer return their initial value,
//   - useMemo / useCallback / useRef / useContext work normally,
//   - useEffect effects DO NOT run — side effects and browser-only work
//     belong in effects, which are client-only,
//   - useId produces stable ids.
//
// Attributes serialize with the exact same name mapping the client DOM uses
// (className→class, htmlFor→for, aria*→aria-*, style objects, dataset), and
// all text and attribute values are HTML-escaped, so dynamic content can't
// inject markup.
//
// Event handlers (onClick, ...) are omitted — they get wired up on the client.
// Hooks that read browser globals during render (window, document,
// localStorage, matchMedia, WebSocket, ...) are not usable on a non-browser
// runtime; keep that access inside effects.
//
// Usage:
//   import { renderToString } from "/dist/nexa-server.js";
//   const html = renderToString(App);
//   const html = renderToString(App, { title: "Home" });
//   const html = renderToString(h("main", { className: "m-page" }, "Hi"));

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

export function renderToString(input, props) {
  // Each server render starts a fresh useHead collection; a leftover from a
  // render that never called renderHeadToString() must not leak into this one.
  ssrHeadEntries = [];

  const tree = typeof input === "function"
    ? renderComponentToTree(input, props || {})
    : normalizeTree(input);

  let html = "";
  for (const node of tree) {
    html += serializeVNode(node);
  }
  return html;
}

function renderComponentToTree(component, props) {
  const root = createRoot(component, null);
  const previousRoot = currentRenderRoot;
  const previousOwner = currentHookOwner;

  prepareHookOwner(root);
  root.pendingEffects = [];
  currentRenderRoot = root;
  currentHookOwner = root;

  try {
    return normalizeTree(component(props));
  } finally {
    // Effects are intentionally never flushed on the server; the synthetic
    // root is discarded once serialization completes.
    currentRenderRoot = previousRoot;
    currentHookOwner = previousOwner;
  }
}

function serializeVNode(vnode) {
  if (vnode.type === TEXT_NODE) {
    return escapeText(vnode.props.nodeValue);
  }

  // Portals have no DOM target on the server — render their children inline so
  // content is not lost (position differs from the client; hydration
  // reconciles it later).
  if (vnode.type === PORTAL) {
    return serializeChildren(vnode.props.children);
  }

  const tag = vnode.type;
  const attributes = serializeAttributes(vnode.props);

  if (VOID_ELEMENTS.has(tag)) {
    return `<${tag}${attributes}>`;
  }

  // Raw HTML mirrors the client-side `innerHTML` prop: emitted verbatim
  // (never escaped) and replaces children entirely.
  if (vnode.props.innerHTML != null) {
    return `<${tag}${attributes}>${String(vnode.props.innerHTML)}</${tag}>`;
  }

  return `<${tag}${attributes}>${serializeChildren(vnode.props.children)}</${tag}>`;
}

function serializeChildren(children) {
  let out = "";
  for (const child of children) {
    out += serializeVNode(child);
  }
  return out;
}

function serializeAttributes(props) {
  const parts = [];

  for (const name of Object.keys(props)) {
    if (name === "children" || name === "key" || name === "ref" || name === "innerHTML") continue;

    const value = props[name];

    // Event handlers are client-only.
    if (name.startsWith("on") && typeof value === "function") continue;

    if (value === null || value === undefined || value === false) continue;

    if (name === "style") {
      const style = styleToString(value);
      if (style) parts.push(`style="${escapeAttribute(style)}"`);
      continue;
    }

    if (name === "dataset" && value && typeof value === "object") {
      for (const [key, dataValue] of Object.entries(value)) {
        if (dataValue === null || dataValue === undefined) continue;
        parts.push(`data-${camelToKebab(key)}="${escapeAttribute(String(dataValue))}"`);
      }
      continue;
    }

    const attribute = attributeAlias(name);

    if (value === true) {
      parts.push(attribute);
      continue;
    }

    parts.push(`${attribute}="${escapeAttribute(String(value))}"`);
  }

  return parts.length ? " " + parts.join(" ") : "";
}

function styleToString(style) {
  if (!style) return "";
  if (typeof style === "string") return style;

  const parts = [];
  for (const [name, value] of Object.entries(style)) {
    if (value === null || value === undefined) continue;
    const property = name.startsWith("--") ? name : camelToKebab(name);
    parts.push(`${property}: ${value}`);
  }
  return parts.join("; ");
}

function camelToKebab(name) {
  return name.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  // Escape &, <, > via escapeText, then the double-quote separately with
  // split/join (a `/"/g` regex literal trips some naive JS scanners).
  return escapeText(value).split('"').join("&quot;");
}

// ── hydrate (SSR phase 2) ──────────────────────────────────
//
// Adopts server-rendered HTML (from renderToString) instead of recreating it:
// runs the component once, then walks the existing DOM in tandem with the new
// vdom, reusing element and text nodes in place while attaching event handlers,
// refs, and any missing attributes. Only mismatches are (re)created.
//
// Expects the container's markup to be renderToString's own (compact) output.
// Two text-node subtleties are handled: the browser merges adjacent server
// text into one node (split back apart with splitText), and empty text nodes
// (`cond && h(...)` when false) are absent in the HTML (inserted here) — so the
// hydrated DOM ends up structurally identical to a fresh client render, and all
// later updates patch normally. Portals are not hydrated (created fresh). If
// hydration throws, it recovers with a clean client render.
//
// Usage:
//   import { hydrate } from "/dist/nexa-server.js";
//   hydrate(App, document.getElementById("app"));

export function hydrate(component, container) {
  if (typeof component !== "function") {
    throw new TypeError("hydrate expects a component as its first argument.");
  }

  if (roots.get(container)) {
    // Already mounted here — just re-render normally.
    render(component, container);
    return;
  }

  const root = createRoot(component, container);
  roots.set(container, root);
  liveRoots.add(root);

  prepareHookOwner(root);
  root.pendingEffects = [];
  const previousRoot = currentRenderRoot;
  const previousOwner = currentHookOwner;
  currentRenderRoot = root;
  currentHookOwner = root;

  let newTree;
  try {
    newTree = normalizeTree(root.component());
    cleanupUnusedChildren(root);
  } finally {
    currentRenderRoot = previousRoot;
    currentHookOwner = previousOwner;
  }

  try {
    hydrateChildren(container, newTree);
    root.oldTree = newTree;
    runEffects(root);
  } catch (error) {
    console.error("Nexa: hydration failed — falling back to a clean client render.", error);
    container.textContent = "";
    root.oldTree = [];
    scheduleRender(root);
  }
}

function hydrateChildren(parent, newChildren) {
  const doms = Array.from(parent.childNodes);
  let index = 0;

  for (const newChild of newChildren) {
    newChild._containerArray = newChildren;
    index = hydrateNode(parent, doms, index, newChild);
  }

  // Remove any leftover server nodes the new tree didn't claim.
  for (let i = index; i < doms.length; i += 1) {
    if (doms[i].parentNode === parent) {
      parent.removeChild(doms[i]);
    }
  }
}

function hydrateNode(parent, doms, index, vnode) {
  const reference = doms[index] || null;

  // Portals aren't hydrated — create fresh, consuming no server node.
  if (vnode.type === PORTAL) {
    parent.insertBefore(createDom(vnode, parent), reference);
    return index;
  }

  if (vnode.type === TEXT_NODE) {
    const value = vnode.props.nodeValue;

    // Empty text nodes have no server markup — insert one to keep alignment.
    if (value === "") {
      const node = document.createTextNode("");
      parent.insertBefore(node, reference);
      vnode._dom = node;
      return index;
    }

    const candidate = doms[index];
    if (candidate && candidate.nodeType === 3) {
      if (candidate.data === value) {
        vnode._dom = candidate;
        return index + 1;
      }
      // Adjacent text was merged by the parser — split this node's tail off so
      // the following text vnode can adopt it.
      if (candidate.data.startsWith(value)) {
        const tail = candidate.splitText(value.length);
        doms.splice(index + 1, 0, tail);
        vnode._dom = candidate;
        return index + 1;
      }
      // Content differs — reconcile in place.
      candidate.data = value;
      vnode._dom = candidate;
      return index + 1;
    }

    const node = document.createTextNode(value);
    parent.insertBefore(node, reference);
    vnode._dom = node;
    return index;
  }

  // Element.
  const candidate = doms[index];
  if (candidate && candidate.nodeType === 1 && candidate.localName === vnode.type) {
    vnode._dom = candidate;
    updateDom(candidate, {}, vnode.props);
    // innerHTML elements own their subtree — hydrating children here would
    // strip the injected markup (the vnode has no children to claim it).
    if (vnode.props.innerHTML == null) {
      hydrateChildren(candidate, vnode.props.children);
    }
    if (vnode.type === "select" && "value" in vnode.props) {
      candidate.value = vnode.props.value;
    }
    return index + 1;
  }

  // No matching node — create fresh, consuming no server node.
  parent.insertBefore(createDom(vnode, parent), reference);
  return index;
}
