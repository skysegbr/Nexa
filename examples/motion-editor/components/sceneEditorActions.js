// Scene transactions adapted to the editor's history and keyframe selection.

import {
  addSceneDoc,
  deleteSceneDoc,
  duplicateSceneDoc,
  moveSceneDoc,
  renameSceneDoc,
  selectSceneDoc,
} from "./sceneOps.js";

export function createSceneActions({ effective, setDoc, setSelected }) {
  const activate = (result) => {
    if (!result) return null;
    const next = result.doc || result;
    setDoc(next);
    setSelected([]);
    return result.id || next.activeSceneId;
  };

  return {
    selectScene: (id) => activate(selectSceneDoc(effective, id)),
    addScene: (name) => activate(addSceneDoc(effective, name)),
    duplicateScene: () => activate(duplicateSceneDoc(effective)),
    deleteScene: (id = effective.activeSceneId) => activate(deleteSceneDoc(effective, id)),
    renameScene: (id, name) => {
      const next = renameSceneDoc(effective, id, name);
      if (next) setDoc(next);
    },
    moveScene: (id, delta) => {
      const next = moveSceneDoc(effective, id, delta);
      if (next) setDoc(next);
    },
  };
}
