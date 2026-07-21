# Motion in Nexa (nexa-motion)

`nexa-motion` is the timeline-animation add-on: the Macromedia Flash mental model
rebuilt on browser primitives — a timeline with keyframes and tweens, labels,
frame scripts, and the classic `play() / stop() / gotoAndPlay() / gotoAndStop()`
quartet. It has no dependencies and no CSS file (it animates inline `transform`
and `opacity`), and it is **not** part of `nexa-components.js` — import it
directly from `/dist/nexa-motion.js`.

Reach for it whenever the task is animation, an intro/splash, keyframes, tweens,
staggered entrances, or anything "like Flash / a movie clip". Don't hand-roll
`requestAnimationFrame` loops or pull in GSAP for these.

---

## Concept

An animation in nexa-motion follows this pattern:

1. Describe the movie as data: a `duration`, some `labels`, and `tracks` — each
   track is a named list of keyframes.
2. Call `useTimeline(spec)` once at the top of your component (it captures the
   spec on first render and autoplays after mount).
3. Bind each animated element to its track with a `ref`: `tl.track("logo")`.
4. Drive playback through the returned controller — `tl.gotoAndPlay("finale")`,
   `tl.stop()`, `tl.reverse()`, `tl.seek(ms)`.

A **property absent from a keyframe is not a key for it** — each property tweens
between the keyframes that *do* define it (per-property tracks, exactly like
Flash's separate motion tweens). Only `transform` and `opacity` are tweened, so
animations stay on the GPU.

```js
import { useTimeline, easings, stagger } from "/dist/nexa-motion.js";
```

---

## useTimeline

```js
const tl = useTimeline({
  duration: 3000,      // ms — inferred from the last keyframe/script if omitted
  loop: false,         // false (once) | true (forever) | n (n extra passes)
  speed: 1,            // playback rate (use reverse() to go backwards)
  ease: "linear",      // default easing for tweens that don't name their own
  autoplay: true,      // play after mount; false = start paused
  labels: { flyIn: 500 },            // named times for gotoAndPlay/seek
  tracks: { /* trackName: keyframes */ },
  onFrame: { flyIn: () => playWhoosh() },  // frame scripts (ms or label keys)
  onUpdate: (ms) => {},              // after every applied frame
  onLoop: () => {},                  // at each loop wrap
  onComplete: () => setDone(true),   // when it finishes with no loops left
});
```

`useTimeline` is the component-lifecycle wrapper: it creates the timeline on
first render (**the spec is captured then — treat it as static**, like
`createLazy`), autoplays after mount unless `autoplay: false`, and destroys
itself on unmount. Because the spec is static, don't rebuild it from changing
props each render; drive changes through the controller instead.

### Returned controller

The object `useTimeline` returns is your remote control:

| Member | What it does |
|---|---|
| `track(name)` | Callback ref that binds an element to a track — `h("div", { ref: tl.track("logo") })` |
| `play()` / `stop()` | Resume / pause at the current time |
| `gotoAndPlay(msOrLabel)` | Jump to a time/label and play (fires a frame script sitting exactly there) |
| `gotoAndStop(msOrLabel)` | Jump to a time/label and pause |
| `seek(msOrLabel)` | Move the playhead without playing — fires **no** frame scripts |
| `reverse()` | Flip playback direction |
| `setSpeed(n)` | Change the playback rate live |
| `label(name)` | Resolve a label (or number) to ms; throws on an unknown label |
| `time` / `duration` | Current playhead / total length, in ms (read-only) |
| `isPlaying` / `direction` | Playback state (read-only) |
| `destroy()` | Stop the ticker and release layers (automatic under `useTimeline`) |

---

## Keyframes & tracks

A track is an array of keyframes, each with an `at` (ms) plus any of the
animatable properties:

```js
tracks: {
  logo: [
    { at: 0,    x: -560, rotate: -180, opacity: 0 },
    { at: 800,  x: 0,    rotate: 0,    opacity: 1, ease: "outBack" },
    { at: 2400, y: -40,  scale: 0.85,             ease: "inOutCubic" },
  ],
}
```

Then bind the element in your vdom:

```js
h("img", { ref: tl.track("logo"), src: "logo.png" })
```

Animatable keyframe fields:

| Field | Meaning |
|---|---|
| `x`, `y` | Translation in px (rendered as `translate3d`) |
| `scale` / `scaleX` / `scaleY` | Uniform scale, or per-axis (per-axis overrides `scale`) |
| `rotate` | Degrees |
| `skewX`, `skewY` | Degrees |
| `opacity` | 0–1 |
| `color`, `backgroundColor`, `fill`, `stroke` | Color tweens — see below |
| `path`, `orient` | Motion guide — see below |
| `set` | Discrete frame-by-frame styles — see below |
| `ease` | How the playhead **arrives** at this keyframe |

> `ease` names the easing of the tween *arriving at* the keyframe it sits on —
> not leaving it. That is the Flash convention and it trips people up.

---

## Easings

The classic Robert Penner set (originally written *for* Flash), exported as
`easings` and referenced by name in `ease`:

```
linear
inQuad   outQuad   inOutQuad
inCubic  outCubic  inOutCubic
inBack   outBack   inOutBack
outElastic   outBounce
```

`outBack` snaps past and settles, `outElastic` wobbles, `outBounce` bounces.
You can also read the raw functions off `easings` (`easings.outBack(t)`, with
`t ∈ [0, 1]`) if you need to drive something by hand.

---

## stagger — cascade entrances

`stagger(keyframes, eachMs, index)` shifts every keyframe of a list by
`index * eachMs`, so item *i* starts a beat after item *i − 1* — the classic
letter/list cascade:

```js
const LETTER = [
  { at: 2000, y: 90, opacity: 0, rotate: 8 },
  { at: 2550, y: 0,  opacity: 1, rotate: 0, ease: "outBack" },
];

const tracks = {};
letters.forEach((_, i) => {
  tracks[`letter-${i}`] = stagger(LETTER, 110, i); // each 110 ms later
});
```

Bind each with `tl.track(\`letter-${i}\`)`.

---

## Labels & frame scripts

`labels` give times readable names; `onFrame` runs code when the playhead
**crosses** a frame while playing (direction-aware). This is Flash's "code on a
frame" — great for syncing app state to scenes:

```js
const tl = useTimeline({
  duration: 5200,
  labels: { loading: 0, logo: 900, title: 2000, finale: 3800 },
  tracks,
  onFrame: {
    logo:   () => setScene("logo"),
    finale: () => setScene("finale"),
  },
});

// jump the movie to a scene by name:
h("button", { onClick: () => tl.gotoAndPlay("finale") }, "Skip to finale")
```

Frame-script rules:

- A script fires when the playhead **crosses** it during playback (so
  `reverse()` fires them in reverse order too).
- `gotoAndPlay(target)` also fires a script sitting **exactly** on the target
  (as Flash did).
- `seek()` / `gotoAndStop()` fire **nothing** — they only move the playhead.

---

## Playback control (the quartet + scrubbing)

Everything is on the controller, so wiring a control deck is direct:

```js
h("button", { onClick: () => tl.play() }, "Play"),
h("button", { onClick: () => tl.stop() }, "Stop"),
h("button", { onClick: () => tl.gotoAndPlay(0) }, "Restart"),
h("button", { onClick: () => tl.reverse() }, "Reverse"),
h("button", { onClick: () => tl.setSpeed(2) }, "2×"),

// a scrubber — seek() moves the playhead without firing frame scripts:
h("input", {
  type: "range", min: 0, max: tl.duration, value: tl.time,
  onInput: (e) => tl.seek(Number(e.target.value)),
})
```

---

## Color tweens

`color`, `backgroundColor`, `fill`, and `stroke` interpolate per RGBA channel.
Values are hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb()` / `rgba()` strings
(parsed when the timeline is built):

```js
tracks: {
  cta: [
    { at: 0,    backgroundColor: "#3b82f6" },
    { at: 1000, backgroundColor: "#ef4444", ease: "inOutQuad" },
  ],
}
```

---

## Frame-by-frame with `set`

`set` applies styles **discretely** at a keyframe and holds them until the next
`set` — no tween. This is frame-by-frame animation: sprite-sheet steps via
`backgroundPosition`, visibility flips, class-free state changes:

```js
tracks: {
  sprite: [
    { at: 0,   set: { backgroundPosition: "0px 0" } },
    { at: 100, set: { backgroundPosition: "-64px 0" } },
    { at: 200, set: { backgroundPosition: "-128px 0" } },
  ],
}
```

---

## Motion guides (path & orient)

Flash's motion-guide layer: a `path` (an SVG path string) on a keyframe makes the
element follow that curve from the **previous** keyframe to this one. The curve's
start/end become x/y keyframes so surrounding tweens stay seamless. `orient: true`
rotates the element along the tangent ("orient to path"):

```js
tracks: {
  comet: [
    { at: 0,    x: 0, y: 0 },
    { at: 1500, path: "M 0 0 C 120 -200, 380 -180, 480 0", orient: true, ease: "inOutCubic" },
  ],
}
```

**Contract:** inside the guided span the curve owns x/y. If you also key x/y at
the guide's own keyframe, make them match the curve's endpoint or the element
jumps at the boundary; back-to-back guides should join end-to-start.

---

## Movie clips (nested timelines)

A child component with its **own** `useTimeline` is a movie clip: it ticks
independently of its parent and keeps looping regardless of what the parent
timeline is doing — exactly like a Flash MovieClip. Nest them freely.

```js
function PulsingRing() {
  const clip = useTimeline({
    duration: 1600,
    loop: true,                       // loops forever, on its own ticker
    tracks: {
      ring: [
        { at: 0,    scale: 0.9,  opacity: 0.7 },
        { at: 800,  scale: 1.25, opacity: 0.15, ease: "outCubic" },
        { at: 1600, scale: 0.9,  opacity: 0.7,  ease: "inOutCubic" },
      ],
    },
  });
  return h("span", { ref: clip.track("ring"), ariaHidden: "true" });
}
```

Drop `h(PulsingRing)` anywhere in the parent movie; it runs on its own.

---

## createTimeline — the imperative variant

`createTimeline(spec)` is the hook-free constructor for code outside a component
(a plain script, a class, a non-Nexa page). Same spec, same controller — but
**you own the lifecycle**: call `destroy()` yourself.

```js
import { createTimeline } from "/dist/nexa-motion.js";

const tl = createTimeline({ duration: 2000, tracks: { /* … */ } });
// the ref returned by track() is just a function — call it with the element:
tl.track("logo")(document.querySelector(".logo"));
// … later …
tl.destroy();
```

Inside components, prefer `useTimeline` — it wires creation, autoplay, and
teardown to the component lifecycle for you.

---

## Performance & accessibility

**Compositor promotion.** While a timeline moves, each tracked element is
promoted to its own GPU layer (`will-change` + `translate3d`) for a smooth
tween, then **de-promoted at rest**. So do **not** animate `x`/`y`/`scale` on a
*very large* node — a full `ZoomStage` frame, or an SVG wider/taller than
~4096px. It briefly becomes a layer bigger than the GPU's max texture, forcing
the browser to tile it; the tiles can blank out and flicker (especially while an
ancestor is scaled at the same time). Animate its `opacity` instead, or animate
a small child element.

**Reduced motion is your responsibility.** Unlike `ZoomStage`, nexa-motion does
**not** auto-honor `prefers-reduced-motion` — gate it yourself. A clean pattern
is to start paused and jump to the end for users who ask for less motion:

```js
import { useMediaQuery } from "/dist/nexa.js";

const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
const tl = useTimeline({ duration: 3000, tracks, autoplay: !reduce });
if (reduce) tl.gotoAndStop("finale"); // land on the final state, no animation
```

---

## Complete example

A small self-contained movie: a logo flies in, a two-word title cascades in,
and a control deck scrubs and replays it.

```js
import { h, render, useState } from "/dist/nexa.js";
import { useTimeline, stagger } from "/dist/nexa-motion.js";

const TITLE = "NEXA".split("");

function buildTracks() {
  const tracks = {
    logo: [
      { at: 0,   x: -300, opacity: 0 },
      { at: 700, x: 0,    opacity: 1, ease: "outBack" },
    ],
  };
  const LETTER = [
    { at: 900,  y: 60, opacity: 0 },
    { at: 1300, y: 0,  opacity: 1, ease: "outBack" },
  ];
  TITLE.forEach((_, i) => { tracks[`letter-${i}`] = stagger(LETTER, 90, i); });
  return tracks;
}

function App() {
  const [scene, setScene] = useState("intro");

  const tl = useTimeline({
    duration: 2000,
    labels: { intro: 0, title: 900 },
    tracks: buildTracks(),
    onFrame: {
      intro: () => setScene("intro"),
      title: () => setScene("title"),
    },
  });

  return h("div", { className: "movie" },
    h("div", { className: "logo", ref: tl.track("logo") }, "◆"),
    h("h1", null,
      TITLE.map((ch, i) =>
        h("span", { key: i, className: "letter", ref: tl.track(`letter-${i}`) }, ch)),
    ),
    h("div", { className: "deck" },
      h("button", { onClick: () => tl.gotoAndPlay(0) }, "Replay"),
      h("button", { onClick: () => tl.stop() }, "Stop"),
      h("input", {
        type: "range", min: 0, max: tl.duration, value: tl.time,
        onInput: (e) => tl.seek(Number(e.target.value)),
      }),
      h("span", null, `scene: ${scene}`),
    ),
  );
}

render(App, document.getElementById("app"));
```

---

## See also

- **`examples/nexa-motion`** — the full Flash-style intro: preloader, flying
  logo, letter cascade, frame scripts, a nested looping movie clip, SKIP INTRO,
  and a control deck with scrubber, reverse, speed, and `gotoAndPlay` scene jumps.
- **`examples/motion-editor`** — a Flash-8-style visual authoring IDE built on
  the real runtime: draggable keyframe diamonds, auto-key on stage drag, Free
  Transform, motion guides, onion skinning, undo/redo, and live `useTimeline()`
  code export.
- **`examples/motion-landing`** — an animated product landing page built on the
  add-on itself (hero timeline, scroll-driven scenes, replayable intro).
- **Video tutorials** — [`tutorials/nexa-motion`](../tutorials/nexa-motion/) and
  [`tutorials/motion-editor`](../tutorials/motion-editor/) (auto-generated screen
  recordings driven by the real framework).
- **`docs/AI_SPEC.md` §10** — the terse API quick-reference (also covers the
  other add-ons: ZoomStage, PipelineCanvas, FullCodeEditor).
- **`dist/nexa-motion.d.ts`** — full TypeScript declarations.
