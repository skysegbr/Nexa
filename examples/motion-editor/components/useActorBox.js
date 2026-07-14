// Move/resize gesture for the selected actor (selection tool): the drag
// mutates LOCAL state for live preview and commits ONCE (one undo step) on
// release — the owner routes the commit by `mode`, "move" or a corner
// ("nw", "ne", "sw", "se").

import { useState } from "/dist/nexa.js";
import { capturePointer } from "./editorUtils.js";

const MIN_SIZE = 12;

export function useActorBox({ onCommit }) {
  const [drag, setDrag] = useState(null); // { id, mode, startPoint, startBox, box }

  const start = (event, actor, mode, stagePoint) => {
    event.stopPropagation();
    const startBox = { x: actor.x, y: actor.y, w: actor.w, h: actor.h };
    setDrag({ id: actor.id, mode, startPoint: stagePoint(event), startBox, box: startBox });
    capturePointer(event);
  };

  const move = (event, stagePoint) => {
    if (!drag) return;
    const point = stagePoint(event);
    const dx = Math.round(point.x - drag.startPoint.x);
    const dy = Math.round(point.y - drag.startPoint.y);
    // A click is not a gesture: nothing moves until the pointer commits
    // past a small threshold — selecting an actor must never auto-key.
    if (!drag.armed && Math.hypot(dx, dy) < 4) return;
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

    setDrag({ ...drag, armed: true, box });
  };

  const end = () => {
    if (!drag) return;
    const { id, mode, box, startBox } = drag;
    setDrag(null);
    if (box.x !== startBox.x || box.y !== startBox.y || box.w !== startBox.w || box.h !== startBox.h) {
      onCommit(id, box, mode);
    }
  };

  // The in-flight box for the actor being dragged (null when idle).
  const boxOf = (id) => (drag && drag.id === id ? drag.box : null);

  return { start, move, end, boxOf, dragging: Boolean(drag) };
}
