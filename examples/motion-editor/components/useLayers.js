// Editor-side selection and layer chrome. Which layer ROW is lit and which
// ACTOR is selected both live here — one source of truth, instead of the
// actor half living as a second copy in app.js and being hand-synced. Folder
// collapse and the eye/lock/outline switches stay transient; hierarchy lives
// in the document.

import { useEffect, useState } from "/dist/nexa.js";
import { layerDescendantIds, layerForActor } from "./layerOps.js";
import { isPaintLayer } from "./layerTypes.js";

export function useLayers(doc) {
  const [selectedId, setSelectedId] = useState(doc.layers[0]?.id || null);
  const [actorId, setActorId] = useState(null); // selected actor id | null
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

  // Select an actor — it and its layer row both light up.
  const selectActor = (id) => {
    const layer = layerForActor(doc, id);
    setActorId(id);
    if (layer) setSelectedId(layer.id);
  };

  // Light an actor's layer row WITHOUT selecting the actor — a keyframe or a
  // drag is the real selection then, so the actor inspector must stay closed.
  const selectActorRow = (id) => {
    const layer = layerForActor(doc, id);
    setActorId(null);
    if (layer) setSelectedId(layer.id);
  };

  const toggle = (id, key) =>
    setFlags((current) => ({ ...current, [id]: { ...current[id], [key]: !current[id]?.[key] } }));

  const reset = () => {
    setSelectedId(null);
    setActorId(null);
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
    actorId,
    flags,
    select: setSelectedId,
    setActor: setActorId,
    selectActor,
    selectActorRow,
    toggle,
    reset,
    drop,
  };
}
