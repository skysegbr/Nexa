// Example: motion-editor — a visual timeline editor for nexa-motion, in the
// spirit of the Flash IDE: stage preview on top, timeline panel with
// draggable keyframes below, an inspector for the selection, undo/redo,
// multi-selection, copy/paste, motion-guide drawing directly on the stage,
// and live code export.
//
// The document lives in useEditorDoc (useHistory + selection + all
// mutations). Every document change rebuilds the createTimeline()
// controller and the stage rebinds through fresh track() refs: the preview
// is always the real runtime, never an approximation.

import { h, render, useEffect, useRef, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { ACTORS, INITIAL_DOC } from "./data.js";
import { Stage } from "./components/Stage.js";
import { TimelinePanel } from "./components/TimelinePanel.js";
import { Inspector } from "./components/Inspector.js";
import { CodePane } from "./components/CodePane.js";
import { smoothPath } from "./components/smoothPath.js";
import { useEditorDoc } from "./components/useEditorDoc.js";
import { useEditorShortcuts } from "./components/useEditorShortcuts.js";

function buildController(doc) {
  return createTimeline({
    duration: doc.duration,
    tracks: doc.tracks,
    autoplay: false,
  });
}

function App() {
  const playheadRef = useRef(0);
  const editor = useEditorDoc(INITIAL_DOC, playheadRef);
  const [drawing, setDrawing] = useState(null); // { track, index, points } | null

  // Controller lifecycle: rebuild on every document change, parked at the
  // same playhead so scrub position survives edits and undo.
  const [tl, setTl] = useState(() => buildController(INITIAL_DOC));
  const lastBuiltRef = useRef(INITIAL_DOC);
  useEffect(() => {
    if (lastBuiltRef.current === editor.doc) return;
    lastBuiltRef.current = editor.doc;
    tl.destroy();
    const fresh = buildController(editor.doc);
    fresh.seek(Math.min(playheadRef.current, fresh.duration));
    setTl(fresh);
  });

  // ── motion-guide drawing on the stage ──

  const startDrawing = () => {
    if (editor.selected.length === 1) {
      setDrawing({ ...editor.selected[0], points: [] });
    }
  };

  const addDrawingPoint = (point) => {
    setDrawing((current) => current && { ...current, points: [...current.points, point] });
  };

  const finishDrawing = () => {
    if (drawing && drawing.points.length >= 2) {
      editor.updateKeyframe(drawing.track, drawing.index, { path: smoothPath(drawing.points) });
    }
    setDrawing(null);
  };

  useEditorShortcuts({
    undo: editor.undo,
    redo: editor.redo,
    onCopy: editor.copySelected,
    onPaste: editor.pasteAtPlayhead,
    onDelete: editor.deleteSelected,
    onEscape: () => setDrawing(null),
  });

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
        h("button", { type: "button", className: "me-btn", disabled: !editor.canUndo, onClick: editor.undo }, "↩ undo"),
        h("button", { type: "button", className: "me-btn", disabled: !editor.canRedo, onClick: editor.redo }, "↪ redo"),
      ),
      h(
        "p",
        { className: "me-hint" },
        drawing
          ? "DRAWING GUIDE: click points on the stage · finish in the inspector · Esc cancels"
          : "drag diamonds (shift = multi) · + adds at the playhead · Ctrl+C/V copies to the playhead · Del deletes · Ctrl+Z undo",
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
          doc: editor.doc,
          selected: editor.selected,
          drawing,
          onDrawPoint: addDrawingPoint,
        }),
        h(TimelinePanel, {
          tl,
          doc: editor.doc,
          actors: ACTORS,
          selected: editor.selected,
          playheadRef,
          onSelect: editor.select,
          onDragStart: editor.dragStart,
          onDragPreview: editor.dragPreview,
          onDragCommit: editor.dragCommit,
          onAddKeyframe: editor.addKeyframe,
          onSetDuration: editor.setDuration,
        }),
      ),
      h(
        "aside",
        { className: "me-right" },
        h(Inspector, {
          doc: editor.doc,
          selected: editor.selected,
          drawing,
          onEdit: (patch) =>
            editor.selected.length === 1 &&
            editor.updateKeyframe(editor.selected[0].track, editor.selected[0].index, patch),
          onDelete: editor.deleteSelected,
          onStartDrawing: startDrawing,
          onFinishDrawing: finishDrawing,
          onCancelDrawing: () => setDrawing(null),
        }),
        h(CodePane, { doc: editor.doc }),
      ),
    ),
  );
}

render(App, document.getElementById("app"));
