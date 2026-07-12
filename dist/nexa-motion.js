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
//   skewX?, skewY?, opacity?, ease? }
//   - `at` is the keyframe's time in milliseconds.
//   - `ease` names how the playhead ARRIVES at this keyframe (the tween from
//     the previous keyframe of each property). See `easings` for the names —
//     the classic Penner set, originally written for Flash.
//   - A property absent from a keyframe simply isn't a key for it: the
//     property tweens between the keyframes that DO define it.
//   - x/y are px (translate), rotate/skewX/skewY are degrees, scale is a
//     factor (scaleX/scaleY override it per axis).
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

// ── Track compilation ────────────────────────────────────────────────────────

const TWEEN_PROPS = ["x", "y", "rotate", "skewX", "skewY", "scale", "scaleX", "scaleY", "opacity"];
const TRANSFORM_PROPS = new Set(["x", "y", "rotate", "skewX", "skewY", "scale", "scaleX", "scaleY"]);

// Per track, build one sorted [{at, value, ease}] list PER PROPERTY, so a
// keyframe that omits a property never interrupts that property's tween.
function compileTrack(keyframes) {
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  const perProp = new Map();

  for (const keyframe of sorted) {
    for (const prop of TWEEN_PROPS) {
      if (keyframe[prop] === undefined) continue;
      let points = perProp.get(prop);
      if (!points) {
        points = [];
        perProp.set(prop, points);
      }
      points.push({ at: keyframe.at, value: keyframe[prop], ease: keyframe.ease });
    }
  }

  let hasTransform = false;
  for (const prop of perProp.keys()) {
    if (TRANSFORM_PROPS.has(prop)) hasTransform = true;
  }

  return { perProp, hasTransform, hasOpacity: perProp.has("opacity") };
}

function valueAt(points, time, defaultEase) {
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
    return from.value + (to.value - from.value) * ease(progress);
  }

  return last.value;
}

// Canonical order keeps the composed transform deterministic:
// translate → rotate → skew → scale. Only properties the track animates are
// emitted, so tracks compose with any static CSS the element already has.
function styleAt(compiled, time, defaultEase) {
  const value = (prop, fallback) => {
    const points = compiled.perProp.get(prop);
    return points ? valueAt(points, time, defaultEase) : fallback;
  };

  const style = {};

  if (compiled.hasTransform) {
    const parts = [];
    // translate3d over translate: no browser collapses its serialized form
    // (Firefox rewrites `translate(50px, 0px)` as `translate(50px)`), and it
    // promotes the element to its own compositor layer.
    if (compiled.perProp.has("x") || compiled.perProp.has("y")) {
      parts.push(`translate3d(${value("x", 0)}px, ${value("y", 0)}px, 0px)`);
    }
    if (compiled.perProp.has("rotate")) {
      parts.push(`rotate(${value("rotate", 0)}deg)`);
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
    for (const points of compiled.perProp.values()) {
      lastKeyframeAt = Math.max(lastKeyframeAt, points[points.length - 1].at);
    }
  }

  const labels = spec.labels || {};
  const resolveTime = (target) => {
    if (typeof target === "number") return target;
    if (target in labels) return labels[target];
    throw new Error(`nexa-motion: unknown label "${target}".`);
  };

  const scripts = Object.entries(spec.onFrame || {})
    .map(([key, fn]) => ({ at: resolveTime(key in labels ? key : Number(key)), fn }))
    .sort((a, b) => a.at - b.at);
  for (const script of scripts) {
    lastKeyframeAt = Math.max(lastKeyframeAt, script.at);
  }

  const duration = spec.duration ?? lastKeyframeAt;
  const defaultEase = spec.ease || "linear";
  const elements = new Map(); // trackName → Set<Element>
  const refCallbacks = new Map(); // trackName → stable callback ref

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
    for (const element of bound) {
      if (style.transform !== undefined) element.style.transform = style.transform;
      if (style.opacity !== undefined) element.style.opacity = style.opacity;
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
    if (toTime > fromTime) {
      for (const script of scripts) {
        if (script.at > fromTime && script.at <= toTime) script.fn();
      }
    } else if (toTime < fromTime) {
      for (let i = scripts.length - 1; i >= 0; i -= 1) {
        const script = scripts[i];
        if (script.at < fromTime && script.at >= toTime) script.fn();
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
      // Replaying a finished movie starts over, like hitting play in Flash.
      if (direction > 0 && time >= duration) time = 0;
      if (direction < 0 && time <= 0) time = duration;
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
      if (destroyed) return;
      controller.stop();
      time = Math.max(0, Math.min(duration, resolveTime(target)));
      applyAll();
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
          // Sync the newcomer to the playhead immediately so late-mounting
          // elements never flash their unanimated state.
          const compiled = tracks.get(name);
          if (compiled) {
            const style = styleAt(compiled, time, defaultEase);
            if (style.transform !== undefined) node.style.transform = style.transform;
            if (style.opacity !== undefined) node.style.opacity = style.opacity;
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
    controllerRef.current._autoplay = spec?.autoplay !== false;
  }

  useEffect(() => {
    const controller = controllerRef.current;
    if (controller._autoplay) {
      controller.play();
    }
    return () => controller.destroy();
  }, []);

  return controllerRef.current;
}
