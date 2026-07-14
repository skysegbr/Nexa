// The editor's document state: useHistory (undo/redo) + selection + every
// mutation; drags edit a transient draft and commit ONE history step on
// release. Selection entries are { track, id } — the keyframe's `_id` —
// so undo/redo reordering arrays never re-aims them at another diamond.

import { useHistory, useRef, useState } from "/dist/nexa.js";
import { snapToFrame } from "./editorUtils.js";
import { normalizeMotionDocument } from "./documentSchema.js";
import {
  writeKeyframeAtDoc,
  withKeyframeIds,
  freshKeyframeId,
  clipboardFrom,
  pasteClipboardDoc,
  moveKeyframesDoc,
  setLabelDoc,
} from "./docOps.js";
import { createActorActions } from "./editorActorActions.js";
import { createSceneActions } from "./sceneEditorActions.js";
import { layerActorIds } from "./layerOps.js";

export function useEditorDoc(initialDoc, playheadRef) {
  const [initial] = useState(() => withKeyframeIds(normalizeMotionDocument(initialDoc, initialDoc)));
  const { state: doc, set: setDoc, undo, redo, canUndo, canRedo } = useHistory(initial, { limit: 100 });
  const [draft, setDraft] = useState(null); // in-flight drag document
  const [selected, setSelected] = useState([]); // [{ track, id }]
  const dragOriginRef = useRef(null); // [{ track, id, at }] while dragging
  const clipboardRef = useRef(null);

  const effective = draft ?? doc;

  // Everything the editor touches snaps to the document's frame grid.
  const snap = (ms) => snapToFrame(ms, effective.fps);

  const indexOfKeyframe = (trackName, id) =>
    (effective.tracks[trackName] || []).findIndex((keyframe) => keyframe._id === id);

  // Selection entries can dangle after undo/delete — drop them.
  const liveSelected = selected.filter((entry) => indexOfKeyframe(entry.track, entry.id) !== -1);

  // ── document edits (all history-committing paths go through setDoc) ──

  const updateKeyframe = (trackName, id, patch) => {
    // No-op patches must not touch history (a blur re-fires change with
    // the value already committed → duplicate entry → "undo does nothing");
    // missing entries (sparse imported docs) are no-ops too.
    const index = indexOfKeyframe(trackName, id);
    const current = index !== -1 && effective.tracks[trackName][index];
    if (!current || Object.keys(patch).every((key) => Object.is(current[key], patch[key]))) {
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
    const keyframe = { at: snap(playheadRef.current), _id: freshKeyframeId() };
    // Imported documents may list an actor without a tracks entry.
    const nextTrack = [...(effective.tracks[trackName] || []), keyframe];
    setDoc({ ...effective, tracks: { ...effective.tracks, [trackName]: nextTrack } });
    setSelected([{ track: trackName, id: keyframe._id }]);
  };

  // Flash keys the whole layer: one atomic history step, one keyframe per
  // member actor, while preserving the runtime's independent tracks.
  const addLayerKeyframe = (layerId) => {
    const layer = effective.layers.find((entry) => entry.id === layerId);
    const actorIds = layer && layerActorIds(effective, layerId);
    if (!actorIds?.length) return;
    const at = snap(playheadRef.current);
    const tracks = { ...effective.tracks };
    const nextSelection = [];
    let changed = false;
    for (const track of actorIds) {
      const existing = (tracks[track] || []).find((keyframe) => keyframe.at === at);
      const keyframe = existing || { at, _id: freshKeyframeId() };
      if (!existing) {
        tracks[track] = [...(tracks[track] || []), keyframe];
        changed = true;
      }
      nextSelection.push({ track, id: keyframe._id });
    }
    if (changed) setDoc({ ...effective, tracks });
    setSelected(nextSelection);
  };

  // Flash's auto-key: dragging an actor on the stage records its position
  // as a keyframe AT THE PLAYHEAD (updating the one already there, if any).
  const keyAtPlayhead = (trackName, patch) => {
    const next = writeKeyframeAtDoc(effective, trackName, snap(playheadRef.current), patch);
    if (next) setDoc(next);
  };

  const deleteSelected = () => {
    if (liveSelected.length === 0) return;
    const doomed = new Set(liveSelected.map((entry) => entry.id));
    const tracks = {};
    for (const [name, keyframes] of Object.entries(effective.tracks)) {
      tracks[name] = keyframes.filter((keyframe) => !doomed.has(keyframe._id));
    }
    setDoc({ ...effective, tracks });
    setSelected([]);
  };

  // Scalar document properties (duration, fps, stageColor, library, …):
  // one guarded mutation instead of a setter per field.
  const setDocProp = (key, value) => {
    if (!Object.is(effective[key], value)) {
      setDoc({ ...effective, [key]: value });
    }
  };

  // One undoable transaction for linked operations spanning document branches.
  const transact = (transform) => {
    const next = transform(effective);
    if (next && next !== effective) setDoc(next);
  };
  // Labels ship with the export; `ms: undefined` removes one.
  const setLabel = (name, ms) => setDoc(setLabelDoc(effective, name, ms));

  // Replace an entire track — the actor-level code editor commits here.
  const setTrack = (trackName, keyframes) => {
    setDoc({
      ...effective,
      tracks: { ...effective.tracks, [trackName]: keyframes.map((kf) => ({ ...kf, _id: freshKeyframeId() })) },
    });
    setSelected([]);
  };

  // ── copy/paste: keyframes travel to the playhead, keeping their spacing ──

  const copySelected = () => {
    if (liveSelected.length === 0) return;
    clipboardRef.current = clipboardFrom(effective, liveSelected);
  };

  const pasteAtPlayhead = () => {
    if (!clipboardRef.current) return;
    const next = pasteClipboardDoc(effective, clipboardRef.current, snap(playheadRef.current));
    setDoc(next.doc);
    setSelected(next.pasted);
  };

  // ── selection & keyframe dragging (draft-based) ──

  const select = (entry, additive) => {
    setSelected((current) => {
      if (!additive) return [{ ...entry }];
      const without = current.filter((e) => e.id !== entry.id);
      return without.length === current.length ? [...current, { ...entry }] : without;
    });
  };

  // Dragging an unselected diamond selects it first (Flash behavior).
  const dragStart = (entry, additive) => {
    const isSelected = liveSelected.some((e) => e.id === entry.id);
    const nextSelection = isSelected && !additive ? liveSelected : additive
      ? [...liveSelected.filter((e) => e.id !== entry.id), entry]
      : [entry];
    setSelected(nextSelection);

    dragOriginRef.current = nextSelection.map((sel) => ({
      track: sel.track,
      id: sel.id,
      at: effective.tracks[sel.track][indexOfKeyframe(sel.track, sel.id)].at,
    }));
  };

  const dragPreview = (deltaMs) => {
    if (!dragOriginRef.current) return;
    setDraft(moveKeyframesDoc(doc, dragOriginRef.current, deltaMs, snap));
  };

  const dragCommit = () => {
    dragOriginRef.current = null;
    if (draft) {
      setDoc(draft);
      setDraft(null);
    }
  };

  const actorActions = createActorActions({ effective, setDoc, setSelected });
  const sceneActions = createSceneActions({ effective, setDoc, setSelected });

  // Loading a project is a normal (undoable) history step. Old saves
  // inherit the starter cast, every actor gets a tracks entry, and
  // keyframe ids are regenerated (saved ids come from an older session).
  const load = (nextDoc) => {
    setDoc(withKeyframeIds(normalizeMotionDocument(nextDoc, initialDoc)));
    setSelected([]);
  };

  const clearSelection = () => setSelected([]);

  return {
    load,
    ...actorActions,
    ...sceneActions,
    clearSelection,
    doc: effective,
    // The committed document (no in-flight drag draft): rebuild triggers key
    // off this so a drag preview doesn't recompile the runtime per pixel.
    committedDoc: doc,
    selected: liveSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    updateKeyframe,
    addKeyframe,
    addLayerKeyframe,
    keyAtPlayhead,
    deleteSelected,
    setDocProp,
    transact,
    setLabel,
    setTrack,
    copySelected,
    pasteAtPlayhead,
    select,
    dragStart,
    dragPreview,
    dragCommit,
  };
}
