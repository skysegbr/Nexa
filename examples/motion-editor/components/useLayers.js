// Editor-side layer selection and chrome. Folder collapse and the familiar
// eye/lock/outline switches stay transient; hierarchy lives in the document.

import { useState } from "/dist/nexa.js";
import { layerDescendantIds, layerForActor } from "./layerOps.js";

export function useLayers(doc) {
  const [selectedId, setSelectedId] = useState(doc.layers[0]?.id || null);
  const [flags, setFlags] = useState({});
  const selected = doc.layers.find((layer) => layer.id === selectedId) || doc.layers[0] || null;
  const descendants = selected ? layerDescendantIds(doc.layers, selected.id) : new Set();
  const active = selected?.type === "normal"
    ? selected
    : doc.layers.find((layer) => layer.type === "normal" && descendants.has(layer.id))
      || doc.layers.find((layer) => layer.type === "normal");

  const selectActor = (actorId) => {
    const layer = layerForActor(doc, actorId);
    if (layer) setSelectedId(layer.id);
  };

  const toggle = (id, key) =>
    setFlags((current) => ({ ...current, [id]: { ...current[id], [key]: !current[id]?.[key] } }));

  const reset = () => {
    setSelectedId(null);
    setFlags({});
  };

  const drop = (...ids) => {
    const removed = new Set(ids);
    if (removed.has(selectedId)) setSelectedId(null);
    setFlags((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !removed.has(id))));
  };

  return {
    activeId: active?.id || null,
    selectedId: selected?.id || null,
    flags,
    select: setSelectedId,
    selectActor,
    toggle,
    reset,
    drop,
  };
}
