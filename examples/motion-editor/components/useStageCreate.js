// Rubber-band creation of new actors on the stage (adapted from the
// drawEasyNexa canvas): with a shape tool active, drag to size a rectangle
// or ellipse; with the text tool, click to place. The draft box previews in
// the overlay and the actor is committed on release.

import { useState } from "/dist/nexa.js";
import { capturePointer } from "./editorUtils.js";

function normalizeBox(x1, y1, x2, y2) {
  return {
    x: Math.round(Math.min(x1, x2)),
    y: Math.round(Math.min(y1, y2)),
    w: Math.round(Math.abs(x2 - x1)),
    h: Math.round(Math.abs(y2 - y1)),
  };
}

export function useStageCreate({ tool, fill, onCreate, stagePoint }) {
  const [createDraft, setCreateDraft] = useState(null); // { x0, y0, x1, y1 }

  const active = tool === "rect" || tool === "ellipse" || tool === "text";

  const onPointerDown = (event) => {
    if (!active) return false;
    if (tool === "text") {
      const point = stagePoint(event);
      onCreate({ kind: "text", x: Math.round(point.x), y: Math.round(point.y), w: 120, h: 34, fill, text: "Text" });
      return true;
    }
    const point = stagePoint(event);
    setCreateDraft({ x0: point.x, y0: point.y, x1: point.x, y1: point.y });
    capturePointer(event);
    return true;
  };

  const onPointerMove = (event) => {
    if (!createDraft) return;
    const point = stagePoint(event);
    setCreateDraft({ ...createDraft, x1: point.x, y1: point.y });
  };

  const onPointerUp = () => {
    if (!createDraft) return;
    const box = normalizeBox(createDraft.x0, createDraft.y0, createDraft.x1, createDraft.y1);
    setCreateDraft(null);
    // Ignore accidental clicks — a real shape needs some size.
    if (box.w >= 8 && box.h >= 8) {
      onCreate({ kind: tool, ...box, fill });
    }
  };

  const draftBox = createDraft
    ? normalizeBox(createDraft.x0, createDraft.y0, createDraft.x1, createDraft.y1)
    : null;

  return { active, draftBox, onPointerDown, onPointerMove, onPointerUp };
}
