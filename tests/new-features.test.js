// Tests for new hooks and features added in the new-hooks-and-features branch:
// memo, createPortal, createLazy, useId, useDebounce, useThrottle,
// useMediaQuery, useIntersectionObserver, useWebSocket, useVirtualList.

import {
  h,
  render,
  unmount,
  useState,
  useEffect,
  useRef,
  memo,
  createPortal,
  createLazy,
  useId,
  useDebounce,
  useThrottle,
  useMediaQuery,
  useIntersectionObserver,
  useWebSocket,
  useVirtualList,
} from "../dist/nexa.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── memo ───────────────────────────────────────────────────

test("memo skips re-rendering when parent re-renders but props are shallowly equal", async () => {
  let childRenders = 0;
  let setTick;

  const Child = memo(function Child({ label }) {
    childRenders += 1;
    return h("span", null, label);
  });

  function Parent() {
    const [, setTickState] = useState(0);
    setTick = setTickState;
    return h(Child, { label: "hello" });
  }

  const container = mountPoint();
  render(Parent, container);
  await flush();
  assertEqual(childRenders, 1);

  setTick(1);
  await flush();
  assertEqual(childRenders, 1, "expected memo to skip re-render when props are unchanged");
});

test("memo re-renders when props change", async () => {
  let childRenders = 0;
  let setLabel;

  const Child = memo(function Child({ label }) {
    childRenders += 1;
    return h("span", null, label);
  });

  function Parent() {
    const [label, setLabelState] = useState("a");
    setLabel = setLabelState;
    return h(Child, { label });
  }

  const container = mountPoint();
  render(Parent, container);
  await flush();
  assertEqual(childRenders, 1);

  setLabel("b");
  await flush();
  assertEqual(childRenders, 2, "expected memo to re-render when a prop value changes");
  assertEqual(container.querySelector("span").textContent, "b");
});

test("memo re-renders when a component inside the memoized tree calls setState", async () => {
  let increment;

  const Child = memo(function Child({ label }) {
    const [count, setCount] = useState(0);
    increment = () => setCount((c) => c + 1);
    return h("span", null, `${label}:${count}`);
  });

  function Parent() {
    return h(Child, { label: "x" });
  }

  const container = mountPoint();
  render(Parent, container);
  await flush();
  assertEqual(container.querySelector("span").textContent, "x:0");

  increment();
  await flush();
  assertEqual(
    container.querySelector("span").textContent,
    "x:1",
    "expected memo to re-render when a descendant calls setState (dirty flag)",
  );
});

test("memo custom compare function controls when re-rendering happens", async () => {
  let childRenders = 0;
  let setData;

  // Only re-renders when the `id` field changes; ignores other fields.
  const Child = memo(
    function Child({ data }) {
      childRenders += 1;
      return h("span", null, data.id);
    },
    (prev, next) => prev.data.id === next.data.id,
  );

  function Parent() {
    const [data, setDataState] = useState({ id: 1, extra: "a" });
    setData = setDataState;
    return h(Child, { data });
  }

  const container = mountPoint();
  render(Parent, container);
  await flush();
  assertEqual(childRenders, 1);

  setData({ id: 1, extra: "b" }); // id unchanged — custom compare says equal
  await flush();
  assertEqual(childRenders, 1, "expected custom compare to prevent re-render when id is the same");

  setData({ id: 2, extra: "b" }); // id changed — should re-render
  await flush();
  assertEqual(childRenders, 2, "expected custom compare to allow re-render when id changes");
  assertEqual(container.querySelector("span").textContent, "2");
});

// ── createPortal ───────────────────────────────────────────

test("createPortal renders children into the specified DOM node instead of the current parent", async () => {
  const target = document.createElement("div");
  document.body.appendChild(target);

  function Widget() {
    return h(
      "div",
      { className: "host" },
      createPortal(h("p", { className: "portal-child" }, "portal content"), target),
    );
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assert(
    !container.querySelector(".portal-child"),
    "expected portal child to NOT be rendered inside the original parent",
  );
  const portalChild = target.querySelector(".portal-child");
  assert(portalChild, "expected portal child to be rendered inside the target DOM node");
  assertEqual(portalChild.textContent, "portal content");

  unmount(container);
  target.remove();
});

test("createPortal cleans up its target children when the component unmounts", async () => {
  const target = document.createElement("div");
  document.body.appendChild(target);

  function Widget() {
    return createPortal(h("p", { className: "pc" }, "hi"), target);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assert(target.querySelector(".pc"), "expected portal child to exist after mount");

  unmount(container);
  assert(!target.querySelector(".pc"), "expected portal target to be emptied after unmount");

  target.remove();
});

test("createPortal updates its children on re-render", async () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  let setMsg;

  function Widget() {
    const [msg, setMsgState] = useState("v1");
    setMsg = setMsgState;
    return createPortal(h("p", { className: "pm" }, msg), target);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(target.querySelector(".pm").textContent, "v1");

  setMsg("v2");
  await flush();
  assertEqual(target.querySelector(".pm").textContent, "v2", "expected portal content to update on re-render");

  unmount(container);
  target.remove();
});

// ── createLazy ─────────────────────────────────────────────

test("createLazy shows fallback while loading and renders component after promise resolves", async () => {
  let resolveLoad;
  const loadPromise = new Promise((resolve) => { resolveLoad = resolve; });

  function RealComponent({ value }) {
    return h("p", { className: "loaded" }, `value:${value}`);
  }

  const LazyComp = createLazy(
    () => loadPromise.then(() => ({ default: RealComponent })),
    h("p", { className: "loading" }, "carregando..."),
  );

  function Widget() {
    return h(LazyComp, { value: "42" });
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assert(container.querySelector(".loading"), "expected fallback to be shown while loading");
  assert(!container.querySelector(".loaded"), "expected real component to not be rendered yet");

  resolveLoad();
  await flush();
  await flush(); // extra tick: promise resolution + scheduleRender + microtask

  assert(!container.querySelector(".loading"), "expected fallback to disappear after load");
  assert(container.querySelector(".loaded"), "expected real component to be rendered after load");
  assertEqual(container.querySelector(".loaded").textContent, "value:42");
});

test("createLazy per-use fallback prop overrides the default fallback", async () => {
  let resolveLoad;
  const loadPromise = new Promise((resolve) => { resolveLoad = resolve; });

  const LazyComp = createLazy(
    () => loadPromise.then(() => ({ default: () => h("p", null, "done") })),
    h("span", { className: "default-fb" }, "default"),
  );

  function Widget() {
    return h(LazyComp, { fallback: h("span", { className: "per-use-fb" }, "per-use") });
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assert(!container.querySelector(".default-fb"), "expected default fallback to be overridden");
  assert(container.querySelector(".per-use-fb"), "expected per-use fallback to be shown");

  resolveLoad();
  await flush();
  await flush();
});

// ── useId ──────────────────────────────────────────────────

test("useId returns a stable ID string across renders", async () => {
  const seen = [];
  let rerender;

  function Widget() {
    const [, setTick] = useState(0);
    rerender = () => setTick((t) => t + 1);
    const id = useId();
    seen.push(id);
    return h("span", { id }, "x");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  rerender();
  await flush();

  assertEqual(seen.length, 2);
  assert(seen[0] === seen[1], "expected useId to return the same ID across renders");
  assert(typeof seen[0] === "string" && seen[0].length > 0, "expected useId to return a non-empty string");
});

test("useId generates unique IDs for different component instances", async () => {
  const ids = [];

  function Field() {
    const id = useId();
    ids.push(id);
    return h("span", { id }, "x");
  }

  function Widget() {
    return h("div", null, h(Field, { key: "a" }), h(Field, { key: "b" }), h(Field, { key: "c" }));
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assertEqual(ids.length, 3);
  const uniqueIds = new Set(ids);
  assertEqual(uniqueIds.size, 3, "expected each component instance to receive a unique ID");
});

// ── useDebounce ────────────────────────────────────────────

test("useDebounce preserves the previous value immediately and updates after delay", async () => {
  let setInput;

  function Widget() {
    const [input, setInputState] = useState("initial");
    setInput = setInputState;
    const debounced = useDebounce(input, 30);
    return h("span", { className: "d" }, debounced);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(container.querySelector(".d").textContent, "initial");

  setInput("updated");
  await flush();
  assertEqual(
    container.querySelector(".d").textContent,
    "initial",
    "expected debounced value to stay old immediately after input changes",
  );

  await sleep(50);
  await flush();
  assertEqual(
    container.querySelector(".d").textContent,
    "updated",
    "expected debounced value to update after the delay elapses",
  );
});

test("useDebounce resets the timer when the value changes again before the delay elapses", async () => {
  let setInput;

  function Widget() {
    const [input, setInputState] = useState("a");
    setInput = setInputState;
    const debounced = useDebounce(input, 40);
    return h("span", { className: "d" }, debounced);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  setInput("b");
  await flush();
  await sleep(20); // halfway through delay

  setInput("c"); // resets the timer
  await flush();
  await sleep(20); // only 20ms since "c" was set — delay not elapsed yet
  await flush();
  assertEqual(
    container.querySelector(".d").textContent,
    "a",
    "expected value to still be old because debounce timer was reset",
  );

  await sleep(30); // now elapsed
  await flush();
  assertEqual(container.querySelector(".d").textContent, "c");
});

// ── useThrottle ────────────────────────────────────────────

test("useThrottle fires immediately on first call and then throttles within the window", async () => {
  const calls = [];
  let throttled;

  function Widget() {
    const fn = (v) => calls.push(v);
    throttled = useThrottle(fn, 50);
    return h("span", null, "x");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  throttled("a"); // fires immediately
  assertEqual(calls.join(","), "a", "expected first call to fire immediately");

  throttled("b"); // within window — queued
  throttled("c"); // replaces "b" as the trailing call
  assertEqual(calls.join(","), "a", "expected calls within the throttle window to not fire yet");

  await sleep(70);
  assertEqual(calls.join(","), "a,c", "expected trailing call to fire after the throttle window");
});

// ── useMediaQuery ──────────────────────────────────────────

test("useMediaQuery returns true for 'all' and false for 'not all'", async () => {
  let result;

  function Widget() {
    const alwaysTrue = useMediaQuery("all");
    const alwaysFalse = useMediaQuery("not all");
    result = { alwaysTrue, alwaysFalse };
    return h("span", null, "x");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assertEqual(result.alwaysTrue, true, "expected 'all' media query to match");
  assertEqual(result.alwaysFalse, false, "expected 'not all' media query to not match");
});

// ── useIntersectionObserver ────────────────────────────────

test("useIntersectionObserver returns null before the first observation fires", async () => {
  let entry;

  function Widget() {
    const ref = useRef(null);
    entry = useIntersectionObserver(ref);
    return h("div", { ref }, "observe me");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assertEqual(entry, null, "expected useIntersectionObserver to return null synchronously before the observer fires");
});

// ── useWebSocket ───────────────────────────────────────────

test("useWebSocket starts in 'closed' status when no URL is provided", async () => {
  let wsState;

  function Widget() {
    wsState = useWebSocket(null);
    return h("span", null, wsState.status);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assertEqual(wsState.status, "closed", "expected status to be 'closed' when URL is null");
  assertEqual(wsState.lastMessage, null, "expected lastMessage to be null initially");
  assert(typeof wsState.send === "function", "expected send to be a callable function");
});

// ── useVirtualList ─────────────────────────────────────────

test("useVirtualList computes totalHeight as items.length * itemHeight", async () => {
  const items = Array.from({ length: 200 }, (_, i) => ({ id: i }));
  let listState;

  function Widget() {
    listState = useVirtualList(items, { itemHeight: 50 });
    return h("div", { ref: listState.containerRef }, "list");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assertEqual(listState.totalHeight, 200 * 50, "expected totalHeight = items.length * itemHeight");
});

test("useVirtualList virtualItems cover the overscan zone even when container height is zero", async () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `item-${i}` }));
  let listState;

  function Widget() {
    listState = useVirtualList(items, { itemHeight: 40, overscan: 5 });
    return h("div", { ref: listState.containerRef }, "list");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  // containerHeight is 0 (no layout in headless). With overscan=5:
  //   startIndex = max(0, floor(0/40) - 5) = 0
  //   visibleCount = overscan*2 = 10  (containerHeight=0 branch)
  //   endIndex = min(100, 0 + 10) = 10
  assertEqual(listState.startIndex, 0);
  assertEqual(listState.endIndex, 10);
  assertEqual(listState.virtualItems.length, 10);
  assertEqual(listState.virtualItems[0].item, items[0]);
  assertEqual(listState.virtualItems[0].offsetTop, 0);
  assertEqual(listState.virtualItems[4].index, 4);
  assertEqual(listState.virtualItems[4].offsetTop, 4 * 40);
  assertEqual(listState.virtualItems[9].index, 9);
  assertEqual(listState.virtualItems[9].offsetTop, 9 * 40);
});

test("useVirtualList clamps virtualItems to the end of the items array", async () => {
  const items = Array.from({ length: 3 }, (_, i) => ({ id: i }));
  let listState;

  function Widget() {
    listState = useVirtualList(items, { itemHeight: 40, overscan: 10 });
    return h("div", { ref: listState.containerRef }, "list");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  // overscan*2=20 but only 3 items exist — endIndex must be clamped to 3
  assertEqual(listState.endIndex, 3, "expected endIndex to be clamped to items.length");
  assertEqual(listState.virtualItems.length, 3);
});
