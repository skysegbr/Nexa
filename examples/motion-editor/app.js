// Example: motion-editor — a visual timeline editor for nexa-motion, in the
// spirit of the Flash IDE: stage preview on top, timeline panel with
// draggable keyframes below, an inspector for the selection, undo/redo,
// multi-selection, motion-guide drawing directly on the stage, and live
// code export.
//
// The document (duration + tracks of keyframes) lives in useHistory (the
// core's undo/redo hook). Drags edit a transient DRAFT that only commits to
// history on release — one undo step per gesture, not per pixel. Every
// document change rebuilds the createTimeline() controller and the stage
// rebinds through fresh track() refs: the preview is always the real
// runtime, never an approximation.

import { h, render, useEffect, useHistory, useRef, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { ACTORS, INITIAL_DOC } from "./data.js";
import { Stage } from "./components/Stage.js";
import { TimelinePanel } from "./components/TimelinePanel.js";
import { Inspector } from "./components/Inspector.js";
import { CodePane } from "./components/CodePane.js";
import { smoothPath } from "./components/smoothPath.js";
import { useEditorShortcuts } from "./components/useEditorShortcuts.js";

function buildController(doc) {
  return createTimeline({
    duration: doc.duration,
    tracks: doc.tracks,
    autoplay: false,
  });
}

const snap = (ms) => Math.round(ms / 25) * 25;

function App() {
  const { state: doc, set: setDoc, undo, redo, canUndo, canRedo } = useHistory(INITIAL_DOC, { limit: 100 });
  const [draft, setDraft] = useState(null); // in-flight drag document
  const [selected, setSelected] = useState([]); // [{ track, index }]
  const [drawing, setDrawing] = useState(null); // { track, index, points: [{x,y}] } | null
  const playheadRef = useRef(0);
  const dragOriginRef = useRef(null); // Map "track:index" → original at

  const effective = draft ?? doc;

  // Selection entries can dangle after undo/delete — drop them.
  const liveSelected = selected.filter((entry) => effective.tracks[entry.track]?.[entry.index]);

  // Controller lifecycle: rebuild on every effective-document change, parked
  // at the same playhead so scrub position survives edits and undo.
  const [tl, setTl] = useState(() => buildController(INITIAL_DOC));
  const lastBuiltRef = useRef(INITIAL_DOC);
  useEffect(() => {
    if (lastBuiltRef.current === effective) return;
    lastBuiltRef.current = effective;
    tl.destroy();
    const fresh = buildController(effective);
    fresh.seek(Math.min(playheadRef.current, fresh.duration));
    setTl(fresh);
  });

  // ── document edits (all history-committing paths go through setDoc) ──

  const updateKeyframe = (trackName, index, patch) => {
    // A no-op patch must not touch history: a blur can re-fire change with
    // the value already committed, and pushing a duplicate entry makes the
    // next undo appear to do nothing.
    const current = effective.tracks[trackName][index];
    if (Object.keys(patch).every((key) => Object.is(current[key], patch[key]))) {
      return;
    }

    const nextTrack = effective.tracks[trackName].map((keyframe, i) =>
      i === index ? { ...keyframe, ...patch } : keyframe,
    );
    for (const key of Object.keys(nextTrack[index])) {
      if (nextTrack[index][key] === undefined) {
        delete nextTrack[index][key];
      }
    }
    setDoc({ ...effective, tracks: { ...effective.tracks, [trackName]: nextTrack } });
  };

  const addKeyframe = (trackName) => {
    const at = snap(playheadRef.current);
    const nextTrack = [...effective.tracks[trackName], { at }];
    setDoc({ ...effective, tracks: { ...effective.tracks, [trackName]: nextTrack } });
    setSelected([{ track: trackName, index: nextTrack.length - 1 }]);
  };

  const deleteSelected = () => {
    if (liveSelected.length === 0) return;
    const doomed = new Set(liveSelected.map((entry) => `${entry.track}:${entry.index}`));
    const tracks = {};
    for (const [name, keyframes] of Object.entries(effective.tracks)) {
      tracks[name] = keyframes.filter((_, i) => !doomed.has(`${name}:${i}`));
    }
    setDoc({ ...effective, tracks });
    setSelected([]);
  };

  const setDuration = (duration) => {
    if (Number.isFinite(duration) && duration >= 100 && duration !== effective.duration) {
      setDoc({ ...effective, duration });
    }
  };

  // ── selection & keyframe dragging (draft-based: one undo per gesture) ──

  const select = (entry, additive) => {
    setSelected((current) => {
      if (!additive) return [{ ...entry }];
      const key = `${entry.track}:${entry.index}`;
      const without = current.filter((e) => `${e.track}:${e.index}` !== key);
      return without.length === current.length ? [...current, { ...entry }] : without;
    });
  };

  const dragStart = (entry, additive) => {
    // Dragging an unselected diamond selects it first (Flash behavior).
    const key = `${entry.track}:${entry.index}`;
    const isSelected = liveSelected.some((e) => `${e.track}:${e.index}` === key);
    const nextSelection = isSelected && !additive ? liveSelected : additive
      ? [...liveSelected.filter((e) => `${e.track}:${e.index}` !== key), entry]
      : [entry];
    setSelected(nextSelection);

    const origins = new Map();
    for (const sel of nextSelection) {
      origins.set(`${sel.track}:${sel.index}`, effective.tracks[sel.track][sel.index].at);
    }
    dragOriginRef.current = origins;
  };

  const dragPreview = (deltaMs) => {
    const origins = dragOriginRef.current;
    if (!origins) return;
    const tracks = { ...effective.tracks };
    for (const [key, originalAt] of origins) {
      const [trackName, indexText] = key.split(":");
      const index = Number(indexText);
      const nextAt = snap(Math.max(0, Math.min(effective.duration, originalAt + deltaMs)));
      tracks[trackName] = tracks[trackName].map((keyframe, i) =>
        i === index ? { ...keyframe, at: nextAt } : keyframe,
      );
    }
    setDraft({ ...doc, tracks });
  };

  const dragCommit = () => {
    dragOriginRef.current = null;
    if (draft) {
      setDoc(draft);
      setDraft(null);
    }
  };

  // ── motion-guide drawing on the stage ──

  const startDrawing = () => {
    if (liveSelected.length === 1) {
      setDrawing({ ...liveSelected[0], points: [] });
    }
  };

  const addDrawingPoint = (point) => {
    setDrawing((current) => current && { ...current, points: [...current.points, point] });
  };

  const finishDrawing = () => {
    if (drawing && drawing.points.length >= 2) {
      updateKeyframe(drawing.track, drawing.index, { path: smoothPath(drawing.points) });
    }
    setDrawing(null);
  };

  useEditorShortcuts({ undo, redo, onDelete: deleteSelected, onEscape: () => setDrawing(null) });

  return h(
    "div",
    { className: "me-app" },
    h(
      "header",
      { className: "me-header" },
      h("h1", { className: "me-brand" }, "⬡ Nexa ", h("em", null, "Motion Editor")),
      h(
        "div",
        { className: "me-history" },
        h("button", { type: "button", className: "me-btn", disabled: !canUndo, onClick: undo }, "↩ undo"),
        h("button", { type: "button", className: "me-btn", disabled: !canRedo, onClick: redo }, "↪ redo"),
      ),
      h(
        "p",
        { className: "me-hint" },
        drawing
          ? "DRAWING GUIDE: click points on the stage · finish in the inspector · Esc cancels"
          : "drag diamonds (shift = multi) · + adds a keyframe at the playhead · Del deletes · Ctrl+Z undo",
      ),
    ),
    h(
      "main",
      { className: "me-main" },
      h(
        "div",
        { className: "me-left" },
        h(Stage, {
          tl,
          actors: ACTORS,
          doc: effective,
          selected: liveSelected,
          drawing,
          onDrawPoint: addDrawingPoint,
        }),
        h(TimelinePanel, {
          tl,
          doc: effective,
          actors: ACTORS,
          selected: liveSelected,
          playheadRef,
          onSelect: select,
          onDragStart: dragStart,
          onDragPreview: dragPreview,
          onDragCommit: dragCommit,
          onAddKeyframe: addKeyframe,
          onSetDuration: setDuration,
        }),
      ),
      h(
        "aside",
        { className: "me-right" },
        h(Inspector, {
          doc: effective,
          selected: liveSelected,
          drawing,
          onEdit: (patch) =>
            liveSelected.length === 1 && updateKeyframe(liveSelected[0].track, liveSelected[0].index, patch),
          onDelete: deleteSelected,
          onStartDrawing: startDrawing,
          onFinishDrawing: finishDrawing,
          onCancelDrawing: () => setDrawing(null),
        }),
        h(CodePane, { doc: effective }),
      ),
    ),
  );
}

render(App, document.getElementById("app"));
