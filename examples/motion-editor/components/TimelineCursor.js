// The only timeline chrome that MOVES while the movie plays: the playhead
// line and the onion-skin brackets. It holds the playhead state (not
// TimelinePanel), so a running movie re-renders ONLY this small overlay at
// 20Hz — the transport, the ruler ticks and, above all, every keyframe LANE
// stay put. One full-height line replaces the old per-lane segments.
//
// Returns a SINGLE root element on purpose: a fragment/array return would
// force a full-root re-render on every tick (see renderComponent in
// nexa.js), which is exactly the cost we're removing.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { snapToFrame, capturePointer, DEFAULT_FPS } from "./editorUtils.js";

export function TimelineCursor({ tl, playheadRef, duration, fps, measureRef, onion, onOnionCount }) {
  const [playhead, setPlayhead] = useState(() => playheadRef.current || 0);
  const dragRef = useRef(null);

  // The UI clock: follow the controller (and any programmatic jump — play,
  // seek, a ruler drag) on requestAnimationFrame, so the line tracks the
  // pointer smoothly while scrubbing instead of trailing a 50ms tick. Idle is
  // free: setPlayhead bails on Object.is when the rounded time is unchanged.
  // This is the single writer of playheadRef, which the stage and ghosts read.
  useEffect(() => {
    let raf;
    const follow = () => {
      playheadRef.current = tl.time;
      setPlayhead(Math.round(tl.time));
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [tl]);

  const frameMs = 1000 / (fps || DEFAULT_FPS);
  const pct = (at) => `${(Math.max(0, Math.min(duration, at)) / duration) * 100}%`;

  const msFromPointer = (event) => {
    const rect = measureRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return snapToFrame(ratio * duration, fps);
  };

  // Flash's onion markers: the brackets drag to widen/narrow the ghost range.
  const markerDown = (event) => {
    event.stopPropagation();
    dragRef.current = true;
    capturePointer(event);
  };
  const markerMove = (event) => {
    if (!dragRef.current) return;
    const frames = Math.abs(msFromPointer(event) - playhead) / frameMs;
    onOnionCount(Math.max(1, Math.min(12, Math.round(frames))));
  };
  const markerUp = () => {
    dragRef.current = null;
  };

  const marker = (side) => {
    const at = side === "left" ? playhead - onion.count * frameMs : playhead + onion.count * frameMs;
    return h(
      "div",
      {
        className: `me-onion-marker me-onion-marker-${side}`,
        title: "Onion range — drag to widen/narrow (frames)",
        style: { left: pct(at) },
        onPointerDown: markerDown,
        onPointerMove: markerMove,
        onPointerUp: markerUp,
      },
      side === "left" ? "❲" : "❳",
    );
  };

  return h(
    "div",
    { className: "me-cursor-overlay", ariaHidden: "true" },
    h("div", { className: "me-playhead", style: { left: pct(playhead) } }),
    onion.on && marker("left"),
    onion.on && marker("right"),
  );
}
