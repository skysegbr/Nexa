// The vertical tool strip, Flash-style (adapted from drawEasyNexa's
// toolbar): selection, rectangle, ellipse and text tools, plus the fill
// swatch applied to newly created actors.

import { h } from "/dist/nexa.js";
import { TOOLS, FILLS } from "../data.js";

export function Toolbox({ tool, onTool, fill, onFill }) {
  return h(
    "nav",
    { className: "me-toolbox", ariaLabel: "Stage tools" },
    TOOLS.map((entry) =>
      h(
        "button",
        {
          key: entry.id,
          type: "button",
          className: `me-tool${tool === entry.id ? " me-tool-active" : ""}`,
          title: entry.label,
          ariaLabel: entry.label,
          ariaPressed: tool === entry.id ? "true" : "false",
          onClick: () => onTool(entry.id),
        },
        entry.icon,
      ),
    ),
    h("div", { className: "me-toolbox-divider", ariaHidden: "true" }),
    FILLS.map((color) =>
      h("button", {
        key: color,
        type: "button",
        className: `me-swatch${fill === color ? " me-swatch-active" : ""}`,
        title: color,
        ariaLabel: `Fill ${color}`,
        style: { background: color },
        onClick: () => onFill(color),
      }),
    ),
  );
}
