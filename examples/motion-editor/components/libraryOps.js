// The document's symbol library (Flash's Library panel): shape + paint
// saved from a stage actor, no keyframes; instances are ordinary actors.
// Plain per-render helper — the document itself lives in useEditorDoc.

export function libraryFor(editor, selectedActor, createActor) {
  const items = editor.doc.library || [];

  const save = () => {
    if (!selectedActor) return;
    const { label, kind, w, h, fill, text } = selectedActor;
    const symbol = { name: label, kind, w, h, fill, text };
    editor.setDocProp("library", [...items.filter((item) => item.name !== label), symbol]);
  };

  const place = (item) => {
    const offset = (editor.doc.actors.length % 6) * 24;
    createActor({ ...item, name: undefined, labelBase: item.name, x: 48 + offset, y: 48 + offset });
  };

  const remove = (name) =>
    editor.setDocProp("library", items.filter((item) => item.name !== name));

  return { items, save, place, remove };
}
