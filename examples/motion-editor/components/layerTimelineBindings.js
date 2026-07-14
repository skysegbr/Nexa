// Layer-domain callbacks consumed by TimelinePanel. app.js composes this
// adapter but does not own the layer business rules.

export function layerTimelineBindings({ editor, layers, setActorSelection }) {
  return {
    activeLayerId: layers.activeId,
    layerFlags: layers.flags,
    onAddKeyframe: (id) => {
      setActorSelection(null);
      layers.select(id);
      editor.addLayerKeyframe(id);
    },
    onDeleteLayer: (id) => {
      const doomed = editor.doc.layers.find((layer) => layer.id === id)?.actorIds || [];
      setActorSelection((current) => (doomed.includes(current) ? null : current));
      layers.drop(id);
      editor.deleteLayer(id);
    },
    onToggleHidden: (id) => layers.toggle(id, "hidden"),
    onToggleLocked: (id) => layers.toggle(id, "locked"),
    onToggleOutline: (id) => layers.toggle(id, "outline"),
    onMoveLayer: editor.moveLayer,
    onSelectLayer: (id) => {
      const layer = editor.doc.layers.find((entry) => entry.id === id);
      layers.select(id);
      setActorSelection(layer?.actorIds.length === 1 ? layer.actorIds[0] : null);
      editor.clearSelection();
    },
    onRenameLayer: (id, name) => editor.updateLayer(id, { name }),
    onAddLayer: () => {
      const id = editor.addLayer();
      layers.select(id);
      setActorSelection(null);
      editor.clearSelection();
    },
  };
}
