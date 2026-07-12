// Tests for the v0.2 feature set: raw HTML via `innerHTML`, useHead,
// usePresence, and targeted subtree re-renders.

import {
  h,
  hydrate,
  render,
  createContext,
  createLazy,
  memo,
  renderHeadToString,
  renderToString,
  useContext,
  useEffect,
  useErrorBoundary,
  useHead,
  usePresence,
  useState,
} from "../dist/nexa.js";
import { assert, assertEqual, flush, mountPoint, test } from "./runner.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── innerHTML ──────────────────────────────────────────────

test("innerHTML: injects raw HTML on mount", async () => {
  const mp = mountPoint();
  render(() => h("div", { className: "raw", innerHTML: "<b>bold</b> text" }), mp);
  await flush();

  assert(mp.querySelector(".raw b"), "expected injected <b> element");
  assertEqual(mp.querySelector(".raw").innerHTML, "<b>bold</b> text");
});

test("innerHTML: updating the string replaces the injected content", async () => {
  const mp = mountPoint();
  let setHtml;

  function Raw() {
    const [html, set] = useState("<b>first</b>");
    setHtml = set;
    return h("div", { innerHTML: html });
  }

  render(Raw, mp);
  await flush();
  assert(mp.querySelector("b"), "expected initial <b>");

  setHtml("<i>second</i>");
  await flush();
  assert(!mp.querySelector("b"), "old content should be gone");
  assertEqual(mp.querySelector("i").textContent, "second");
});

test("innerHTML: removing the prop clears the injected content", async () => {
  const mp = mountPoint();
  let toggle;

  function Sw() {
    const [raw, set] = useState(true);
    toggle = () => set(false);
    return raw ? h("p", { innerHTML: "<u>raw</u>" }) : h("p", null, "plain");
  }

  render(Sw, mp);
  await flush();
  assert(mp.querySelector("u"), "expected injected <u>");

  toggle();
  await flush();
  assert(!mp.querySelector("u"), "injected content should be cleared");
  assertEqual(mp.querySelector("p").textContent, "plain");
});

test("innerHTML: renderToString emits it verbatim (never escaped)", async () => {
  const html = renderToString(h("div", { className: "x", innerHTML: "<b>&amp; raw</b>" }));
  assertEqual(html, '<div class="x"><b>&amp; raw</b></div>');
});

// ── useHead ────────────────────────────────────────────────

test("useHead: sets document.title and upserts meta tags on the client", async () => {
  const previousTitle = document.title;
  const mp = mountPoint();
  let setTitle;

  function Page() {
    const [title, set] = useState("First Title");
    setTitle = set;
    useHead({ title, meta: [{ name: "test:description", content: `d-${title}` }] });
    return h("div", null, title);
  }

  try {
    render(Page, mp);
    await flush();
    assertEqual(document.title, "First Title");

    const metas = () =>
      [...document.head.querySelectorAll("meta")].filter(
        (m) => m.getAttribute("name") === "test:description",
      );
    assertEqual(metas().length, 1);
    assertEqual(metas()[0].getAttribute("content"), "d-First Title");
    assert(metas()[0].hasAttribute("data-nexa-head"), "expected data-nexa-head marker");

    setTitle("Second Title");
    await flush();
    assertEqual(document.title, "Second Title");
    assertEqual(metas().length, 1, "meta must be updated in place, not duplicated");
    assertEqual(metas()[0].getAttribute("content"), "d-Second Title");
  } finally {
    document.title = previousTitle;
    for (const m of document.head.querySelectorAll('meta[name="test:description"]')) m.remove();
  }
});

test("useHead: renderToString collects entries for renderHeadToString", async () => {
  function Page() {
    useHead({
      title: "App <Default>",
      meta: [{ name: "description", content: "app-level" }],
    });
    useHead({
      title: "Page Title",
      meta: [
        { name: "description", content: 'page "level"' },
        { property: "og:title", content: "OG Page" },
      ],
    });
    return h("main", null, "content");
  }

  const html = renderToString(Page);
  assertEqual(html, "<main>content</main>");

  const head = renderHeadToString();
  assert(head.includes("<title>Page Title</title>"), `last title wins, got: ${head}`);
  assert(!head.includes("App"), "overridden title must not appear");
  assert(
    head.includes('<meta name="description" content="page &quot;level&quot;" data-nexa-head>'),
    `expected deduped+escaped description, got: ${head}`,
  );
  assert(head.includes('<meta property="og:title" content="OG Page" data-nexa-head>'));

  assertEqual(renderHeadToString(), "", "a second call must return nothing (already consumed)");
});

// ── usePresence ────────────────────────────────────────────

test("usePresence(boolean): keeps the element mounted while exiting, then unmounts", async () => {
  const mp = mountPoint();
  let setOpen;

  function Banner() {
    const [open, set] = useState(true);
    setOpen = set;
    const { mounted, exiting } = usePresence(open, { duration: 40 });
    return h("div", null, mounted ? h("output", { className: exiting ? "leaving" : "shown" }, "hi") : null);
  }

  render(Banner, mp);
  await flush();
  assertEqual(mp.querySelector("output").className, "shown");

  setOpen(false);
  await flush();
  assert(mp.querySelector("output"), "element must stay mounted during exit");
  assertEqual(mp.querySelector("output").className, "leaving");

  await wait(80);
  assert(!mp.querySelector("output"), "element must unmount after the exit duration");
});

test("usePresence(boolean): re-showing during the exit cancels it", async () => {
  const mp = mountPoint();
  let setOpen;

  function Banner() {
    const [open, set] = useState(true);
    setOpen = set;
    const { mounted, exiting } = usePresence(open, { duration: 40 });
    return h("div", null, mounted ? h("output", { className: exiting ? "leaving" : "shown" }, "hi") : null);
  }

  render(Banner, mp);
  await flush();

  setOpen(false);
  await flush();
  setOpen(true);
  await flush();
  assertEqual(mp.querySelector("output").className, "shown");

  await wait(80);
  assert(mp.querySelector("output"), "cancelled exit must not unmount the element");
});

test("usePresence(list): exiting items hold their position, then leave", async () => {
  const mp = mountPoint();
  let setItems;

  function List() {
    const [items, set] = useState([1, 2, 3]);
    setItems = set;
    const rows = usePresence(items, { duration: 40 });
    return h(
      "ul",
      null,
      rows.map((row) => h("li", { key: row.key, className: row.exiting ? "exit" : "" }, String(row.item))),
    );
  }

  render(List, mp);
  await flush();
  assertEqual(mp.querySelectorAll("li").length, 3);

  setItems([1, 3]);
  await flush();
  const lis = mp.querySelectorAll("li");
  assertEqual(lis.length, 3, "removed item must stay mounted during exit");
  assertEqual(lis[1].textContent, "2", "exiting item must keep its position");
  assertEqual(lis[1].className, "exit");

  await wait(80);
  const after = [...mp.querySelectorAll("li")].map((li) => li.textContent);
  assertEqual(after.join(","), "1,3");
});

// ── targeted subtree re-renders ────────────────────────────

test("subtree: child setState re-renders only the child", async () => {
  const mp = mountPoint();
  const renders = { app: 0, middle: 0, sibling: 0, child: 0 };
  let bump;

  function Child() {
    renders.child += 1;
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    return h("b", null, String(n));
  }

  function Sibling() {
    renders.sibling += 1;
    return h("p", null, "sib");
  }

  function Middle() {
    renders.middle += 1;
    return h("section", null, h(Child), h(Sibling));
  }

  function App() {
    renders.app += 1;
    return h("div", null, h(Middle));
  }

  render(App, mp);
  await flush();
  assertEqual(mp.querySelector("b").textContent, "0");

  bump();
  await flush();
  assertEqual(mp.querySelector("b").textContent, "1");
  assertEqual(renders.child, 2, "child re-renders");
  assertEqual(renders.app, 1, "app must NOT re-render");
  assertEqual(renders.middle, 1, "middle must NOT re-render");
  assertEqual(renders.sibling, 1, "sibling must NOT re-render");
});

test("subtree: parent setState still flows new props to children", async () => {
  const mp = mountPoint();
  let bump;

  function Kid({ n }) {
    return h("b", null, String(n));
  }

  function Parent() {
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    return h("div", null, h(Kid, { n }));
  }

  function App() {
    return h("main", null, h(Parent));
  }

  render(App, mp);
  await flush();

  bump();
  await flush();
  assertEqual(mp.querySelector("b").textContent, "1");
});

test("subtree: targeted re-render sees provided context values", async () => {
  const mp = mountPoint();
  const Ctx = createContext("default");
  let bump;

  function Child() {
    const value = useContext(Ctx);
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    return h("b", null, `${value}:${n}`);
  }

  function App() {
    return h("div", null, Ctx.provide("provided", () => h(Child)));
  }

  render(App, mp);
  await flush();
  assertEqual(mp.querySelector("b").textContent, "provided:0");

  bump();
  await flush();
  assertEqual(
    mp.querySelector("b").textContent,
    "provided:1",
    "targeted re-render must see the provided value, not the default",
  );
});

test("subtree: output type change is patched in place", async () => {
  const mp = mountPoint();
  let toggle;

  function Shape() {
    const [on, set] = useState(false);
    toggle = () => set((v) => !v);
    return on ? h("em", null, "on") : h("strong", null, "off");
  }

  function App() {
    return h("div", null, h(Shape), h("span", null, "anchor"));
  }

  render(App, mp);
  await flush();
  assert(mp.querySelector("strong"), "starts as <strong>");

  toggle();
  await flush();
  assert(!mp.querySelector("strong"));
  assertEqual(mp.querySelector("em").textContent, "on");
  assertEqual(mp.querySelector("span").textContent, "anchor", "siblings untouched");
});

test("subtree: fragment-output components fall back to a full render and stay correct", async () => {
  const mp = mountPoint();
  let bump;

  function Frag() {
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    return [h("i", { className: "a" }, String(n)), h("i", { className: "b" }, String(n * 2))];
  }

  function App() {
    return h("div", null, h(Frag));
  }

  render(App, mp);
  await flush();

  bump();
  await flush();
  assertEqual(mp.querySelector(".a").textContent, "1");
  assertEqual(mp.querySelector(".b").textContent, "2");
});

test("subtree: effects run after a targeted re-render", async () => {
  const mp = mountPoint();
  const seen = [];
  let bump;

  function Child() {
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    useEffect(() => {
      seen.push(`${n}:${mp.querySelector("b").textContent}`);
    }, [n]);
    return h("b", null, String(n));
  }

  function App() {
    return h("div", null, h(Child));
  }

  render(App, mp);
  await flush();

  bump();
  await flush();
  assertEqual(seen.join("|"), "0:0|1:1", "effect must run after the DOM committed");
});

test("subtree: memo components still skip when a sibling updates", async () => {
  const mp = mountPoint();
  let heavyRenders = 0;
  let bump;

  const Heavy = memo(function Heavy({ label }) {
    heavyRenders += 1;
    return h("p", null, label);
  });

  function Wrap() {
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    return h("div", null, h("span", null, String(n)), h(Heavy, { label: "fixed" }));
  }

  function App() {
    return h("main", null, h(Wrap));
  }

  render(App, mp);
  await flush();

  bump();
  await flush();
  assertEqual(mp.querySelector("span").textContent, "1");
  assertEqual(heavyRenders, 1, "memo must still skip inside a targeted re-render");
});

test("subtree: setState on an unmounted component is ignored", async () => {
  const mp = mountPoint();
  let setInner;
  let hide;

  function Temp() {
    const [n, set] = useState(0);
    setInner = set;
    return h("u", null, String(n));
  }

  function App() {
    const [show, set] = useState(true);
    hide = () => set(false);
    return h("div", null, show ? h(Temp) : h("p", null, "gone"));
  }

  render(App, mp);
  await flush();

  hide();
  await flush();
  assertEqual(mp.querySelector("p").textContent, "gone");

  setInner(99);
  await flush();
  assertEqual(mp.querySelector("p").textContent, "gone", "no crash, no spurious render");
});

test("subtree: a throw during a targeted re-render reaches the error boundary", async () => {
  const mp = mountPoint();
  let boom;

  function Bomb() {
    const [n, set] = useState(0);
    boom = () => set(1);
    if (n > 0) {
      throw new Error("bomb");
    }
    return h("span", null, "ok");
  }

  function App() {
    const [error, , guard] = useErrorBoundary();
    return h("div", null, error ? h("b", null, "caught") : guard(() => h(Bomb)));
  }

  render(App, mp);
  await flush();
  assertEqual(mp.querySelector("span").textContent, "ok");

  boom();
  await flush();
  assertEqual(mp.querySelector("b").textContent, "caught");
});

test("subtree: createLazy resolution re-renders only the lazy owner", async () => {
  const mp = mountPoint();
  let appRenders = 0;
  let resolveLoader;

  const LazyThing = createLazy(
    () =>
      new Promise((resolve) => {
        resolveLoader = () => resolve({ default: () => h("mark", null, "loaded") });
      }),
    h("span", null, "loading"),
  );

  function App() {
    appRenders += 1;
    return h("div", null, h(LazyThing));
  }

  render(App, mp);
  await flush();
  assertEqual(mp.querySelector("span").textContent, "loading");
  assertEqual(appRenders, 1);

  resolveLoader();
  await flush();
  assertEqual(mp.querySelector("mark").textContent, "loaded");
  assertEqual(appRenders, 1, "resolution must not re-render the whole app");
});

// ── regressions from the branch code review ────────────────

test("review: fallback inside a memo parent still commits the update", async () => {
  const mp = mountPoint();
  let bump;

  function Toggle() {
    const [on, set] = useState(false);
    bump = () => set(true);
    return on
      ? [h("i", { className: "fa" }, "a"), h("i", { className: "fb" }, "b")]
      : h("button", null, "single");
  }

  const Wrap = memo(function Wrap() {
    return h("div", null, h(Toggle));
  });

  function App() {
    return h("main", null, h(Wrap));
  }

  render(App, mp);
  await flush();
  assert(mp.querySelector("button"), "starts as a single element");

  bump();
  await flush();
  assert(!mp.querySelector("button"), "old output must be gone");
  assert(mp.querySelector(".fa") && mp.querySelector(".fb"), "fragment output must commit through the memo parent");
});

test("review: a throw under a memo parent still reaches the error boundary", async () => {
  const mp = mountPoint();
  let boom;

  function Bomb() {
    const [n, set] = useState(0);
    boom = () => set(1);
    if (n > 0) {
      throw new Error("bomb");
    }
    return h("span", null, "fine");
  }

  const Wrap = memo(function Wrap() {
    return h("section", null, h(Bomb));
  });

  function App() {
    const [error, , guard] = useErrorBoundary();
    return h("div", null, error ? h("b", null, "caught") : guard(() => h(Wrap)));
  }

  render(App, mp);
  await flush();
  assertEqual(mp.querySelector("span").textContent, "fine");

  boom();
  await flush();
  assertEqual(mp.querySelector("b")?.textContent, "caught", "boundary must latch through the memo parent");
});

test("review: provider change blocks memo skip so context snapshots stay fresh", async () => {
  const mp = mountPoint();
  const Ctx = createContext("default");
  let setVal;
  let reveal;

  function Consumer() {
    const [show, set] = useState(false);
    reveal = () => set(true);
    // Reading the context only in the revealed branch is safe in Nexa:
    // useContext consumes no hook cursor.
    const value = show ? useContext(Ctx) : "hidden";
    return h("b", null, String(value));
  }

  const Wrap = memo(function Wrap() {
    return h("section", null, h(Consumer));
  });

  function App() {
    const [v, set] = useState("A");
    setVal = set;
    return h("div", null, Ctx.provide(v, () => h(Wrap)));
  }

  render(App, mp);
  await flush();
  assertEqual(mp.querySelector("b").textContent, "hidden");

  setVal("B");
  await flush();

  reveal();
  await flush();
  assertEqual(
    mp.querySelector("b").textContent,
    "B",
    "targeted re-render must see the value provided AFTER the memo boundary was crossed",
  );
});

test("review: dep-less effects run exactly once per commit across the shape-change fallback", async () => {
  const mp = mountPoint();
  let effectRuns = 0;
  let bump;

  function Frag() {
    const [n, set] = useState(0);
    bump = () => set((v) => v + 1);
    useEffect(() => {
      effectRuns += 1;
    });
    return n === 0 ? h("span", null, "one") : [h("i", null, "a"), h("i", null, "b")];
  }

  function App() {
    return h("div", null, h(Frag));
  }

  render(App, mp);
  await flush();
  assertEqual(effectRuns, 1);

  bump();
  await flush();
  assertEqual(mp.querySelectorAll("i").length, 2);
  assertEqual(effectRuns, 2, "the carried + re-queued entries must dedupe to one run");
});

test("review: effects run only after every sibling in the batch has patched", async () => {
  const mp = mountPoint();
  let observed = null;
  let bumpA;
  let bumpB;

  function A() {
    const [n, set] = useState(0);
    bumpA = () => set(1);
    useEffect(() => {
      if (n > 0) {
        observed = mp.querySelector(".b-out").textContent;
      }
    }, [n]);
    return h("span", null, String(n));
  }

  function B() {
    const [n, set] = useState(0);
    bumpB = () => set(1);
    return h("em", { className: "b-out" }, String(n));
  }

  function App() {
    return h("div", null, h(A), h(B));
  }

  render(App, mp);
  await flush();

  bumpA();
  bumpB();
  await flush();
  assertEqual(observed, "1", "A's effect must see B's committed DOM, not the stale value");
});

test("review: one fallback in a batch does not re-render the other members twice", async () => {
  const mp = mountPoint();
  const renders = { b: 0 };
  let bumpFrag;
  let bumpB;

  function FragToggle() {
    const [n, set] = useState(0);
    bumpFrag = () => set(1);
    return n === 0 ? h("span", null, "s") : [h("i", null, "a"), h("i", null, "b")];
  }

  function Counter() {
    renders.b += 1;
    const [n, set] = useState(0);
    bumpB = () => set(1);
    return h("em", null, String(n));
  }

  function App() {
    return h("div", null, h(FragToggle), h(Counter));
  }

  render(App, mp);
  await flush();
  assertEqual(renders.b, 1);

  bumpFrag();
  bumpB();
  await flush();
  assertEqual(mp.querySelector("em").textContent, "1");
  assertEqual(renders.b, 2, "the root fallback already covered Counter — no second targeted pass");
});

test("review: innerHTML drops children (warning once) instead of corrupting the tree", async () => {
  const mp = mountPoint();
  const warns = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warns.push(args.join(" "));
  let toggleShow;

  function Mix() {
    const [show, set] = useState(false);
    toggleShow = () => set(true);
    return h(
      "div",
      null,
      h("p", { innerHTML: "<u>raw</u>" }, show && h("span", { className: "ghost" }, "x")),
      h("b", null, String(show)),
    );
  }

  try {
    render(Mix, mp);
    await flush();
    assert(mp.querySelector("u"), "raw HTML injected");
    assertEqual(warns.length, 0, "falsy conditional children must not warn");

    toggleShow();
    await flush();
    assertEqual(mp.querySelector("b").textContent, "true", "app keeps rendering");
    assert(mp.querySelector("u"), "raw HTML preserved");
    assert(!mp.querySelector(".ghost"), "conflicting child is dropped");
    assertEqual(warns.filter((w) => w.includes("innerHTML")).length, 1, "one warning for real children");
  } finally {
    console.warn = originalWarn;
  }
});

test("review: removing innerHTML with a conditional child swap does not wedge the app", async () => {
  const mp = mountPoint();
  let toggleRich;

  function Sw() {
    const [rich, set] = useState(true);
    toggleRich = () => set(false);
    return h("p", rich ? { innerHTML: "<u>r</u>" } : {}, !rich && h("span", null, "plain"));
  }

  render(Sw, mp);
  await flush();
  assert(mp.querySelector("u"), "starts with raw HTML");

  toggleRich();
  await flush();
  assert(!mp.querySelector("u"), "raw content cleared");
  assertEqual(mp.querySelector("span").textContent, "plain", "vnode children take over cleanly");
});

test("review: hydrate adopts innerHTML content without rebuilding it", async () => {
  const mp = mountPoint();

  function Page() {
    return h("div", { className: "host", innerHTML: "<b>keep</b>" });
  }

  mp.innerHTML = renderToString(Page);
  const before = mp.querySelector(".host b");
  assert(before, "server markup present before hydration");

  hydrate(Page, mp);
  assert(mp.querySelector(".host b") === before, "the node inside the innerHTML region must be reused, not recreated");
});

test("review: setState on an unmounted component warns once", async () => {
  const mp = mountPoint();
  const warns = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warns.push(args.join(" "));
  let setInner;
  let hide;

  function Temp() {
    const [n, set] = useState(0);
    setInner = set;
    return h("u", null, String(n));
  }

  function App() {
    const [show, set] = useState(true);
    hide = () => set(false);
    return h("div", null, show ? h(Temp) : h("p", null, "gone"));
  }

  try {
    render(App, mp);
    await flush();
    hide();
    await flush();

    setInner(1);
    await flush();
    setInner(2);
    await flush();

    const unmountedWarns = warns.filter((w) => w.includes("unmounted"));
    assertEqual(unmountedWarns.length, 1, "exactly one diagnostic per stale owner");
    assertEqual(mp.querySelector("p").textContent, "gone");
  } finally {
    console.warn = originalWarn;
  }
});

test("subtree: independent keyed list items keep their own state", async () => {
  const mp = mountPoint();
  const renders = new Map();
  const bumps = new Map();

  function Counter({ id }) {
    renders.set(id, (renders.get(id) || 0) + 1);
    const [n, set] = useState(0);
    bumps.set(id, () => set((v) => v + 1));
    return h("li", { className: `c${id}` }, String(n));
  }

  function App() {
    return h("ul", null, [1, 2, 3].map((id) => h(Counter, { key: id, id })));
  }

  render(App, mp);
  await flush();

  bumps.get(2)();
  await flush();
  assertEqual(mp.querySelector(".c1").textContent, "0");
  assertEqual(mp.querySelector(".c2").textContent, "1");
  assertEqual(mp.querySelector(".c3").textContent, "0");
  assertEqual(renders.get(1), 1, "item 1 must not re-render");
  assertEqual(renders.get(2), 2);
  assertEqual(renders.get(3), 1, "item 3 must not re-render");
});
