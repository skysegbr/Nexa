// Shared by sceneBarBindings and symbolContextBindings: wrap a navigation
// action (scene switch / MovieClip enter-exit) so the parked playhead, actor
// selection and layer view reset ONLY after the action actually moved —
// returned a truthy id. A rejected or no-op action (cycle guard, not editing,
// duplicate scene of nothing) must leave the user's parked state untouched.
export function createResetAfter({ setActorSelection, layers, playheadRef }) {
  return (action) => (...args) => {
    const id = action(...args);
    if (!id) return;
    playheadRef.current = 0;
    setActorSelection(null);
    layers.reset();
  };
}
