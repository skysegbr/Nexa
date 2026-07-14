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
import { tweenTranslation } from "./editorUtils.js";
import { pathAnchors, smoothPath } from "./smoothPath.js";
import { useStageCreate } from "./useStageCreate.js";
import { useActorBox } from "./useActorBox.js";
import { StageOverlay } from "./StageOverlay.js";
import { OnionSkin } from "./OnionSkin.js";
import { HANDLES, baseOf, actorStyle } from "./actorGeometry.js";

export function Stage({
  tl,
  doc,
  committedDoc,
  selected,
  actorSel,
  drawing,
  tool,
  fill,
  layerFlags,
  onion,
  playheadRef,
  onDrawPoint,
  onEditGuide,
  onCreateActor,
  onSelectActor,
  onUpdateActor,
  onKeyPosition,
}) {
  const stageRef = useRef(null);
  const tweenRef = useRef({ x: 0, y: 0 }); // tween offset at move-drag start

  const stagePoint = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const create = useStageCreate({ tool, fill, onCreate: onCreateActor, stagePoint });

  // Flash's auto-key: a MOVE gesture records the drop as a position
  // keyframe at the playhead (base + keyframe x/y + tween offset must land
  // on the drop point, so the actor doesn't jump on release). Resizing
  // still edits the actor's base box — keyframes don't tween w/h.
  const actorBox = useActorBox({
    onCommit: (id, box, mode) => {
      if (mode !== "move") return onUpdateActor(id, box);
      const base = doc.actors.find((actor) => actor.id === id);
      onKeyPosition(id, {
        x: Math.round(box.x + tweenRef.current.x - base.x),
        y: Math.round(box.y + tweenRef.current.y - base.y),
      });
    },
  });

  // The live document view: the actor being moved/resized previews from the
  // local drag box.
  const liveActor = (actor) => {
    const box = actorBox.boxOf(actor.id);
    return box ? { ...actor, ...box } : actor;
  };
  const actorsById = Object.fromEntries(doc.actors.map((actor) => [actor.id, liveActor(actor)]));
  const selectedActor = actorSel ? actorsById[actorSel] : null;

  const actorPointerDown = (event, actor) => {
    if (tool !== "select" || drawing) return;
    onSelectActor(actor.id);
    tweenRef.current = tweenTranslation(event.currentTarget);
    actorBox.start(event, actorsById[actor.id], "move", stagePoint);
  };

  // Locked layers keep their selection outline but reject every stage
  // gesture (move/resize) — Flash's padlock. Hidden layers keep their
  // track() binding so the controller stays warm; visibility:hidden also
  // makes them unclickable for free.
  const selectedFlags = actorSel ? layerFlags[actorSel] || {} : {};

  const stagePointerDown = (event) => {
    // Empty-stage click with the selection tool clears the actor selection.
    if (tool === "select" && !drawing && event.target === stageRef.current) {
      onSelectActor(null);
    }
    create.onPointerDown(event);
  };

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
      onPointerDown: stagePointerDown,
      onPointerMove: (event) => {
        create.onPointerMove(event);
        actorBox.move(event, stagePoint);
      },
      onPointerUp: () => {
        create.onPointerUp();
        actorBox.end();
      },
    },
    onion.on && h(OnionSkin, { doc: committedDoc, playheadRef, count: onion.count, layerFlags }),
    doc.actors.map((actor) => {
      const live = actorsById[actor.id];
      const flags = layerFlags[actor.id] || {};
      const style = actorStyle(live);
      if (flags.hidden) style.visibility = "hidden";
      return h(
        "div",
        {
          key: actor.id,
          className:
            `me-actor me-kind-${actor.kind} me-actor-${actor.id}` +
            (actorSel === actor.id ? " me-actor-selected" : "") +
            (flags.locked ? " me-actor-locked" : ""),
          style,
          ref: tl.track(actor.id),
          onPointerDown: (e) => actorPointerDown(e, actor),
        },
        actor.kind === "text" ? actor.text : "",
      );
    }),
    // Resize handles for the selected actor (selection tool only).
    selectedActor &&
      tool === "select" &&
      !drawing &&
      !selectedFlags.locked &&
      !selectedFlags.hidden &&
      HANDLES.map((corner) =>
        h("div", {
          key: corner,
          className: `me-handle me-handle-${corner}`,
          style: {
            left: `${corner.includes("w") ? selectedActor.x : selectedActor.x + selectedActor.w}px`,
            top: `${corner.includes("n") ? selectedActor.y : selectedActor.y + selectedActor.h}px`,
          },
          onPointerDown: (e) => actorBox.start(e, selectedActor, corner, stagePoint),
        }),
      ),
    h(StageOverlay, {
      guides,
      preview,
      drawingPoints: drawing ? drawing.points : [],
      draftBox: create.draftBox,
      draftKind: tool,
      anchors: editableAnchors,
      anchorsBase: editableBase,
      onAnchorDown: startAnchorDrag,
      onAnchorMove: moveAnchorDrag,
      onAnchorUp: endAnchorDrag,
    }),
  );
}
