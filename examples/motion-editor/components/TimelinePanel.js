// The timeline panel: transport buttons, a scrubbable ruler with the
// playhead, and one row per track where keyframes are draggable diamonds.
// Positions are percentages of the document duration, so the panel scales
// with its container.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";

export function TimelinePanel({
  tl,
  doc,
  actors,
  selected,
  playheadRef,
  onSelect,
  onMoveKeyframe,
  onAddKeyframe,
  onSetDuration,
}) {
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rulerRef = useRef(null);
  const dragRef = useRef(null);

  // UI clock: follow the real playhead while the movie runs (or after any
  // programmatic jump). State lives here, so only the panel re-renders.
  useEffect(() => {
    const id = setInterval(() => {
      playheadRef.current = tl.time;
      setPlayhead(Math.round(tl.time));
      setPlaying(tl.isPlaying);
    }, 50);
    return () => clearInterval(id);
  }, [tl]);

  const msFromPointer = (event) => {
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return Math.round((ratio * doc.duration) / 25) * 25;
  };

  const scrub = (event) => {
    const at = msFromPointer(event);
    tl.stop();
    tl.seek(at);
    playheadRef.current = at;
    setPlayhead(at);
  };

  // Diamond dragging via pointer capture; the document is updated on every
  // move so the stage preview follows the drag live.
  const startDrag = (event, trackName, index) => {
    event.stopPropagation();
    onSelect({ track: trackName, index });
    dragRef.current = { trackName, index };
    // Pointer capture keeps the drag alive outside the diamond; not every
    // event source supports it (synthetic events, older browsers) — the
    // drag still works without it as long as the pointer stays in the lane.
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch {}
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const { trackName, index } = dragRef.current;
    onMoveKeyframe(trackName, index, msFromPointer(event));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const pct = (at) => `${(at / doc.duration) * 100}%`;

  return h(
    "section",
    { className: "me-timeline", ariaLabel: "Timeline" },

    h(
      "div",
      { className: "me-transport" },
      h("button", { type: "button", className: "me-btn", onClick: () => tl.play() }, playing ? "▶ …" : "▶ play"),
      h("button", { type: "button", className: "me-btn", onClick: () => tl.stop() }, "■ stop"),
      h(
        "button",
        {
          type: "button",
          className: "me-btn",
          onClick: () => {
            tl.gotoAndStop(0);
            playheadRef.current = 0;
            setPlayhead(0);
          },
        },
        "⏮ start",
      ),
      h("span", { className: "me-clock" }, `${(playhead / 1000).toFixed(2)}s`),
      h(
        "label",
        { className: "me-duration" },
        "duration (ms) ",
        h("input", {
          type: "number",
          min: 100,
          step: 100,
          value: doc.duration,
          onChange: (e) => onSetDuration(Number(e.target.value)),
        }),
      ),
    ),

    h(
      "div",
      { className: "me-ruler", ref: rulerRef, onPointerDown: scrub },
      h("div", { className: "me-playhead", style: { left: pct(playhead) } }),
      [0, 0.25, 0.5, 0.75, 1].map((stop) =>
        h(
          "span",
          { key: stop, className: "me-tick", style: { left: `${stop * 100}%` } },
          `${((doc.duration * stop) / 1000).toFixed(1)}s`,
        ),
      ),
    ),

    actors.map((actor) =>
      h(
        "div",
        { key: actor.id, className: "me-row" },
        h(
          "div",
          { className: "me-row-label" },
          actor.label,
          h(
            "button",
            {
              type: "button",
              className: "me-btn me-btn-add",
              title: "Add keyframe at the playhead",
              onClick: () => onAddKeyframe(actor.id),
            },
            "+",
          ),
        ),
        h(
          "div",
          { className: "me-row-lane" },
          h("div", { className: "me-playhead me-playhead-lane", style: { left: pct(playhead) } }),
          (doc.tracks[actor.id] || []).map((keyframe, index) =>
            h("button", {
              key: index,
              type: "button",
              className:
                "me-key" +
                (selected && selected.track === actor.id && selected.index === index ? " me-key-selected" : ""),
              style: { left: pct(keyframe.at) },
              title: `${actor.label} @ ${keyframe.at}ms`,
              onPointerDown: (e) => startDrag(e, actor.id, index),
              onPointerMove: moveDrag,
              onPointerUp: endDrag,
            }),
          ),
        ),
      ),
    ),
  );
}
