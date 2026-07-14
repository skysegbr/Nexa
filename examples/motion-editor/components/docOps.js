// Pure document transforms for the actor operations: each takes the current
// document and returns the next one (or null for a no-op), so useEditorDoc
// stays the single owner of history/selection while the array juggling
// lives here.

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
      tracks: { ...doc.tracks, [id]: [{ at: 0, x: 0, y: 0, opacity: 1 }] },
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
        [copyId]: (doc.tracks[id] || []).map((keyframe) => ({ ...keyframe })),
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
