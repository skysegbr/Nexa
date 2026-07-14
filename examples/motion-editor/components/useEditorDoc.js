// The editor's document state: useHistory (undo/redo) + selection + every
// mutation; drags edit a transient draft and commit ONE history step on
// release. Selection entries are { track, id } — the keyframe's `_id` —
// so undo/redo reordering arrays never re-aims them at another diamond.

import { useHistory, useRef, useState } from "/dist/nexa.js";
import { snap } from "./editorUtils.js";
import {
  addActorDoc,
  duplicateActorDoc,
  moveActorLayerDoc,
  deleteActorDoc,
  writeKeyframeAtDoc,
  withKeyframeIds,
  freshKeyframeId,
  clipboardFrom,
  pasteClipboardDoc,
  moveKeyframesDoc,
  setLabelDoc,
  setLoopDoc,
} from "./docOps.js";

export function useEditorDoc(initialDoc, playheadRef) {
  const [initial] = useState(() => withKeyframeIds(initialDoc));
  const { state: doc, set: setDoc, undo, redo, canUndo, canRedo } = useHistory(initial, { limit: 100 });
  const [draft, setDraft] = useState(null); // in-flight drag document
  const [selected, setSelected] = useState([]); // [{ track, id }]
  const dragOriginRef = useRef(null); // [{ track, id, at }] while dragging
  const clipboardRef = useRef(null);

  const effective = draft ?? doc;

  const indexOfKeyframe = (trackName, id) =>
    (effective.tracks[trackName] || []).findIndex((keyframe) => keyframe._id === id);

  // Selection entries can dangle after undo/delete — drop them.
  const liveSelected = selected.filter((entry) => indexOfKeyframe(entry.track, entry.id) !== -1);

  // ── document edits (all history-committing paths go through setDoc) ──

  const updateKeyframe = (trackName, id, patch) => {
    // A no-op patch must not touch history: a blur can re-fire change with
    // the value already committed, and pushing a duplicate entry makes the
    // next undo appear to do nothing. Missing entries (imported documents
    // can be sparse) are also no-ops.
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

  const setDuration = (duration) => {
    if (Number.isFinite(duration) && duration >= 100 && duration !== effective.duration) {
      setDoc({ ...effective, duration });
    }
  };

  // Timeline labels ({ name: ms }) and looping are document properties —
  // they ship with the export. `ms: undefined` removes a label.
  const setLabel = (name, ms) => setDoc(setLabelDoc(effective, name, ms));

  const setLoop = (loop) => {
    const next = setLoopDoc(effective, loop);
    if (next) setDoc(next);
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

  const dragStart = (entry, additive) => {
    // Dragging an unselected diamond selects it first (Flash behavior).
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

  // ── actors: created with the stage tools, deleted from their row ──

  const updateActor = (id, patch) => {
    const current = effective.actors.find((actor) => actor.id === id);
    if (!current || Object.keys(patch).every((key) => Object.is(current[key], patch[key]))) {
      return;
    }
    setDoc({
      ...effective,
      actors: effective.actors.map((actor) => (actor.id === id ? { ...actor, ...patch } : actor)),
    });
  };

  const addActor = (actor) => {
    const next = addActorDoc(effective, actor);
    setDoc(next.doc);
    setSelected([{ track: next.id, id: next.doc.tracks[next.id][0]._id }]);
  };

  // ONE history step; returns the new id (null for stale ids) so the
  // caller can move the actor selection onto the copy.
  const duplicateActor = (id) => {
    const next = duplicateActorDoc(effective, id);
    if (!next) return null;
    setDoc(next.doc);
    setSelected([]);
    return next.id;
  };

  const moveActorLayer = (id, delta) => {
    const next = moveActorLayerDoc(effective, id, delta);
    if (next) setDoc(next);
  };

  const deleteActor = (id) => {
    const next = deleteActorDoc(effective, id);
    if (!next) return;
    setDoc(next);
    setSelected((current) => current.filter((entry) => entry.track !== id));
  };

  // Loading a project (or resetting) is a normal history step — undoable.
  // Projects saved before actors became part of the document inherit the
  // starter cast, and every actor is guaranteed a tracks entry so sparse
  // imported documents can't crash keyframe mutations. Keyframe ids are
  // regenerated: saved files carry ids from an older session.
  const load = (nextDoc) => {
    const actors = nextDoc.actors ?? initialDoc.actors;
    const tracks = { ...nextDoc.tracks };
    for (const actor of actors) {
      if (!tracks[actor.id]) {
        tracks[actor.id] = [];
      }
    }
    setDoc(withKeyframeIds({ ...nextDoc, actors, tracks }));
    setSelected([]);
  };

  const clearSelection = () => setSelected([]);

  return {
    load,
    addActor,
    duplicateActor,
    deleteActor,
    updateActor,
    moveActorLayer,
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
    keyAtPlayhead,
    deleteSelected,
    setDuration,
    setLabel,
    setLoop,
    copySelected,
    pasteAtPlayhead,
    select,
    dragStart,
    dragPreview,
    dragCommit,
  };
}
