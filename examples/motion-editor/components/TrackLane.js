// One timeline lane, Flash-style: frame-grid background, shaded tween
// SPANS between consecutive keyframes (with the classic arrow), and the
// keyframes themselves as draggable dots. The lane only reports the time
// DELTA of a drag — the document applies it to the whole selection.

import { h, useRef } from "/dist/nexa.js";
import { capturePointer } from "./editorUtils.js";

export function TrackLane({
  actor,
  keyframes,
  selected,
  playheadPct,
  pct,
  frameGrid,
  msFromPointer,
  onDragStart,
  onDragPreview,
  onDragCommit,
}) {
  const dragRef = useRef(null);

  const startDrag = (event, keyframeId) => {
    event.stopPropagation();
    onDragStart({ track: actor.id, id: keyframeId }, event.shiftKey);
    dragRef.current = { startMs: msFromPointer(event), moved: false };
    capturePointer(event);
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const delta = msFromPointer(event) - dragRef.current.startMs;
    if (delta !== 0) dragRef.current.moved = true;
    if (dragRef.current.moved) onDragPreview(delta);
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    onDragCommit();
  };

  // Tween spans between consecutive keyframes, in time order.
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  const spans = [];
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].at > sorted[i - 1].at) {
      spans.push({
        key: sorted[i]._id,
        from: sorted[i - 1].at,
        to: sorted[i].at,
        guide: Boolean(sorted[i].path),
      });
    }
  }

  return h(
    "div",
    { className: "me-row-lane", style: frameGrid },
    h("div", { className: "me-playhead me-playhead-lane", style: { left: playheadPct } }),
    spans.map((span) =>
      h("div", {
        key: span.key,
        className: `me-span${span.guide ? " me-span-guide" : ""}`,
        style: {
          left: pct(span.from),
          width: `calc(${pct(span.to)} - ${pct(span.from)})`,
        },
      }),
    ),
    keyframes.map((keyframe) =>
      h("button", {
        key: keyframe._id,
        type: "button",
        className:
          "me-key" +
          (selected.some((entry) => entry.id === keyframe._id) ? " me-key-selected" : "") +
          (keyframe.path ? " me-key-guide" : ""),
        style: { left: pct(keyframe.at) },
        title: `${actor.label} @ ${keyframe.at}ms${keyframe.path ? " (motion guide)" : ""}`,
        onPointerDown: (e) => startDrag(e, keyframe._id),
        onPointerMove: moveDrag,
        onPointerUp: endDrag,
      }),
    ),
  );
}
