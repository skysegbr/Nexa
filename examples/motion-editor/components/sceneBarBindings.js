// App-level coordination when the active scene changes.

export function sceneBarBindings({ editor, layers, setActorSelection, playheadRef }) {
  const activate = (action) => (...args) => {
    playheadRef.current = 0;
    const id = action(...args);
    if (!id) return;
    setActorSelection(null);
    layers.reset();
  };
  return {
    onSelect: activate(editor.selectScene),
    onAdd: activate(editor.addScene),
    onDuplicate: activate(editor.duplicateScene),
    onDelete: activate(editor.deleteScene),
    onRename: editor.renameScene,
    onMove: editor.moveScene,
  };
}
