import { h, useEffect, useRef, useState } from "./nexa.js";

// ── PreziStage ───────────────────────────────────────────────────────────────
//
// A Prezi-style zooming presentation. All frame content is normal Nexa
// vdom, positioned with plain CSS on one large "world" div — every frame is
// mounted on screen simultaneously, same as the real canvas. Only the
// *camera* (a single transform on that world div) is imperative: a small
// requestAnimationFrame tween eases pan/zoom/rotate between frames at 60fps,
// which the vdom diff loop can't do smoothly on its own.
//
// Frame schema: { id, x, y, w, h, rotate?, content }
//   x/y/w/h are world-pixel coordinates. rotate is degrees (default 0).
//
// Props:
//   frames        Array<{ id, x, y, w, h, rotate?, content }>
//   path          Array<id> — navigation order, defaults to `frames` order
//   index / defaultIndex / onIndexChange  — controlled/uncontrolled current step
//   duration      ms per camera animation (default 900)
//   easing        (t) => t easing function (default cubicEaseInOut)
//   padding       fraction (0–0.45) of the viewport reserved as margin around
//                 every framed frame, so frames don't touch the stage edges
//                 edge-to-edge (default 0.06). 0 = fill the viewport exactly.
//   controllerRef ref — set to { next, prev, goTo, index, frames } every render
//   keyboardNav   bool, default true — ArrowRight/Space = next, ArrowLeft = prev
//   advanceOnClick bool, default true — click on stage background advances

function cubicEaseInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function cameraFor(frame, vw, vh, padding = 0) {
  const pad = Math.min(Math.max(padding, 0), 0.45);
  const effVw = vw * (1 - pad * 2);
  const effVh = vh * (1 - pad * 2);
  return {
    cx: frame.x + frame.w / 2,
    cy: frame.y + frame.h / 2,
    scale: Math.min(effVw / frame.w, effVh / frame.h),
    rotate: frame.rotate || 0,
  };
}

function applyCamera(worldEl, cam, vw, vh) {
  worldEl.style.transform =
    `translate(${vw / 2}px, ${vh / 2}px) scale(${cam.scale}) rotate(${-cam.rotate}deg) translate(${-cam.cx}px, ${-cam.cy}px)`;
}

class PreziCameraController {
  constructor(wrapEl, worldEl, { padding = 0 } = {}) {
    this.wrap    = wrapEl;
    this.world   = worldEl;
    this.padding = padding;
    this.vw      = 0;
    this.vh      = 0;
    this.cam     = { cx: 0, cy: 0, scale: 1, rotate: 0 };
    this._activeFrame = null;

    this._raf = null;
    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(this.wrap);
    this._onResize();
  }

  setPadding(padding) {
    this.padding = padding;
  }

  _onResize() {
    const rect = this.wrap.getBoundingClientRect();
    this.vw = rect.width;
    this.vh = rect.height;
    // Re-fit (not just re-center) the active frame — the viewport's own
    // dimensions changed, so the previous `scale` is stale.
    if (this._activeFrame) {
      this.cam = cameraFor(this._activeFrame, this.vw, this.vh, this.padding);
    }
    applyCamera(this.world, this.cam, this.vw, this.vh);
  }

  jumpTo(frame) {
    if (!frame) return;
    this._cancel();
    this._activeFrame = frame;
    this.cam = cameraFor(frame, this.vw, this.vh, this.padding);
    applyCamera(this.world, this.cam, this.vw, this.vh);
  }

  animateTo(frame, { duration = 900, easing = cubicEaseInOut } = {}) {
    if (!frame) return;
    this._cancel();
    this._activeFrame = frame;

    const from = this.cam;
    const to   = cameraFor(frame, this.vw, this.vh, this.padding);
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easing(t);
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

  _cancel() {
    if (this._raf != null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  destroy() {
    this._cancel();
    this._ro.disconnect();
  }
}

function jc(...c) { return c.filter(Boolean).join(" "); }

export function PreziStage({
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
  className = "",
  style,
} = {}) {
  const wrapRef  = useRef(null);
  const worldRef = useRef(null);
  const ctrlRef  = useRef(null);
  const navRef   = useRef({});

  const [internalIndex, setInternalIndex] = useState(defaultIndex);
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
    ctrlRef.current?.[animate ? "animateTo" : "jumpTo"](frame, { duration, easing });
  };

  const next = () => { if (curIndex < seq.length - 1) goTo(curIndex + 1); };
  const prev = () => { if (curIndex > 0) goTo(curIndex - 1); };

  navRef.current = { next, prev, goTo };

  // Mount: build the imperative camera controller once.
  useEffect(() => {
    if (!wrapRef.current || !worldRef.current) return undefined;
    const ctrl = new PreziCameraController(wrapRef.current, worldRef.current, { padding });
    ctrlRef.current = ctrl;
    ctrl.jumpTo(seq[curIndex]);
    return () => { ctrl.destroy(); ctrlRef.current = null; };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    ctrlRef.current?.setPadding(padding);
  }, [padding]);

  // Keyboard navigation.
  useEffect(() => {
    if (!keyboardNav) return undefined;
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); navRef.current.next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); navRef.current.prev(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [keyboardNav]);

  // Exposed imperative API — reassigned every render so it always closes
  // over the current index/sequence (unlike PipelineCanvas's controllerRef,
  // which is set once on mount because it wraps a long-lived instance).
  if (controllerRef) {
    controllerRef.current = { next, prev, goTo, index: curIndex, frames: seq };
  }

  return h(
    "div",
    {
      ref: wrapRef,
      className: jc("m-prezi-stage", className),
      style,
      tabIndex: 0,
      onClick: () => { if (advanceOnClick) next(); },
    },
    h(
      "div",
      { ref: worldRef, className: "m-prezi-world" },
      // Frames can legitimately overlap in world space (an "overview" frame
      // is, by definition, as big as the whole canvas). Paint largest-area
      // frames first so they sit behind smaller nested frames instead of
      // covering them.
      [...seq].sort((a, b) => (b.w * b.h) - (a.w * a.h)).map((frame) =>
        h(
          "div",
          {
            key: frame.id,
            className: jc("m-prezi-frame", frame.id === seq[curIndex]?.id && "m-prezi-frame-active"),
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
