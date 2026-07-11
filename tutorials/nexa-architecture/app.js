// Tutorial player for the "nexa-architecture" example: left = code for the
// current step, right = the real examples/nexa-architecture ZoomStage deck
// running in an iframe, bottom = caption. The recording driver advances
// steps via window.__setStep(n).

import { h, render, useState } from "/dist/nexa.js";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "",
  },
  {
    title: "1. Frames in world space",
    code: `// data.js — the whole deck is one array of plain objects
export const ARCHITECTURE_FRAMES = [
  {
    id: "cover",
    x: 0, y: 0, w: 1120, h: 640, rotate: 0,
    data: { kind: "cover", heading: "..." },
  },
  {
    id: "why",
    x: 1280, y: -260, w: 820, h: 780, rotate: -5,
    data: { kind: "lens", heading: "..." },
  },
  // ...11 frames scattered across one large canvas
];`,
    caption: "A ZoomStage deck is data: each frame is a plain object with a position, a size and an optional rotation on one large world canvas. No slides — one surface.",
  },
  {
    title: "2. The stage",
    code: `import { ZoomStage } from "/dist/nexa-zoom.js";

const [index, setIndex] = useState(0);
const controllerRef = useRef(null);

h(ZoomStage, {
  frames,              // vdom content per frame
  index,               // controlled current step
  onIndexChange: setIndex,
  controllerRef,       // imperative next/prev/goTo
  duration: 820,       // camera glide, in ms
  padding: 0.13,       // margin around the framed frame
})`,
    caption: "ZoomStage is a controlled component: the app owns the index. Every frame is regular Nexa vdom, mounted all the time — only the camera is imperative.",
  },
  {
    title: "3. Navigating",
    code: `// NavDock — plain buttons driving the camera
h("button", {
  ariaLabel: "Previous frame",
  onClick: () => controllerRef.current?.prev(),
}),

h("strong", null, "04 / 11"),   // current / total

h("button", {
  ariaLabel: "Next frame",
  onClick: () => controllerRef.current?.next(),
})`,
    caption: "next(), prev() and goTo(id) glide the camera between frames — pan, zoom and rotation eased at 60 fps. Watch the stage: every transition is one camera move.",
  },
  {
    title: "4. Every frame is clickable",
    code: `// app.js — idle frames navigate on click
content: h("div", {
  className: isActive ? "arch-frame-hit"
                      : "arch-frame-hit arch-frame-hit-idle",
  onClick: isActive ? undefined : (event) => {
    event.stopPropagation();
    controllerRef.current?.goTo(frame.id);
  },
}, h(FrameContent, { data: frame.data }))

// clicking the stage background advances too
// (advanceOnClick, enabled by default)`,
    caption: "Because frames are live vdom, they can handle their own events: clicking any visible frame jumps straight to it, and a click on the background advances the deck.",
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
      h("h1", null, "Zooming presentations with ", h("em", null, "ZoomStage")),
      h("p", null, "The nexa-architecture example — 11 frames, one camera, no slides"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "ZoomStage"), " — recap"),
      h("ul", null,
        h("li", null, "frames are plain objects on one world canvas"),
        h("li", null, "content is live Nexa vdom — always mounted"),
        h("li", null, "controlled by index + onIndexChange"),
        h("li", null, "controllerRef: next / prev / goTo(id)"),
        h("li", null, "the camera is the only imperative part"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — examples/nexa-architecture"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · ZoomStage tutorial"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `step ${step} of ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h("div", { className: "tut-demo" },
        h("iframe", { className: "tut-frame", src: "/examples/nexa-architecture/index.html", title: "nexa-architecture example" }),
      ),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
