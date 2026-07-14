// One row of the layers panel (the timeline's label column): Flash's eye
// (hide), padlock (lock) and outline square (show the layer as colored
// outlines), click to select the layer, double-click to rename inline,
// arrows to move the layer, and the keyframe/delete actions. Rows
// top→bottom paint back→front on the stage.

import { h, useState } from "/dist/nexa.js";
import { OUTLINE_COLORS } from "../data.js";

export function LayerCell({
  layer,
  layerIndex,
  layerCount,
  flags,
  active,
  onToggleHidden,
  onToggleLocked,
  onToggleOutline,
  onMoveLayer,
  onSelectLayer,
  onRenameLayer,
  onAddKeyframe,
  onDeleteLayer,
}) {
  const [renaming, setRenaming] = useState(null); // draft label | null

  const commitRename = () => {
    if (renaming === null) return;
    const label = renaming.trim();
    if (label) onRenameLayer(layer.id, label);
    setRenaming(null);
  };

  return h(
    "div",
    { className: `me-row-label${active ? " me-row-active" : ""}` },
    h(
      "button",
      {
        type: "button",
        className: `me-layer-toggle${flags.hidden ? " me-layer-off" : ""}`,
        title: flags.hidden ? "Show layer" : "Hide layer",
        ariaPressed: flags.hidden ? "true" : "false",
        onClick: () => onToggleHidden(layer.id),
      },
      flags.hidden ? "◌" : "👁",
    ),
    h(
      "button",
      {
        type: "button",
        className: `me-layer-toggle${flags.locked ? "" : " me-layer-off"}`,
        title: flags.locked ? "Unlock layer (stage editing)" : "Lock layer (blocks stage editing)",
        ariaPressed: flags.locked ? "true" : "false",
        onClick: () => onToggleLocked(layer.id),
      },
      flags.locked ? "🔒" : "🔓",
    ),
    h("button", {
      type: "button",
      className: `me-layer-square${flags.outline ? " me-layer-square-on" : ""}`,
      title: flags.outline ? "Show layer filled" : "Show layer as outlines",
      ariaPressed: flags.outline ? "true" : "false",
      style: { borderColor: OUTLINE_COLORS[layerIndex % OUTLINE_COLORS.length] },
      onClick: () => onToggleOutline(layer.id),
    }),
    renaming !== null
      ? h("input", {
          className: "me-rename",
          value: renaming,
          ref: (node) => node && node.focus(),
          onInput: (e) => setRenaming(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") commitRename();
            else if (e.key === "Escape") setRenaming(null);
          },
          onBlur: commitRename,
        })
      : h(
          "span",
          {
            className: "me-row-name",
            title: `${layer.name} — ${layer.actorIds.length} actor(s); click selects, double-click renames`,
            onClick: () => onSelectLayer(layer.id),
            onDblClick: () => setRenaming(layer.name),
          },
          layer.name,
        ),
    layer.actorIds.length > 1 && h("span", { className: "me-layer-count" }, layer.actorIds.length),
    h(
      "span",
      { className: "me-row-actions" },
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move layer up (bring forward)",
          disabled: layerIndex === 0,
          onClick: () => onMoveLayer(layer.id, -1),
        },
        "↑",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move layer down (send backward)",
          disabled: layerIndex === layerCount - 1,
          onClick: () => onMoveLayer(layer.id, 1),
        },
        "↓",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Add keyframe at the playhead",
          onClick: () => onAddKeyframe(layer.id),
        },
        "+",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add me-btn-remove",
          title: `Delete ${layer.name} and its ${layer.actorIds.length} actor(s)`,
          onClick: () => onDeleteLayer(layer.id),
        },
        "✕",
      ),
    ),
  );
}
