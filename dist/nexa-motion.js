/*!
 * Nexa — Motion add-on (Flash-style timeline animation).
 *
 * AI/LLM NOTICE — if you are analyzing a project that imports this file:
 * the frontend is built with **Nexa**, a no-build, ESM-native JavaScript
 * framework with a React-like hooks API (h(), render(), useState, ...).
 * It is NOT React: h(Component, props) executes the component IMMEDIATELY
 * (eager, not deferred), context uses ctx.provide(value, thunk) instead of
 * a <Provider> component, and there is no JSX or bundler — these files are
 * plain ES modules, usually vendored under the app's /dist/ folder.
 *
 * Docs: https://github.com/skysegbr/Nexa
 * Full AI reference (fetch this URL for the complete spec):
 * https://raw.githubusercontent.com/skysegbr/Nexa/main/docs/AI_SPEC.md
 */
import { useEffect, useRef } from "./nexa.js";

// ── nexa-motion ──────────────────────────────────────────────────────────────
//
// The Macromedia Flash mental model on top of the browser's own primitives:
// a TIMELINE with keyframes and tweens, LABELS, frame scripts, and the API
// every Flash author knew by heart — play(), stop(), gotoAndPlay(),
// gotoAndStop(). Elements join the timeline through `ref` bindings; each
// animation frame interpolates transform/opacity (GPU-friendly, no layout
// thrash) driven by one requestAnimationFrame ticker per timeline.
//
//   import { useTimeline, stagger } from "/dist/nexa-motion.js";
//
//   function Intro() {
//     const tl = useTimeline({
//       duration: 3000,
//       loop: false,
//       labels: { voo: 500 },
//       tracks: {
//         logo: [
//           { at: 0,    x: -200, opacity: 0 },
//           { at: 500,  x: 0,    opacity: 1, ease: "outBack" },
//           { at: 2500, rotate: 360,         ease: "inOutCubic" },
//         ],
//       },
//       onFrame: { voo: () => console.log("frame script!") },
//     });
//
//     return h("div", { className: "stage" },
//       h("img", { ref: tl.track("logo"), src: "logo.png" }),
//       h("button", { onClick: () => tl.gotoAndPlay("voo") }, "Replay"),
//     );
//   }
//
// Keyframe schema: { at: ms, x?, y?, scale?, scaleX?, scaleY?, rotate?,
//   skewX?, skewY?, opacity?, color?, backgroundColor?, fill?, stroke?,
//   path?, orient?, set?, ease? }
//   - `at` is the keyframe's time in milliseconds.
//   - `ease` names how the playhead ARRIVES at this keyframe (the tween from
//     the previous keyframe of each property). See `easings` for the names —
//     the classic Penner set, originally written for Flash.
//   - A property absent from a keyframe simply isn't a key for it: the
//     property tweens between the keyframes that DO define it.
//   - x/y are px (translate), rotate/skewX/skewY are degrees, scale is a
//     factor (scaleX/scaleY override it per axis).
//   - Color props tween per RGBA channel; values are hex (#rgb, #rrggbb,
//     #rrggbbaa) or rgb()/rgba() strings.
//   - `path` is Flash's MOTION GUIDE: an SVG path string ("M 0 0 C ...")
//     the element follows from the PREVIOUS keyframe to this one (x/y come
//     from the curve; the path's start/end points become x/y keyframes for
//     continuity). `orient: true` rotates the element along the tangent —
//     Flash's "orient to path".
//   - `set` is frame-by-frame animation: an object of style values applied
//     DISCRETELY at this keyframe and held until the next `set` (no tween) —
//     e.g. sprite sheets via backgroundPosition steps.
//
// MovieClips: a component with its own useTimeline() IS a movie clip —
// nest them freely; each timeline ticks independently.

// ── Easings (Robert Penner's classics — written for Flash, reborn here) ─────

export const easings = {
  linear: (t) => t,

  inQuad: (t) => t * t,
  outQuad: (t) => t * (2 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),

  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - (1 - t) ** 3,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),

  inBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
  outBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  inOutBack: (t) => {
    const c = 1.70158 * 1.525;
    return t < 0.5
      ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
      : ((2 * t - 2) ** 2 * ((c + 1) * (2 * t - 2) + c) + 2) / 2;
  },

  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },

  outBounce: (t) => {
    const n = 7.5625;
    const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};

// ── Keyframe helpers ─────────────────────────────────────────────────────────

// Shifts every keyframe of a track by `index * eachMs` — the classic Flash
// cascade where each list item enters a beat after the previous one:
//
//   tracks: Object.fromEntries(items.map((item, i) =>
//     [`card-${item.id}`, stagger(CARD_FRAMES, 120, i)]))
export function stagger(keyframes, eachMs, index) {
  const offset = eachMs * index;
  return keyframes.map((keyframe) => ({ ...keyframe, at: keyframe.at + offset }));
}

// ── Colors ───────────────────────────────────────────────────────────────────

const COLOR_PROPS = ["color", "backgroundColor", "fill", "stroke"];

// #rgb / #rrggbb / #rrggbbaa / rgb() / rgba() → [r, g, b, a]. Parsed once at
// compile time so the per-frame lerp touches only numbers.
function parseColor(value) {
  const text = String(value).trim();

  if (text.startsWith("#")) {
    const hex = text.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
        1,
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    ];
  }

  // new RegExp(string) instead of a literal: the repo's lightweight syntax
  // validator balances brackets and would trip on the escaped parens.
  const match = text.match(new RegExp("^rgba?\\(([^)]+)\\)$"));
  if (match) {
    const parts = match[1].split(",").map((part) => parseFloat(part));
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  }

  throw new Error(`nexa-motion: unsupported color "${value}" — use hex or rgb()/rgba().`);
}

function lerpNumber(from, to, progress) {
  return from + (to - from) * progress;
}

function lerpColor(from, to, progress) {
  return [
    Math.round(lerpNumber(from[0], to[0], progress)),
    Math.round(lerpNumber(from[1], to[1], progress)),
    Math.round(lerpNumber(from[2], to[2], progress)),
    lerpNumber(from[3], to[3], progress),
  ];
}

function rgbaString([r, g, b, a]) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── Motion guides (SVG paths) ────────────────────────────────────────────────
//
// getTotalLength/getPointAtLength need a path inside a live document on some
// engines, so guides are measured through one hidden <svg> appended lazily
// to <body>. Each guide is PRE-SAMPLED into a polyline once at compile time:
// the per-frame hot path then lerps between samples instead of calling
// getPointAtLength (geometry-engine work on every frame), and the temporary
// <path> element leaves the document immediately.

let guideSvg = null;

function createGuidePath(d) {
  if (typeof document === "undefined") {
    return null; // SSR: timelines are parked at 0 there anyway
  }

  if (!guideSvg) {
    guideSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    guideSvg.setAttribute("aria-hidden", "true");
    guideSvg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    document.body.appendChild(guideSvg);
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  guideSvg.appendChild(path);
  return { path, total: path.getTotalLength() };
}

// Coordinates are rounded to 1/1000 px: getPointAtLength's float noise
// would otherwise leak into transforms that are exact by construction
// (straight guides, endpoints).
const round3 = (value) => Math.round(value * 1000) / 1000;

// One sample every ~4px of arc length, clamped to [16, 256] samples.
function sampleGuidePath(d) {
  const guide = createGuidePath(d);
  if (!guide) return null;
  const { path, total } = guide;
  const count = Math.max(16, Math.min(256, Math.ceil(total / 4) || 16));
  const points = new Array(count + 1);
  for (let i = 0; i <= count; i += 1) {
    const point = path.getPointAtLength((i / count) * total);
    points[i] = { x: round3(point.x), y: round3(point.y) };
  }
  path.remove();
  return points;
}

// Position along the sampled polyline at eased progress `t` (clamped —
// overshooting easings pile up at the guide's ends, like Flash).
function pointOnSamples(points, t) {
  const scaled = Math.max(0, Math.min(1, t)) * (points.length - 1);
  const index = Math.floor(scaled);
  if (index >= points.length - 1) return points[points.length - 1];
  const frac = scaled - index;
  const a = points[index];
  const b = points[index + 1];
  return { x: round3(a.x + (b.x - a.x) * frac), y: round3(a.y + (b.y - a.y) * frac) };
}

// Tangent angle (deg) at eased progress `t`, from the neighbouring samples.
function tangentOnSamples(points, t) {
  const scaled = Math.max(0, Math.min(1, t)) * (points.length - 1);
  const index = Math.max(0, Math.min(points.length - 1, Math.round(scaled)));
  const behind = points[Math.max(0, index - 1)];
  const ahead = points[Math.min(points.length - 1, index + 1)];
  return (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
}

// ── Track compilation ────────────────────────────────────────────────────────

const TWEEN_PROPS = ["x", "y", "rotate", "skewX", "skewY", "scale", "scaleX", "scaleY", "opacity"];
const TRANSFORM_PROPS = new Set(["x", "y", "rotate", "skewX", "skewY", "scale", "scaleX", "scaleY"]);

function insertPoint(points, point) {
  for (let i = 0; i < points.length; i += 1) {
    if (points[i].at === point.at) return; // explicit keyframes win
    if (points[i].at > point.at) {
      points.splice(i, 0, point);
      return;
    }
  }
  points.push(point);
}

// Per track, build one sorted [{at, value, ease}] list PER PROPERTY, so a
// keyframe that omits a property never interrupts that property's tween.
// Colors get their own lists (per-channel lerp), `set` styles become
// discrete steps, and `path` keyframes become motion-guide segments.
function compileTrack(keyframes) {
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  const perProp = new Map();
  const perColor = new Map();
  const steps = [];
  const guides = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const keyframe = sorted[i];

    for (const prop of TWEEN_PROPS) {
      if (keyframe[prop] === undefined) continue;
      let points = perProp.get(prop);
      if (!points) {
        points = [];
        perProp.set(prop, points);
      }
      points.push({ at: keyframe.at, value: keyframe[prop], ease: keyframe.ease });
    }

    for (const prop of COLOR_PROPS) {
      if (keyframe[prop] === undefined) continue;
      let points = perColor.get(prop);
      if (!points) {
        points = [];
        perColor.set(prop, points);
      }
      points.push({ at: keyframe.at, value: parseColor(keyframe[prop]), ease: keyframe.ease });
    }

    if (keyframe.set) {
      steps.push({ at: keyframe.at, styles: keyframe.set });
    }

    if (keyframe.path) {
      const points = sampleGuidePath(keyframe.path);
      if (points) {
        const orient = keyframe.orient === true;
        guides.push({
          fromAt: i > 0 ? sorted[i - 1].at : keyframe.at,
          toAt: keyframe.at,
          ease: keyframe.ease,
          orient,
          points,
          // Boundary tangents let orientation HOLD outside the span instead
          // of snapping to 0deg the frame the guide ends.
          startAngle: orient ? tangentOnSamples(points, 0) : 0,
          endAngle: orient ? tangentOnSamples(points, 1) : 0,
        });
      }
    }
  }

  // A guide's endpoints become x/y keyframes, so tweens before and after the
  // curve continue exactly from where it starts/ends.
  for (const guide of guides) {
    const start = guide.points[0];
    const end = guide.points[guide.points.length - 1];
    let xPoints = perProp.get("x");
    let yPoints = perProp.get("y");
    if (!xPoints) perProp.set("x", (xPoints = []));
    if (!yPoints) perProp.set("y", (yPoints = []));
    insertPoint(xPoints, { at: guide.fromAt, value: start.x });
    insertPoint(yPoints, { at: guide.fromAt, value: start.y });
    insertPoint(xPoints, { at: guide.toAt, value: end.x });
    insertPoint(yPoints, { at: guide.toAt, value: end.y });
  }

  let hasTransform = guides.length > 0;
  for (const prop of perProp.keys()) {
    if (TRANSFORM_PROPS.has(prop)) hasTransform = true;
  }

  // The track's own extent — duration inference must see EVERY kind of
  // keyframe (a color-only or steps-only track still has a length).
  const lastAt = sorted.length ? sorted[sorted.length - 1].at : 0;

  // Union of every property the steps touch: styleAt must emit a value for
  // ALL of them on every frame (active step's value or "" to clear), or
  // discrete styles would leak across backward seeks and loop wraps.
  const stepKeys = new Set();
  for (const step of steps) {
    for (const key of Object.keys(step.styles)) {
      stepKeys.add(key);
    }
  }

  return {
    perProp,
    perColor,
    steps,
    stepKeys,
    guides,
    lastAt,
    hasTransform,
    hasOpacity: perProp.has("opacity"),
    hasOrient: guides.some((guide) => guide.orient),
  };
}

function pointsAt(points, time, defaultEase, lerp) {
  const first = points[0];
  const last = points[points.length - 1];
  if (time <= first.at) return first.value;
  if (time >= last.at) return last.value;

  for (let i = 1; i < points.length; i += 1) {
    const to = points[i];
    if (time > to.at) continue;
    const from = points[i - 1];
    const span = to.at - from.at;
    const progress = span === 0 ? 1 : (time - from.at) / span;
    const ease = easings[to.ease] || easings[defaultEase] || easings.linear;
    return lerp(from.value, to.value, ease(progress));
  }

  return last.value;
}

// Computes every style this track drives at `time`, as one flat object of
// camelCase style properties. Discrete `set` steps are assigned first and
// tweened properties second, so a tween always wins over a conflicting set.
function styleAt(compiled, time, defaultEase) {
  const style = {};

  // 1. Frame-by-frame steps: the last `set` at or before the playhead holds.
  //    Every step-managed property gets a value each frame — the active
  //    step's, or "" (clearing the inline style) before the first step or
  //    when the active step doesn't set it. Assigning only the active
  //    step's keys would leak styles across backward seeks and loop wraps.
  if (compiled.steps.length > 0) {
    let activeStep = null;
    for (const step of compiled.steps) {
      if (step.at > time) break;
      activeStep = step;
    }
    for (const key of compiled.stepKeys) {
      style[key] = activeStep && key in activeStep.styles ? activeStep.styles[key] : "";
    }
  }

  // 2. Color tweens.
  for (const [prop, points] of compiled.perColor) {
    style[prop] = rgbaString(pointsAt(points, time, defaultEase, lerpColor));
  }

  // 3. Motion guide: inside a guide span, x/y come from the curve — and
  //    rotate from its tangent when orienting (Flash's "orient to path").
  let guidePoint = null;
  let guideAngle = null;
  for (const guide of compiled.guides) {
    if (time < guide.fromAt || time > guide.toAt) continue;
    const span = guide.toAt - guide.fromAt;
    const progress = span === 0 ? 1 : (time - guide.fromAt) / span;
    const ease = easings[guide.ease] || easings[defaultEase] || easings.linear;
    const eased = ease(progress);
    guidePoint = pointOnSamples(guide.points, eased);
    if (guide.orient) {
      guideAngle = tangentOnSamples(guide.points, eased);
    }
    break;
  }

  // Outside every span, orientation holds the nearest guide's boundary
  // tangent (last passed guide's end, else next guide's start) — unless the
  // track keys `rotate` explicitly, which then owns the value out there.
  if (guideAngle === null && compiled.hasOrient && !compiled.perProp.has("rotate")) {
    let hold = null;
    for (const guide of compiled.guides) {
      if (!guide.orient) continue;
      if (time > guide.toAt) hold = guide.endAngle;
      else if (hold === null && time < guide.fromAt) hold = guide.startAngle;
    }
    guideAngle = hold;
  }

  // 4. Transform + opacity, composed in canonical order (translate → rotate
  //    → skew → scale). Only properties the track animates are emitted, so
  //    tracks compose with any static CSS the element already has.
  const value = (prop, fallback) => {
    const points = compiled.perProp.get(prop);
    return points ? pointsAt(points, time, defaultEase, lerpNumber) : fallback;
  };

  if (compiled.hasTransform) {
    const parts = [];
    // translate3d over translate: no browser collapses its serialized form
    // (Firefox rewrites `translate(50px, 0px)` as `translate(50px)`), and it
    // promotes the element to its own compositor layer.
    if (compiled.perProp.has("x") || compiled.perProp.has("y")) {
      const x = guidePoint ? guidePoint.x : value("x", 0);
      const y = guidePoint ? guidePoint.y : value("y", 0);
      parts.push(`translate3d(${x}px, ${y}px, 0px)`);
    }
    if (compiled.perProp.has("rotate") || compiled.hasOrient) {
      const rotate = guideAngle !== null ? guideAngle : value("rotate", 0);
      parts.push(`rotate(${rotate}deg)`);
    }
    if (compiled.perProp.has("skewX") || compiled.perProp.has("skewY")) {
      parts.push(`skew(${value("skewX", 0)}deg, ${value("skewY", 0)}deg)`);
    }
    if (compiled.perProp.has("scale") || compiled.perProp.has("scaleX") || compiled.perProp.has("scaleY")) {
      const uniform = value("scale", 1);
      parts.push(`scale(${value("scaleX", uniform)}, ${value("scaleY", uniform)})`);
    }
    style.transform = parts.join(" ");
  }

  if (compiled.hasOpacity) {
    style.opacity = String(value("opacity", 1));
  }

  return style;
}

// ── Timeline ─────────────────────────────────────────────────────────────────
//
// createTimeline(spec) → controller. Imperative and framework-free — the
// useTimeline() hook below wraps it with mount/unmount lifecycle.
//
// spec:
//   duration   ms; inferred from the last keyframe/script when omitted
//   loop       false (default) | true (forever) | n (extra passes)
//   speed      playback rate, default 1 (negative values: use reverse())
//   ease       default easing name for tweens without their own (linear)
//   labels     { name: ms }
//   tracks     { trackName: [keyframe, ...] }
//   onFrame    { msOrLabel: fn } — frame scripts, fired when the playhead
//              CROSSES the frame while playing (direction-aware).
//              gotoAndPlay(target) fires the script sitting exactly on the
//              target (as Flash did); plain seeks/gotoAndStop fire nothing.
//   onUpdate   fn(timeMs) after each applied frame
//   onLoop     fn() at each wrap
//   onComplete fn() when the playhead finishes (no loops left)
//
// controller: play, stop, gotoAndPlay, gotoAndStop, seek, reverse, setSpeed,
//   track(name) → ref, time, duration, isPlaying, direction, destroy.

export function createTimeline(spec = {}) {
  const tracks = new Map();
  let lastKeyframeAt = 0;

  for (const [name, keyframes] of Object.entries(spec.tracks || {})) {
    const compiled = compileTrack(keyframes);
    tracks.set(name, compiled);
    lastKeyframeAt = Math.max(lastKeyframeAt, compiled.lastAt);
  }

  const labels = spec.labels || {};
  const resolveTime = (target) => {
    // NaN would silently poison every clamp and the inferred duration —
    // treat it as the unknown-label error it almost always is (a typo'd
    // onFrame/goto key coerced through Number()).
    if (typeof target === "number" && !Number.isNaN(target)) return target;
    if (target in labels) return labels[target];
    throw new Error(`nexa-motion: unknown label or time "${target}".`);
  };

  const scripts = Object.entries(spec.onFrame || {})
    .map(([key, fn]) => {
      const numeric = Number(key);
      const at = key in labels ? labels[key] : Number.isNaN(numeric) ? resolveTime(key) : numeric;
      return { at, fn };
    })
    .sort((a, b) => a.at - b.at);
  for (const script of scripts) {
    lastKeyframeAt = Math.max(lastKeyframeAt, script.at);
  }

  const duration = spec.duration ?? lastKeyframeAt;
  const defaultEase = spec.ease || "linear";
  const elements = new Map(); // trackName → Set<Element>
  const refCallbacks = new Map(); // trackName → stable callback ref
  const warnedTracks = new Set(); // unknown track names already reported

  let time = 0;
  let playing = false;
  let direction = 1;
  let speed = spec.speed ?? 1;
  let loopsLeft = spec.loop === true ? Infinity : spec.loop || 0;
  const loopsTotal = loopsLeft;
  let rafHandle = null;
  let lastNow = null;
  let destroyed = false;

  function applyTrack(name, compiled) {
    const bound = elements.get(name);
    if (!bound || bound.size === 0) return;
    const style = styleAt(compiled, time, defaultEase);
    const keys = Object.keys(style);
    for (const element of bound) {
      for (const key of keys) {
        element.style[key] = style[key];
      }
    }
  }

  function applyAll() {
    for (const [name, compiled] of tracks) {
      applyTrack(name, compiled);
    }
    spec.onUpdate?.(time);
  }

  // Fire scripts the playhead crossed moving from `fromTime` to `toTime`
  // (exclusive start, inclusive end — a script fires once per pass).
  function fireCrossedScripts(fromTime, toTime) {
    // `scripts` is sorted by `at`, so each direction can stop scanning the
    // moment it passes the playhead.
    if (toTime > fromTime) {
      for (const script of scripts) {
        if (script.at > toTime) break;
        if (script.at > fromTime) script.fn();
      }
    } else if (toTime < fromTime) {
      for (let i = scripts.length - 1; i >= 0; i -= 1) {
        const script = scripts[i];
        if (script.at < toTime) break;
        if (script.at < fromTime) script.fn();
      }
    }
  }

  function stopTicker() {
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
    lastNow = null;
  }

  function tick(now) {
    rafHandle = null;
    if (destroyed || !playing) return;

    const delta = lastNow === null ? 0 : now - lastNow;
    lastNow = now;

    const previous = time;
    let next = time + delta * speed * direction;

    // End handling. Forward end is `duration`; reverse end is 0.
    let completed = false;
    if (direction > 0 && next >= duration) {
      if (loopsLeft > 0) {
        loopsLeft -= 1;
        fireCrossedScripts(previous, duration);
        spec.onLoop?.();
        next = duration === 0 ? 0 : next % duration;
        time = next;
        fireCrossedScripts(0, next);
      } else {
        next = duration;
        time = next;
        fireCrossedScripts(previous, next);
        completed = true;
      }
    } else if (direction < 0 && next <= 0) {
      if (loopsLeft > 0) {
        loopsLeft -= 1;
        fireCrossedScripts(previous, 0);
        spec.onLoop?.();
        next = duration === 0 ? 0 : duration + (next % duration);
        time = next;
        fireCrossedScripts(duration, next);
      } else {
        next = 0;
        time = next;
        fireCrossedScripts(previous, next);
        completed = true;
      }
    } else {
      time = next;
      fireCrossedScripts(previous, next);
    }

    applyAll();

    if (completed) {
      playing = false;
      spec.onComplete?.();
      return;
    }

    rafHandle = requestAnimationFrame(tick);
  }

  function startTicker() {
    // No rAF (renderToString in a DOM-less runtime): stay paused — the
    // timeline still answers seek/gotoAndStop for static output.
    if (typeof requestAnimationFrame !== "function") return;
    if (rafHandle === null) {
      lastNow = null;
      rafHandle = requestAnimationFrame(tick);
    }
  }

  const controller = {
    get time() {
      return time;
    },
    get duration() {
      return duration;
    },
    get isPlaying() {
      return playing;
    },
    get direction() {
      return direction;
    },

    label(name) {
      return resolveTime(name);
    },

    // The Flash quartet.
    play() {
      if (destroyed || playing) return;
      // Replaying a finished movie starts over, like hitting play in Flash —
      // with its loop budget restored, same as gotoAndPlay does.
      if (direction > 0 && time >= duration) {
        time = 0;
        loopsLeft = loopsTotal;
      }
      if (direction < 0 && time <= 0) {
        time = duration;
        loopsLeft = loopsTotal;
      }
      playing = true;
      startTicker();
    },
    stop() {
      playing = false;
      stopTicker();
    },
    gotoAndPlay(target) {
      if (destroyed) return;
      const target_ = Math.max(0, Math.min(duration, resolveTime(target)));
      loopsLeft = loopsTotal;
      time = target_;
      // Flash executed the target frame's script on gotoAndPlay.
      for (const script of scripts) {
        if (script.at === target_) script.fn();
      }
      applyAll();
      playing = true;
      startTicker();
    },
    gotoAndStop(target) {
      controller.stop();
      controller.seek(target);
    },
    seek(target) {
      if (destroyed) return;
      time = Math.max(0, Math.min(duration, resolveTime(target)));
      applyAll();
    },

    reverse() {
      direction *= -1;
    },
    setSpeed(next) {
      speed = next;
    },

    // Stable callback ref binding an element to a named track. Nexa calls it
    // with the node on mount and null on unmount.
    track(name) {
      let callback = refCallbacks.get(name);
      if (callback) return callback;

      callback = (node) => {
        let bound = elements.get(name);
        if (!bound) {
          bound = new Set();
          elements.set(name, bound);
        }

        if (node) {
          bound.add(node);
          node.style.willChange = "transform, opacity";
          // Sync the newcomer to the playhead immediately (through the one
          // canonical apply path) so late-mounting elements never flash
          // their unanimated state.
          const compiled = tracks.get(name);
          if (compiled) {
            applyTrack(name, compiled);
          } else if (!warnedTracks.has(name)) {
            // The most common silent failure: binding a track the spec
            // doesn't know. useTimeline captures its spec on FIRST render —
            // tracks built from data that arrives later never compile.
            warnedTracks.add(name);
            console.warn(
              `nexa-motion: track "${name}" is not in this timeline's spec — the element is bound but nothing will animate it.`,
            );
          }
        } else {
          // Callback refs receive null without saying WHICH node unmounted,
          // and at clearRef time the node may still be in the document —
          // prune after the removal has actually happened.
          queueMicrotask(() => {
            for (const element of bound) {
              if (!element.isConnected) bound.delete(element);
            }
          });
        }
      };

      refCallbacks.set(name, callback);
      return callback;
    },

    destroy() {
      destroyed = true;
      playing = false;
      stopTicker();
      elements.clear();
      // Guides are pre-sampled at compile time — their temporary <path>
      // elements already left the hidden <svg>; nothing to clean up here.
    },
  };

  if (spec.autoplay) {
    controller.play();
  }

  return controller;
}

// ── useTimeline ──────────────────────────────────────────────────────────────
//
// Component-lifecycle wrapper: creates the timeline on first render (the
// spec is captured then — like createLazy, treat it as static), autoplays
// after mount unless `autoplay: false`, and destroys on unmount.
//
//   const tl = useTimeline({ duration: 2000, tracks: { ... } });
//   h("div", { ref: tl.track("hero") }, ...)

export function useTimeline(spec) {
  const controllerRef = useRef(null);

  if (!controllerRef.current) {
    controllerRef.current = createTimeline({ ...spec, autoplay: false });
  }

  useEffect(() => {
    const controller = controllerRef.current;
    // The effect entry is created on the first render, so this closure holds
    // the same spec the controller was built from.
    if (spec?.autoplay !== false) {
      controller.play();
    }
    return () => controller.destroy();
  }, []);

  return controllerRef.current;
}
