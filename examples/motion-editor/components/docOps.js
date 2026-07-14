// Pure document transforms for the actor operations: each takes the current
// document and returns the next one (or null for a no-op), so useEditorDoc
// stays the single owner of history/selection while the array juggling
// lives here.

// Every keyframe carries a session-unique `_id`: selection, drags and the
// clipboard target keyframes BY ID, so undo/redo reordering an array never
// re-aims them at a different diamond. `_`-prefixed keys are editor-side
// only — the code export strips them.
let nextKeyframeId = 1;
export const freshKeyframeId = () => `k${nextKeyframeId++}`;

// Regenerates every id (used on init and project load: saved files carry
// ids from an older session and could collide with this one's counter).
export function withKeyframeIds(doc) {
  const tracks = {};
  for (const [name, keyframes] of Object.entries(doc.tracks)) {
    tracks[name] = keyframes.map((keyframe) => ({ ...keyframe, _id: freshKeyframeId() }));
  }
  return { ...doc, tracks };
}

// Unique id per kind: rect-1, rect-2, ... (also reused by duplication).
function nextIdFor(doc, kind) {
  let n = 1;
  while (doc.actors.some((actor) => actor.id === `${kind}-${n}`)) n += 1;
  return { id: `${kind}-${n}`, n };
}

export function addActorDoc(doc, actor) {
  const { id, n } = nextIdFor(doc, actor.kind);
  const label = `${actor.kind[0].toUpperCase()}${actor.kind.slice(1)} ${n}`;
  return {
    id,
    doc: {
      ...doc,
      actors: [...doc.actors, { ...actor, id, label }],
      // A starter keyframe at 0 so the new row has a diamond to work from.
      tracks: { ...doc.tracks, [id]: [{ at: 0, x: 0, y: 0, opacity: 1, _id: freshKeyframeId() }] },
    },
  };
}

// Clone actor + keyframes, nudged so the copy is visible next to the
// original. Returns null for stale ids (the selection can dangle).
export function duplicateActorDoc(doc, id) {
  const source = doc.actors.find((actor) => actor.id === id);
  if (!source) return null;
  const { id: copyId } = nextIdFor(doc, source.kind);
  const copy = { ...source, id: copyId, label: `${source.label} copy`, x: source.x + 16, y: source.y + 16 };
  return {
    id: copyId,
    doc: {
      ...doc,
      actors: [...doc.actors, copy],
      tracks: {
        ...doc.tracks,
        [copyId]: (doc.tracks[id] || []).map((keyframe) => ({ ...keyframe, _id: freshKeyframeId() })),
      },
    },
  };
}

// Z-order, Flash's Arrange: actors paint in document order, so moving an
// actor within the array is moving it between layers. `delta` is ±1 for
// one step, ±Infinity for front/back.
export function moveActorLayerDoc(doc, id, delta) {
  const index = doc.actors.findIndex((actor) => actor.id === id);
  if (index === -1) return null;
  const target = Math.max(
    0,
    Math.min(doc.actors.length - 1, delta === Infinity ? doc.actors.length - 1 : delta === -Infinity ? 0 : index + delta),
  );
  if (target === index) return null;
  const actors = [...doc.actors];
  const [moved] = actors.splice(index, 1);
  actors.splice(target, 0, moved);
  return { ...doc, actors };
}

// Flash's auto-key: write `patch` into the keyframe sitting exactly at
// `at`, or insert a new keyframe there. Returns null when nothing would
// change (dropping an actor back on its own spot must not touch history).
export function writeKeyframeAtDoc(doc, trackName, at, patch) {
  const keyframes = doc.tracks[trackName] || [];
  const index = keyframes.findIndex((keyframe) => keyframe.at === at);
  if (index !== -1 && Object.keys(patch).every((key) => Object.is(keyframes[index][key], patch[key]))) {
    return null;
  }
  const nextTrack =
    index !== -1
      ? keyframes.map((keyframe, i) => (i === index ? { ...keyframe, ...patch } : keyframe))
      : [...keyframes, { at, ...patch, _id: freshKeyframeId() }];
  return { ...doc, tracks: { ...doc.tracks, [trackName]: nextTrack } };
}

// Timeline labels ({ name: ms }); `ms: undefined` removes the label.
export function setLabelDoc(doc, name, ms) {
  const labels = { ...(doc.labels || {}) };
  if (ms === undefined) delete labels[name];
  else labels[name] = ms;
  return { ...doc, labels };
}

export function setLoopDoc(doc, loop) {
  if (Boolean(doc.loop) === loop) return null;
  return { ...doc, loop: loop || undefined };
}

// Clipboard payload for the selected keyframes: copies stripped of their
// ids (paste mints fresh ones), plus the earliest `at` so a paste keeps
// the group's internal spacing relative to the playhead.
export function clipboardFrom(doc, entries) {
  const items = entries.map(({ track, id }) => {
    const { _id, ...keyframe } = doc.tracks[track].find((k) => k._id === id);
    return { track, keyframe };
  });
  return { entries: items, baseAt: Math.min(...items.map((item) => item.keyframe.at)) };
}

export function pasteClipboardDoc(doc, clipboard, atPlayhead) {
  const offset = atPlayhead - clipboard.baseAt;
  const tracks = { ...doc.tracks };
  const pasted = [];
  for (const { track, keyframe } of clipboard.entries) {
    const at = Math.max(0, Math.min(doc.duration, keyframe.at + offset));
    const copy = { ...keyframe, at, _id: freshKeyframeId() };
    tracks[track] = [...(tracks[track] || []), copy];
    pasted.push({ track, id: copy._id });
  }
  return { doc: { ...doc, tracks }, pasted };
}

// Shift the dragged keyframes to `origin.at + deltaMs`, clamped to the
// document — the per-pointermove draft during a diamond drag.
export function moveKeyframesDoc(doc, origins, deltaMs, snapFn) {
  const tracks = { ...doc.tracks };
  for (const { track: trackName, id, at } of origins) {
    const nextAt = snapFn(Math.max(0, Math.min(doc.duration, at + deltaMs)));
    tracks[trackName] = tracks[trackName].map((keyframe) =>
      keyframe._id === id ? { ...keyframe, at: nextAt } : keyframe,
    );
  }
  return { ...doc, tracks };
}

export function deleteActorDoc(doc, id) {
  // Unknown id (stale selection): committing anyway would push a
  // content-identical history entry — the "undo does nothing" bug.
  if (!doc.actors.some((actor) => actor.id === id)) return null;
  const tracks = { ...doc.tracks };
  delete tracks[id];
  return {
    ...doc,
    actors: doc.actors.filter((actor) => actor.id !== id),
    tracks,
  };
}
