// Stage creation gestures: rubber-band boxes, click-to-place text, straight
// lines and freehand pencil paths. Every gesture previews locally and
// commits one actor on release.

import { useState } from "/dist/nexa.js";
import { capturePointer } from "./editorUtils.js";
import { vectorActorFromPoints } from "./vectorGeometry.js";

function normalizeBox(x1, y1, x2, y2) {
  return {
    x: Math.round(Math.min(x1, x2)),
    y: Math.round(Math.min(y1, y2)),
    w: Math.round(Math.abs(x2 - x1)),
    h: Math.round(Math.abs(y2 - y1)),
  };
}

export function useStageCreate({ tool, fill, stroke, strokeWidth, onCreate, stagePoint }) {
  const [createDraft, setCreateDraft] = useState(null); // { points: [{ x, y }] }

  const active = ["rect", "ellipse", "text", "line", "pencil"].includes(tool);

  const onPointerDown = (event) => {
    if (!active) return false;
    if (tool === "text") {
      const point = stagePoint(event);
      onCreate({ kind: "text", x: Math.round(point.x), y: Math.round(point.y), w: 120, h: 34, fill, text: "Text" });
      return true;
    }
    const point = stagePoint(event);
    setCreateDraft({ points: [point] });
    capturePointer(event);
    return true;
  };

  const onPointerMove = (event) => {
    if (!createDraft) return;
    const point = stagePoint(event);
    if (tool === "pencil") {
      const last = createDraft.points[createDraft.points.length - 1];
      if (Math.hypot(point.x - last.x, point.y - last.y) >= 3) {
        setCreateDraft({ points: [...createDraft.points, point] });
      }
    } else {
      setCreateDraft({ points: [createDraft.points[0], point] });
    }
  };

  const onPointerUp = () => {
    if (!createDraft) return;
    const points = createDraft.points;
    setCreateDraft(null);
    if (tool === "line" || tool === "pencil") {
      const actor = vectorActorFromPoints(tool, points, { stroke, strokeWidth });
      if (actor) onCreate(actor);
      return;
    }
    if (points.length < 2) return;
    const box = normalizeBox(points[0].x, points[0].y, points[1].x, points[1].y);
    // Ignore accidental clicks — a real shape needs some size.
    if (box.w >= 8 && box.h >= 8) {
      onCreate({ kind: tool, ...box, fill });
    }
  };

  const draftBox = createDraft
    && (tool === "rect" || tool === "ellipse")
    ? normalizeBox(
        createDraft.points[0].x,
        createDraft.points[0].y,
        createDraft.points[createDraft.points.length - 1].x,
        createDraft.points[createDraft.points.length - 1].y,
      )
    : null;
  const draftVector = createDraft && (tool === "line" || tool === "pencil")
    ? vectorActorFromPoints(tool, createDraft.points, { stroke, strokeWidth })
    : null;

  return { active, draftBox, draftVector, onPointerDown, onPointerMove, onPointerUp };
}
