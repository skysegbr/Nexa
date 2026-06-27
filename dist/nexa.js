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
    scheduleRender(owner.renderRoot);
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
    scheduleRender(owner.renderRoot);
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

  function LazyComponent(props) {
    if (status === 1) return Component(props);
    if (status === 2) throw loadError;

    if (!promise) {
      promise = loader().then(
        (mod) => {
          status = 1;
          Component = mod.default ?? mod;
          for (const root of liveRoots) {
            scheduleRender(root);
          }
        },
        (err) => {
          status = 2;
          loadError = err;
          for (const root of liveRoots) {
            scheduleRender(root);
          }
        },
      );
    }

    const perUseFallback = props.fallback;
    return perUseFallback !== undefined ? perUseFallback : fallback;
  }

  Object.defineProperty(LazyComponent, "name", { value: "Lazy" });
  return LazyComponent;
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
  const dirty = Object.keys(baseline).some(
    (key) => !Object.is(values[key], baseline[key]),
  );

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
    childCursor: 0,
    children: new Map(),
    nextChildren: new Set(),
    oldTree: [],
    pendingEffects: [],
    renderRoot: null,
    renderQueued: false,
    dirty: false,
  };

  root.renderRoot = root;
  return root;
}

function createComponentOwner(renderRoot) {
  return {
    hooks: [],
    hookCursor: 0,
    childCursor: 0,
    children: new Map(),
    nextChildren: new Set(),
    renderRoot,
    dirty: false,
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
  const identity = componentIdentity(type, props, parentOwner.childCursor);
  parentOwner.childCursor += 1;

  let owner = parentOwner.children.get(identity);

  if (!owner) {
    owner = createComponentOwner(currentRenderRoot);
    parentOwner.children.set(identity, owner);
  }

  parentOwner.nextChildren.add(identity);

  // Memo: skip re-render when props are shallowly equal and neither this
  // owner nor any of its descendants have called setState since last render.
  // `owner.dirty` covers state changes INSIDE the component itself (since
  // memo's Memoized wrapper calls component(props) in the same owner context,
  // the component's own useState/useReducer marks this owner as dirty).
  // `hasDirtyDescendant` covers state changes in child components.
  if (type._isMemo && owner.memoizedOutput !== undefined) {
    const compare = type._memoCompare;
    const equal = compare
      ? compare(owner.memoizedProps, props)
      : !shallowPropsChanged(owner.memoizedProps, props);
    if (equal && !owner.dirty && !hasDirtyDescendant(owner)) {
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
    return tree;
  } finally {
    currentHookOwner = previousOwner;
  }
}

function prepareHookOwner(owner) {
  owner.hookCursor = 0;
  owner.childCursor = 0;
  owner.nextChildren = new Set();
  owner.dirty = false;
}

function cleanupUnusedChildren(owner) {
  for (const [identity, child] of owner.children) {
    if (!owner.nextChildren.has(identity)) {
      cleanupEffects(child);
      owner.children.delete(identity);
    }
  }
}

function componentIdentity(type, props, index) {
  return `${componentTypeId(type)}:${props.key ?? `index-${index}`}`;
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

// Shallow prop comparison for memo: returns true when props differ.
// Compares all keys (including children) by Object.is — same as React.memo.
function shallowPropsChanged(prev, next) {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return true;
  return prevKeys.some((k) => !Object.is(prev[k], next[k]));
}

function scheduleRender(root) {
  if (root.renderQueued) {
    return;
  }

  root.renderQueued = true;

  queueMicrotask(() => {
    root.renderQueued = false;
    prepareHookOwner(root);
    root.pendingEffects = [];
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
  });
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
    dom.appendChild(createDom(child, dom));
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
    clearRef(oldVNode.props.ref);
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

function updateDom(dom, previousProps, nextProps) {
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

  return {
    provide(value, renderFn) {
      stack.push(value);
      try {
        return renderFn();
      } finally {
        stack.pop();
      }
    },
    get _value() {
      return stack[stack.length - 1];
    },
  };
}

export function useContext(context) {
  requireHookOwner("useContext");
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
  }, [ref.current]);
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
  }, [ref.current]);
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

  const setValue = (value) => {
    const next = typeof value === "function" ? value(stored) : value;
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
    setStored(next);
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

export function useRouter() {
  const getPath = () => {
    const hash = window.location.hash.slice(1) || "/";
    const q = hash.indexOf("?");
    return q === -1 ? hash : hash.slice(0, q);
  };

  const getParams = () => {
    const hash = window.location.hash.slice(1) || "";
    const q = hash.indexOf("?");
    return q === -1 ? {} : Object.fromEntries(new URLSearchParams(hash.slice(q + 1)));
  };

  const [path, setPath] = useState(getPath);
  const [params, setParams] = useState(getParams);

  useEffect(() => {
    const handler = () => {
      setPath(getPath());
      setParams(getParams());
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to) => {
    window.location.hash = to;
  }, []);

  return { path, params, navigate };
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
// Usage:
//   const { data, loading, error, refetch } = useFetch("/api/nodes");

export function useFetch(url, options = {}) {
  const [state, setState] = useState({ data: null, loading: !!url, error: null });
  const abortRef  = useRef(null);
  const optionStr = JSON.stringify(options);

  const run = useCallback((targetUrl) => {
    if (!targetUrl) { setState({ data: null, loading: false, error: null }); return; }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(targetUrl, { signal: ctrl.signal, ...JSON.parse(optionStr) })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ data: null, loading: false, error: err.message ?? String(err) });
      });
  }, [optionStr]);

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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([e]) => {
        setEntry(e);
        if (once && e.isIntersecting) observer.disconnect();
      },
      { threshold, root, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref.current, threshold, root, rootMargin, once]);

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
  const timerRef = useRef(null);
  const activeRef = useRef(true);

  const connect = useCallback(() => {
    if (!url || !activeRef.current) return;
    setStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (e) => {
      setStatus("open");
      onOpen?.(e);
    };

    ws.onmessage = (e) => {
      setLastMessage(e.data);
      onMessage?.(e);
    };

    ws.onerror = (e) => {
      setStatus("error");
      onError?.(e);
    };

    ws.onclose = (e) => {
      setStatus("closed");
      onClose?.(e);
      if (reconnect && activeRef.current) {
        timerRef.current = setTimeout(connect, reconnectDelay);
      }
    };
  }, [url, reconnect, reconnectDelay]);

  useEffect(() => {
    activeRef.current = true;
    connect();
    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      wsRef.current?.close();
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
  }, [containerRef.current]);

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
