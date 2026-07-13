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
import { FILLS, INITIAL_DOC } from "./data.js";
import { Stage } from "./components/Stage.js";
import { Toolbox } from "./components/Toolbox.js";
import { TimelinePanel } from "./components/TimelinePanel.js";
import { Inspector } from "./components/Inspector.js";
import { CodePane } from "./components/CodePane.js";
import { smoothPath } from "./components/smoothPath.js";
import { ActorInspector } from "./components/ActorInspector.js";
import { ProjectBar } from "./components/ProjectBar.js";
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
  const [tool, setTool] = useState("select");
  const [fill, setFill] = useState(FILLS[0]);
  const [actorSel, setActorSel] = useState(null); // actor id | null

  // Keyframe selection and actor selection are mutually exclusive — the
  // sidebar shows one inspector at a time.
  const selectActor = (id) => {
    setActorSel(id);
    if (id) editor.clearSelection();
  };

  const selectKeyframe = (entry, additive) => {
    setActorSel(null);
    editor.select(entry, additive);
  };

  const createActor = (actor) => {
    editor.addActor(actor);
    setTool("select"); // back to selection after placing, like Flash
  };

  const selectedActor = actorSel && editor.doc.actors.find((actor) => actor.id === actorSel);

  // Controller lifecycle: rebuild on every COMMITTED document change,
  // parked at the same playhead so scrub position survives edits and undo.
  // Drag drafts deliberately don't rebuild — recompiling every track (and
  // re-measuring every guide path) per pointermove janks the exact
  // interaction the editor is built around; the preview catches up on
  // release, when the gesture commits.
  const [tl, setTl] = useState(() => buildController(INITIAL_DOC));
  const lastBuiltRef = useRef(INITIAL_DOC);
  useEffect(() => {
    if (lastBuiltRef.current === editor.committedDoc) return;
    lastBuiltRef.current = editor.committedDoc;
    tl.destroy();
    const fresh = buildController(editor.committedDoc);
    fresh.seek(Math.min(playheadRef.current, fresh.duration));
    setTl(fresh);
  });

  // The rebuild effect above only destroys on REPLACEMENT — this one owns
  // the final controller when the editor unmounts (rAF ticker + guide
  // paths in the shared hidden svg must not outlive the app).
  const tlRef = useRef(tl);
  tlRef.current = tl;
  useEffect(() => () => tlRef.current.destroy(), []);

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
    onDelete: () => {
      // Branch on the VALIDATED selection — actorSel can dangle after the
      // actor was deleted elsewhere (row ✕, project load).
      if (selectedActor) {
        editor.deleteActor(selectedActor.id);
        setActorSel(null);
      } else {
        editor.deleteSelected();
      }
    },
    onEscape: () => {
      setDrawing(null);
      setActorSel(null);
    },
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
      h(ProjectBar, {
        doc: editor.doc,
        onLoad: (loaded) => {
          editor.load(loaded);
          setActorSel(null);
        },
        onNew: () => {
          editor.load(INITIAL_DOC);
          setActorSel(null);
        },
      }),
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
        h(
          "div",
          { className: "me-stage-row" },
          h(Toolbox, { tool, onTool: setTool, fill, onFill: setFill }),
          h(Stage, {
            tl,
            doc: editor.doc,
            selected: editor.selected,
            actorSel,
            drawing,
            tool,
            fill,
            onDrawPoint: addDrawingPoint,
            onEditGuide: (track, index, path) => editor.updateKeyframe(track, index, { path }),
            onCreateActor: createActor,
            onSelectActor: selectActor,
            onUpdateActor: editor.updateActor,
          }),
        ),
        h(TimelinePanel, {
          tl,
          doc: editor.doc,
          selected: editor.selected,
          playheadRef,
          onSelect: selectKeyframe,
          onDragStart: (entry, additive) => {
            setActorSel(null);
            editor.dragStart(entry, additive);
          },
          onDragPreview: editor.dragPreview,
          onDragCommit: editor.dragCommit,
          onAddKeyframe: editor.addKeyframe,
          onDeleteActor: (id) => {
            editor.deleteActor(id);
            if (actorSel === id) setActorSel(null);
          },
          onSetDuration: editor.setDuration,
        }),
      ),
      h(
        "aside",
        { className: "me-right" },
        selectedActor
          ? h(ActorInspector, {
              actor: selectedActor,
              onEdit: (patch) => editor.updateActor(selectedActor.id, patch),
              onArrange: (delta) => editor.moveActorLayer(selectedActor.id, delta),
              onDelete: () => {
                editor.deleteActor(selectedActor.id);
                setActorSel(null);
              },
            })
          : h(Inspector, {
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
