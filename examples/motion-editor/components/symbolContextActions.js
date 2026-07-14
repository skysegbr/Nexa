// Enter/exit MovieClip editing through the same undoable editor document.

import { enterSymbolDoc, exitSymbolDoc } from "./symbolTimelineOps.js";

export function createSymbolContextActions({ effective, setDoc, setSelected }) {
  const navigate = (next) => {
    if (!next) return null;
    setDoc(next);
    setSelected([]);
    return next.editingSymbolId || next.activeSceneId;
  };
  return {
    enterSymbol: (id) => navigate(enterSymbolDoc(effective, id)),
    exitSymbol: () => navigate(exitSymbolDoc(effective)),
  };
}
