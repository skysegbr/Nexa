// Layer-domain callbacks consumed by TimelinePanel. app.js composes this
// adapter but does not own hierarchy or selection transactions.

import { layerDescendantIds } from "./layerOps.js";

export function layerTimelineBindings({ editor, layers, setActorSelection }) {
  const add = (type) => {
    const selected = editor.doc.layers.find((layer) => layer.id === layers.selectedId);
    const parentId = selected?.type === "folder" ? selected.id : undefined;
    const id = editor.addLayer(undefined, type, parentId);
    if (parentId && layers.flags[parentId]?.collapsed) layers.toggle(parentId, "collapsed");
    layers.select(id);
    setActorSelection(null);
    editor.clearSelection();
  };

  return {
    activeLayerId: layers.selectedId,
    layerFlags: layers.flags,
    onAddKeyframe: (id) => {
      setActorSelection(null);
      layers.select(id);
      editor.addLayerKeyframe(id);
    },
    onDeleteLayer: (id) => {
      const removedIds = layerDescendantIds(editor.doc.layers, id);
      const doomed = editor.doc.layers.filter((layer) => removedIds.has(layer.id)).flatMap((layer) => layer.actorIds);
      setActorSelection((current) => (doomed.includes(current) ? null : current));
      layers.drop(...removedIds);
      editor.deleteLayer(id);
    },
    onToggleHidden: (id) => layers.toggle(id, "hidden"),
    onToggleLocked: (id) => layers.toggle(id, "locked"),
    onToggleOutline: (id) => layers.toggle(id, "outline"),
    onToggleCollapsed: (id) => layers.toggle(id, "collapsed"),
    onMoveLayer: editor.moveLayer,
    onIndentLayer: editor.indentLayer,
    onOutdentLayer: editor.outdentLayer,
    onSelectLayer: (id) => {
      const layer = editor.doc.layers.find((entry) => entry.id === id);
      layers.select(id);
      setActorSelection(layer?.actorIds.length === 1 ? layer.actorIds[0] : null);
      editor.clearSelection();
    },
    onRenameLayer: (id, name) => editor.updateLayer(id, { name }),
    onAddLayer: () => add("normal"),
    onAddFolder: () => add("folder"),
  };
}
