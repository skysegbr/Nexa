// Flash's scene strip: switch, rename, reorder, add, duplicate and delete.

import { h, useState } from "/dist/nexa.js";

function SceneName({ scene, onRename }) {
  const [draft, setDraft] = useState(scene.name);
  const commit = () => {
    const name = draft.trim();
    if (name) onRename(scene.id, name);
    else setDraft(scene.name);
  };
  return h("input", {
    className: "me-scene-name",
    value: draft,
    ariaLabel: "Scene name",
    onInput: (event) => setDraft(event.target.value),
    onBlur: commit,
    onKeyDown: (event) => {
      if (event.key === "Enter") event.currentTarget.blur();
      if (event.key === "Escape") setDraft(scene.name);
    },
  });
}

export function SceneBar({ doc, onSelect, onAdd, onDuplicate, onRename, onDelete, onMove }) {
  const active = doc.scenes.find((scene) => scene.id === doc.activeSceneId) || doc.scenes[0];
  const index = doc.scenes.indexOf(active);
  return h(
    "section",
    { className: "me-scenes", ariaLabel: "Scenes" },
    h("span", { className: "me-scenes-label" }, "Scene"),
    h(
      "select",
      { className: "me-scene-select", value: active.id, ariaLabel: "Active scene", onChange: (event) => onSelect(event.target.value) },
      doc.scenes.map((scene, sceneIndex) =>
        h("option", { key: scene.id, value: scene.id }, `${sceneIndex + 1}. ${scene.name}`)),
    ),
    h(SceneName, { key: active.id, scene: active, onRename }),
    h("span", { className: "me-scene-count" }, `${index + 1}/${doc.scenes.length}`),
    h("button", { type: "button", className: "me-btn me-scene-btn", disabled: index === 0, title: "Move scene earlier", onClick: () => onMove(active.id, -1) }, "←"),
    h("button", { type: "button", className: "me-btn me-scene-btn", disabled: index === doc.scenes.length - 1, title: "Move scene later", onClick: () => onMove(active.id, 1) }, "→"),
    h("button", { type: "button", className: "me-btn me-scene-btn", title: "New scene", onClick: onAdd }, "+ scene"),
    h("button", { type: "button", className: "me-btn me-scene-btn", title: "Duplicate scene", onClick: onDuplicate }, "⧉"),
    h("button", { type: "button", className: "me-btn me-scene-btn me-btn-danger", disabled: doc.scenes.length === 1, title: "Delete scene", onClick: () => onDelete(active.id) }, "✕"),
  );
}
