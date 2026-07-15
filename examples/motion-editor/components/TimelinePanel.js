// The timeline panel, Flash 8 layout: transport bar, a frame-numbered
// ruler with the playhead, named label markers and draggable onion-skin
// brackets, and one frame-gridded lane per layer (see TrackLane). The
// label column doubles as Flash's layers panel (see LayerCell). Ruler +
// lanes live inside one horizontally scrollable strip whose inner width
// is the zoom factor.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { snapToFrame, DEFAULT_FPS } from "./editorUtils.js";
import { LayerLabels } from "./LayerLabels.js";
import { visibleLayers } from "./layerOps.js";
import { TrackLane } from "./TrackLane.js";
import { TransportBar } from "./TransportBar.js";
import { TimelineCursor } from "./TimelineCursor.js";
import { FrameControls } from "./FrameControls.js";

export function TimelinePanel({
  tl,
  doc,
  selected,
  selectedLayerId,
  layerFlags,
  playheadRef,
  onDragStart,
  onDragPreview,
  onDragCommit,
  onAddKeyframe,
  onDeleteLayer,
  onSetDuration,
  onSetFps,
  onToggleHidden,
  onToggleLocked,
  onToggleOutline,
  onToggleCollapsed,
  onMoveLayer,
  onIndentLayer,
  onOutdentLayer,
  onSelectLayer,
  onRenameLayer,
  onAddLayer,
  onAddFolder,
  onAddMask,
  onAddGuide,
  onAddLabel,
  onRemoveLabel,
  onToggleLoop,
  frameActions,
  onion,
  onOnionToggle,
  onOnionCount,
}) {
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState(1);
  const rulerRef = useRef(null);

  const fps = doc.fps || DEFAULT_FPS;
  const frameMs = 1000 / fps;
  const totalFrames = Math.max(1, Math.round(doc.duration / frameMs));
  const actorsById = Object.fromEntries(doc.actors.map((actor) => [actor.id, actor]));
  const shownLayers = visibleLayers(doc.layers, layerFlags);
  const layerActions = {
    onToggleHidden, onToggleLocked, onToggleOutline, onToggleCollapsed,
    onMoveLayer, onIndentLayer, onOutdentLayer, onSelectLayer,
    onRenameLayer, onAddKeyframe, onDeleteLayer, onAddLayer, onAddFolder, onAddMask, onAddGuide,
  };

  // The playhead clock now lives in TimelineCursor (the line) and
  // TransportReadout (the clock text) — small self-clocked children, so a
  // playing movie no longer re-renders this panel and its lanes at 20Hz.

  // Preview speed survives controller rebuilds (every commit replaces tl).
  useEffect(() => {
    tl.setSpeed(speed);
  }, [tl, speed]);

  const msFromPointer = (event) => {
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return snapToFrame(ratio * doc.duration, fps);
  };

  // Seeking writes playheadRef directly; TimelineCursor's clock (≤50ms)
  // catches the line up. The onion brackets live in TimelineCursor too.
  const scrub = (event) => {
    const at = msFromPointer(event);
    tl.stop();
    tl.seek(at);
    playheadRef.current = at;
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

  return h(
    "section",
    { className: "me-timeline", ariaLabel: "Timeline" },
    h(TransportBar, {
      tl,
      fps,
      duration: doc.duration,
      onSetDuration,
      onSetFps,
      onRewind: () => {
        tl.gotoAndStop(0);
        playheadRef.current = 0;
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
    h(FrameControls, { actions: frameActions }),
    h(
      "div",
      { className: "me-tracks" },
      // Fixed left column: Flash's layers panel.
      h(LayerLabels, { doc, layers: shownLayers, selectedLayerId, layerFlags, actions: layerActions }),
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
            frameMarks.map((f) =>
              h(
                "span",
                { key: f, className: "me-tick", style: { left: pct((f - 1) * frameMs) } },
                String(f),
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
          shownLayers.map((layer) =>
            h(TrackLane, {
              key: layer.id,
              kind: layer.type,
              tracks: layer.actorIds
                .map((actorId) => actorsById[actorId])
                .filter(Boolean)
                .map((actor) => ({ actor, keyframes: doc.tracks[actor.id] || [] })),
              selected,
              active: selectedLayerId === layer.id,
              pct,
              frameGrid,
              msFromPointer,
              onDragStart,
              onDragPreview,
              onDragCommit,
            }),
          ),
          // One full-height playhead line + onion brackets over the whole
          // strip. Self-clocked, so playback repaints only this overlay.
          h(TimelineCursor, {
            tl,
            playheadRef,
            duration: doc.duration,
            fps,
            measureRef: rulerRef,
            onion,
            onOnionCount,
          }),
        ),
      ),
    ),
  );
}
