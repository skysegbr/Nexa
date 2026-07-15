/*!
 * Nexa — ZoomStage add-on (pan/zoom presentation stage).
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
import { h, useEffect, useRef, useState } from "./nexa.js";

// ── ZoomStage ────────────────────────────────────────────────────────────────
//
// A pan/zoom presentation: a camera glides between "frames" scattered across
// one large canvas, in the style of non-linear zooming presentation tools.
// All frame content is normal Nexa vdom, positioned with plain CSS on one
// large "world" div — every frame is mounted on screen simultaneously, same
// as the real canvas. Only the *camera* (a single transform on that world
// div) is imperative: a small requestAnimationFrame tween eases
// pan/zoom/rotate between frames at 60fps, which the vdom diff loop can't do
// smoothly on its own.
//
// Frame schema: { id, x, y, w, h, rotate?, label?, content }
//   x/y/w/h are world-pixel coordinates. rotate is degrees (default 0).
//   label (optional) is announced to screen readers on navigation.
//
// Props:
//   frames        Array<{ id, x, y, w, h, rotate?, label?, content }>
//   path          Array<id> — navigation order, defaults to `frames` order
//   index / defaultIndex / onIndexChange  — controlled/uncontrolled current step
//   duration      ms per camera animation (default 900)
//   easing        (t) => t easing function (default cubicEaseInOut)
//   padding       fraction (0–0.45) of the viewport reserved as margin around
//                 every framed frame (default 0.06). 0 = fill the viewport.
//   controllerRef ref — { next, prev, goTo, reset, fitAll, index, frames }
//   keyboardNav   bool, default true — Arrow/Space = step, Home/End = first/last;
//                 with freeZoom, +/- zoom and 0/Esc recenter the current frame
//   advanceOnClick bool, default true — tap on stage background advances
//   swipeNav      bool, default true — horizontal swipe steps (touch/pen)
//   freeZoom      bool, default false — wheel/pinch to zoom, drag to pan freely
//                 (with flick momentum); double-click zooms toward the point
//                 when advanceOnClick is off
//   minZoom/maxZoom  freeZoom scale bounds as multiples of the frame fit
//                 (default 0.2 and 12)
//   autoplay      truthy — auto-advance; a number sets the interval ms
//                 (default 4000), looping back to the first frame
//   hashNav       bool, default false — sync the current frame id to location.hash
//   onInteract    () => void — fired when the user first grabs the camera
//                 (wheel/pinch/drag), e.g. to pause an autoplay tour
//   ariaLabel     string — accessible name for the whole stage
//
// Respects prefers-reduced-motion: navigation jumps instead of animating.

function cubicEaseInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Interpolate rotation the SHORT way (±180°) so 350°→10° sweeps +20°, not −340°.
function shortestRotate(from, to) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  else if (d < -180) d += 360;
  return from + d;
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function cameraFor(frame, vw, vh, padding = 0) {
  const pad = clamp(padding, 0, 0.45);
  const effVw = vw * (1 - pad * 2);
  const effVh = vh * (1 - pad * 2);
  return {
    cx: frame.x + frame.w / 2,
    cy: frame.y + frame.h / 2,
    scale: Math.min(effVw / frame.w, effVh / frame.h),
    rotate: frame.rotate || 0,
  };
}

// The bounding box of every frame, as a pseudo-frame to fit an overview onto.
function boundsOf(frames) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of frames) {
    minX = Math.min(minX, f.x);
    minY = Math.min(minY, f.y);
    maxX = Math.max(maxX, f.x + f.w);
    maxY = Math.max(maxY, f.y + f.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, rotate: 0 };
}

function applyCamera(worldEl, cam, vw, vh) {
  worldEl.style.transform =
    `translate(${vw / 2}px, ${vh / 2}px) scale(${cam.scale}) rotate(${-cam.rotate}deg) translate(${-cam.cx}px, ${-cam.cy}px)`;
}

class ZoomCameraController {
  constructor(wrapEl, worldEl, opts = {}) {
    const { padding = 0, freeZoom = false, swipeNav = true, minZoom = 0.2, maxZoom = 12, onSwipe, onInteract } = opts;
    this.wrap     = wrapEl;
    this.world    = worldEl;
    this.padding  = padding;
    this.freeZoom = freeZoom;
    this.swipeNav = swipeNav;
    this.minZoom  = minZoom;
    this.maxZoom  = maxZoom;
    this.onSwipe  = onSwipe;
    this.onInteract = onInteract;
    this.vw       = 0;
    this.vh       = 0;
    this.cam      = { cx: 0, cy: 0, scale: 1, rotate: 0 };
    this._activeFrame = null;
    this._free    = false; // user has zoomed/panned away from the active frame

    this._raf   = null;
    this._from  = this.cam;
    this._to    = this.cam;
    this._start = 0;
    this._dur   = 900;
    this._ease  = cubicEaseInOut;

    // Gesture + momentum state.
    this._pointers = new Map(); // pointerId → { x, y }
    this._down     = null;      // first-pointer down position
    this._dragged  = false;     // a pan/pinch/swipe consumed this sequence → suppress the trailing click
    this._pinch    = 0;         // last two-finger distance
    this._vel      = { x: 0, y: 0 }; // px/ms, for flick momentum
    this._lastMove = 0;
    this._glide    = null;      // momentum rAF handle

    this._onDown   = (e) => this._pointerDown(e);
    this._onMove   = (e) => this._pointerMove(e);
    this._onUp     = (e) => this._pointerUp(e);
    this._onWheel  = (e) => this._wheel(e);
    this.wrap.addEventListener("pointerdown", this._onDown);
    this.wrap.addEventListener("pointermove", this._onMove);
    this.wrap.addEventListener("pointerup", this._onUp);
    this.wrap.addEventListener("pointercancel", this._onUp);
    this.wrap.addEventListener("wheel", this._onWheel, { passive: false });

    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(this.wrap);
    this._onResize();
  }

  setInteraction(freeZoom, swipeNav, minZoom, maxZoom) {
    this.freeZoom = freeZoom;
    this.swipeNav = swipeNav;
    if (minZoom != null) this.minZoom = minZoom;
    if (maxZoom != null) this.maxZoom = maxZoom;
  }

  // Consume-and-clear the "a gesture just happened" flag, so the click that
  // trails a drag doesn't also advance the stage.
  consumedGesture() {
    const dragged = this._dragged;
    this._dragged = false;
    return dragged;
  }

  setPadding(padding) {
    this.padding = padding;
    if (!this._free) this._retarget();
  }

  // Re-fit the active frame to the current viewport/padding. Mid-animation we
  // retarget the in-flight tween instead of snapping.
  _retarget() {
    if (!this._activeFrame) return;
    const to = cameraFor(this._activeFrame, this.vw, this.vh, this.padding);
    if (this._raf != null) {
      this._to = { ...to, rotate: shortestRotate(this._from.rotate, to.rotate) };
    } else {
      this.cam = to;
      applyCamera(this.world, this.cam, this.vw, this.vh);
    }
  }

  _onResize() {
    const rect = this.wrap.getBoundingClientRect();
    this.vw = rect.width;
    this.vh = rect.height;
    // Free exploration survives a resize: keep the camera, just re-centre it.
    if (this._free || !this._activeFrame) {
      applyCamera(this.world, this.cam, this.vw, this.vh);
      return;
    }
    this._retarget();
  }

  jumpTo(frame) {
    if (!frame) return;
    this._cancel();
    this._stopGlide();
    this._free = false;
    this._activeFrame = frame;
    this.cam = cameraFor(frame, this.vw, this.vh, this.padding);
    this._from = this.cam;
    this._to = this.cam;
    applyCamera(this.world, this.cam, this.vw, this.vh);
  }

  animateTo(frame, opts = {}) {
    if (!frame) return;
    this._free = false;
    this._activeFrame = frame;
    this._animateCam(cameraFor(frame, this.vw, this.vh, this.padding), opts);
  }

  // Ease the camera from where it is now to a target camera. Shared by frame
  // navigation, reset() and fitAll(). Honours prefers-reduced-motion.
  _animateCam(target, { duration = 900, easing = cubicEaseInOut } = {}) {
    this._cancel();
    this._stopGlide();
    if (prefersReducedMotion()) {
      this.cam = { ...target };
      this._from = this.cam;
      this._to = this.cam;
      applyCamera(this.world, this.cam, this.vw, this.vh);
      return;
    }
    this._from = this.cam;
    this._to = { ...target, rotate: shortestRotate(this._from.rotate, target.rotate) };
    this._dur = Math.max(1, duration);
    this._ease = easing || cubicEaseInOut;
    this._start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - this._start) / this._dur);
      const e = this._ease(t);
      const from = this._from;
      const to = this._to;
      this.cam = {
        cx:     from.cx     + (to.cx     - from.cx)     * e,
        cy:     from.cy     + (to.cy     - from.cy)     * e,
        scale:  from.scale  + (to.scale  - from.scale)  * e,
        rotate: from.rotate + (to.rotate - from.rotate) * e,
      };
      applyCamera(this.world, this.cam, this.vw, this.vh);
      if (t < 1) this._raf = requestAnimationFrame(tick);
      else this._raf = null;
    };
    this._raf = requestAnimationFrame(tick);
  }

  // Ease back to the active frame's fit, undoing any free exploration.
  reset() {
    if (!this._activeFrame) return;
    this._free = false;
    this._animateCam(cameraFor(this._activeFrame, this.vw, this.vh, this.padding));
  }

  // Zoom out to frame every frame at once (an overview of the whole canvas).
  fitAll(frames) {
    if (!frames || !frames.length) return;
    this._free = true;
    this._animateCam(cameraFor(boundsOf(frames), this.vw, this.vh, this.padding));
  }

  _cancel() {
    if (this._raf != null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  // ── free camera: wheel/pinch zoom-to-cursor, drag pan, momentum ──

  _fitScale() {
    return this._activeFrame
      ? cameraFor(this._activeFrame, this.vw, this.vh, this.padding).scale
      : (this.cam.scale || 1);
  }

  _beginInteract() {
    if (!this._free) this.onInteract?.();
    this._free = true;
  }

  // The camera that keeps the world point under (clientX, clientY) fixed while
  // the scale becomes s2.
  _zoomPoint(s2, clientX, clientY) {
    const s = this.cam.scale;
    const rect = this.wrap.getBoundingClientRect();
    const dx = (clientX - rect.left) - this.vw / 2;
    const dy = (clientY - rect.top) - this.vh / 2;
    const rot = (this.cam.rotate * Math.PI) / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const k = 1 / s - 1 / s2;
    return {
      cx: this.cam.cx + (cos * dx - sin * dy) * k,
      cy: this.cam.cy + (sin * dx + cos * dy) * k,
      scale: s2,
      rotate: this.cam.rotate,
    };
  }

  _clampScale(factor) {
    const fit = this._fitScale();
    return clamp(this.cam.scale * factor, fit * this.minZoom, fit * this.maxZoom);
  }

  zoomBy(factor, clientX, clientY) {
    this._cancel();
    this._stopGlide();
    const s2 = this._clampScale(factor);
    if (s2 === this.cam.scale) return;
    this._beginInteract();
    this.cam = this._zoomPoint(s2, clientX, clientY);
    applyCamera(this.world, this.cam, this.vw, this.vh);
  }

  // Animated zoom toward a point — for double-click.
  zoomAt(clientX, clientY, factor) {
    const s2 = this._clampScale(factor);
    if (s2 === this.cam.scale) return;
    this._beginInteract();
    this._animateCam(this._zoomPoint(s2, clientX, clientY), { duration: 320 });
  }

  // Zoom toward the viewport centre — for the +/- keys.
  zoomCenter(factor) {
    const rect = this.wrap.getBoundingClientRect();
    this.zoomBy(factor, rect.left + this.vw / 2, rect.top + this.vh / 2);
  }

  panByScreen(dx, dy) {
    this._cancel();
    this._beginInteract();
    const s = this.cam.scale;
    const rot = (this.cam.rotate * Math.PI) / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    this.cam = {
      ...this.cam,
      cx: this.cam.cx - (cos * dx - sin * dy) / s,
      cy: this.cam.cy - (sin * dx + cos * dy) / s,
    };
    applyCamera(this.world, this.cam, this.vw, this.vh);
  }

  _startGlide() {
    this._stopGlide();
    let vx = this._vel.x;
    let vy = this._vel.y;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(40, now - last);
      last = now;
      this.panByScreen(vx * dt, vy * dt);
      const decay = Math.pow(0.94, dt / 16);
      vx *= decay;
      vy *= decay;
      this._glide = Math.hypot(vx, vy) > 0.02 ? requestAnimationFrame(step) : null;
    };
    this._glide = requestAnimationFrame(step);
  }

  _stopGlide() {
    if (this._glide != null) {
      cancelAnimationFrame(this._glide);
      this._glide = null;
    }
  }

  // ── gestures ──

  _capture() {
    for (const id of this._pointers.keys()) {
      try { this.wrap.setPointerCapture(id); } catch { /* not supported */ }
    }
  }

  _pointerDown(e) {
    if (e.button != null && e.button > 0) return; // left / touch / pen only
    this._stopGlide();
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this._pointers.size === 1) {
      this._down = { x: e.clientX, y: e.clientY };
      this._dragged = false;
      this._vel = { x: 0, y: 0 };
      this._lastMove = performance.now();
    } else if (this._pointers.size === 2) {
      const [a, b] = [...this._pointers.values()];
      this._pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  _pointerMove(e) {
    const p = this._pointers.get(e.pointerId);
    if (!p) return;
    const px = p.x;
    const py = p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    const n = this._pointers.size;

    if (n >= 2 && this.freeZoom) {
      const [a, b] = [...this._pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (this._pinch > 0) this.zoomBy(dist / this._pinch, (a.x + b.x) / 2, (a.y + b.y) / 2);
      this._pinch = dist;
      this._dragged = true;
      e.preventDefault();
      return;
    }

    if (n === 1 && this._down) {
      const far = Math.abs(e.clientX - this._down.x) > 8 || Math.abs(e.clientY - this._down.y) > 8;
      // Commit the drag lazily (only once it's really moving) so a plain tap
      // never captures the pointer and steals clicks from frame content.
      if (far && (this.freeZoom || this.swipeNav)) this._capture();
      if (this.freeZoom) {
        this.panByScreen(e.clientX - px, e.clientY - py);
        // Track velocity for flick momentum, but only from real time gaps —
        // synthetic bursts (dt ≈ 0) would read as an absurd speed.
        const now = performance.now();
        const dt = now - this._lastMove;
        if (dt >= 4) {
          this._vel = {
            x: this._vel.x * 0.4 + ((e.clientX - px) / dt) * 0.6,
            y: this._vel.y * 0.4 + ((e.clientY - py) / dt) * 0.6,
          };
          this._lastMove = now;
        }
        if (far) this._dragged = true;
        e.preventDefault();
      }
    }
  }

  _pointerUp(e) {
    if (!this._pointers.has(e.pointerId)) return;
    this._pointers.delete(e.pointerId);
    this._pinch = 0;
    if (this._pointers.size > 0) return; // still mid multi-touch

    if (this._down) {
      const dx = e.clientX - this._down.x;
      const dy = e.clientY - this._down.y;
      if (this.freeZoom) {
        // A flick — release while still moving fast — glides to a stop.
        const fresh = performance.now() - this._lastMove < 60;
        if (this._dragged && fresh && Math.hypot(this._vel.x, this._vel.y) > 0.25) this._startGlide();
      } else if (this.swipeNav && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        this.onSwipe?.(dx < 0 ? 1 : -1);
        this._dragged = true;
      }
    }
    this._down = null;
  }

  _wheel(e) {
    if (!this.freeZoom) return;
    e.preventDefault();
    this.zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
  }

  destroy() {
    this._cancel();
    this._stopGlide();
    this._ro.disconnect();
    this.wrap.removeEventListener("pointerdown", this._onDown);
    this.wrap.removeEventListener("pointermove", this._onMove);
    this.wrap.removeEventListener("pointerup", this._onUp);
    this.wrap.removeEventListener("pointercancel", this._onUp);
    this.wrap.removeEventListener("wheel", this._onWheel);
  }
}

function jc(...c) { return c.filter(Boolean).join(" "); }

function frameIds(frames, path) {
  return path && path.length ? path.slice() : frames.map((f) => f.id);
}

export function ZoomStage({
  frames = [],
  path,
  index,
  defaultIndex = 0,
  onIndexChange,
  duration = 900,
  easing,
  padding = 0.06,
  controllerRef,
  keyboardNav = true,
  advanceOnClick = true,
  swipeNav = true,
  freeZoom = false,
  minZoom = 0.2,
  maxZoom = 12,
  autoplay,
  hashNav = false,
  onInteract,
  ariaLabel,
  className = "",
  style,
} = {}) {
  const wrapRef  = useRef(null);
  const worldRef = useRef(null);
  const ctrlRef  = useRef(null);
  const navRef   = useRef({});
  const cbRef    = useRef({});
  cbRef.current = { onInteract };

  const hashIndex = () => {
    if (!hashNav || typeof location === "undefined") return -1;
    return frameIds(frames, path).indexOf(decodeURIComponent(location.hash.replace(/^#/, "")));
  };
  const [internalIndex, setInternalIndex] = useState(() => {
    const i = hashIndex();
    return i >= 0 ? i : defaultIndex;
  });
  const curIndex = index !== undefined ? index : internalIndex;

  const seq = path && path.length
    ? path.map((id) => frames.find((f) => f.id === id)).filter(Boolean)
    : frames;

  const resolveFrame = (target) => {
    if (typeof target === "number") return seq[target];
    return seq.find((f) => f.id === target);
  };

  const goTo = (target, { animate = true } = {}) => {
    const frame = resolveFrame(target);
    if (!frame) return;
    const newIndex = seq.indexOf(frame);
    if (index === undefined) setInternalIndex(newIndex);
    onIndexChange?.(newIndex);
    const method = animate && !prefersReducedMotion() ? "animateTo" : "jumpTo";
    ctrlRef.current?.[method](frame, { duration, easing });
  };

  const next = () => { if (curIndex < seq.length - 1) goTo(curIndex + 1); };
  const prev = () => { if (curIndex > 0) goTo(curIndex - 1); };

  navRef.current = {
    next,
    prev,
    goTo,
    first: () => goTo(0),
    last: () => goTo(seq.length - 1),
    swipe: (dir) => { if (dir > 0) next(); else prev(); },
    advance: () => { if (curIndex >= seq.length - 1) goTo(0); else next(); },
  };

  // Mount: build the imperative camera controller once.
  useEffect(() => {
    if (!wrapRef.current || !worldRef.current) return undefined;
    const ctrl = new ZoomCameraController(wrapRef.current, worldRef.current, {
      padding,
      freeZoom,
      swipeNav,
      minZoom,
      maxZoom,
      onSwipe: (dir) => navRef.current.swipe(dir),
      onInteract: () => cbRef.current.onInteract?.(),
    });
    ctrlRef.current = ctrl;
    ctrl.jumpTo(seq[curIndex]);
    return () => { ctrl.destroy(); ctrlRef.current = null; };
  }, []);

  useEffect(() => { ctrlRef.current?.setPadding(padding); }, [padding]);
  useEffect(() => {
    ctrlRef.current?.setInteraction(freeZoom, swipeNav, minZoom, maxZoom);
  }, [freeZoom, swipeNav, minZoom, maxZoom]);

  // Keyboard: nav always; zoom/recenter shortcuts only while freeZoom is on.
  useEffect(() => {
    if (!keyboardNav) return undefined;
    const onKeyDown = (e) => {
      const t = e.target;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable) return;
      if (freeZoom) {
        if (e.key === "+" || e.key === "=") { e.preventDefault(); ctrlRef.current?.zoomCenter(1.3); return; }
        if (e.key === "-" || e.key === "_") { e.preventDefault(); ctrlRef.current?.zoomCenter(1 / 1.3); return; }
        if (e.key === "0" || e.key === "Escape") { e.preventDefault(); ctrlRef.current?.reset(); return; }
      }
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); navRef.current.next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); navRef.current.prev(); }
      else if (e.key === "Home") { e.preventDefault(); navRef.current.first(); }
      else if (e.key === "End") { e.preventDefault(); navRef.current.last(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [keyboardNav, freeZoom]);

  // Autoplay: auto-advance, looping back to the first frame.
  useEffect(() => {
    if (!autoplay) return undefined;
    const ms = typeof autoplay === "number" ? autoplay : 4000;
    const id = setInterval(() => navRef.current.advance(), ms);
    return () => clearInterval(id);
  }, [autoplay]);

  // Deep-linking: react to the URL hash (back/forward, shared links).
  useEffect(() => {
    if (!hashNav) return undefined;
    const onHash = () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (id && seq.some((f) => f.id === id)) navRef.current.goTo(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [hashNav]);

  useEffect(() => {
    if (!hashNav) return;
    const id = seq[curIndex]?.id;
    if (id && decodeURIComponent(location.hash.replace(/^#/, "")) !== id) {
      history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    }
  }, [hashNav, curIndex]);

  // Exposed imperative API — reassigned every render so it always closes over
  // the current index/sequence (unlike PipelineCanvas's controllerRef, which
  // is set once on mount because it wraps a long-lived instance).
  if (controllerRef) {
    controllerRef.current = {
      next,
      prev,
      goTo,
      reset: () => ctrlRef.current?.reset(),
      fitAll: () => ctrlRef.current?.fitAll(seq),
      zoomIn: () => ctrlRef.current?.zoomCenter(1.3),
      zoomOut: () => ctrlRef.current?.zoomCenter(1 / 1.3),
      index: curIndex,
      frames: seq,
    };
  }

  const active = seq[curIndex];

  return h(
    "div",
    {
      ref: wrapRef,
      className: jc("m-zoom-stage", freeZoom && "m-zoom-stage-free", className),
      style,
      tabIndex: 0,
      role: "group",
      ariaLabel,
      // A drag/swipe fires the trailing click too; consumedGesture() eats it so
      // panning the canvas doesn't also advance the slide.
      onClick: () => {
        const consumed = ctrlRef.current?.consumedGesture();
        if (advanceOnClick && !consumed) next();
      },
      // Double-click zooms toward the point — but only when taps aren't already
      // spoken for by advanceOnClick (a double-click is two taps).
      onDblClick: (e) => {
        if (freeZoom && !advanceOnClick) ctrlRef.current?.zoomAt(e.clientX, e.clientY, 1.9);
      },
    },
    h(
      "div",
      { className: "m-zoom-live", ariaLive: "polite" },
      active ? active.label || `Frame ${curIndex + 1} of ${seq.length}` : "",
    ),
    h(
      "div",
      { ref: worldRef, className: "m-zoom-world" },
      // Frames can legitimately overlap in world space (an "overview" frame
      // is, by definition, as big as the whole canvas). Paint largest-area
      // frames first so they sit behind smaller nested frames instead of
      // covering them.
      [...seq].sort((a, b) => (b.w * b.h) - (a.w * a.h)).map((frame) =>
        h(
          "div",
          {
            key: frame.id,
            className: jc("m-zoom-frame", frame.id === active?.id && "m-zoom-frame-active"),
            role: "group",
            ariaLabel: frame.label,
            style: {
              left: `${frame.x}px`,
              top: `${frame.y}px`,
              width: `${frame.w}px`,
              height: `${frame.h}px`,
              transform: `rotate(${frame.rotate || 0}deg)`,
            },
          },
          frame.content,
        )
      ),
    ),
  );
}
