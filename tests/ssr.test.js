// Tests for renderToString (server-side rendering).

import {
  h,
  render,
  useState,
  useMemo,
  useId,
  createContext,
  useContext,
  renderToString,
} from "../dist/nexa.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

// ── basic serialization ────────────────────────────────────────────────────────

test("renderToString: element with className maps to class and renders children", () => {
  const html = renderToString(h("h1", { className: "m-title" }, "Hello"));
  assertEqual(html, '<h1 class="m-title">Hello</h1>');
});

test("renderToString: void elements have no closing tag", () => {
  assertEqual(renderToString(h("img", { src: "a.png" })), '<img src="a.png">');
  assertEqual(renderToString(h("br", null)), "<br>");
});

test("renderToString: boolean attribute true renders bare, false is omitted", () => {
  assertEqual(renderToString(h("input", { disabled: true })), "<input disabled>");
  assertEqual(renderToString(h("input", { disabled: false })), "<input>");
});

test("renderToString: htmlFor and aria props map to their attribute names", () => {
  const html = renderToString(h("label", { htmlFor: "x", ariaHidden: "true" }, "L"));
  assertEqual(html, '<label for="x" aria-hidden="true">L</label>');
});

test("renderToString: style object serializes to a CSS string (kebab + custom props)", () => {
  const html = renderToString(
    h("div", { style: { color: "red", marginTop: "4px", "--m-x": "2px" } }),
  );
  assertEqual(html, '<div style="color: red; margin-top: 4px; --m-x: 2px"></div>');
});

test("renderToString: dataset serializes to data-* attributes", () => {
  assertEqual(
    renderToString(h("div", { dataset: { userId: "7", role: "admin" } })),
    '<div data-user-id="7" data-role="admin"></div>',
  );
});

test("renderToString: event handlers and refs are omitted", () => {
  const html = renderToString(h("button", { onClick: () => {}, ref: {} }, "Go"));
  assertEqual(html, "<button>Go</button>");
});

// ── escaping (XSS safety) ───────────────────────────────────────────────────────

test("renderToString: text and attribute values are HTML-escaped", () => {
  const html = renderToString(h("p", { title: '"><x>' }, "a & b <c>"));
  assert(!html.includes("<c>"), "raw < in text must be escaped");
  assert(!html.includes('"><x>'), "raw attribute breakout must be escaped");
  assertEqual(html, '<p title="&quot;&gt;&lt;x&gt;">a &amp; b &lt;c&gt;</p>');
});

// ── hooks in server mode ────────────────────────────────────────────────────────

test("renderToString: useState/useMemo return initial values; effects don't run", () => {
  function C() {
    const [n] = useState(5);
    const doubled = useMemo(() => n * 2, [n]);
    return h("span", null, `n:${n} d:${doubled}`);
  }
  assertEqual(renderToString(C), "<span>n:5 d:10</span>");
});

test("renderToString: passes props to the root component", () => {
  function Greeting({ name }) {
    return h("p", null, `Hi ${name}`);
  }
  assertEqual(renderToString(Greeting, { name: "Ana" }), "<p>Hi Ana</p>");
});

test("renderToString: useId produces a stable id within the render", () => {
  function Field() {
    const id = useId();
    return h("label", { htmlFor: id }, h("input", { id }));
  }
  const html = renderToString(Field);
  const start = html.indexOf('for="') + 5;
  const id = html.slice(start, html.indexOf('"', start));
  assert(id.length > 0, "expected a for= attribute");
  assert(html.includes(`id="${id}"`), "input id must match the label's for");
});

test("renderToString: context provide() supplies values on the server", () => {
  const Theme = createContext("light");
  function Label() {
    return h("span", null, useContext(Theme));
  }
  function App() {
    return Theme.provide("dark", () => h("div", null, h(Label)));
  }
  assertEqual(renderToString(App), "<div><span>dark</span></div>");
});

// ── equivalence with the client DOM ─────────────────────────────────────────────

test("renderToString output matches the client-rendered DOM", async () => {
  // Uses markup that serializes identically whether set as an attribute (SSR)
  // or a DOM property (client). Property-only reflections — an <input value>
  // (property, not reflected to innerHTML) or an inline style object (which the
  // CSSOM re-normalizes with a trailing ';') — are covered by the dedicated
  // attribute/style tests above and intentionally differ from innerHTML.
  function Card({ title, n }) {
    return h(
      "article",
      { className: "m-card", dataset: { id: "42" }, ariaLabel: "card" },
      h("h2", { className: "m-title" }, title),
      h("p", { className: "muted" }, `count: ${n}`),
      h("button", { type: "button", disabled: true }, "x"),
    );
  }
  function App() {
    const [n] = useState(3);
    return h("section", { className: "m-page" }, h(Card, { title: "Nexa", n }));
  }

  // Server HTML, re-parsed by the browser so both sides serialize identically.
  const ssr = document.createElement("div");
  ssr.innerHTML = renderToString(App);

  const client = mountPoint();
  render(App, client);
  await flush();

  assertEqual(ssr.innerHTML, client.innerHTML);
});
