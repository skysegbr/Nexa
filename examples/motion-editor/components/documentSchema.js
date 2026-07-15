// Versioned motion-editor document boundary. The root projects the active
// scene for existing editor domains; `scenes` is the canonical movie list.

import { normalizeLayers } from "./layerOps.js";
import { applyScene, syncActiveScene } from "./sceneOps.js";
import { normalizeMovieClipTimeline, syncEditingSymbol } from "./symbolTimelineOps.js";

export const MOTION_DOCUMENT_VERSION = 8;

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function normalizeLibrary(items) {
  if (!Array.isArray(items)) return [];
  const used = new Set();
  let nextId = 1;
  return items.filter(isRecord).map((item, index) => {
    let id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : "";
    while (!id || used.has(id)) id = `symbol-${nextId++}`;
    used.add(id);
    return {
      ...item,
      id,
      name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : `Symbol ${index + 1}`,
      kind: item.kind || "rect",
      w: Number.isFinite(item.w) ? Math.max(1, item.w) : 48,
      h: Number.isFinite(item.h) ? Math.max(1, item.h) : 48,
      timeline: normalizeMovieClipTimeline(item.timeline, item),
    };
  });
}

function normalizeScene(source, fallback, id, name) {
  const actors = Array.isArray(source.actors)
    ? source.actors.filter((actor) => isRecord(actor) && typeof actor.id === "string")
    : Array.isArray(fallback.actors) ? fallback.actors : [];
  const sourceTracks = isRecord(source.tracks) ? source.tracks : {};
  const tracks = {};
  for (const actor of actors) {
    const keyframes = sourceTracks[actor.id];
    tracks[actor.id] = Array.isArray(keyframes) ? keyframes.filter(isRecord).map((keyframe) => ({ ...keyframe })) : [];
  }
  return {
    id,
    name,
    duration: Number.isFinite(source.duration) && source.duration >= 100 ? source.duration : fallback.duration || 3000,
    actors: actors.map((actor) => ({ ...actor })),
    tracks,
    layers: normalizeLayers(source.layers, actors),
    labels: isRecord(source.labels) ? { ...source.labels } : undefined,
    loop: source.loop || undefined,
  };
}

function normalizedScenes(source, base) {
  const inputs = Array.isArray(source.scenes) && source.scenes.length ? source.scenes : [source];
  const used = new Set();
  let nextId = 1;
  return inputs.filter(isRecord).map((scene, index) => {
    let id = typeof scene.id === "string" && scene.id.trim() ? scene.id.trim() : "";
    while (!id || used.has(id)) id = `scene-${nextId++}`;
    used.add(id);
    const fallback = inputs.length === 1 ? base : { duration: source.duration || base.duration || 3000, actors: [] };
    const name = typeof scene.name === "string" && scene.name.trim() ? scene.name.trim() : `Scene ${index + 1}`;
    return normalizeScene(scene, fallback, id, name);
  });
}

export function normalizeMotionDocument(input, fallback = {}) {
  const source = isRecord(input) ? input : {};
  const base = isRecord(fallback) ? fallback : {};
  const scenes = normalizedScenes(source, base);
  const active = scenes.find((scene) => scene.id === source.activeSceneId) || scenes[0];
  const shared = {
    ...base,
    ...source,
    schemaVersion: MOTION_DOCUMENT_VERSION,
    fps: Number.isFinite(source.fps) && source.fps >= 1 ? Math.min(120, Math.round(source.fps)) : base.fps || 24,
    stageColor: typeof source.stageColor === "string" ? source.stageColor : base.stageColor || "#ffffff",
    library: normalizeLibrary(source.library ?? base.library),
    scenes,
    editingSymbolId: undefined,
    symbolEditStack: undefined,
  };
  return applyScene(shared, active);
}

function serializeTracks(tracks) {
  return Object.fromEntries(Object.entries(tracks || {}).map(([name, keyframes]) => [
    name,
    keyframes.map((keyframe) => Object.fromEntries(Object.entries(keyframe).filter(([key]) => !key.startsWith("_")))),
  ]));
}

export function serializeMotionDocument(doc) {
  const contextual = doc.editingSymbolId ? syncEditingSymbol(doc) : doc;
  const synced = syncActiveScene(contextual);
  const library = synced.library.map((symbol) => ({
    ...symbol,
    timeline: { ...symbol.timeline, tracks: serializeTracks(symbol.timeline.tracks) },
  }));
  return {
    ...synced,
    editingSymbolId: undefined,
    symbolEditStack: undefined,
    library,
    schemaVersion: MOTION_DOCUMENT_VERSION,
    tracks: serializeTracks(synced.tracks),
    scenes: synced.scenes.map((scene) => ({ ...scene, tracks: serializeTracks(scene.tracks) })),
  };
}
