// Versioned motion-editor document boundary. Saved projects are editor data,
// not runtime specs: normalize them here before any hook or panel consumes
// them, and keep session-only fields out of files/localStorage.

import { normalizeLayers } from "./layerOps.js";

export const MOTION_DOCUMENT_VERSION = 5;

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
    };
  });
}

export function normalizeMotionDocument(input, fallback = {}) {
  const source = isRecord(input) ? input : {};
  const base = isRecord(fallback) ? fallback : {};
  const actors = Array.isArray(source.actors)
    ? source.actors.filter((actor) => isRecord(actor) && typeof actor.id === "string")
    : Array.isArray(base.actors)
      ? base.actors
      : [];
  const sourceTracks = isRecord(source.tracks) ? source.tracks : {};
  const tracks = {};

  for (const actor of actors) {
    const keyframes = sourceTracks[actor.id];
    tracks[actor.id] = Array.isArray(keyframes) ? keyframes.filter(isRecord).map((keyframe) => ({ ...keyframe })) : [];
  }

  return {
    ...base,
    ...source,
    schemaVersion: MOTION_DOCUMENT_VERSION,
    duration: Number.isFinite(source.duration) && source.duration >= 100 ? source.duration : base.duration || 3000,
    fps: Number.isFinite(source.fps) && source.fps >= 1 ? Math.min(120, Math.round(source.fps)) : base.fps || 24,
    stageColor: typeof source.stageColor === "string" ? source.stageColor : base.stageColor || "#ffffff",
    actors: actors.map((actor) => ({ ...actor })),
    tracks,
    layers: normalizeLayers(source.layers, actors),
    library: normalizeLibrary(source.library ?? base.library),
    labels: isRecord(source.labels) ? { ...source.labels } : undefined,
    loop: source.loop || undefined,
  };
}

export function serializeMotionDocument(doc) {
  const tracks = {};
  for (const [name, keyframes] of Object.entries(doc.tracks || {})) {
    tracks[name] = keyframes.map((keyframe) =>
      Object.fromEntries(Object.entries(keyframe).filter(([key]) => !key.startsWith("_"))),
    );
  }
  return { ...doc, schemaVersion: MOTION_DOCUMENT_VERSION, tracks };
}
