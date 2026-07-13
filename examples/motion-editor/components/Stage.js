// The preview stage: the document's actors bound to the CURRENT controller
// via track() refs, an SVG overlay for motion guides (dashed, like Flash's
// guide layer) with draggable anchor handles, guide drawing by clicking,
// and actor CREATION with the shape tools (rubber-band drag / text click).
//
// Guide coordinates live in the actor's translate space; the overlay
// converts to stage space through the actor's document box (x/y/w/h),
// running the curve through the actor's CENTER — the closest thing to
// Flash's registration point.

import { h, useRef, useState } from "/dist/nexa.js";
import { pathAnchors, smoothPath } from "./smoothPath.js";
import { useStageCreate } from "./useStageCreate.js";

const baseOf = (actor) => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });

function actorStyle(actor) {
  const style = {
    left: `${actor.x}px`,
    top: `${actor.y}px`,
    width: `${actor.w}px`,
    height: `${actor.h}px`,
  };
  if (actor.kind === "text") {
    style.color = actor.fill;
    style.fontSize = `${actor.h * 0.8}px`;
    style.lineHeight = `${actor.h}px`;
  } else {
    style.background = actor.fill;
    style.borderRadius = actor.kind === "ellipse" ? "50%" : "10px";
  }
  return style;
}

export function Stage({ tl, doc, selected, drawing, tool, fill, onDrawPoint, onEditGuide, onCreateActor }) {
  const stageRef = useRef(null);
  const actorsById = Object.fromEntries(doc.actors.map((actor) => [actor.id, actor]));

  const stagePoint = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const create = useStageCreate({ tool, fill, onCreate: onCreateActor, stagePoint });

  const handleClick = (event) => {
    if (!drawing) return;
    const actor = actorsById[drawing.track];
    if (!actor) return;
    const base = baseOf(actor);
    const point = stagePoint(event);
    // Stage space → the actor's translate space, through its center.
    onDrawPoint({ x: Math.round(point.x - base.x), y: Math.round(point.y - base.y) });
  };

  // ── anchor dragging for the selected keyframe's existing guide ──
  // The drag mutates LOCAL state for live preview and commits a single
  // updateKeyframe (one undo step) on release.

  const [anchorDrag, setAnchorDrag] = useState(null); // { anchors, index } | null

  const editable =
    !drawing && !create.active && selected.length === 1 && doc.tracks[selected[0].track]?.[selected[0].index]?.path
      ? selected[0]
      : null;
  const editableKeyframe = editable && doc.tracks[editable.track][editable.index];
  const editableAnchors = anchorDrag ? anchorDrag.anchors : editableKeyframe ? pathAnchors(editableKeyframe.path) : null;
  const editableBase = editable && actorsById[editable.track] ? baseOf(actorsById[editable.track]) : null;

  const startAnchorDrag = (event, index) => {
    event.stopPropagation();
    setAnchorDrag({ anchors: pathAnchors(editableKeyframe.path), index });
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch {}
  };

  const moveAnchorDrag = (event) => {
    if (!anchorDrag) return;
    const point = stagePoint(event);
    const anchors = anchorDrag.anchors.map((anchor, i) =>
      i === anchorDrag.index
        ? { x: Math.round(point.x - editableBase.x), y: Math.round(point.y - editableBase.y) }
        : anchor,
    );
    setAnchorDrag({ ...anchorDrag, anchors });
  };

  const endAnchorDrag = () => {
    if (!anchorDrag) return;
    onEditGuide(editable.track, editable.index, smoothPath(anchorDrag.anchors));
    setAnchorDrag(null);
  };

  // Guides to display: every path keyframe of the selected tracks (or of the
  // track being drawn), positioned at the owning actor's base.
  const guideTracks = new Set(selected.map((entry) => entry.track));
  if (drawing) guideTracks.add(drawing.track);

  const guides = [];
  for (const trackName of guideTracks) {
    const actor = actorsById[trackName];
    if (!actor) continue;
    const base = baseOf(actor);
    for (const keyframe of doc.tracks[trackName] || []) {
      if (keyframe.path) {
        // The guide being anchor-dragged previews from the local anchors.
        const d = anchorDrag && keyframe === editableKeyframe ? smoothPath(anchorDrag.anchors) : keyframe.path;
        guides.push({ trackName, d, base });
      }
    }
  }

  const drawingActor = drawing && actorsById[drawing.track];
  const preview = drawing && drawing.points.length > 0 && drawingActor
    ? {
        base: baseOf(drawingActor),
        points: drawing.points.map((point) => `${point.x},${point.y}`).join(" "),
      }
    : null;

  return h(
    "section",
    {
      className: `me-stage${drawing || create.active ? " me-stage-drawing" : ""}`,
      ariaLabel: "Preview stage",
      ref: stageRef,
      onClick: handleClick,
      onPointerDown: create.onPointerDown,
      onPointerMove: create.onPointerMove,
      onPointerUp: create.onPointerUp,
    },
    doc.actors.map((actor) =>
      h(
        "div",
        {
          key: actor.id,
          className: `me-actor me-kind-${actor.kind} me-actor-${actor.id}`,
          style: actorStyle(actor),
          ref: tl.track(actor.id),
        },
        actor.kind === "text" ? actor.text : "",
      ),
    ),
    h(
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
        drawing.points.map((point, i) =>
          h("circle", {
            key: i,
            className: "me-guide-dot",
            cx: point.x + preview.base.x,
            cy: point.y + preview.base.y,
            r: 3,
          }),
        ),
      // Rubber-band preview while creating a shape.
      create.draftBox &&
        h(create.draftBox && tool === "ellipse" ? "ellipse" : "rect", {
          className: "me-create-preview",
          ...(tool === "ellipse"
            ? {
                cx: create.draftBox.x + create.draftBox.w / 2,
                cy: create.draftBox.y + create.draftBox.h / 2,
                rx: create.draftBox.w / 2,
                ry: create.draftBox.h / 2,
              }
            : { x: create.draftBox.x, y: create.draftBox.y, width: create.draftBox.w, height: create.draftBox.h }),
        }),
      // Draggable anchor handles for the selected keyframe's guide.
      editableAnchors &&
        editableBase &&
        editableAnchors.map((anchor, i) =>
          h("circle", {
            key: `a${i}`,
            className: "me-anchor",
            cx: anchor.x + editableBase.x,
            cy: anchor.y + editableBase.y,
            r: 6,
            onPointerDown: (e) => startAnchorDrag(e, i),
            onPointerMove: moveAnchorDrag,
            onPointerUp: endAnchorDrag,
          }),
        ),
    ),
  );
}
