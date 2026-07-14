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

import { h, render, useRef, useState } from "/dist/nexa.js";
import { INITIAL_DOC } from "./data.js";
import { Stage } from "./components/Stage.js";
import { Toolbox } from "./components/Toolbox.js";
import { TimelinePanel } from "./components/TimelinePanel.js";
import { Inspector } from "./components/Inspector.js";
import { CodePane } from "./components/CodePane.js";
import { smoothPath } from "./components/smoothPath.js";
import { ActorInspector } from "./components/ActorInspector.js";
import { Library } from "./components/Library.js";
import { libraryFor } from "./components/libraryOps.js";
import { EditorHeader } from "./components/EditorHeader.js";
import { useEditorDoc } from "./components/useEditorDoc.js";
import { useEditorShortcuts } from "./components/useEditorShortcuts.js";
import { useStageController } from "./components/useStageController.js";
import { applySpecToDoc } from "./components/codeParse.js";
import { useDrawingTools } from "./components/useDrawingTools.js";
function App() {
  const playheadRef = useRef(0);
  const editor = useEditorDoc(INITIAL_DOC, playheadRef);
  const [drawing, setDrawing] = useState(null); // { track, index, points } | null
  const drawingTools = useDrawingTools();
  const { tool, setTool } = drawingTools;
  const [actorSel, setActorSel] = useState(null); // actor id | null

  // Layer chrome, Flash's eye and padlock: editor-side state keyed by actor
  // id — NOT part of the document, so toggling never pollutes the undo
  // history, the export, or saved projects.
  const [layerFlags, setLayerFlags] = useState({}); // id → { hidden, locked }
  const toggleLayerFlag = (id, key) =>
    setLayerFlags((flags) => ({ ...flags, [id]: { ...flags[id], [key]: !flags[id]?.[key] } }));

  // Onion skin toggle + how many 100ms ghosts each side of the playhead.
  const [onion, setOnion] = useState({ on: false, count: 2 });

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

  const duplicateSelectedActor = () => {
    if (!selectedActor) return;
    const copyId = editor.duplicateActor(selectedActor.id);
    if (copyId) setActorSel(copyId);
  };

  const deleteActor = (id) => {
    editor.deleteActor(id);
    // Drop the layer flags too: a future actor can reuse the freed id and
    // must not inherit a stale eye/padlock.
    setLayerFlags(({ [id]: _dropped, ...rest }) => rest);
    setActorSel((current) => (current === id ? null : current));
  };

  const selectedActorSource = actorSel && editor.doc.actors.find((actor) => actor.id === actorSel);
  const library = libraryFor(editor, selectedActorSource, createActor);
  const selectedActor = library.selected;
  const loadProject = (project) => {
    editor.load(project);
    setActorSel(null);
    setLayerFlags({});
  };

  const tl = useStageController(INITIAL_DOC, editor.committedDoc, playheadRef);

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
      editor.updateKeyframe(drawing.track, drawing.id, { path: smoothPath(drawing.points) });
    }
    setDrawing(null);
  };

  useEditorShortcuts({
    undo: editor.undo,
    redo: editor.redo,
    onCopy: editor.copySelected,
    onPaste: editor.pasteAtPlayhead,
    onDuplicate: duplicateSelectedActor,
    onDelete: () => {
      // Branch on the VALIDATED selection — actorSel can dangle after the
      // actor was deleted elsewhere (row ✕, project load).
      if (selectedActor) {
        deleteActor(selectedActor.id);
      } else {
        editor.deleteSelected();
      }
    },
    onEscape: () => {
      setDrawing(null);
      setActorSel(null);
    },
    onTool: setTool,
  });

  return h(
    "div",
    { className: "me-app" },
    h(EditorHeader, {
      editor,
      drawing,
      onLoad: (loaded) => loadProject(loaded),
      onNew: () => loadProject(INITIAL_DOC),
    }),
    h(
      "main",
      { className: "me-main" },
      h(
        "div",
        { className: "me-left" },
        h(
          "div",
          { className: "me-stage-row" },
          h(Toolbox, drawingTools.toolboxProps),
          h(Stage, {
            tl,
            doc: editor.doc,
            committedDoc: editor.committedDoc,
            selected: editor.selected,
            actorSel,
            drawing,
            ...drawingTools.stageProps,
            layerFlags,
            onion,
            playheadRef,
            onDrawPoint: addDrawingPoint,
            onEditGuide: (track, id, path) => editor.updateKeyframe(track, id, { path }),
            onCreateActor: createActor,
            onSelectActor: selectActor,
            onUpdateActor: editor.updateActor,
            onKeyPosition: editor.keyAtPlayhead,
          }),
        ),
        h(TimelinePanel, {
          tl,
          doc: editor.doc,
          selected: editor.selected,
          actorSel,
          layerFlags,
          playheadRef,
          onSelect: selectKeyframe,
          onDragStart: (entry, additive) => {
            setActorSel(null);
            editor.dragStart(entry, additive);
          },
          onDragPreview: editor.dragPreview,
          onDragCommit: editor.dragCommit,
          onAddKeyframe: editor.addKeyframe,
          onDeleteActor: deleteActor,
          onSetDuration: (ms) => Number.isFinite(ms) && ms >= 100 && editor.setDocProp("duration", ms),
          onSetFps: (fps) => Number.isFinite(fps) && fps >= 1 && fps <= 120 && editor.setDocProp("fps", Math.round(fps)),
          onToggleHidden: (id) => toggleLayerFlag(id, "hidden"),
          onToggleLocked: (id) => toggleLayerFlag(id, "locked"),
          onToggleOutline: (id) => toggleLayerFlag(id, "outline"),
          onMoveLayer: editor.moveActorLayer,
          onSelectActor: selectActor,
          onRenameActor: (id, label) => editor.updateActor(id, { label }),
          onAddLabel: (name) => editor.setLabel(name, Math.round(playheadRef.current)),
          onRemoveLabel: (name) => editor.setLabel(name, undefined),
          onToggleLoop: () => editor.setDocProp("loop", editor.doc.loop ? undefined : true),
          onion,
          onOnionToggle: () => setOnion((current) => ({ ...current, on: !current.on })),
          onOnionCount: (count) =>
            Number.isFinite(count) && setOnion((current) => ({ ...current, count: Math.max(1, Math.min(12, Math.round(count))) })),
        }),
      ),
      h(
        "aside",
        { className: "me-right" },
        selectedActor
          ? h(ActorInspector, {
              actor: selectedActor,
              keyframes: editor.doc.tracks[selectedActor.id] || [],
              fps: editor.doc.fps,
              symbolName: library.selectedSymbol?.name,
              onEdit: library.edit,
              onArrange: (delta) => editor.moveActorLayer(selectedActor.id, delta),
              onDuplicate: duplicateSelectedActor,
              onSaveSymbol: library.save,
              onDelete: () => deleteActor(selectedActor.id),
              // Object → its animation: parks the playhead on the keyframe
              // and selects it, flipping to the keyframe editor.
              onJumpKeyframe: (kf) => {
                tl.stop();
                tl.seek(kf.at);
                playheadRef.current = kf.at;
                selectKeyframe({ track: selectedActor.id, id: kf._id }, false);
              },
              onApplyTrack: (kfs) => editor.setTrack(selectedActor.id, kfs),
            })
          : h(Inspector, {
          doc: editor.doc,
          selected: editor.selected,
          drawing,
          onEdit: (patch) =>
            editor.selected.length === 1 &&
            editor.updateKeyframe(editor.selected[0].track, editor.selected[0].id, patch),
          onDelete: editor.deleteSelected,
          onStartDrawing: startDrawing,
          onFinishDrawing: finishDrawing,
          onCancelDrawing: () => setDrawing(null),
        }),
        h(Library, { items: library.items, usage: library.usage, onPlace: library.place, onRemove: library.remove }),
        h(CodePane, {
          doc: editor.doc,
          onApply: (spec) => {
            editor.load(applySpecToDoc(editor.doc, spec));
            setActorSel(null);
          },
        }),
      ),
    ),
  );
}

render(App, document.getElementById("app"));
