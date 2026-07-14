// Transactions unique to Flash's special authoring layers.

import { addLayerDoc } from "./layerOps.js";
import { layerHasAncestorType, nextLayerId } from "./layerTree.js";

export function addMaskLayerDoc(doc, targetId) {
  const target = doc.layers.find((layer) =>
    layer.id === targetId && layer.type !== "mask" && !layerHasAncestorType(doc.layers, layer.id, "mask"));
  if (!target) return addLayerDoc(doc, undefined, "mask");
  const id = nextLayerId(doc.layers);
  const mask = {
    id,
    name: `Mask ${doc.layers.filter((layer) => layer.type === "mask").length + 1}`,
    type: "mask",
    actorIds: [],
    ...(target.parentId ? { parentId: target.parentId } : {}),
  };
  const layers = [...doc.layers];
  const index = layers.indexOf(target);
  layers.splice(index, 0, mask);
  layers[index + 1] = { ...target, parentId: id };
  return { id, doc: { ...doc, layers } };
}
