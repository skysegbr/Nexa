// Tutorial player for the Motion Editor: left = what's happening as code,
// right = the REAL editor in an iframe being driven step by step (create
// an object, key it at the playhead, transform, play, ship the code),
// bottom = caption. The recording driver advances via window.__setStep(n).

import { h, render, useState } from "/dist/nexa.js";

const EDITOR = "/examples/motion-editor/index.html";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "",
  },
  {
    title: "1. Draw the object",
    code: `// pick a tool, draw on the stage
//   ▭ rectangle  ◯ ellipse  T text

// every new actor gets:
//   · a layer row on the timeline
//   · a starter keyframe at f1
//   · the export entry, instantly

"rect-1": [
  { at: 0, x: 0, y: 0, opacity: 1 },
]`,
    caption: "An empty stage, Flash-style tools on the left. Pick the rectangle, drag on the stage — the shape becomes an actor with its own layer and a starter keyframe at frame 1.",
  },
  {
    title: "2. Scrub, then drag = keyframe",
    code: `// Flash's auto-key:
// drag AT the playhead → keyframe

"rect-1": [
  { at: 0,    x: 0,   y: 0 },
  { at: 1500, x: 260, y: 70 }, // f37
]

// a plain click never records —
// only a real drag does`,
    caption: "Move the playhead to frame 37, then drag the square where it should be at that moment. The drop is recorded as a keyframe — see the dot and the tween span appear on its lane.",
  },
  {
    title: "3. Free Transform",
    code: `// ⤾ the Free Transform tool:
//   corners scale
//   the lollipop rotates
//   (Shift snaps to 15°)

"rect-1": [
  { at: 0,    x: 0,   y: 0 },
  { at: 1500, x: 260, y: 70 },
  { at: 3000, rotate: 120 },  // f73
]`,
    caption: "Jump to the last frame and grab the rotation handle above the selection — the spin is keyed at the playhead too, exactly like the position was.",
  },
  {
    title: "4. Play the movie",
    code: `tl.play();

// dots  = keyframes
// spans = tweens between poses
// ∞ loop · spd · onion skin
// f37 · 24 fps · 1.50s`,
    caption: "Rewind and play: the editor's preview IS the real nexa-motion runtime — the square glides to its f37 pose, then rotates into the final one, looping.",
  },
  {
    title: "5. Ship the code",
    code: `// what you scrubbed is what
// you ship — copy & paste:

const tl = useTimeline({
  duration: 3000,
  tracks: {
    "rect-1": [ /* your poses */ ],
  },
  loop: true,
});

h("div", { ref: tl.track("rect-1") })`,
    caption: "Select the object and its Behavior panel lists every keyframe — click one to edit it, or edit the track as code. The Export pane always holds the ready-to-paste useTimeline() source.",
  },
  { // 6 — recap card (overlay)
    title: "", code: "", caption: "",
  },
];

// ── tiny highlighter ─────────────────────────────────────────────────────────

// Built with new RegExp(string) instead of a regex literal: the repo's
// lightweight syntax validator balances brackets and would trip on the
// character classes inside a literal.
const TOKEN_RE = new RegExp(
  ["(\\/\\/[^\\n]*)",                                                    // comment
   "(\"(?:[^\"\\\\]|\\\\.)*\"|`(?:[^`\\\\]|\\\\.)*`)",                   // string/template
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
      h("h1", null, "The ", h("em", null, "Motion Editor")),
      h("p", null, "create an object and animate it, step by step — Flash-style"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "Motion Editor"), " — recap"),
      h("ul", null,
        h("li", null, "draw a shape → it's an actor with a layer + starter keyframe"),
        h("li", null, "scrub the playhead, drag the object → auto-key, like Flash"),
        h("li", null, "Free Transform keys rotate/scale at the playhead too"),
        h("li", null, "play: the preview is the real nexa-motion runtime"),
        h("li", null, "Behavior lists the object's keyframes; Export is live code"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — examples/motion-editor"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · Motion Editor tutorial"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `step ${step} of ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h("div", { className: "tut-demo" },
        h(
          "div",
          { className: "tut-frame-wrap" },
          h("iframe", { className: "tut-frame", src: EDITOR, title: "Motion Editor" }),
        ),
      ),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
