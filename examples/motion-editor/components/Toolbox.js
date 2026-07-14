// The vertical tool strip, Flash-style (adapted from drawEasyNexa's
// toolbar): selection, rectangle, ellipse and text tools, plus the fill
// swatch applied to newly created actors.

import { h } from "/dist/nexa.js";
import { TOOLS, FILLS } from "../data.js";
import { isVectorKind } from "./vectorGeometry.js";

export function Toolbox({ tool, onTool, fill, onFill, stroke, onStroke, strokeWidth, onStrokeWidth }) {
  const drawingVector = isVectorKind(tool);
  const activeColor = drawingVector ? stroke : fill;
  const chooseColor = drawingVector ? onStroke : onFill;
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
        className: `me-swatch${activeColor === color ? " me-swatch-active" : ""}`,
        title: color,
        ariaLabel: `${drawingVector ? "Stroke" : "Fill"} ${color}`,
        style: { background: color },
        onClick: () => chooseColor(color),
      }),
    ),
    h("div", { className: "me-toolbox-divider", ariaHidden: "true" }),
    h(
      "label",
      { className: "me-paint-control", title: "Fill color" },
      "F",
      h("input", { type: "color", value: fill, ariaLabel: "Fill color", onInput: (e) => onFill(e.target.value) }),
    ),
    h(
      "label",
      { className: "me-paint-control", title: "Stroke color" },
      "S",
      h("input", { type: "color", value: stroke, ariaLabel: "Stroke color", onInput: (e) => onStroke(e.target.value) }),
    ),
    h(
      "label",
      { className: "me-stroke-control", title: "Stroke width" },
      h("span", null, `${strokeWidth}px`),
      h("input", {
        type: "range",
        min: 1,
        max: 16,
        value: strokeWidth,
        ariaLabel: "Stroke width",
        onInput: (e) => onStrokeWidth(Number(e.target.value)),
      }),
    ),
  );
}
