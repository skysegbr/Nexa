// Toolbox-owned state kept out of app.js: the root only consumes the props
// needed by the Toolbox and Stage domains.

import { useState } from "/dist/nexa.js";
import { FILLS } from "../data.js";

export function useDrawingTools() {
  const [tool, setTool] = useState("select");
  const [fill, setFill] = useState(FILLS[0]);
  const [stroke, setStroke] = useState("#e8ecff");
  const [strokeWidth, setStrokeWidth] = useState(3);

  return {
    tool,
    setTool,
    toolboxProps: {
      tool,
      onTool: setTool,
      fill,
      onFill: setFill,
      stroke,
      onStroke: setStroke,
      strokeWidth,
      onStrokeWidth: setStrokeWidth,
    },
    stageProps: { tool, fill, stroke, strokeWidth },
  };
}
