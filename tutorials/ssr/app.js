// Tutorial player for the "ssr" example: left = code for the current step,
// right = the real examples/ssr app running in an iframe (renderToString +
// hydrate, with the raw server HTML on display), bottom = caption. The
// recording driver advances steps via window.__setStep(n).

import { h, render, useState } from "/dist/nexa.js";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "",
  },
  {
    title: "1. renderToString",
    code: `import { renderToString, hydrate }
  from "/dist/nexa-server.js";

// "server side": no DOM involved at all
const html = renderToString(App);

// html is a plain string:
// <section class="m-page ...">
//   <h1 class="m-title-lg">SSR + hydrate</h1>
//   ...text escaped, no event handlers
// </section>`,
    caption: "renderToString(App) runs the component with no DOM and returns plain HTML — that's what a real server would send. On the right: the actual string this example produced.",
  },
  {
    title: "2. One component, both sides",
    code: `function App() {
  const [n, setN] = useState(3);

  return h("section", null,
    h("h1", null, "SSR + hydrate"),
    h(Card, null,
      h("p", null, "Count: ", h(Badge, null, String(n))),
      h(Button, {
        variant: "contained",
        onClick: () => setN((v) => v + 1),
      }, "Add"),
    ),
  );
}`,
    caption: "The exact same component runs on the server and in the browser. On the server, useState supplies initial values and effects simply don't run — keep browser-only work inside effects.",
  },
  {
    title: "3. hydrate adopts the DOM",
    code: `// the string arrives "over the wire":
mount.innerHTML = html;

const cardBefore = mount.querySelector(".m-card");

// adopt the existing DOM — no re-creation:
hydrate(App, mount);

mount.querySelector(".m-card") === cardBefore;
// true — same node, handlers now attached`,
    caption: "hydrate(App, mount) walks the server HTML and adopts it in place — reusing nodes and wiring up event handlers. The status line on the right is this example proving the card node survived.",
  },
  {
    title: "4. Alive after hydration",
    code: `h(Button, {
  variant: "contained",
  onClick: () => setN((v) => v + 1),
}, "Add"),

h(Button, {
  variant: "outlined",
  onClick: () => setN(0),
}, "Reset")

// server HTML first paint -> living app`,
    caption: "After hydration the page is a normal Nexa app: state, clicks, re-renders. Users saw meaningful HTML on first paint — and no Node was involved; any backend can send that string.",
  },
  { // 5 — recap card (overlay)
    title: "", code: "", caption: "",
  },
];

// ── tiny highlighter ─────────────────────────────────────────────────────────

// Built with new RegExp(string) instead of a regex literal: the repo's
// lightweight syntax validator balances brackets and would trip on the
// character classes inside a literal.
const TOKEN_RE = new RegExp(
  ["(\\/\\/[^\\n]*)",                                                    // comment
   "(\"(?:[^\"\\\\]|\\\\.)*\")",                                         // string
   "(\\b(?:import|from|function|const|return|async|await|new|if|true|false)\\b)", // keyword
   "([A-Za-z_$][\\w$]*)(?=\\()",                                         // fn call
  ].join("|"),
  "g",
);

function highlight(code) {
  const tokens = [];
  const re = TOKEN_RE;
  re.lastIndex = 0;
  let last = 0, m;
  while ((m = re.exec(code))) {
    if (m.index > last) tokens.push(code.slice(last, m.index));
    if (m[1]) tokens.push(h("span", { className: "tut-cm" }, m[1]));
    else if (m[2]) tokens.push(h("span", { className: "tut-str" }, m[2]));
    else if (m[3]) tokens.push(h("span", { className: "tut-kw" }, m[3]));
    else tokens.push(h("span", { className: "tut-fn" }, m[4]));
    last = re.lastIndex;
  }
  if (last < code.length) tokens.push(code.slice(last));
  return tokens;
}

// ── player shell ─────────────────────────────────────────────────────────────

function App() {
  const [step, setStep] = useState(0);
  window.__setStep = setStep;
  const s = STEPS[step];

  return h("div", { className: "tut-root" },
    step === 0 && h("div", { className: "tut-overlay" },
      h("h1", null, "Server-side rendering with ", h("em", null, "Nexa")),
      h("p", null, "renderToString + hydrate — real HTML first, living app second"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "SSR"), " — recap"),
      h("ul", null,
        h("li", null, "renderToString(App): plain HTML, no DOM, values escaped"),
        h("li", null, "the same component runs on both sides"),
        h("li", null, "effects don't run on the server — browser work stays there"),
        h("li", null, "hydrate() adopts the server DOM, it never recreates it"),
        h("li", null, "no Node required — any backend can send the string"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — examples/ssr · docs/AI_SPEC.md §6"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · SSR tutorial"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `step ${step} of ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h("div", { className: "tut-demo" },
        h("iframe", { className: "tut-frame", src: "/examples/ssr/index.html", title: "ssr example" }),
      ),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
