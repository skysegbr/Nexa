// Pure Flash-style symbol operations. A symbol owns reusable artwork
// (kind/paint/text); an actor owns its instance identity, box and timeline.
// Keeping this in the editor avoids adding authoring concepts to the small
// nexa-motion runtime.

import { applyScene, syncActiveScene } from "./sceneOps.js";
import { movieClipTimelineFromArtwork, syncEditingSymbol } from "./symbolTimelineOps.js";

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

export const symbolsById = (doc) => new Map((doc.library || []).map((item) => [item.id, item]));

// Callers resolving MANY actors in one pass (the stage, the onion ghosts)
// build the symbol Map once and pass it in — otherwise every actor does its
// own O(library) find, which is O(actors × library) per render.
export function resolveActor(doc, actor, symbols) {
  if (!actor?.symbolId) return actor;
  const symbol = symbols ? symbols.get(actor.symbolId) : (doc.library || []).find((item) => item.id === actor.symbolId);
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
  symbol.timeline = movieClipTimelineFromArtwork(symbol);
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
  const detach = (actor) => {
    if (actor.symbolId !== symbolId) return actor;
    const resolved = resolveActor(doc, actor);
    const { symbolId: _removed, ...plainActor } = actor;
    return { ...plainActor, ...contentOf(resolved) };
  };
  if (!doc.scenes) {
    return { ...doc, actors: doc.actors.map(detach), library: doc.library.filter((item) => item.id !== symbolId) };
  }
  const contextual = doc.editingSymbolId ? syncEditingSymbol(doc) : doc;
  const synced = syncActiveScene(contextual);
  const scenes = synced.scenes.map((scene) => ({ ...scene, actors: scene.actors.map(detach) }));
  const library = synced.library
    .filter((item) => item.id !== symbolId)
    .map((item) => ({ ...item, timeline: { ...item.timeline, actors: item.timeline.actors.map(detach) } }));
  const next = { ...synced, scenes, library };
  if (next.editingSymbolId) return { ...next, actors: next.actors.map(detach) };
  return applyScene(next, scenes.find((scene) => scene.id === next.activeSceneId));
}

export function symbolUsage(doc) {
  const counts = {};
  const contextual = doc.editingSymbolId ? syncEditingSymbol(doc) : doc;
  const synced = doc.scenes ? syncActiveScene(contextual) : contextual;
  const actors = doc.scenes
    ? [...synced.scenes.flatMap((scene) => scene.actors), ...synced.library.flatMap((item) => item.timeline?.actors || [])]
    : doc.actors;
  for (const actor of actors) {
    if (actor.symbolId) counts[actor.symbolId] = (counts[actor.symbolId] || 0) + 1;
  }
  return counts;
}
