// Pure Flash-style symbol operations. A symbol owns reusable artwork
// (kind/paint/text); an actor owns its instance identity, box and timeline.
// Keeping this in the editor avoids adding authoring concepts to the small
// nexa-motion runtime.

const CONTENT_FIELDS = ["kind", "fill", "text", "stroke", "strokeWidth", "path", "vectorW", "vectorH"];

const contentOf = (actor) =>
  Object.fromEntries(CONTENT_FIELDS.filter((field) => actor[field] !== undefined).map((field) => [field, actor[field]]));

function applyPatch(target, patch) {
  if (Object.keys(patch).every((key) => Object.is(target[key], patch[key]))) return target;
  const next = { ...target, ...patch };
  for (const key of Object.keys(patch)) {
    if (next[key] === undefined) delete next[key];
  }
  return next;
}

function nextSymbolId(library) {
  const used = new Set(library.map((item) => item.id));
  let index = 1;
  while (used.has(`symbol-${index}`)) index += 1;
  return `symbol-${index}`;
}

export function resolveActor(doc, actor) {
  if (!actor?.symbolId) return actor;
  const symbol = (doc.library || []).find((item) => item.id === actor.symbolId);
  if (!symbol) return actor;
  return { ...actor, ...contentOf(symbol), symbolId: symbol.id };
}

export function convertActorToSymbolDoc(doc, actorId) {
  const actor = doc.actors.find((entry) => entry.id === actorId);
  if (!actor) return doc;
  const library = doc.library || [];
  const resolved = resolveActor(doc, actor);

  if (actor.symbolId && library.some((item) => item.id === actor.symbolId)) {
    return doc;
  }

  const symbol = {
    id: nextSymbolId(library),
    name: actor.label || `Symbol ${library.length + 1}`,
    ...contentOf(resolved),
    w: actor.w,
    h: actor.h,
  };
  return {
    ...doc,
    library: [...library, symbol],
    actors: doc.actors.map((entry) => (entry.id === actorId ? { ...entry, symbolId: symbol.id } : entry)),
  };
}

export function editActorOrSymbolDoc(doc, actorId, patch) {
  const actor = doc.actors.find((entry) => entry.id === actorId);
  if (!actor) return doc;
  if (!actor.symbolId || !(doc.library || []).some((item) => item.id === actor.symbolId)) {
    const edited = applyPatch(actor, patch);
    return edited === actor
      ? doc
      : { ...doc, actors: doc.actors.map((entry) => (entry.id === actorId ? edited : entry)) };
  }
  const contentPatch = {};
  const instancePatch = {};
  for (const [key, value] of Object.entries(patch)) {
    (CONTENT_FIELDS.includes(key) ? contentPatch : instancePatch)[key] = value;
  }

  const symbol = doc.library.find((item) => item.id === actor.symbolId);
  const editedSymbol = applyPatch(symbol, contentPatch);
  const editedActor = applyPatch(actor, instancePatch);
  const library = editedSymbol === symbol
    ? doc.library
    : doc.library.map((item) => (item.id === actor.symbolId ? editedSymbol : item));
  const actors = editedActor === actor
    ? doc.actors
    : doc.actors.map((entry) => (entry.id === actorId ? editedActor : entry));
  return library === doc.library && actors === doc.actors ? doc : { ...doc, library, actors };
}

export function removeSymbolDoc(doc, symbolId) {
  if (!(doc.library || []).some((item) => item.id === symbolId)) return doc;
  const actors = doc.actors.map((actor) => {
    if (actor.symbolId !== symbolId) return actor;
    const resolved = resolveActor(doc, actor);
    const { symbolId: _removed, ...plainActor } = actor;
    return { ...plainActor, ...contentOf(resolved) };
  });
  return { ...doc, actors, library: doc.library.filter((item) => item.id !== symbolId) };
}

export function symbolUsage(doc) {
  const counts = {};
  for (const actor of doc.actors) {
    if (actor.symbolId) counts[actor.symbolId] = (counts[actor.symbolId] || 0) + 1;
  }
  return counts;
}
