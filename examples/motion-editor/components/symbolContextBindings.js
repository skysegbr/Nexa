// Selection/playhead coordination around MovieClip context navigation.

export function symbolContextBindings({ editor, layers, setActorSelection, playheadRef }) {
  const navigate = (action) => (...args) => {
    playheadRef.current = 0;
    const id = action(...args);
    if (!id) return;
    setActorSelection(null);
    layers.reset();
  };
  return { enter: navigate(editor.enterSymbol), exit: navigate(editor.exitSymbol) };
}
