// MovieClip symbol timelines and nested edit-context projection.

import { normalizeLayers } from "./layerOps.js";
import { applyScene, SCENE_FIELDS, syncActiveScene } from "./sceneOps.js";
import { contentOf } from "./symbolOps.js";

export function movieClipTimelineFromArtwork(source) {
  const actor = {
    id: "artwork-1",
    label: `${source.name || source.label || "Symbol"} artwork`,
    ...contentOf(source),
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

// The shared shape of a timeline "branch" — a scene (documentSchema) or a
// MovieClip symbol timeline: copy each actor's tracks, normalize its layers,
// floor the duration at 100ms. Callers resolve the actor list and add their
// own wrapper keys (a scene's id/name, a movie clip's artwork fallback).
export function normalizeTimelineBranch(source, actors, durationDefault) {
  const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const sourceTracks = isRecord(source.tracks) ? source.tracks : {};
  const tracks = {};
  for (const actor of actors) {
    tracks[actor.id] = Array.isArray(sourceTracks[actor.id])
      ? sourceTracks[actor.id].filter(isRecord).map((keyframe) => ({ ...keyframe }))
      : [];
  }
  return {
    duration: Number.isFinite(source.duration) && source.duration >= 100 ? source.duration : durationDefault,
    actors: actors.map((actor) => ({ ...actor })),
    tracks,
    layers: normalizeLayers(source.layers, actors),
    labels: isRecord(source.labels) ? { ...source.labels } : undefined,
    loop: source.loop || undefined,
  };
}

export function normalizeMovieClipTimeline(input, symbol) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return movieClipTimelineFromArtwork(symbol);
  const actors = Array.isArray(input.actors)
    ? input.actors.filter((actor) => actor && typeof actor === "object" && typeof actor.id === "string")
    : [];
  return normalizeTimelineBranch(input, actors, 1000);
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
  const preview = first && !first.symbolId ? contentOf(first) : {};
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
