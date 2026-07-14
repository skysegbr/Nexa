// The stage's SVG overlay: dashed motion guides, the in-progress guide
// polyline with its dots, the rubber-band preview of a shape being created,
// and the draggable anchor handles of the selected guide.

import { h } from "/dist/nexa.js";

export function StageOverlay({
  guides,
  preview,
  drawingPoints,
  draftBox,
  draftVector,
  draftKind,
  anchors,
  anchorsBase,
  onAnchorDown,
  onAnchorMove,
  onAnchorUp,
}) {
  return h(
    "svg",
    { className: "me-guides", ariaHidden: "true" },
    guides.map((guide, i) =>
      h("path", {
        key: `${guide.trackName}-${i}`,
        className: "me-guide",
        d: guide.d,
        transform: `translate(${guide.base.x}, ${guide.base.y})`,
      }),
    ),
    preview &&
      h("polyline", {
        className: "me-guide me-guide-preview",
        points: preview.points,
        transform: `translate(${preview.base.x}, ${preview.base.y})`,
      }),
    preview &&
      drawingPoints.map((point, i) =>
        h("circle", {
          key: i,
          className: "me-guide-dot",
          cx: point.x + preview.base.x,
          cy: point.y + preview.base.y,
          r: 3,
        }),
      ),
    // Rubber-band preview while creating a shape.
    draftBox &&
      h(draftKind === "ellipse" ? "ellipse" : "rect", {
        className: "me-create-preview",
        ...(draftKind === "ellipse"
          ? {
              cx: draftBox.x + draftBox.w / 2,
              cy: draftBox.y + draftBox.h / 2,
              rx: draftBox.w / 2,
              ry: draftBox.h / 2,
            }
          : { x: draftBox.x, y: draftBox.y, width: draftBox.w, height: draftBox.h }),
      }),
    draftVector &&
      h("path", {
        className: "me-vector-preview",
        d: draftVector.path,
        transform: `translate(${draftVector.x}, ${draftVector.y})`,
        stroke: draftVector.stroke,
        "stroke-width": draftVector.strokeWidth,
      }),
    // Draggable anchor handles for the selected keyframe's guide.
    anchors &&
      anchorsBase &&
      anchors.map((anchor, i) =>
        h("circle", {
          key: `a${i}`,
          className: "me-anchor",
          cx: anchor.x + anchorsBase.x,
          cy: anchor.y + anchorsBase.y,
          r: 6,
          onPointerDown: (e) => onAnchorDown(e, i),
          onPointerMove: onAnchorMove,
          onPointerUp: onAnchorUp,
        }),
      ),
  );
}
