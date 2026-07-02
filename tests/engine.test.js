// Engine tests: hooks, scheduling, and keyed reconciliation.
//
// These cover the riskiest parts of dist/nexa.js — the parts a silent
// regression would be most expensive to ship: state updates, effect
// ordering/cleanup, memoization, and how the patcher reuses vs. discards
// DOM nodes and hook state.

import {
  h,
  render,
  unmount,
  useState,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useErrorBoundary,
} from "../dist/nexa.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";

test("h() builds a tree and render() mounts it to the DOM", async () => {
  function Hello() {
    return h("h1", { className: "title" }, "Hello, Nexa");
  }

  const container = mountPoint();
  render(Hello, container);
  await flush();

  const heading = container.querySelector("h1.title");
  assert(heading, "expected an <h1.title> in the DOM");
  assertEqual(heading.textContent, "Hello, Nexa");
});

test("useState updates trigger a re-render with the new value", async () => {
  let setCount;

  function Counter() {
    const [count, setter] = useState(0);
    setCount = setter;
    return h("span", null, `count:${count}`);
  }

  const container = mountPoint();
  render(Counter, container);
  await flush();
  assertEqual(container.querySelector("span").textContent, "count:0");

  setCount((c) => c + 1);
  await flush();
  assertEqual(container.querySelector("span").textContent, "count:1");
});

test("useState bails out of re-rendering for an Object.is-equal value", async () => {
  let renders = 0;
  let setValue;

  function Box() {
    const [value, setter] = useState("a");
    setValue = setter;
    renders += 1;
    return h("span", null, value);
  }

  const container = mountPoint();
  render(Box, container);
  await flush();
  const rendersAfterMount = renders;

  setValue("a");
  await flush();
  assertEqual(renders, rendersAfterMount, "expected no re-render for an Object.is-equal value");
});

test("useEffect runs after mount and cleans up before re-running on dependency change", async () => {
  const log = [];
  let setDep;

  function Widget() {
    const [dep, setter] = useState(0);
    setDep = setter;

    useEffect(() => {
      log.push(`effect:${dep}`);
      return () => log.push(`cleanup:${dep}`);
    }, [dep]);

    return h("span", null, String(dep));
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(log.join(","), "effect:0");

  setDep(1);
  await flush();
  assertEqual(log.join(","), "effect:0,cleanup:0,effect:1");
});

test("useEffect cleanup runs on unmount", async () => {
  const log = [];

  function Widget() {
    useEffect(() => {
      log.push("mount");
      return () => log.push("unmount");
    }, []);
    return h("span", null, "x");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  unmount(container);
  assertEqual(log.join(","), "mount,unmount");
});

test("useMemo recomputes only when its dependencies change", async () => {
  let computations = 0;
  let setSeed;
  let setOther;

  function Widget() {
    const [seed, setSeedState] = useState(1);
    const [, setOtherState] = useState(0);
    setSeed = setSeedState;
    setOther = setOtherState;

    const value = useMemo(() => {
      computations += 1;
      return seed * 10;
    }, [seed]);

    return h("span", null, String(value));
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(computations, 1);

  setOther(1); // unrelated state — memo must not recompute
  await flush();
  assertEqual(computations, 1, "expected memo to bail out when its own dependency is unchanged");

  setSeed(2);
  await flush();
  assertEqual(computations, 2, "expected memo to recompute when its dependency changed");
  assertEqual(container.querySelector("span").textContent, "20");
});

test("useCallback returns a stable reference across renders when deps are unchanged", async () => {
  const seen = [];
  let rerender;

  function Widget() {
    const [, setTick] = useState(0);
    rerender = () => setTick((t) => t + 1);

    const onClick = useCallback(() => {}, []);
    seen.push(onClick);

    return h("button", { onClick }, "go");
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  rerender();
  await flush();

  assertEqual(seen.length, 2);
  assert(seen[0] === seen[1], "expected useCallback to return the same function reference across renders");
});

test("useRef keeps a stable identity and exposes the mounted DOM node", async () => {
  let elementRef;

  function Widget() {
    elementRef = useRef(null);
    return h("input", { ref: elementRef, defaultValue: "hi" });
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  assert(elementRef.current instanceof HTMLInputElement, "expected ref.current to be the mounted <input>");
  assertEqual(elementRef.current.value, "hi");
});

test("useReducer dispatches through the reducer and bails out on an unchanged state", async () => {
  let renders = 0;
  let dispatch;

  function reducer(state, action) {
    switch (action.type) {
      case "inc": return { count: state.count + 1 };
      case "noop": return state;
      default: return state;
    }
  }

  function Widget() {
    const [state, d] = useReducer(reducer, { count: 0 });
    dispatch = d;
    renders += 1;
    return h("span", null, String(state.count));
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  const rendersAfterMount = renders;

  dispatch({ type: "noop" });
  await flush();
  assertEqual(renders, rendersAfterMount, "expected no re-render when the reducer returns the same state object");

  dispatch({ type: "inc" });
  await flush();
  assertEqual(container.querySelector("span").textContent, "1");
});

test("keyed reconciliation reorders existing DOM nodes instead of recreating them", async () => {
  let setItems;

  function List({ items }) {
    return h("ul", null, items.map((item) => h("li", { key: item }, item)));
  }

  function Widget() {
    const [items, setter] = useState(["a", "b", "c"]);
    setItems = setter;
    return h(List, { items });
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();

  const [a, b, c] = [...container.querySelectorAll("li")];
  assertEqual([a, b, c].map((li) => li.textContent).join(","), "a,b,c");

  setItems(["c", "a", "b"]);
  await flush();

  const reordered = [...container.querySelectorAll("li")];
  assertEqual(reordered.map((li) => li.textContent).join(","), "c,a,b");
  assert(
    reordered[0] === c && reordered[1] === a && reordered[2] === b,
    "expected keyed <li> elements to be moved in place rather than recreated",
  );
});

test("removing a keyed item unmounts only that item and leaves the others alone", async () => {
  const log = [];
  let setItems;

  function Item({ id }) {
    useEffect(() => {
      log.push(`mount:${id}`);
      return () => log.push(`unmount:${id}`);
    }, [id]);
    return h("li", { key: id }, id);
  }

  function Widget() {
    const [items, setter] = useState(["a", "b", "c"]);
    setItems = setter;
    return h("ul", null, items.map((id) => h(Item, { key: id, id })));
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(log.join(","), "mount:a,mount:b,mount:c");

  setItems(["a", "c"]);
  await flush();

  assertEqual(log.join(","), "mount:a,mount:b,mount:c,unmount:b");
  assertEqual([...container.querySelectorAll("li")].map((li) => li.textContent).join(","), "a,c");
});

test("a component discards its hook state when conditional rendering unmounts and remounts it", async () => {
  let toggle;
  let bump;
  const seen = [];

  function Child() {
    const [count, setCount] = useState(0);
    bump = () => setCount((c) => c + 1);
    seen.push(count);
    return h("span", null, String(count));
  }

  function Widget() {
    const [show, setShow] = useState(true);
    toggle = () => setShow((s) => !s);
    return show ? h(Child, null) : null;
  }

  const container = mountPoint();
  render(Widget, container);
  await flush();
  assertEqual(seen.join(","), "0");

  bump();
  await flush();
  assertEqual(container.querySelector("span").textContent, "1");

  toggle(); // unmount Child — its hook state should be discarded
  await flush();
  assert(!container.querySelector("span"), "expected Child to be unmounted");

  toggle(); // remount Child — useState(0) should start over, not resume at 1
  await flush();
  assertEqual(seen.join(","), "0,1,0", "expected Child's useState to re-initialize on remount");
  assertEqual(container.querySelector("span").textContent, "0");
});

test("h(\"svg\", ...) creates elements in the SVG namespace, with foreignObject reverting to HTML", async () => {
  function Chart() {
    return h(
      "svg",
      { viewBox: "0 0 100 100", "stroke-width": 2 },
      h("g", { class: "layer" }, h("circle", { cx: 50, cy: 50, r: 40, fill: "tomato" })),
      h("foreignObject", { x: 0, y: 0, width: 100, height: 100 },
        h("div", { className: "caption" }, "plain HTML inside SVG")),
    );
  }

  const container = mountPoint();
  render(Chart, container);
  await flush();

  const svg = container.querySelector("svg");
  const g = container.querySelector("g");
  const circle = container.querySelector("circle");
  const foreignObject = container.querySelector("foreignObject");
  const caption = container.querySelector(".caption");

  assert(svg, "expected an <svg> in the DOM");
  assertEqual(svg.namespaceURI, SVG_NS, "expected <svg> to live in the SVG namespace");
  assertEqual(g.namespaceURI, SVG_NS, "expected <g> to inherit the SVG namespace");
  assertEqual(circle.namespaceURI, SVG_NS, "expected <circle> to inherit the SVG namespace");
  assertEqual(foreignObject.namespaceURI, SVG_NS, "expected <foreignObject> itself to stay in the SVG namespace");
  assert(caption, "expected the HTML <div class=\"caption\"> inside <foreignObject>");
  assertEqual(caption.namespaceURI, HTML_NS, "expected <foreignObject> children to revert to the HTML namespace");

  assertEqual(svg.getAttribute("viewBox"), "0 0 100 100");
  assertEqual(svg.getAttribute("stroke-width"), "2");
  assertEqual(g.getAttribute("class"), "layer", "expected className to map to class via setAttribute fallback on SVG elements");
  assertEqual(circle.getAttribute("cx"), "50", "expected read-only SVGAnimatedLength props to fall back to setAttribute");
  assertEqual(circle.getAttribute("fill"), "tomato");
});

test("patching an SVG tree updates attributes in place without recreating elements in the wrong namespace", async () => {
  let setRadius;

  function Chart() {
    const [radius, setter] = useState(10);
    setRadius = setter;
    return h("svg", { viewBox: "0 0 100 100" }, h("circle", { cx: 50, cy: 50, r: radius }));
  }

  const container = mountPoint();
  render(Chart, container);
  await flush();

  const circleBefore = container.querySelector("circle");
  assertEqual(circleBefore.getAttribute("r"), "10");

  setRadius(25);
  await flush();

  const circleAfter = container.querySelector("circle");
  assert(circleBefore === circleAfter, "expected the patcher to reuse the existing <circle> DOM node");
  assertEqual(circleAfter.getAttribute("r"), "25");
  assertEqual(circleAfter.namespaceURI, SVG_NS, "expected the patched <circle> to remain in the SVG namespace");
});

test("<select value> selects the matching <option> on first mount even when it isn't the first option", async () => {
  function Form() {
    return h(
      "select",
      { value: "b" },
      h("option", { value: "a" }, "A"),
      h("option", { value: "b" }, "B"),
      h("option", { value: "c" }, "C"),
    );
  }

  const container = mountPoint();
  render(Form, container);
  await flush();

  const select = container.querySelector("select");
  assertEqual(
    select.value,
    "b",
    "expected the select's value to match the requested option even though option elements didn't exist yet when value was first set",
  );
});

test("<select value> re-selects correctly when a patch adds new options and a value pointing at one of them", async () => {
  let setState;

  function Form() {
    const [state, setter] = useState({ value: "a", options: ["a"] });
    setState = setter;
    return h(
      "select",
      { value: state.value },
      state.options.map((opt) => h("option", { key: opt, value: opt }, opt.toUpperCase())),
    );
  }

  const container = mountPoint();
  render(Form, container);
  await flush();

  setState({ value: "c", options: ["a", "b", "c"] });
  await flush();

  const select = container.querySelector("select");
  assertEqual(
    select.value,
    "c",
    "expected the select to land on the newly-added option even though it didn't exist in the DOM when value was patched",
  );
});

// Render and effect errors are reported through console.error by design (see
// runSafely / scheduleRender in dist/nexa.js) — these tests trigger them on
// purpose, so we capture console.error instead of letting it spam the run.
async function withSilencedConsoleError(fn) {
  const original = console.error;
  const calls = [];
  console.error = (...args) => calls.push(args);

  try {
    await fn();
  } finally {
    console.error = original;
  }

  return calls;
}

test("useErrorBoundary catches a render error, shows a fallback, and retries once after reset", async () => {
  let shouldThrow = true;
  let renderAttempts = 0;
  let boundaryError;
  let boundaryReset;

  function Flaky() {
    renderAttempts += 1;
    if (shouldThrow) {
      throw new Error("Flaky blew up");
    }
    return h("p", { className: "ok" }, "recovered");
  }

  function Boundary() {
    const [error, reset, guard] = useErrorBoundary();
    boundaryError = error;
    boundaryReset = reset;

    if (error) {
      return h("p", { className: "fallback" }, `caught: ${error.message}`);
    }

    return guard(() => h(Flaky, null));
  }

  const container = mountPoint();

  const mountErrors = await withSilencedConsoleError(async () => {
    render(Boundary, container);
    await flush();
  });

  assert(mountErrors.length > 0, "expected the caught render error to be reported via console.error");
  assert(boundaryError instanceof Error && boundaryError.message === "Flaky blew up", "expected the boundary to capture the thrown Error");
  assertEqual(container.querySelector(".fallback")?.textContent, "caught: Flaky blew up");
  assert(!container.querySelector(".ok"), "expected the failing subtree to be replaced by the fallback, not left in the DOM");
  assertEqual(renderAttempts, 1, "expected exactly one render attempt — the latched error must stop further retries");

  shouldThrow = false;
  boundaryReset();
  await flush();

  assertEqual(boundaryError, null, "expected reset() to clear the latched error");
  assertEqual(container.querySelector(".ok")?.textContent, "recovered");
  assert(!container.querySelector(".fallback"), "expected the fallback to be replaced once the guarded render succeeds");
  assertEqual(renderAttempts, 2, "expected guard to retry the render exactly once after reset()");
});

test("a throwing effect or cleanup is reported but does not block its siblings", async () => {
  const log = [];

  function Boom() {
    useEffect(() => {
      log.push("boom:mount");
      throw new Error("boom mount");
    }, []);
    return h("span", null, "boom");
  }

  function Steady() {
    useEffect(() => {
      log.push("steady:mount");
      return () => log.push("steady:cleanup");
    }, []);
    return h("span", null, "steady");
  }

  function BoomCleanup() {
    useEffect(() => {
      log.push("boomCleanup:mount");
      return () => {
        log.push("boomCleanup:cleanup");
        throw new Error("boom cleanup");
      };
    }, []);
    return h("span", null, "boomCleanup");
  }

  function Widget() {
    return h("div", null, h(Boom, null), h(Steady, null), h(BoomCleanup, null));
  }

  const container = mountPoint();

  const mountErrors = await withSilencedConsoleError(async () => {
    render(Widget, container);
    await flush();
  });

  assertEqual(log.join(","), "boom:mount,steady:mount,boomCleanup:mount", "expected every mount effect to run even though Boom's threw");
  assert(mountErrors.length > 0, "expected the thrown mount effect to be reported via console.error");

  const unmountErrors = await withSilencedConsoleError(async () => {
    unmount(container);
  });

  assertEqual(
    log.join(","),
    "boom:mount,steady:mount,boomCleanup:mount,steady:cleanup,boomCleanup:cleanup",
    "expected every cleanup to run even though boomCleanup's threw",
  );
  assert(unmountErrors.length > 0, "expected the thrown cleanup to be reported via console.error");
});
