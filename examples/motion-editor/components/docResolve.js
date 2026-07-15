// Symbols + layer flags resolved once per render, memoized on [doc,
// layerFlags]. The stage and the onion ghosts both need every actor's
// symbol content and every layer's inherited hidden/locked/outline flags;
// doing it here — once, behind a memo — keeps a move/resize drag (which
// re-renders the stage on every pointermove, doc stable until commit) from
// re-walking the symbol library (was O(actors × library)) or the layer tree
// (was O(layers²)) each frame.

import { useMemo } from "/dist/nexa.js";
import { orderedActors, resolveAllLayerFlags } from "./layerOps.js";
import { resolveActor, symbolsById } from "./symbolOps.js";

export function useResolvedDoc(doc, layerFlags) {
  return useMemo(() => {
    const symbols = symbolsById(doc);
    return {
      symbols,
      resolvedActors: orderedActors(doc).map((actor) => resolveActor(doc, actor, symbols)),
      flagsByLayer: resolveAllLayerFlags(doc, layerFlags),
    };
  }, [doc, layerFlags]);
}
