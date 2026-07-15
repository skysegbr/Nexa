// Selection/playhead coordination around MovieClip context navigation.

export function symbolContextBindings({ editor, layers, setActorSelection, playheadRef }) {
  // Reset only AFTER the navigation succeeded — a rejected enter/exit
  // (cycle guard, not editing) must not zero the parked playhead.
  const navigate = (action) => (...args) => {
    const id = action(...args);
    if (!id) return;
    playheadRef.current = 0;
    setActorSelection(null);
    layers.reset();
  };
  return { enter: navigate(editor.enterSymbol), exit: navigate(editor.exitSymbol) };
}
