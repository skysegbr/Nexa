// Pure layer model. Folders group authoring rows; normal layers own actors.

import {
  layerDescendantIds,
  layerHasAncestorType,
  nextLayerId,
  parentKey,
  preorderLayers,
} from "./layerTree.js";
import { isLayerContainer, isPaintLayer, normalizeLayerType } from "./layerTypes.js";

export {
  layerDepth,
  layerDescendantIds,
  layerHasAncestorType,
  layerSiblingPosition,
  resolveAllLayerFlags,
  resolvedLayerFlags,
  visibleLayers,
} from "./layerTree.js";

export function normalizeLayers(input, actors) {
  const hasLayerInput = Array.isArray(input) && input.length > 0;
  const actorIds = new Set(actors.map((actor) => actor.id));
  const assigned = new Set();
  const usedLayers = new Set();
  let layers = [];

  for (const candidate of Array.isArray(input) ? input : []) {
    if (!candidate || typeof candidate !== "object") continue;
    let id = typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.trim() : "";
    if (!id || usedLayers.has(id)) id = nextLayerId(layers);
    usedLayers.add(id);
    const type = normalizeLayerType(candidate.type);
    const members = [];
    if (type !== "folder") {
      for (const actorId of Array.isArray(candidate.actorIds) ? candidate.actorIds : []) {
        if (!actorIds.has(actorId) || assigned.has(actorId)) continue;
        assigned.add(actorId);
        members.push(actorId);
      }
    }
    layers.push({
      ...candidate,
      id,
      name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : `Layer ${layers.length + 1}`,
      type,
      actorIds: members,
    });
  }

  const byId = new Map(layers.map((layer) => [layer.id, layer]));
  layers = layers.map((layer) => {
    const parent = byId.get(layer.parentId);
    if (!isLayerContainer(parent) || parent.id === layer.id) {
      const { parentId: _invalid, ...root } = layer;
      return root;
    }
    const seen = new Set([layer.id]);
    let cursor = parent;
    while (cursor) {
      if (seen.has(cursor.id) || (layer.type === "mask" && cursor.type === "mask")) {
        const { parentId: _cycle, ...root } = layer;
        return root;
      }
      seen.add(cursor.id);
      cursor = byId.get(cursor.parentId);
    }
    return layer;
  });

  for (const actor of actors) {
    if (assigned.has(actor.id)) continue;
    const id = nextLayerId(layers);
    layers.push({ id, name: actor.label || `Layer ${layers.length + 1}`, type: "normal", actorIds: [actor.id] });
  }
  if (!layers.some((layer) => layer.type === "normal")) {
    layers.unshift({ id: nextLayerId(layers), name: "Layer 1", type: "normal", actorIds: [] });
  }
  // v2 actor order painted back→front; Flash's layer panel is front→back.
  if (!hasLayerInput) layers.reverse();
  return preorderLayers(layers);
}

export const layerForActor = (doc, actorId) =>
  (doc.layers || []).find((layer) => layer.actorIds.includes(actorId)) || null;

export const layerActorIds = (doc, layerId) => {
  const ids = layerDescendantIds(doc.layers || [], layerId);
  return (doc.layers || []).filter((layer) => ids.has(layer.id)).flatMap((layer) => layer.actorIds);
};

export function orderedActors(doc) {
  const byId = new Map(doc.actors.map((actor) => [actor.id, actor]));
  const ordered = [];
  for (const layer of [...(doc.layers || [])].reverse()) {
    for (const actorId of layer.actorIds) {
      const actor = byId.get(actorId);
      if (actor) {
        ordered.push(actor);
        byId.delete(actorId);
      }
    }
  }
  return [...ordered, ...byId.values()];
}

export function addLayerDoc(doc, name, type = "normal", parentId) {
  const id = nextLayerId(doc.layers || []);
  const layerType = normalizeLayerType(type);
  const parent = doc.layers.find((layer) => layer.id === parentId && isLayerContainer(layer));
  const layer = {
    id,
    name: name || (layerType === "folder" ? `Folder ${doc.layers.filter((item) => item.type === "folder").length + 1}`
      : layerType === "mask" ? `Mask ${doc.layers.filter((item) => item.type === "mask").length + 1}`
        : layerType === "guide" ? `Guide ${doc.layers.filter((item) => item.type === "guide").length + 1}`
          : `Layer ${doc.layers.length + 1}`),
    type: layerType,
    actorIds: [],
    ...(parent ? { parentId: parent.id } : {}),
  };
  const layers = [...doc.layers];
  layers.splice(parent ? layers.indexOf(parent) + 1 : 0, 0, layer);
  return { id, doc: { ...doc, layers } };
}

export function moveLayerDoc(doc, id, delta) {
  const layer = doc.layers.find((entry) => entry.id === id);
  if (!layer) return null;
  const siblings = doc.layers.filter((entry) => parentKey(entry) === parentKey(layer));
  const index = siblings.indexOf(layer);
  const target = siblings[Math.max(0, Math.min(siblings.length - 1, index + delta))];
  if (!target || target === layer) return null;
  const movingIds = layerDescendantIds(doc.layers, id);
  const moving = doc.layers.filter((entry) => movingIds.has(entry.id));
  const layers = doc.layers.filter((entry) => !movingIds.has(entry.id));
  const targetIds = layerDescendantIds(layers, target.id);
  const targetIndexes = layers.flatMap((entry, i) => (targetIds.has(entry.id) ? [i] : []));
  const insertAt = delta < 0 ? Math.min(...targetIndexes) : Math.max(...targetIndexes) + 1;
  layers.splice(insertAt, 0, ...moving);
  return { ...doc, layers };
}

export function canIndentLayer(layers, id) {
  const layer = layers.find((entry) => entry.id === id);
  if (!layer) return false;
  const siblings = layers.filter((entry) => parentKey(entry) === parentKey(layer));
  const container = siblings[siblings.indexOf(layer) - 1];
  if (!isLayerContainer(container)) return false;
  if (layer.type !== "mask") return true;
  return container.type !== "mask" && !layerHasAncestorType(layers, container.id, "mask");
}

export function indentLayerDoc(doc, id) {
  const layer = doc.layers.find((entry) => entry.id === id);
  if (!layer) return null;
  const siblings = doc.layers.filter((entry) => parentKey(entry) === parentKey(layer));
  const folder = siblings[siblings.indexOf(layer) - 1];
  if (!canIndentLayer(doc.layers, id)) return null;
  const movingIds = layerDescendantIds(doc.layers, id);
  const moving = doc.layers.filter((entry) => movingIds.has(entry.id));
  moving[0] = { ...moving[0], parentId: folder.id };
  const layers = doc.layers.filter((entry) => !movingIds.has(entry.id));
  const folderIds = layerDescendantIds(layers, folder.id);
  const insertAt = Math.max(...layers.flatMap((entry, i) => (folderIds.has(entry.id) ? [i] : []))) + 1;
  layers.splice(insertAt, 0, ...moving);
  return { ...doc, layers };
}

export function outdentLayerDoc(doc, id) {
  const layer = doc.layers.find((entry) => entry.id === id);
  const folder = doc.layers.find((entry) => entry.id === layer?.parentId);
  if (!layer || !folder) return null;
  const movingIds = layerDescendantIds(doc.layers, id);
  const moving = doc.layers.filter((entry) => movingIds.has(entry.id));
  const { parentId: _oldParent, ...outdented } = moving[0];
  moving[0] = folder.parentId ? { ...outdented, parentId: folder.parentId } : outdented;
  const layers = doc.layers.filter((entry) => !movingIds.has(entry.id));
  const folderIds = layerDescendantIds(layers, folder.id);
  const insertAt = Math.max(...layers.flatMap((entry, i) => (folderIds.has(entry.id) ? [i] : []))) + 1;
  layers.splice(insertAt, 0, ...moving);
  return { ...doc, layers };
}

export function moveActorToLayerDoc(doc, actorId, layerId) {
  const target = doc.layers.find((layer) => layer.id === layerId && isPaintLayer(layer));
  if (!target || !doc.actors.some((actor) => actor.id === actorId) || target.actorIds.includes(actorId)) return null;
  return {
    ...doc,
    layers: doc.layers.map((layer) => ({
      ...layer,
      actorIds: layer.id === layerId
        ? [...layer.actorIds.filter((id) => id !== actorId), actorId]
        : layer.actorIds.filter((id) => id !== actorId),
    })),
  };
}

export function arrangeActorInLayerDoc(doc, actorId, delta) {
  const layer = layerForActor(doc, actorId);
  if (!layer) return null;
  const index = layer.actorIds.indexOf(actorId);
  const target = Math.max(0, Math.min(layer.actorIds.length - 1,
    delta === Infinity ? layer.actorIds.length - 1 : delta === -Infinity ? 0 : index + delta));
  if (target === index) return null;
  const actorIds = [...layer.actorIds];
  const [moved] = actorIds.splice(index, 1);
  actorIds.splice(target, 0, moved);
  return { ...doc, layers: doc.layers.map((entry) => (entry.id === layer.id ? { ...entry, actorIds } : entry)) };
}

export function deleteLayerDoc(doc, layerId) {
  if (!doc.layers.some((entry) => entry.id === layerId)) return null;
  const removedIds = layerDescendantIds(doc.layers, layerId);
  const doomed = new Set(doc.layers.filter((layer) => removedIds.has(layer.id)).flatMap((layer) => layer.actorIds));
  const tracks = { ...doc.tracks };
  doomed.forEach((actorId) => delete tracks[actorId]);
  let layers = doc.layers.filter((entry) => !removedIds.has(entry.id));
  if (!layers.some((layer) => layer.type === "normal")) {
    layers = [{ id: nextLayerId(layers), name: "Layer 1", type: "normal", actorIds: [] }, ...layers];
  }
  return { ...doc, layers, tracks, actors: doc.actors.filter((actor) => !doomed.has(actor.id)) };
}
