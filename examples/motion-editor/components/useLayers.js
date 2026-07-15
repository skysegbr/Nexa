// Editor-side layer selection and chrome. Folder collapse and the familiar
// eye/lock/outline switches stay transient; hierarchy lives in the document.

import { useEffect, useState } from "/dist/nexa.js";
import { layerDescendantIds, layerForActor } from "./layerOps.js";
import { isPaintLayer } from "./layerTypes.js";

export function useLayers(doc) {
  const [selectedId, setSelectedId] = useState(doc.layers[0]?.id || null);
  const [flags, setFlags] = useState({});
  const selected = doc.layers.find((layer) => layer.id === selectedId) || doc.layers[0] || null;

  // Self-healing flag hygiene: layer ids are reused after deletion
  // (nextLayerId takes the lowest free number), so a stale entry from a
  // deleted layer would be reborn as an invisibly locked/hidden new layer.
  // Prune to the ids that actually exist whenever the document disagrees.
  useEffect(() => {
    const liveIds = new Set(doc.layers.map((layer) => layer.id));
    if (Object.keys(flags).some((id) => !liveIds.has(id))) {
      setFlags((current) => Object.fromEntries(Object.entries(current).filter(([id]) => liveIds.has(id))));
    }
  });
  const descendants = selected ? layerDescendantIds(doc.layers, selected.id) : new Set();
  const active = isPaintLayer(selected)
    ? selected
    : doc.layers.find((layer) => isPaintLayer(layer) && descendants.has(layer.id))
      || doc.layers.find(isPaintLayer);

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
