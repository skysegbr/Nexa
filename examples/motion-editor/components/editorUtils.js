// Small pure helpers shared across the editor.

// The editor thinks in FRAMES, like Flash: keyframes land on the frame
// grid of the document's fps. Internally everything stays milliseconds
// (the runtime is ms-based) — snapping rounds to the nearest frame and
// then to a whole ms, so exports show integers and the frame number
// round-trips stably.
export const DEFAULT_FPS = 24;

export const snapToFrame = (ms, fps = DEFAULT_FPS) =>
  Math.round((Math.round((ms * fps) / 1000) * 1000) / fps);

// 1-based frame number for display, Flash-style (frame 1 sits at t=0).
export const frameOf = (ms, fps = DEFAULT_FPS) => Math.round((ms * fps) / 1000) + 1;

// Pointer capture that tolerates event sources without it (synthetic
// events, older browsers) — the drag still works while the pointer stays
// inside the element's ancestors.
export function capturePointer(event) {
  try {
    event.target.setPointerCapture(event.pointerId);
  } catch {}
}

// The tween translation nexa-motion is currently applying to an element —
// read back from the inline transform the controller writes (translate3d is
// always its first part, and rotate/scale around the center never move the
// translation). Needed by auto-key: keyframes record base-relative
// positions, and dropping the actor must not undo the tween's own offset.
// new RegExp(string): the repo's lightweight validator trips on literals.
const TRANSLATE3D_RE = new RegExp("translate3d\\((-?[0-9.e+]+)px,\\s*(-?[0-9.e+]+)px");
const ROTATE_RE = new RegExp("rotate\\((-?[0-9.e+]+)deg\\)");
const SCALE_RE = new RegExp("scale\\((-?[0-9.e+]+)");

export function tweenTranslation(element) {
  const match = TRANSLATE3D_RE.exec(element.style.transform || "");
  return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : { x: 0, y: 0 };
}

// Rotation (deg) and uniform scale the tween is applying — same read-back
// idea, for the Free Transform tool's auto-key.
export function tweenRotation(element) {
  const match = ROTATE_RE.exec(element.style.transform || "");
  return match ? parseFloat(match[1]) : 0;
}

export function tweenScale(element) {
  const match = SCALE_RE.exec(element.style.transform || "");
  return match ? parseFloat(match[1]) : 1;
}
