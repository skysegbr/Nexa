// MovieClip symbol timelines and nested edit-context projection.

import { normalizeLayers } from "./layerOps.js";
import { applyScene, SCENE_FIELDS, syncActiveScene } from "./sceneOps.js";

const ART_FIELDS = ["kind", "fill", "text", "stroke", "strokeWidth", "path", "vectorW", "vectorH"];

const artOf = (source) =>
  Object.fromEntries(ART_FIELDS.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));

export function movieClipTimelineFromArtwork(source) {
  const actor = {
    id: "artwork-1",
    label: `${source.name || source.label || "Symbol"} artwork`,
    ...artOf(source),
    x: 0,
    y: 0,
    w: source.w || 48,
    h: source.h || 48,
  };
  return {
    duration: 1000,
    actors: [actor],
    tracks: { [actor.id]: [{ at: 0, x: 0, y: 0, opacity: 1 }] },
    layers: [{ id: "layer-1", name: "Artwork", type: "normal", actorIds: [actor.id] }],
    labels: undefined,
    loop: true,
  };
}

export function normalizeMovieClipTimeline(input, symbol) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return movieClipTimelineFromArtwork(symbol);
  const actors = Array.isArray(input.actors)
    ? input.actors.filter((actor) => actor && typeof actor === "object" && typeof actor.id === "string").map((actor) => ({ ...actor }))
    : [];
  const tracks = {};
  for (const actor of actors) {
    tracks[actor.id] = Array.isArray(input.tracks?.[actor.id])
      ? input.tracks[actor.id].filter((keyframe) => keyframe && typeof keyframe === "object").map((keyframe) => ({ ...keyframe }))
      : [];
  }
  return {
    duration: Number.isFinite(input.duration) && input.duration >= 100 ? input.duration : 1000,
    actors,
    tracks,
    layers: normalizeLayers(input.layers, actors),
    labels: input.labels && typeof input.labels === "object" ? { ...input.labels } : undefined,
    loop: input.loop || undefined,
  };
}

const timelineSnapshot = (doc) => Object.fromEntries(SCENE_FIELDS.map((key) => [key, doc[key]]));

function projectTimeline(doc, symbol, stack) {
  return {
    ...doc,
    ...symbol.timeline,
    editingSymbolId: symbol.id,
    symbolEditStack: stack,
  };
}

export function syncEditingSymbol(doc) {
  if (!doc.editingSymbolId) return doc;
  const current = doc.library.find((symbol) => symbol.id === doc.editingSymbolId);
  if (!current) return doc;
  const timeline = timelineSnapshot(doc);
  const first = doc.actors[0];
  const preview = first && !first.symbolId ? artOf(first) : {};
  return {
    ...doc,
    library: doc.library.map((symbol) =>
      symbol.id === current.id ? { ...symbol, ...preview, timeline } : symbol),
  };
}

export function enterSymbolDoc(doc, symbolId) {
  const chain = [...(doc.symbolEditStack || []), ...(doc.editingSymbolId ? [doc.editingSymbolId] : [])];
  if (chain.includes(symbolId)) return null;
  const prepared = doc.editingSymbolId ? syncEditingSymbol(doc) : syncActiveScene(doc);
  const symbol = prepared.library.find((item) => item.id === symbolId);
  if (!symbol) return null;
  return projectTimeline(prepared, { ...symbol, timeline: normalizeMovieClipTimeline(symbol.timeline, symbol) }, chain);
}

export function exitSymbolDoc(doc) {
  if (!doc.editingSymbolId) return null;
  const saved = syncEditingSymbol(doc);
  const stack = [...(saved.symbolEditStack || [])];
  const parentId = stack.pop();
  if (parentId) {
    const parent = saved.library.find((symbol) => symbol.id === parentId);
    return parent ? projectTimeline(saved, parent, stack) : null;
  }
  const scene = saved.scenes.find((entry) => entry.id === saved.activeSceneId);
  if (!scene) return null;
  const restored = applyScene(saved, scene);
  const { editingSymbolId: _editing, symbolEditStack: _stack, ...clean } = restored;
  return clean;
}
