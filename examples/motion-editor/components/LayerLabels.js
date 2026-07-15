// Fixed left side of the timeline: creation controls and the visible slice
// of the hierarchical layer tree.

import { h } from "/dist/nexa.js";
import {
  canIndentLayer,
  layerActorIds,
  layerDepth,
  layerSiblingPosition,
} from "./layerOps.js";
import { LayerCell } from "./LayerCell.js";

export function LayerLabels({ doc, layers, selectedLayerId, layerFlags, actions }) {
  return h(
    "div",
    { className: "me-track-labels" },
    h(
      "div",
      { className: "me-labels-spacer" },
      h("button", { type: "button", className: "me-new-layer", title: "New layer", onClick: actions.onAddLayer }, "+ layer"),
      h("button", { type: "button", className: "me-new-layer", title: "New layer folder", onClick: actions.onAddFolder }, "+ folder"),
      h("button", { type: "button", className: "me-new-layer", title: "Mask selected layer", onClick: actions.onAddMask }, "+ mask"),
      h("button", { type: "button", className: "me-new-layer", title: "New authoring guide", onClick: actions.onAddGuide }, "+ guide"),
    ),
    layers.map((layer) => {
      const position = layerSiblingPosition(doc.layers, layer.id);
      return h(LayerCell, {
        key: layer.id,
        layer,
        layerIndex: position.index,
        layerCount: position.count,
        depth: layerDepth(doc.layers, layer.id),
        actorCount: layerActorIds(doc, layer.id).length,
        canIndent: canIndentLayer(doc.layers, layer.id),
        flags: layerFlags[layer.id] || {},
        active: selectedLayerId === layer.id,
        ...actions,
      });
    }),
  );
}
