// Layer-type semantics shared by schema, stage and code publication.

export const LAYER_TYPES = new Set(["normal", "folder", "mask", "guide"]);

export const normalizeLayerType = (type) => (LAYER_TYPES.has(type) ? type : "normal");
export const isLayerContainer = (layer) => layer?.type === "folder" || layer?.type === "mask";
export const isPaintLayer = (layer) => Boolean(layer) && layer.type !== "folder";

export function ancestorLayer(doc, layerId, predicate) {
  const byId = new Map(doc.layers.map((layer) => [layer.id, layer]));
  let current = byId.get(layerId);
  while (current?.parentId) {
    current = byId.get(current.parentId);
    if (current && predicate(current)) return current;
  }
  return null;
}

export const maskForLayer = (doc, layerId) => ancestorLayer(doc, layerId, (layer) => layer.type === "mask");

export function isPublishedActor(doc, actorId) {
  const layer = doc.layers.find((entry) => entry.actorIds.includes(actorId));
  return !layer || (layer.type !== "guide" && layer.type !== "mask");
}

export const publishedTrackEntries = (doc) =>
  Object.entries(doc.tracks).filter(([actorId]) => isPublishedActor(doc, actorId));
