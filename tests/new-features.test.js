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
  createContext,
  useContext,
  memo,
  createPortal,
  createLazy,
  loadCSS,
  useId,
  useDebounce,
  useThrottle,
  useMediaQuery,
  useIntersectionObserver,
  useWebSocket,
  useVirtualList,
  useRouter,
  useSwipe,
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

test("memo re-renders when a context value it consumes changes", async () => {
  const ThemeContext = createContext("light");
  let setTheme;

  const Label = memo(function Label() {
    const theme = useContext(ThemeContext);
    return h("span", null, theme);
  });

  function App() {
    const [theme, setThemeState] = useState("light");
    setTheme = setThemeState;
    return ThemeContext.provide(theme, () => h("div", null, h(Label, { fixed: 1 })));
  }

  const container = mountPoint();
  render(App, container);
  await flush();
  assertEqual(container.querySelector("span").textContent, "light");

  setTheme("dark");
  await flush();
  assertEqual(
    container.querySelector("span").textContent,
    "dark",
    "expected memo to re-render when a context value read inside it changed",
  );
});

test("memo re-renders when a descendant of the memoized tree consumes a changed context", async () => {
  const CountContext = createContext(0);
  let setCount;
  let wrapperRenders = 0;

  function Leaf() {
    const count = useContext(CountContext);
    return h("em", null, String(count));
  }

  // The memoized component itself never reads the context — only its child
  // does, so the staleness check must walk the owner subtree.
  const Wrapper = memo(function Wrapper() {
    wrapperRenders += 1;
    return h("div", null, h(Leaf, { fixed: 1 }));
  });

  function App() {
    const [count, setCountState] = useState(0);
    setCount = setCountState;
    return CountContext.provide(count, () => h("section", null, h(Wrapper, { fixed: 1 })));
  }

  const container = mountPoint();
  render(App, container);
  await flush();
  assertEqual(container.querySelector("em").textContent, "0");
  assertEqual(wrapperRenders, 1);

  setCount(41);
  await flush();
  assertEqual(
    container.querySelector("em").textContent,
    "41",
    "expected memo to re-render when a descendant's context read went stale",
  );

  // And with nothing changed, the memo skip must still work.
  const rendersAfterUpdate = wrapperRenders;
  setCount(41); // Object.is-equal — no re-render at all
  await flush();
  assertEqual(wrapperRenders, rendersAfterUpdate, "expected memo to keep skipping when context is unchanged");
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

// ── loadCSS ────────────────────────────────────────────────

test("loadCSS injects the stylesheet once, dedupes repeat calls, and applies the CSS", async () => {
  const href = "./loadcss.fixture.css";
  const p1 = loadCSS(href);
  const p2 = loadCSS(href);
  assert(p1 === p2, "expected repeat calls with the same href to return the same promise");

  await p1;

  const url = new URL(href, document.baseURI).href;
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
    (link) => link.href === url,
  );
  assertEqual(links.length, 1, "expected exactly one injected <link> for the href");

  // Absolute and relative spellings of the same URL share the cache entry.
  assert(loadCSS(url) === p1, "expected dedupe by resolved URL, not by raw string");

  // The sheet really applies — not just a tag in <head>.
  const probe = document.createElement("div");
  probe.className = "loadcss-probe";
  document.body.appendChild(probe);
  assertEqual(getComputedStyle(probe).marginTop, "7px", "expected the loaded CSS to apply");
  probe.remove();
});

test("loadCSS rejects on a missing stylesheet and evicts the entry so a retry is possible", async () => {
  const href = "./does-not-exist.fixture.css";
  const p1 = loadCSS(href);

  let failed = false;
  try {
    await p1;
  } catch {
    failed = true;
  }
  assert(failed, "expected loadCSS to reject for a stylesheet that 404s");

  const p2 = loadCSS(href);
  assert(p2 !== p1, "expected the failed entry to be evicted so the next call retries");
  await p2.catch(() => {}); // settle the retry so nothing rejects unhandled
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

test("useThrottle cancels a pending trailing call when the component unmounts", async () => {
  const calls = [];
  let throttled;

  function Widget() {
    throttled = useThrottle((v) => calls.push(v), 50);
    return h("span", null, "x");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  throttled("a"); // fires immediately
  throttled("b"); // queued as the trailing call
  assertEqual(calls.join(","), "a");

  unmount(container);
  await sleep(70);
  assertEqual(calls.join(","), "a", "expected the trailing call to be cancelled on unmount");
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
  // Capture the FIRST render's value only: the real IntersectionObserver may
  // legitimately fire (and re-render with an entry) before flush() resolves,
  // so asserting on the latest value races against the browser.
  let firstRenderEntry;
  let firstRenderSeen = false;

  function Widget() {
    const ref = useRef(null);
    const entry = useIntersectionObserver(ref);
    if (!firstRenderSeen) {
      firstRenderSeen = true;
      firstRenderEntry = entry;
    }
    return h("div", { ref }, "observe me");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assertEqual(firstRenderEntry, null, "expected useIntersectionObserver to return null on the first render, before the observer fires");
});

test("useIntersectionObserver attaches once the ref's target mounts on a later render, without observer churn", async () => {
  const RealIO = window.IntersectionObserver;
  const instances = [];
  window.IntersectionObserver = class {
    constructor(cb, options) {
      this.cb = cb;
      this.options = options;
      this.observed = [];
      instances.push(this);
    }
    observe(el) { this.observed.push(el); }
    disconnect() { this.disconnected = true; }
  };

  try {
    let setShow;
    const ref = { current: null };

    function Widget() {
      const [show, setShowState] = useState(false);
      setShow = setShowState;
      useIntersectionObserver(ref);
      return show ? h("div", { ref, id: "io-target" }) : h("p", null, "hidden");
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();
    assertEqual(instances.length, 0, "no element yet — nothing to observe");

    setShow(true);
    await flush();
    assertEqual(instances.length, 1, "expected the observer to attach once the target mounted");
    assertEqual(instances[0].observed[0], container.querySelector("#io-target"));

    // Deliver an entry — the resulting re-render must NOT recreate the observer.
    instances[0].cb([{ isIntersecting: true, target: instances[0].observed[0] }]);
    await flush();
    await flush();
    assertEqual(instances.length, 1, "expected no observer churn on unrelated re-renders");

    unmount(container);
    assert(instances[0].disconnected, "expected the observer to disconnect on unmount");
  } finally {
    window.IntersectionObserver = RealIO;
  }
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

// Deterministic stand-in for window.WebSocket: tests drive open/message/close
// through the _open/_message/_close helpers, exactly as the browser would
// (asynchronously, via the assigned on* handlers).
class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  constructor(url) {
    this.url = url;
    this.readyState = FakeWebSocket.CONNECTING;
    this.sent = [];
    FakeWebSocket.instances.push(this);
  }
  send(data) { this.sent.push(data); }
  close() { this.readyState = FakeWebSocket.CLOSED; }
  _open() { this.readyState = FakeWebSocket.OPEN; this.onopen?.({}); }
  _message(data) { this.onmessage?.({ data }); }
  _close() { this.readyState = FakeWebSocket.CLOSED; this.onclose?.({}); }
}

async function withFakeWebSocket(run) {
  const RealWS = window.WebSocket;
  FakeWebSocket.instances = [];
  window.WebSocket = FakeWebSocket;
  try {
    await run(FakeWebSocket.instances);
  } finally {
    window.WebSocket = RealWS;
  }
}

test("useWebSocket connects, tracks status/lastMessage, and send serializes objects", async () => {
  await withFakeWebSocket(async (instances) => {
    let wsState;
    const seen = [];

    function Widget() {
      wsState = useWebSocket("wss://one.test/ws", { onMessage: (e) => seen.push(e.data) });
      return h("span", null, wsState.status);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();

    assertEqual(instances.length, 1);
    assertEqual(instances[0].url, "wss://one.test/ws");
    assertEqual(wsState.status, "connecting");

    instances[0]._open();
    await flush();
    assertEqual(wsState.status, "open");

    instances[0]._message('{"n":1}');
    await flush();
    assertEqual(wsState.lastMessage, '{"n":1}');
    assertEqual(seen.join(","), '{"n":1}', "expected the onMessage callback to fire");

    wsState.send({ hello: "world" });
    wsState.send("plain");
    assertEqual(instances[0].sent[0], '{"hello":"world"}', "expected objects to be JSON-serialized");
    assertEqual(instances[0].sent[1], "plain");

    unmount(container);
  });
});

test("useWebSocket reconnects after a server-side close", async () => {
  await withFakeWebSocket(async (instances) => {
    function Widget() {
      useWebSocket("wss://one.test/ws", { reconnectDelay: 10 });
      return h("span", null);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();
    instances[0]._open();
    await flush();

    instances[0]._close(); // dropped by the server
    await sleep(40);
    assertEqual(instances.length, 2, "expected a new connection after reconnectDelay");
    assertEqual(instances[1].url, "wss://one.test/ws");

    unmount(container);
  });
});

test("useWebSocket: a url change never reconnects to the old url, even when the old socket closes late", async () => {
  await withFakeWebSocket(async (instances) => {
    let setUrl;

    function Widget() {
      const [url, setUrlState] = useState("wss://old.test/ws");
      setUrl = setUrlState;
      useWebSocket(url, { reconnectDelay: 10 });
      return h("span", null);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();
    const oldSocket = instances[0];
    oldSocket._open();
    await flush();

    setUrl("wss://new.test/ws");
    await flush();
    assertEqual(instances.length, 2, "expected a fresh connection for the new url");
    assertEqual(instances[1].url, "wss://new.test/ws");

    // The browser delivers the old socket's close event only now, after the
    // new connection is already up.
    oldSocket._close();
    await sleep(40);

    const oldUrlConnections = instances.filter((ws) => ws.url === "wss://old.test/ws");
    assertEqual(oldUrlConnections.length, 1, "expected the old socket's late close to never trigger a reconnect to the old url");

    unmount(container);
  });
});

test("useWebSocket closes the socket on unmount and never reconnects", async () => {
  await withFakeWebSocket(async (instances) => {
    function Widget() {
      useWebSocket("wss://one.test/ws", { reconnectDelay: 10 });
      return h("span", null);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();
    instances[0]._open();
    await flush();

    unmount(container);
    assertEqual(instances[0].readyState, FakeWebSocket.CLOSED, "expected the socket to be closed on unmount");

    instances[0]._close(); // the close event lands after unmount
    await sleep(40);
    assertEqual(instances.length, 1, "expected no reconnect after unmount");
  });
});

test("useWebSocket callbacks are not stale: handlers see the latest render's props", async () => {
  await withFakeWebSocket(async (instances) => {
    let setLabel;
    const seen = [];

    function Widget() {
      const [label, setLabelState] = useState("first");
      setLabel = setLabelState;
      useWebSocket("wss://one.test/ws", { onMessage: (e) => seen.push(`${label}:${e.data}`) });
      return h("span", null);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();
    instances[0]._open();
    await flush();

    instances[0]._message("a");
    setLabel("second");
    await flush();
    instances[0]._message("b");

    assertEqual(seen.join(","), "first:a,second:b", "expected onMessage to read the latest render's closure");

    unmount(container);
  });
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

// ── useRouter ────────────────────────────────────────────────

// history-mode tests mutate the real page's URL via the History API.
// Restore it afterward so later tests (and repeated suite runs) start clean.
async function withRestoredLocation(fn) {
  const originalUrl = window.location.pathname + window.location.search + window.location.hash;
  try {
    await fn();
  } finally {
    window.history.replaceState(null, "", originalUrl);
  }
}

test("useRouter (hash mode) reads the initial path/params and updates on hashchange", async () => {
  window.location.hash = "#/initial";
  let router;

  function Widget() {
    router = useRouter();
    return h("span", null, router.path);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(router.path, "/initial");

  window.location.hash = "#/next?tab=profile";
  await flush();
  assertEqual(router.path, "/next");
  assertEqual(router.params.tab, "profile");

  window.location.hash = "";
});

test("useRouter (hash mode) navigate() sets window.location.hash", async () => {
  window.location.hash = "#/start";
  let router;

  function Widget() {
    router = useRouter();
    return h("span", null, router.path);
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  router.navigate("/settings?tab=security");
  await flush();
  assertEqual(window.location.hash, "#/settings?tab=security");
  assertEqual(router.path, "/settings");
  assertEqual(router.params.tab, "security");

  window.location.hash = "";
});

test("useRouter (history mode) reads path/params from pathname/search and updates on popstate", async () => {
  await withRestoredLocation(async () => {
    window.history.replaceState(null, "", "/initial?x=1");
    let router;

    function Widget() {
      router = useRouter({ mode: "history" });
      return h("span", null, router.path);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();
    assertEqual(router.path, "/initial");
    assertEqual(router.params.x, "1");

    // pushState alone never fires popstate — only real history-stack
    // navigation (back/forward) does. Simulate that navigation explicitly.
    window.history.pushState(null, "", "/next?y=2");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await flush();
    assertEqual(router.path, "/next");
    assertEqual(router.params.y, "2");
  });
});

test("useRouter (history mode) navigate() pushes state and updates path without a popstate event", async () => {
  await withRestoredLocation(async () => {
    window.history.replaceState(null, "", "/start");
    let router;

    function Widget() {
      router = useRouter({ mode: "history" });
      return h("span", null, router.path);
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();

    router.navigate("/dashboard?tab=x");
    await flush();
    assertEqual(window.location.pathname, "/dashboard");
    assertEqual(router.path, "/dashboard");
    assertEqual(router.params.tab, "x");
  });
});

test("useRouter (history mode) intercepts a same-origin <a href> click instead of reloading the page", async () => {
  await withRestoredLocation(async () => {
    window.history.replaceState(null, "", "/start");
    let router;

    function Widget() {
      router = useRouter({ mode: "history" });
      return h("a", { href: "/clicked", id: "rt-link" }, "go");
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();

    container.querySelector("#rt-link").click();
    await flush();

    assertEqual(window.location.pathname, "/clicked", "expected the click to be intercepted via pushState instead of a real navigation");
    assertEqual(router.path, "/clicked");
  });
});

test("useRouter (history mode) does not intercept a same-page fragment link", async () => {
  await withRestoredLocation(async () => {
    window.history.replaceState(null, "", "/page");
    let router;
    let observedEvent;

    function Widget() {
      router = useRouter({ mode: "history" });
      return h("a", { href: "#section", id: "rt-frag-link" }, "jump");
    }

    const container = mountPoint();
    render(Widget, container);
    await flush();

    const link = container.querySelector("#rt-frag-link");
    link.addEventListener("click", (e) => { observedEvent = e; });
    link.click();
    await flush();

    assertEqual(observedEvent.defaultPrevented, false, "expected same-page fragment links to keep their native behavior");
    assertEqual(router.path, "/page", "expected path to stay the same for a same-page fragment link");
  });
});

// ── useSwipe / useVirtualList: ref reconnects after its target changes ─────
//
// Both hooks used to key their listener-attaching effect off `[ref.current]`.
// That looks like it detects the ref's target changing, but it doesn't: the
// dependency array is evaluated during THIS render's tree-building phase,
// before THIS render's patch has updated ref.current — so it always compares
// the old value against itself. A ref whose target mounts later (conditional
// rendering) or gets replaced (tag/key change) would silently never get its
// listener (re)attached. Fixed by dropping the dependency array so the effect
// re-runs (cleanup + reattach) after every render instead.

function fireSwipeLeft(el) {
  // Real Touch/TouchEvent where the browser allows constructing them
  // (Chromium). Firefox desktop doesn't define the constructors and WebKit
  // desktop defines them but throws "Illegal constructor", so build all four
  // objects before dispatching and fall back to plain events carrying the
  // touch-list shape the hook reads.
  try {
    const start = new Touch({ identifier: 1, target: el, clientX: 200, clientY: 100 });
    const end = new Touch({ identifier: 1, target: el, clientX: 100, clientY: 100 });
    const startEvent = new TouchEvent("touchstart", { touches: [start], bubbles: true });
    const endEvent = new TouchEvent("touchend", { changedTouches: [end], bubbles: true });
    el.dispatchEvent(startEvent);
    el.dispatchEvent(endEvent);
  } catch {
    const start = new Event("touchstart", { bubbles: true });
    start.touches = [{ identifier: 1, target: el, clientX: 200, clientY: 100 }];
    const end = new Event("touchend", { bubbles: true });
    end.changedTouches = [{ identifier: 1, target: el, clientX: 100, clientY: 100 }];
    el.dispatchEvent(start);
    el.dispatchEvent(end);
  }
}

test("useSwipe attaches its listener once the ref's target mounts on a later render", async () => {
  let setShow;
  let swipes = 0;
  const ref = { current: null };

  function Widget() {
    const [show, setShowState] = useState(false);
    setShow = setShowState;
    useSwipe(ref, { onSwipeLeft: () => { swipes += 1; } });
    return show ? h("div", { ref, id: "swipe-target" }) : h("p", null, "hidden");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  setShow(true);
  await flush();

  fireSwipeLeft(container.querySelector("#swipe-target"));
  await flush();
  assertEqual(swipes, 1, "expected the swipe listener to be attached to the element mounted on the second render");
});

test("useVirtualList's own scroll listener attaches once the ref's target mounts on a later render", async () => {
  let setShow;
  let listState;
  const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));

  function Widget() {
    const [show, setShowState] = useState(false);
    setShow = setShowState;
    listState = useVirtualList(items, { itemHeight: 40, overscan: 2 });
    return show
      ? h("div", { ref: listState.containerRef, id: "list-container" })
      : h("p", null, "hidden");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  setShow(true);
  await flush();

  const el = container.querySelector("#list-container");
  // The test sandbox positions containers far off-screen, where headless
  // Chromium doesn't compute real scrollable overflow geometry — stub
  // scrollTop directly instead. This test is only about whether the
  // listener (re)attaches, not about real scroll layout.
  Object.defineProperty(el, "scrollTop", { value: 400, configurable: true });
  el.dispatchEvent(new Event("scroll"));
  await flush();

  assertEqual(
    listState.startIndex,
    Math.max(0, Math.floor(400 / 40) - 2),
    "expected useVirtualList's internal scroll listener to be attached to the element mounted on the second render",
  );
});
