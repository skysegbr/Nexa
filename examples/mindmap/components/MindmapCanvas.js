import { h } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";
import { MindmapNode } from "./MindmapNode.js";

const DEFAULT_SIZE = { width: 200, height: 56 };
const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 1000;

export function MindmapCanvas({ nodes, sizes, onTextChange, onPositionChange, onAddChild, onAddRoot, onDelete, onMeasure }) {
  if (nodes.length === 0) {
    return h(
      "div",
      { className: "mm-canvas mm-canvas-empty" },
      h(
        "div",
        { className: "mm-canvas-empty-inner" },
        h("i", { className: "bi-diagram-3 mm-canvas-empty-icon" }),
        h("p", null, "Your mindmap is empty."),
        h("p", { className: "mm-canvas-empty-sub" }, "Start a new idea to begin mapping."),
        h(Button, { variant: "contained", onClick: onAddRoot }, "Start a new idea"),
      ),
    );
  }

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = nodes.filter((n) => n.parentId && byId[n.parentId]);

  return h(
    "div",
    { className: "mm-canvas" },
    h(
      "div",
      { className: "mm-canvas-grid", style: { width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` } },
      h(
        "svg",
        { className: "mm-links", width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        links.map((child) => {
          const parent = byId[child.parentId];
          const ps = sizes[parent.id] || DEFAULT_SIZE;
          const cs = sizes[child.id] || DEFAULT_SIZE;
          const x1 = parent.x + ps.width;
          const y1 = parent.y + ps.height / 2;
          const x2 = child.x;
          const y2 = child.y + cs.height / 2;
          const bend = Math.max(40, Math.abs(x2 - x1) / 2);
          const d = `M ${x1},${y1} C ${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
          return h("path", { key: child.id, d, className: "mm-link", style: { stroke: child.color } });
        }),
      ),
      nodes.map((node) =>
        h(MindmapNode, {
          key: node.id,
          node,
          isRoot: node.parentId === null,
          onTextChange,
          onPositionChange,
          onAddChild,
          onDelete,
          onMeasure,
        }),
      ),
    ),
  );
}
