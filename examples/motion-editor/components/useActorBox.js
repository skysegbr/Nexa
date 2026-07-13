// Move/resize gesture for the selected actor (selection tool): the drag
// mutates LOCAL state for live preview and commits a single updateActor
// (one undo step) on release. `mode` is "move" or a corner ("nw", "ne",
// "sw", "se").

import { useState } from "/dist/nexa.js";

const MIN_SIZE = 12;

export function useActorBox({ onCommit }) {
  const [drag, setDrag] = useState(null); // { id, mode, startPoint, startBox, box }

  const start = (event, actor, mode, stagePoint) => {
    event.stopPropagation();
    const startBox = { x: actor.x, y: actor.y, w: actor.w, h: actor.h };
    setDrag({ id: actor.id, mode, startPoint: stagePoint(event), startBox, box: startBox });
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch {}
  };

  const move = (event, stagePoint) => {
    if (!drag) return;
    const point = stagePoint(event);
    const dx = Math.round(point.x - drag.startPoint.x);
    const dy = Math.round(point.y - drag.startPoint.y);
    const { x, y, w, h } = drag.startBox;
    let box;

    if (drag.mode === "move") {
      box = { x: x + dx, y: y + dy, w, h };
    } else {
      const west = drag.mode.includes("w");
      const north = drag.mode.includes("n");
      const nextW = Math.max(MIN_SIZE, west ? w - dx : w + dx);
      const nextH = Math.max(MIN_SIZE, north ? h - dy : h + dy);
      box = {
        x: west ? x + (w - nextW) : x,
        y: north ? y + (h - nextH) : y,
        w: nextW,
        h: nextH,
      };
    }

    setDrag({ ...drag, box });
  };

  const end = () => {
    if (!drag) return;
    const { id, box, startBox } = drag;
    setDrag(null);
    if (box.x !== startBox.x || box.y !== startBox.y || box.w !== startBox.w || box.h !== startBox.h) {
      onCommit(id, box);
    }
  };

  // The in-flight box for the actor being dragged (null when idle).
  const boxOf = (id) => (drag && drag.id === id ? drag.box : null);

  return { start, move, end, boxOf, dragging: Boolean(drag) };
}
