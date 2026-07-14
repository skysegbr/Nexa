// Adapter between the editor hook and the pure linked-symbol operations.

import {
  convertActorToSymbolDoc,
  editActorOrSymbolDoc,
  removeSymbolDoc,
  resolveActor,
  symbolUsage,
} from "./symbolOps.js";

export function libraryFor(editor, selectedActor, createActor) {
  const items = editor.doc.library || [];
  const selected = selectedActor ? resolveActor(editor.doc, selectedActor) : null;

  const save = () => {
    if (!selectedActor) return;
    editor.transact((doc) => convertActorToSymbolDoc(doc, selectedActor.id));
  };

  const edit = (patch) => {
    if (selectedActor) editor.transact((doc) => editActorOrSymbolDoc(doc, selectedActor.id, patch));
  };

  const place = (item) => {
    const contextIds = [...(editor.doc.symbolEditStack || []), editor.doc.editingSymbolId].filter(Boolean);
    if (contextIds.includes(item.id)) return;
    const offset = (editor.doc.actors.length % 6) * 24;
    createActor({
      kind: item.kind,
      symbolId: item.id,
      labelBase: item.name,
      x: 48 + offset,
      y: 48 + offset,
      w: item.w,
      h: item.h,
    });
  };

  const remove = (id) => editor.transact((doc) => removeSymbolDoc(doc, id));

  return {
    items,
    selected,
    selectedSymbol: selectedActor?.symbolId ? items.find((item) => item.id === selectedActor.symbolId) : null,
    usage: symbolUsage(editor.doc),
    save,
    edit,
    place,
    remove,
  };
}
