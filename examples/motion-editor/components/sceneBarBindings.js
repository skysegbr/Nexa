// App-level coordination when the active scene changes.

export function sceneBarBindings({ editor, layers, setActorSelection, playheadRef }) {
  // The view only resets AFTER the action really navigated — a rejected or
  // no-op action must not touch the playhead the user parked.
  const activate = (action) => (...args) => {
    const id = action(...args);
    if (!id) return;
    playheadRef.current = 0;
    setActorSelection(null);
    layers.reset();
  };
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
