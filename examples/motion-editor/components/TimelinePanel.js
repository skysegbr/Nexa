// The timeline panel: the transport bar, a scrubbable ruler with the
// playhead and named label markers, and one lane per track where keyframes
// are draggable diamonds. The label column doubles as Flash's layers panel
// (see LayerCell). Ruler + lanes live inside one horizontally scrollable
// strip whose inner width is the zoom factor — positions stay percentages
// of the document duration, so everything scales together.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { snap, capturePointer } from "./editorUtils.js";
import { LayerCell } from "./LayerCell.js";
import { TransportBar } from "./TransportBar.js";

export function TimelinePanel({
  tl,
  doc,
  selected,
  actorSel,
  layerFlags,
  playheadRef,
  onSelect,
  onDragStart,
  onDragPreview,
  onDragCommit,
  onAddKeyframe,
  onDeleteActor,
  onSetDuration,
  onToggleHidden,
  onToggleLocked,
  onMoveLayer,
  onSelectActor,
  onRenameActor,
  onAddLabel,
  onRemoveLabel,
  onToggleLoop,
  onion,
  onOnionToggle,
  onOnionCount,
}) {
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState(1);
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

  // Preview speed survives controller rebuilds (every commit replaces tl).
  useEffect(() => {
    tl.setSpeed(speed);
  }, [tl, speed]);

  const msFromPointer = (event) => {
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return snap(ratio * doc.duration);
  };

  const scrub = (event) => {
    const at = msFromPointer(event);
    tl.stop();
    tl.seek(at);
    playheadRef.current = at;
    setPlayhead(at);
  };

  // Diamond dragging via pointer capture. The panel only reports the time
  // DELTA of the gesture — app.js applies it to the whole selection as a
  // draft document and commits one undo step on release.
  const startDrag = (event, trackName, keyframeId) => {
    event.stopPropagation();
    onDragStart({ track: trackName, id: keyframeId }, event.shiftKey);
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

  const pct = (at) => `${(at / doc.duration) * 100}%`;

  return h(
    "section",
    { className: "me-timeline", ariaLabel: "Timeline" },

    h(TransportBar, {
      tl,
      playing,
      playhead,
      duration: doc.duration,
      onSetDuration,
      onRewind: () => {
        tl.gotoAndStop(0);
        playheadRef.current = 0;
        setPlayhead(0);
      },
      onion,
      onOnionToggle,
      onOnionCount,
      zoom,
      onZoom: setZoom,
      loop: Boolean(doc.loop),
      onToggleLoop,
      speed,
      onSpeed: setSpeed,
      onAddLabel,
    }),

    h(
      "div",
      { className: "me-tracks" },
      // Fixed left column: Flash's layers panel.
      h(
        "div",
        { className: "me-track-labels" },
        h("div", { className: "me-labels-spacer" }),
        doc.actors.map((actor, layerIndex) =>
          h(LayerCell, {
            key: actor.id,
            actor,
            layerIndex,
            layerCount: doc.actors.length,
            flags: layerFlags[actor.id] || {},
            active: actorSel === actor.id,
            onToggleHidden,
            onToggleLocked,
            onMoveLayer,
            onSelectActor,
            onRenameActor,
            onAddKeyframe,
            onDeleteActor,
          }),
        ),
      ),
      // Scrollable right strip: ruler + lanes, zoomed together.
      h(
        "div",
        { className: "me-track-scroll" },
        h(
          "div",
          { className: "me-track-inner", style: { width: `${zoom * 100}%` } },
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
            Object.entries(doc.labels || {}).map(([name, ms]) =>
              h(
                "span",
                {
                  key: name,
                  className: "me-label-marker",
                  style: { left: pct(ms) },
                  title: `${name} @ ${ms}ms — double-click removes`,
                  onDblClick: (e) => {
                    e.stopPropagation();
                    onRemoveLabel(name);
                  },
                },
                `🏷${name}`,
              ),
            ),
          ),
          doc.actors.map((actor) =>
            h(
              "div",
              { key: actor.id, className: "me-row-lane" },
              h("div", { className: "me-playhead me-playhead-lane", style: { left: pct(playhead) } }),
              (doc.tracks[actor.id] || []).map((keyframe) =>
                h("button", {
                  key: keyframe._id,
                  type: "button",
                  className:
                    "me-key" +
                    (selected.some((entry) => entry.id === keyframe._id) ? " me-key-selected" : "") +
                    (keyframe.path ? " me-key-guide" : ""),
                  style: { left: pct(keyframe.at) },
                  title: `${actor.label} @ ${keyframe.at}ms${keyframe.path ? " (motion guide)" : ""}`,
                  onPointerDown: (e) => startDrag(e, actor.id, keyframe._id),
                  onPointerMove: moveDrag,
                  onPointerUp: endDrag,
                }),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
