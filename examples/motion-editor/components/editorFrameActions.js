// History-owning adapter around the pure Flash frame transforms.

import {
  clearLayerKeyframeDoc,
  insertLayerFrameDoc,
  insertLayerKeyframeDoc,
} from "./frameOps.js";

export function createEditorFrameActions({ effective, setDoc, setSelected, playheadRef, snap }) {
  const at = () => snap(playheadRef.current);

  const insertKeyframe = (layerId, blank = false) => {
    const result = insertLayerKeyframeDoc(effective, layerId, at(), blank);
    if (!result) return;
    if (result.doc !== effective) setDoc(result.doc);
    setSelected(result.selected);
  };

  return {
    addLayerKeyframe: (layerId) => insertKeyframe(layerId),
    insertLayerFrame: (layerId) => {
      const next = insertLayerFrameDoc(effective, layerId, at());
      if (next) setDoc(next);
    },
    insertLayerKeyframe: (layerId) => insertKeyframe(layerId),
    insertLayerBlankKeyframe: (layerId) => insertKeyframe(layerId, true),
    clearLayerKeyframe: (layerId) => {
      const next = clearLayerKeyframeDoc(effective, layerId, at());
      if (next) setDoc(next);
      if (next) setSelected([]);
    },
  };
}
