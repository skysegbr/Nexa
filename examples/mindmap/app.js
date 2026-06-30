import { h, render } from "/dist/nexa.js";
import { useMindmap } from "./components/useMindmap.js";
import { MindmapToolbar } from "./components/MindmapToolbar.js";
import { MindmapCanvas } from "./components/MindmapCanvas.js";

function App() {
  const {
    nodes, sizes,
    updateText, updatePosition, reportSize,
    addRoot, addChild, deleteNode, resetMindmap,
  } = useMindmap();

  return h(
    "div",
    { className: "mm-app" },
    h(MindmapToolbar, { nodeCount: nodes.length, onReset: resetMindmap }),
    h(MindmapCanvas, {
      nodes,
      sizes,
      onTextChange: updateText,
      onPositionChange: updatePosition,
      onAddChild: addChild,
      onAddRoot: addRoot,
      onDelete: deleteNode,
      onMeasure: reportSize,
    }),
  );
}

render(App, document.getElementById("app"));
