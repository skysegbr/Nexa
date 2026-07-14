// The editor's document state: duration + keyframe tracks in useHistory
// (the core's undo/redo hook), the current selection, and every mutation —
// keyframe edits, add/delete, copy/paste at the playhead, and draft-based
// dragging (a gesture edits a transient draft and commits ONE history step
// on release, not one per pixel).

import { useHistory, useRef, useState } from "/dist/nexa.js";
import { snap, selKey } from "./editorUtils.js";
import { addActorDoc, duplicateActorDoc, moveActorLayerDoc, deleteActorDoc } from "./docOps.js";

export function useEditorDoc(initialDoc, playheadRef) {
  const { state: doc, set: setDoc, undo, redo, canUndo, canRedo } = useHistory(initialDoc, { limit: 100 });
  const [draft, setDraft] = useState(null); // in-flight drag document
  const [selected, setSelected] = useState([]); // [{ track, index }]
  const dragOriginRef = useRef(null); // [{ track, index, at }] while dragging
  const clipboardRef = useRef(null);

  const effective = draft ?? doc;

  // Selection entries can dangle after undo/delete — drop them.
  const liveSelected = selected.filter((entry) => effective.tracks[entry.track]?.[entry.index]);

  // ── document edits (all history-committing paths go through setDoc) ──

  const updateKeyframe = (trackName, index, patch) => {
    // A no-op patch must not touch history: a blur can re-fire change with
    // the value already committed, and pushing a duplicate entry makes the
    // next undo appear to do nothing. Missing entries (imported documents
    // can be sparse) are also no-ops.
    const current = effective.tracks[trackName]?.[index];
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
    const at = snap(playheadRef.current);
    // Imported documents may list an actor without a tracks entry.
    const nextTrack = [...(effective.tracks[trackName] || []), { at }];
    setDoc({ ...effective, tracks: { ...effective.tracks, [trackName]: nextTrack } });
    setSelected([{ track: trackName, index: nextTrack.length - 1 }]);
  };

  const deleteSelected = () => {
    if (liveSelected.length === 0) return;
    const doomed = new Set(liveSelected.map(selKey));
    const tracks = {};
    for (const [name, keyframes] of Object.entries(effective.tracks)) {
      tracks[name] = keyframes.filter((_, i) => !doomed.has(selKey({ track: name, index: i })));
    }
    setDoc({ ...effective, tracks });
    setSelected([]);
  };

  const setDuration = (duration) => {
    if (Number.isFinite(duration) && duration >= 100 && duration !== effective.duration) {
      setDoc({ ...effective, duration });
    }
  };

  // ── copy/paste: keyframes travel to the playhead, keeping their spacing ──

  const copySelected = () => {
    if (liveSelected.length === 0) return;
    const entries = liveSelected.map(({ track, index }) => ({
      track,
      keyframe: { ...effective.tracks[track][index] },
    }));
    const baseAt = Math.min(...entries.map((entry) => entry.keyframe.at));
    clipboardRef.current = { entries, baseAt };
  };

  const pasteAtPlayhead = () => {
    const clipboard = clipboardRef.current;
    if (!clipboard) return;
    const offset = snap(playheadRef.current) - clipboard.baseAt;
    const tracks = { ...effective.tracks };
    const pasted = [];
    for (const { track, keyframe } of clipboard.entries) {
      const at = snap(Math.max(0, Math.min(effective.duration, keyframe.at + offset)));
      tracks[track] = [...tracks[track], { ...keyframe, at }];
      pasted.push({ track, index: tracks[track].length - 1 });
    }
    setDoc({ ...effective, tracks });
    setSelected(pasted);
  };

  // ── selection & keyframe dragging (draft-based) ──

  const select = (entry, additive) => {
    setSelected((current) => {
      if (!additive) return [{ ...entry }];
      const key = selKey(entry);
      const without = current.filter((e) => selKey(e) !== key);
      return without.length === current.length ? [...current, { ...entry }] : without;
    });
  };

  const dragStart = (entry, additive) => {
    // Dragging an unselected diamond selects it first (Flash behavior).
    const key = selKey(entry);
    const isSelected = liveSelected.some((e) => selKey(e) === key);
    const nextSelection = isSelected && !additive ? liveSelected : additive
      ? [...liveSelected.filter((e) => selKey(e) !== key), entry]
      : [entry];
    setSelected(nextSelection);

    // Plain objects — no string round-trip, so track names from imported
    // JSON can contain any character without corrupting the drag.
    dragOriginRef.current = nextSelection.map((sel) => ({
      track: sel.track,
      index: sel.index,
      at: effective.tracks[sel.track][sel.index].at,
    }));
  };

  const dragPreview = (deltaMs) => {
    const origins = dragOriginRef.current;
    if (!origins) return;
    const tracks = { ...effective.tracks };
    for (const { track: trackName, index, at } of origins) {
      const nextAt = snap(Math.max(0, Math.min(effective.duration, at + deltaMs)));
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
    setSelected([{ track: next.id, index: 0 }]);
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
  // imported documents can't crash keyframe mutations.
  const load = (nextDoc) => {
    const actors = nextDoc.actors ?? initialDoc.actors;
    const tracks = { ...nextDoc.tracks };
    for (const actor of actors) {
      if (!tracks[actor.id]) {
        tracks[actor.id] = [];
      }
    }
    setDoc({ ...nextDoc, actors, tracks });
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
    deleteSelected,
    setDuration,
    copySelected,
    pasteAtPlayhead,
    select,
    dragStart,
    dragPreview,
    dragCommit,
  };
}
