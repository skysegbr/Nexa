// One row of the layers panel (the timeline's label column): Flash's eye
// (hide), padlock (lock) and outline square (show the layer as colored
// outlines), click to select the layer, double-click to rename inline,
// arrows to move the layer, and the keyframe/delete actions. Rows
// top→bottom paint front→back on the stage.

import { h, useState } from "/dist/nexa.js";
import { isLayerContainer } from "./layerTypes.js";
import { OUTLINE_COLORS } from "../data.js";

export function LayerCell({
  layer,
  layerIndex,
  layerCount,
  depth,
  actorCount,
  canIndent,
  flags,
  active,
  onToggleHidden,
  onToggleLocked,
  onToggleOutline,
  onToggleCollapsed,
  onMoveLayer,
  onIndentLayer,
  onOutdentLayer,
  onSelectLayer,
  onRenameLayer,
  onAddKeyframe,
  onDeleteLayer,
}) {
  const [renaming, setRenaming] = useState(null); // draft label | null
  const [actionsOpen, setActionsOpen] = useState(false);
  const runAction = (action) => {
    setActionsOpen(false);
    action();
  };

  const commitRename = () => {
    if (renaming === null) return;
    const label = renaming.trim();
    if (label) onRenameLayer(layer.id, label);
    setRenaming(null);
  };

  return h(
    "div",
    {
      className: `me-row-label me-row-${layer.type}${active ? " me-row-active" : ""}`,
      style: { paddingLeft: `${4 + depth * 14}px` },
    },
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
    isLayerContainer(layer)
      ? h(
          "button",
          {
            type: "button",
            className: "me-folder-toggle",
            title: flags.collapsed ? "Expand folder" : "Collapse folder",
            ariaExpanded: flags.collapsed ? "false" : "true",
            onClick: () => onToggleCollapsed(layer.id),
          },
          flags.collapsed ? "▸" : "▾",
        )
      : h("button", {
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
            title: `${layer.name} — ${actorCount} actor(s); click selects, double-click renames`,
            onClick: () => onSelectLayer(layer.id),
            onDblClick: () => setRenaming(layer.name),
          },
          layer.type === "folder" ? `📁 ${layer.name}`
            : layer.type === "mask" ? `◩ ${layer.name}`
              : layer.type === "guide" ? `⌖ ${layer.name}` : layer.name,
        ),
    actorCount > 1 && h("span", { className: "me-layer-count" }, actorCount),
    h(
      "button",
      {
        type: "button",
        className: "me-layer-more",
        title: `${layer.name} actions`,
        ariaExpanded: actionsOpen ? "true" : "false",
        onClick: () => setActionsOpen((open) => !open),
      },
      "…",
    ),
    h(
      "span",
      { className: `me-row-actions${actionsOpen ? " me-row-actions-open" : ""}` },
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move layer up (bring forward)",
          disabled: layerIndex === 0,
          onClick: () => runAction(() => onMoveLayer(layer.id, -1)),
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
          onClick: () => runAction(() => onMoveLayer(layer.id, 1)),
        },
        "↓",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move into the folder or mask above",
          disabled: !canIndent,
          onClick: () => runAction(() => onIndentLayer(layer.id)),
        },
        "→",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Move out of folder",
          disabled: !layer.parentId,
          onClick: () => runAction(() => onOutdentLayer(layer.id)),
        },
        "←",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add",
          title: "Add keyframe at the playhead",
          onClick: () => runAction(() => onAddKeyframe(layer.id)),
        },
        "+",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn me-btn-add me-btn-remove",
          title: `Delete ${layer.name} and its ${actorCount} actor(s)`,
          onClick: () => runAction(() => onDeleteLayer(layer.id)),
        },
        "✕",
      ),
    ),
  );
}
