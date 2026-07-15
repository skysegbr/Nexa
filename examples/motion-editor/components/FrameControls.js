// Flash's frame commands, kept beside the transport with their familiar
// function-key shortcuts.

import { h } from "/dist/nexa.js";

const COMMANDS = [
  ["▯ frame", "Insert frame (F5)", "insertFrame"],
  ["● keyframe", "Insert keyframe (F6)", "insertKeyframe"],
  ["○ blank", "Insert blank keyframe (F7)", "insertBlankKeyframe"],
  ["⌫ clear", "Clear keyframe (Shift+F6)", "clearKeyframe"],
];

export function FrameControls({ actions }) {
  return h(
    "div",
    { className: "me-frame-controls", ariaLabel: "Frame commands" },
    h("span", { className: "me-frame-controls-label" }, "Frames"),
    COMMANDS.map(([label, title, action]) =>
      h(
        "button",
        {
          key: action,
          type: "button",
          className: "me-btn me-frame-command",
          title,
          disabled: actions.disabled,
          onClick: actions[action],
        },
        label,
      ),
    ),
  );
}
