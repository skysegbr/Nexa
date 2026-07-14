// Editor-side layer selection and chrome. Visibility/lock/outline remain
// transient UI state; membership/order live in the versioned document.

import { useState } from "/dist/nexa.js";
import { layerForActor } from "./layerOps.js";

export function useLayers(doc) {
  const [selectedId, setSelectedId] = useState(doc.layers[0]?.id || null);
  const [flags, setFlags] = useState({});
  const activeId = doc.layers.some((layer) => layer.id === selectedId) ? selectedId : doc.layers[0]?.id || null;

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

  const drop = (id) => {
    if (selectedId === id) setSelectedId(null);
    setFlags(({ [id]: _removed, ...rest }) => rest);
  };

  return { activeId, flags, select: setSelectedId, selectActor, toggle, reset, drop };
}
