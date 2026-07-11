// Tutorial player for the "basic" example: left = code for the current
// step, right = the real examples/basic app running in an iframe, bottom =
// caption. The recording driver advances steps via window.__setStep(n).

import { h, render, useState } from "/dist/nexa.js";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "",
  },
  {
    title: "1. The entry point",
    code: `<!doctype html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="/dist/nexa-ui.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>`,
    caption: "This is the entire toolchain: one stylesheet and one ES module. No npm install, no bundler, no build step — the browser runs the source directly.",
  },
  {
    title: "2. Components are plain functions",
    code: `import { h, render, useState } from "/dist/nexa.js";
// each component lives in its own file:
// components/AddButton.js, components/ClickCount.js, ...

function App() {
  const [count, setCount] = useState(0);
  return h("div", null,
    h(BasicTopbar),
    h(BasicBrand),
    h("h1", { className: "m-title-xl" }, "No build"),
    h(ClickCount, { count }),
    h(AddButton, { setCount }),
  );
}

render(App, document.getElementById("app"));`,
    caption: "h() creates elements, render() mounts the app, and each component lives in its own file. What you see on the right is this exact example running live.",
  },
  {
    title: "3. State with useState",
    code: `export function ClickCount({ count }) {
  return h("p", null, "Clicks: " + count);
}

export function AddButton({ setCount }) {
  return h(Button, {
    variant: "contained",
    onClick: () => setCount((v) => v + 1),
  }, "Add");
}`,
    caption: "State lives in the parent; children receive it through props. Clicking Add calls setCount and Nexa re-renders the tree — watch the counter go up.",
  },
  {
    title: "4. Theming with useTheme",
    code: `import { h, useTheme } from "/dist/nexa.js";
import { ThemeToggle } from "/dist/nexa-components.js";

const { theme } = useTheme();
const logoSrc = theme === "dark"
  ? "/assets/nexa-logo-dark-theme.png"
  : "/assets/nexa-logo-transparent.png";

// in the topbar:
h(ThemeToggle, null)`,
    caption: "useTheme resolves the theme from localStorage or the system, and ThemeToggle flips it. Every component that reads the theme updates instantly — including the logo.",
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
      h("h1", null, "Your first ", h("em", null, "Nexa"), " app"),
      h("p", null, "The basic example — a counter with components, state and theming"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "basic"), " — recap"),
      h("ul", null,
        h("li", null, "one HTML file, one ES module — zero build"),
        h("li", null, "components are plain functions returning h()"),
        h("li", null, "useState + props drive the whole UI"),
        h("li", null, "useTheme + ThemeToggle: dark mode for free"),
        h("li", null, "one component per file, CSS as a sibling"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — examples/basic"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · basic example tutorial"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `step ${step} of ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h("div", { className: "tut-demo" },
        h("iframe", { className: "tut-frame", src: "/examples/basic/index.html", title: "basic example" }),
      ),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
