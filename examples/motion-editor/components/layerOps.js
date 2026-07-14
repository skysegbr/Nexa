// Pure layer model. Layers own paint order and actor membership; actors keep
// their individual runtime tracks. This separation is what lets a Flash-like
// layer hold several independent objects without changing nexa-motion.

function nextLayerId(layers) {
  const used = new Set(layers.map((layer) => layer.id));
  let index = 1;
  while (used.has(`layer-${index}`)) index += 1;
  return `layer-${index}`;
}

export function normalizeLayers(input, actors) {
  const hasLayerInput = Array.isArray(input) && input.length > 0;
  const actorIds = new Set(actors.map((actor) => actor.id));
  const assigned = new Set();
  const usedLayers = new Set();
  const layers = [];

  for (const candidate of Array.isArray(input) ? input : []) {
    if (!candidate || typeof candidate !== "object") continue;
    let id = typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.trim() : "";
    if (!id || usedLayers.has(id)) id = nextLayerId(layers);
    usedLayers.add(id);
    const members = [];
    for (const actorId of Array.isArray(candidate.actorIds) ? candidate.actorIds : []) {
      if (!actorIds.has(actorId) || assigned.has(actorId)) continue;
      assigned.add(actorId);
      members.push(actorId);
    }
    layers.push({
      ...candidate,
      id,
      name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : `Layer ${layers.length + 1}`,
      type: candidate.type || "normal",
      actorIds: members,
    });
  }

  for (const actor of actors) {
    if (assigned.has(actor.id)) continue;
    const id = nextLayerId(layers);
    layers.push({ id, name: actor.label || `Layer ${layers.length + 1}`, type: "normal", actorIds: [actor.id] });
  }
  if (!layers.length) return [{ id: "layer-1", name: "Layer 1", type: "normal", actorIds: [] }];
  // v2 actor order painted back→front; Flash's layer panel is front→back.
  return hasLayerInput ? layers : layers.reverse();
}

export const layerForActor = (doc, actorId) =>
  (doc.layers || []).find((layer) => layer.actorIds.includes(actorId)) || null;

export function orderedActors(doc) {
  const byId = new Map(doc.actors.map((actor) => [actor.id, actor]));
  const ordered = [];
  // DOM paints later nodes on top, so traverse Flash's front→back stack in
  // reverse while preserving each layer's internal actor order.
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

export function addLayerDoc(doc, name) {
  const id = nextLayerId(doc.layers || []);
  const layer = { id, name: name || `Layer ${(doc.layers || []).length + 1}`, type: "normal", actorIds: [] };
  return { id, doc: { ...doc, layers: [layer, ...(doc.layers || [])] } };
}

export function moveLayerDoc(doc, id, delta) {
  const index = doc.layers.findIndex((layer) => layer.id === id);
  if (index === -1) return null;
  const target = Math.max(0, Math.min(doc.layers.length - 1, index + delta));
  if (target === index) return null;
  const layers = [...doc.layers];
  const [moved] = layers.splice(index, 1);
  layers.splice(target, 0, moved);
  return { ...doc, layers };
}

export function moveActorToLayerDoc(doc, actorId, layerId) {
  const target = doc.layers.find((layer) => layer.id === layerId);
  if (!target || !doc.actors.some((actor) => actor.id === actorId) || target.actorIds.includes(actorId)) return null;
  const layers = doc.layers.map((layer) => ({
    ...layer,
    actorIds: layer.id === layerId
      ? [...layer.actorIds.filter((id) => id !== actorId), actorId]
      : layer.actorIds.filter((id) => id !== actorId),
  }));
  return { ...doc, layers };
}

export function arrangeActorInLayerDoc(doc, actorId, delta) {
  const layer = layerForActor(doc, actorId);
  if (!layer) return null;
  const index = layer.actorIds.indexOf(actorId);
  const target = Math.max(
    0,
    Math.min(layer.actorIds.length - 1, delta === Infinity ? layer.actorIds.length - 1 : delta === -Infinity ? 0 : index + delta),
  );
  if (target === index) return null;
  const actorIds = [...layer.actorIds];
  const [moved] = actorIds.splice(index, 1);
  actorIds.splice(target, 0, moved);
  return { ...doc, layers: doc.layers.map((entry) => (entry.id === layer.id ? { ...entry, actorIds } : entry)) };
}

export function deleteLayerDoc(doc, layerId) {
  const layer = doc.layers.find((entry) => entry.id === layerId);
  if (!layer) return null;
  const doomed = new Set(layer.actorIds);
  const tracks = { ...doc.tracks };
  doomed.forEach((actorId) => delete tracks[actorId]);
  let layers = doc.layers.filter((entry) => entry.id !== layerId);
  if (!layers.length) layers = [{ id: "layer-1", name: "Layer 1", type: "normal", actorIds: [] }];
  return { ...doc, layers, tracks, actors: doc.actors.filter((actor) => !doomed.has(actor.id)) };
}
