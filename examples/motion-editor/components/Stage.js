// The preview stage: the demo actors bound to the CURRENT controller via
// track() refs, plus an SVG overlay that shows the selected track's motion
// guides (dashed, like Flash's guide layer), captures clicks while a new
// guide is being drawn, and — when a single guide keyframe is selected —
// exposes the curve's anchor points as draggable handles (edits commit one
// history step on release).
//
// Guide coordinates live in the actor's translate space; the overlay
// converts to stage space through the actor's static layout box
// (offsetLeft/offsetTop are unaffected by transforms), running the curve
// through the actor's CENTER — the closest thing to Flash's registration
// point.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { pathAnchors, smoothPath } from "./smoothPath.js";

export function Stage({ tl, actors, doc, selected, drawing, onDrawPoint, onEditGuide }) {
  const stageRef = useRef(null);
  const actorRefs = useRef(new Map());
  const [bases, setBases] = useState({});

  // Measure each actor's untransformed layout box once mounted (static CSS,
  // so one pass is enough — re-run only when the actor set changes).
  useEffect(() => {
    const measured = {};
    for (const [id, element] of actorRefs.current) {
      measured[id] = {
        x: element.offsetLeft + element.offsetWidth / 2,
        y: element.offsetTop + element.offsetHeight / 2,
      };
    }
    setBases(measured);
  }, [actors.length]);

  const bindActor = (actor) => {
    const bindTimeline = tl.track(actor.id);
    return (node) => {
      bindTimeline(node);
      if (node) actorRefs.current.set(actor.id, node);
      else actorRefs.current.delete(actor.id);
    };
  };

  const stagePoint = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleClick = (event) => {
    if (!drawing) return;
    const base = bases[drawing.track];
    if (!base) return;
    const point = stagePoint(event);
    // Stage space → the actor's translate space, through its center.
    onDrawPoint({ x: Math.round(point.x - base.x), y: Math.round(point.y - base.y) });
  };

  // ── anchor dragging for the selected keyframe's existing guide ──
  // The drag mutates LOCAL state for live preview and commits a single
  // updateKeyframe (one undo step) on release.

  const [anchorDrag, setAnchorDrag] = useState(null); // { anchors, index } | null

  const editable =
    !drawing && selected.length === 1 && doc.tracks[selected[0].track]?.[selected[0].index]?.path
      ? selected[0]
      : null;
  const editableKeyframe = editable && doc.tracks[editable.track][editable.index];
  const editableAnchors = anchorDrag ? anchorDrag.anchors : editableKeyframe ? pathAnchors(editableKeyframe.path) : null;

  const startAnchorDrag = (event, index) => {
    event.stopPropagation();
    setAnchorDrag({ anchors: pathAnchors(editableKeyframe.path), index });
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch {}
  };

  const moveAnchorDrag = (event) => {
    if (!anchorDrag) return;
    const base = bases[editable.track];
    const point = stagePoint(event);
    const anchors = anchorDrag.anchors.map((anchor, i) =>
      i === anchorDrag.index
        ? { x: Math.round(point.x - base.x), y: Math.round(point.y - base.y) }
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
    const base = bases[trackName];
    if (!base) continue;
    for (const keyframe of doc.tracks[trackName] || []) {
      if (keyframe.path) {
        // The guide being anchor-dragged previews from the local anchors.
        const d = anchorDrag && keyframe === editableKeyframe ? smoothPath(anchorDrag.anchors) : keyframe.path;
        guides.push({ trackName, d, base });
      }
    }
  }

  const editableBase = editable ? bases[editable.track] : null;

  const preview = drawing && drawing.points.length > 0 && bases[drawing.track]
    ? {
        base: bases[drawing.track],
        points: drawing.points.map((point) => `${point.x},${point.y}`).join(" "),
      }
    : null;

  return h(
    "section",
    {
      className: `me-stage${drawing ? " me-stage-drawing" : ""}`,
      ariaLabel: "Preview stage",
      ref: stageRef,
      onClick: handleClick,
    },
    actors.map((actor) =>
      h(
        "div",
        { key: actor.id, className: `me-actor ${actor.className}`, ref: bindActor(actor) },
        actor.id === "star" ? "★" : "",
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
