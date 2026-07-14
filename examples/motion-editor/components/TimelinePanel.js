// The timeline panel, Flash 8 layout: transport bar, a frame-numbered
// ruler with the playhead, named label markers and draggable onion-skin
// brackets, and one frame-gridded lane per track (see TrackLane). The
// label column doubles as Flash's layers panel (see LayerCell). Ruler +
// lanes live inside one horizontally scrollable strip whose inner width
// is the zoom factor.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { snapToFrame, frameOf, capturePointer, DEFAULT_FPS } from "./editorUtils.js";
import { LayerCell } from "./LayerCell.js";
import { TrackLane } from "./TrackLane.js";
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
  onSetFps,
  onToggleHidden,
  onToggleLocked,
  onToggleOutline,
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
  const onionDragRef = useRef(null);

  const fps = doc.fps || DEFAULT_FPS;
  const frameMs = 1000 / fps;
  const totalFrames = Math.max(1, Math.round(doc.duration / frameMs));

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
    return snapToFrame(ratio * doc.duration, fps);
  };

  const scrub = (event) => {
    const at = msFromPointer(event);
    tl.stop();
    tl.seek(at);
    playheadRef.current = at;
    setPlayhead(at);
  };

  // Flash's onion markers: the brackets around the playhead drag to widen
  // or narrow the ghosted range (in frames).
  const onionMarkerDown = (event) => {
    event.stopPropagation();
    onionDragRef.current = true;
    capturePointer(event);
  };

  const onionMarkerMove = (event) => {
    if (!onionDragRef.current) return;
    const frames = Math.abs(msFromPointer(event) - playhead) / frameMs;
    onOnionCount(Math.max(1, Math.min(12, Math.round(frames))));
  };

  const onionMarkerUp = () => {
    onionDragRef.current = null;
  };

  const pct = (at) => `${(at / doc.duration) * 100}%`;

  // Flash numbers the ruler at 1, 5, 10, 15…
  const frameMarks = [];
  for (let f = 1; f <= totalFrames; f += f === 1 ? 4 : 5) {
    frameMarks.push(f);
  }

  // Frame-cell grid for the lanes: a line per frame, stronger every 5th.
  const frameGrid = {
    backgroundImage:
      "linear-gradient(90deg, rgba(79, 124, 255, 0.22) 1px, transparent 1px)," +
      " linear-gradient(90deg, rgba(79, 124, 255, 0.09) 1px, transparent 1px)",
    backgroundSize: `${500 / totalFrames}% 100%, ${100 / totalFrames}% 100%`,
  };

  const onionMarker = (side) => {
    const at = side === "left" ? playhead - onion.count * frameMs : playhead + onion.count * frameMs;
    return h(
      "div",
      {
        className: `me-onion-marker me-onion-marker-${side}`,
        title: "Onion range — drag to widen/narrow (frames)",
        style: { left: pct(Math.max(0, Math.min(doc.duration, at))) },
        onPointerDown: onionMarkerDown,
        onPointerMove: onionMarkerMove,
        onPointerUp: onionMarkerUp,
      },
      side === "left" ? "❲" : "❳",
    );
  };

  return h(
    "section",
    { className: "me-timeline", ariaLabel: "Timeline" },

    h(TransportBar, {
      tl,
      playing,
      playhead,
      frame: frameOf(playhead, fps),
      fps,
      duration: doc.duration,
      onSetDuration,
      onSetFps,
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
            onToggleOutline,
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
            { className: "me-ruler", ref: rulerRef, onPointerDown: scrub, style: frameGrid },
            h("div", { className: "me-playhead", style: { left: pct(playhead) } }),
            frameMarks.map((f) =>
              h(
                "span",
                { key: f, className: "me-tick", style: { left: pct((f - 1) * frameMs) } },
                String(f),
              ),
            ),
            onion.on && onionMarker("left"),
            onion.on && onionMarker("right"),
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
            h(TrackLane, {
              key: actor.id,
              actor,
              keyframes: doc.tracks[actor.id] || [],
              selected,
              playheadPct: pct(playhead),
              pct,
              frameGrid,
              msFromPointer,
              onDragStart,
              onDragPreview,
              onDragCommit,
            }),
          ),
        ),
      ),
    ),
  );
}
