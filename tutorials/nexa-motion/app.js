// Tutorial player for nexa-motion: left = code for the current step, right =
// a real example running in an iframe (the Flash-style intro for steps 1-4,
// the Motion Editor for step 5), bottom = caption. The recording driver
// advances steps via window.__setStep(n).

import { h, render, useState } from "/dist/nexa.js";

const INTRO = "/examples/nexa-motion/index.html";
const EDITOR = "/examples/motion-editor/index.html";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "", src: INTRO,
  },
  {
    title: "1. The timeline is back",
    src: INTRO,
    code: `import { useTimeline } from "/dist/nexa-motion.js";

const tl = useTimeline({
  duration: 5200,
  labels: { logo: 900, title: 2000 },
  tracks: {
    logo: [
      { at: 900,  x: -560, opacity: 0 },
      { at: 1700, x: 0, opacity: 1,
        ease: "outBack" },
    ],
  },
});

// bind an element to a track:
h("div", { ref: tl.track("logo") })`,
    caption: "nexa-motion brings the Flash mental model to the browser: a timeline with keyframes and tweens, labels, and elements bound by ref. On the right: this movie playing for real — no plugin required.",
  },
  {
    title: "2. Easing & stagger",
    src: INTRO,
    code: `// Penner easings — written FOR Flash,
// reborn here:
{ at: 1700, x: 0, ease: "outBack" }
{ at: 4400, scale: 1, ease: "outElastic" }

// the classic cascade:
const LETTER = [
  { at: 2000, y: 90, opacity: 0 },
  { at: 2550, y: 0, opacity: 1,
    ease: "outBack" },
];
letters.forEach((_, i) => {
  tracks[\`letter-\${i}\`] =
    stagger(LETTER, 110, i);
});`,
    caption: "Every tween names how it ARRIVES at its keyframe — outBack snaps, outElastic wobbles, outBounce bounces. stagger() shifts a keyframe list per index: the letter cascade every 2003 intro was made of.",
  },
  {
    title: "3. gotoAndPlay & frame scripts",
    src: INTRO,
    code: `// the API you knew by heart:
tl.play();
tl.stop();
tl.gotoAndPlay("title");
tl.gotoAndStop(1200);
tl.reverse();
tl.setSpeed(2);

// frame scripts, like code on a frame:
useTimeline({
  onFrame: {
    logo:  () => setScene("logo"),
    title: () => setScene("title"),
  },
});`,
    caption: "play, stop, gotoAndPlay, gotoAndStop — the quartet works exactly as you remember, with labels. Frame scripts fire as the playhead crosses them. Watch the deck: the scene buttons follow the movie.",
  },
  {
    title: "4. Movie clips",
    src: INTRO,
    code: `// a component with its own timeline
// IS a movie clip:
function PulsingRing() {
  const clip = useTimeline({
    duration: 1600,
    loop: true,
    tracks: {
      ring: [
        { at: 0,    scale: 0.9 },
        { at: 800,  scale: 1.25,
          ease: "outCubic" },
        { at: 1600, scale: 0.9 },
      ],
    },
  });
  return h("span",
    { ref: clip.track("ring") });
}`,
    caption: "Nest timelines freely: the ring around the logo is a child component looping on its own clock, whatever the master timeline does — exactly how MovieClips worked. It keeps pulsing after the movie ends.",
  },
  {
    title: "5. Draw it: the Motion Editor",
    src: EDITOR,
    code: `// what you scrub is what you ship:
const tl = useTimeline({
  duration: 3000,
  tracks: {
    box: [
      { at: 0, x: 0, y: 0 },
      { at: 1500, x: 320, rotate: 180,
        ease: "inOutCubic" },
    ],
    // ...exported live from the editor
  },
});`,
    caption: "And the IDE feeling is back too: drag keyframe diamonds, scrub the ruler, edit easing in the inspector, draw motion guides by clicking on the stage — then copy the generated useTimeline code into your app.",
  },
  { // 6 — recap card (overlay)
    title: "", code: "", caption: "", src: EDITOR,
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
      h("h1", null, "Flash-style animation with ", h("em", null, "Nexa Motion")),
      h("p", null, "timelines · tweens · gotoAndPlay — the glory days, no plugin"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "Nexa Motion"), " — recap"),
      h("ul", null,
        h("li", null, "useTimeline: keyframe tracks, labels, loop, reverse, speed"),
        h("li", null, "Penner easings + stagger() for the classic cascades"),
        h("li", null, "gotoAndPlay/gotoAndStop + frame scripts, like AS1"),
        h("li", null, "movie clips: nested components with their own timelines"),
        h("li", null, "motion guides, color tweens, sprite steps — and a visual editor"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — examples/nexa-motion · examples/motion-editor"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · Motion tutorial"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `step ${step} of ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h("div", { className: "tut-demo" },
        h("iframe", { className: "tut-frame", src: s.src, title: "nexa-motion example" }),
      ),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
