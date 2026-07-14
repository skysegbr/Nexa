// The selection chrome for the select tool, drawn on the actor's VISUAL
// box (measured — includes the tween's transform): a rect, a name tag and
// the corner resize handles. Tiny/invisible actors (opacity 0, scale 0 at
// the playhead) inflate to a minimum size so the selection always shows
// WHERE the object is — the old base-box handles pointed at the wrong
// place whenever x/y were tweening.

import { h } from "/dist/nexa.js";
import { HANDLES } from "./actorGeometry.js";

const MIN_SHOWN = 14;

export function SelectionBox({ box, label, showHandles, onHandleDown }) {
  const shown = {
    x: box.w < MIN_SHOWN ? box.x + box.w / 2 - MIN_SHOWN / 2 : box.x,
    y: box.h < MIN_SHOWN ? box.y + box.h / 2 - MIN_SHOWN / 2 : box.y,
    w: Math.max(MIN_SHOWN, box.w),
    h: Math.max(MIN_SHOWN, box.h),
  };

  return h(
    "div",
    { className: "me-selection" },
    h("div", {
      className: "me-selection-rect",
      style: { left: `${shown.x}px`, top: `${shown.y}px`, width: `${shown.w}px`, height: `${shown.h}px` },
    }),
    h(
      "div",
      { className: "me-selection-tag", style: { left: `${shown.x}px`, top: `${shown.y - 22}px` } },
      label,
    ),
    showHandles &&
      HANDLES.map((corner) =>
        h("div", {
          key: corner,
          className: `me-handle me-handle-${corner}`,
          style: {
            left: `${corner.includes("w") ? shown.x : shown.x + shown.w}px`,
            top: `${corner.includes("n") ? shown.y : shown.y + shown.h}px`,
          },
          onPointerDown: (e) => onHandleDown(e, corner),
        }),
      ),
  );
}
