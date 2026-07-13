// The editor's document state: duration + keyframe tracks in useHistory
// (the core's undo/redo hook), the current selection, and every mutation —
// keyframe edits, add/delete, copy/paste at the playhead, and draft-based
// dragging (a gesture edits a transient draft and commits ONE history step
// on release, not one per pixel).

import { useHistory, useRef, useState } from "/dist/nexa.js";

const snap = (ms) => Math.round(ms / 25) * 25;

export function useEditorDoc(initialDoc, playheadRef) {
  const { state: doc, set: setDoc, undo, redo, canUndo, canRedo } = useHistory(initialDoc, { limit: 100 });
  const [draft, setDraft] = useState(null); // in-flight drag document
  const [selected, setSelected] = useState([]); // [{ track, index }]
  const dragOriginRef = useRef(null); // Map "track:index" → original at
  const clipboardRef = useRef(null);

  const effective = draft ?? doc;

  // Selection entries can dangle after undo/delete — drop them.
  const liveSelected = selected.filter((entry) => effective.tracks[entry.track]?.[entry.index]);

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
    // Unique id/label per kind: rect-1, rect-2, ...
    let n = 1;
    while (effective.actors.some((a) => a.id === `${actor.kind}-${n}`)) n += 1;
    const id = `${actor.kind}-${n}`;
    const label = `${actor.kind[0].toUpperCase()}${actor.kind.slice(1)} ${n}`;
    setDoc({
      ...effective,
      actors: [...effective.actors, { ...actor, id, label }],
      // A starter keyframe at 0 so the new row has a diamond to work from.
      tracks: { ...effective.tracks, [id]: [{ at: 0, x: 0, y: 0, opacity: 1 }] },
    });
    setSelected([{ track: id, index: 0 }]);
  };

  const deleteActor = (id) => {
    const tracks = { ...effective.tracks };
    delete tracks[id];
    setDoc({
      ...effective,
      actors: effective.actors.filter((actor) => actor.id !== id),
      tracks,
    });
    setSelected((current) => current.filter((entry) => entry.track !== id));
  };

  // Loading a project (or resetting) is a normal history step — undoable.
  // Projects saved before actors became part of the document inherit the
  // starter cast.
  const load = (nextDoc) => {
    setDoc({ ...nextDoc, actors: nextDoc.actors ?? initialDoc.actors });
    setSelected([]);
  };

  const clearSelection = () => setSelected([]);

  return {
    load,
    addActor,
    deleteActor,
    updateActor,
    clearSelection,
    doc: effective,
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
