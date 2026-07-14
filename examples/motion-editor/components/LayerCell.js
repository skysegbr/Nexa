// One row of the layers panel (the timeline's label column): Flash's eye
// (hide), padlock (lock) and outline square (show the layer as colored
// outlines), click to select the actor, double-click to rename inline,
// arrows to move the layer, and the keyframe/delete actions. Rows
// top→bottom paint back→front on the stage.

import { h, useState } from "/dist/nexa.js";
import { OUTLINE_COLORS } from "../data.js";

export function LayerCell({
  actor,
  layerIndex,
  layerCount,
  flags,
  active,
  onToggleHidden,
  onToggleLocked,
  onToggleOutline,
  onMoveLayer,
  onSelectActor,
  onRenameActor,
  onAddKeyframe,
  onDeleteActor,
}) {
  const [renaming, setRenaming] = useState(null); // draft label | null

  const commitRename = () => {
    if (renaming === null) return;
    const label = renaming.trim();
    if (label) onRenameActor(actor.id, label);
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
        onClick: () => onToggleHidden(actor.id),
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
        onClick: () => onToggleLocked(actor.id),
      },
      flags.locked ? "🔒" : "🔓",
    ),
    h("button", {
      type: "button",
      className: `me-layer-square${flags.outline ? " me-layer-square-on" : ""}`,
      title: flags.outline ? "Show layer filled" : "Show layer as outlines",
      ariaPressed: flags.outline ? "true" : "false",
      style: { borderColor: OUTLINE_COLORS[layerIndex % OUTLINE_COLORS.length] },
      onClick: () => onToggleOutline(actor.id),
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
            title: `${actor.label} — click selects, double-click renames`,
            onClick: () => onSelectActor(actor.id),
            onDblClick: () => setRenaming(actor.label),
          },
          actor.label,
        ),
    h(
      "span",
      { className: "me-row-actions" },
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move layer up (send backward)",
          disabled: layerIndex === 0,
          onClick: () => onMoveLayer(actor.id, -1),
        },
        "↑",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move layer down (bring forward)",
          disabled: layerIndex === layerCount - 1,
          onClick: () => onMoveLayer(actor.id, 1),
        },
        "↓",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Add keyframe at the playhead",
          onClick: () => onAddKeyframe(actor.id),
        },
        "+",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add me-btn-remove",
          title: `Delete ${actor.label} (actor + track)`,
          onClick: () => onDeleteActor(actor.id),
        },
        "✕",
      ),
    ),
  );
}
