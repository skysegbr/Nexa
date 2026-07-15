// App-level coordination when the active scene changes.

import { createResetAfter } from "./contextReset.js";

export function sceneBarBindings({ editor, layers, setActorSelection, playheadRef }) {
  const activate = createResetAfter({ setActorSelection, layers, playheadRef });
  return {
    onSelect: activate(editor.selectScene),
    // Button handlers receive the click event — never forward it into the
    // action, or the PointerEvent becomes the new scene's NAME.
    onAdd: activate(() => editor.addScene()),
    onDuplicate: activate(() => editor.duplicateScene()),
    onDelete: activate(() => editor.deleteScene()),
    onRename: editor.renameScene,
    onMove: editor.moveScene,
  };
}
