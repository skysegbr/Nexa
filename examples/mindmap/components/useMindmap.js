import { useCallback, useState } from "/dist/nexa.js";
import { BRANCH_COLORS, INITIAL_NODES } from "../data.js";

const CHILD_OFFSET_X = 280;
const CHILD_OFFSET_Y = 90;
const ROOT_START = { x: 60, y: 420 };

let counter = 0;
function nextId() {
  counter += 1;
  return `idea-${Date.now().toString(36)}-${counter}`;
}

export function useMindmap() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [sizes, setSizes] = useState({});

  const updateText = useCallback((id, text) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const updatePosition = useCallback((id, x, y) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const reportSize = useCallback((id, width, height) => {
    setSizes((prev) => (
      prev[id]?.width === width && prev[id]?.height === height
        ? prev
        : { ...prev, [id]: { width, height } }
    ));
  }, []);

  const addRoot = useCallback(() => {
    const id = nextId();
    setNodes((prev) => [
      ...prev,
      { id, parentId: null, text: "New idea", x: ROOT_START.x, y: ROOT_START.y, color: BRANCH_COLORS[0] },
    ]);
  }, []);

  const addChild = useCallback((parentId) => {
    setNodes((prev) => {
      const parent = prev.find((n) => n.id === parentId);
      if (!parent) return prev;
      const siblings = prev.filter((n) => n.parentId === parentId);
      const isBranch = parent.parentId === null;
      const color = isBranch ? BRANCH_COLORS[siblings.length % BRANCH_COLORS.length] : parent.color;
      const id = nextId();
      const node = {
        id,
        parentId,
        text: "New idea",
        x: parent.x + CHILD_OFFSET_X,
        y: parent.y - 60 + siblings.length * CHILD_OFFSET_Y,
        color,
      };
      return [...prev, node];
    });
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes((prev) => {
      const toRemove = new Set([id]);
      let added = true;
      while (added) {
        added = false;
        for (const n of prev) {
          if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n.id)) {
            toRemove.add(n.id);
            added = true;
          }
        }
      }
      return prev.filter((n) => !toRemove.has(n.id));
    });
  }, []);

  const resetMindmap = useCallback(() => {
    setNodes(INITIAL_NODES);
    setSizes({});
  }, []);

  return { nodes, sizes, updateText, updatePosition, reportSize, addRoot, addChild, deleteNode, resetMindmap };
}
