// The preview stage: actors bound to the CURRENT controller via track()
// refs, the motion-guide SVG overlay (drawing + draggable anchors), actor
// creation with the shape tools, and the Free Transform overlay. Guide
// coordinates live in the actor's translate space anchored on its center
// (see actorGeometry.baseOf).

import { h, useRef, useState } from "/dist/nexa.js";
import { tweenTranslation, capturePointer } from "./editorUtils.js";
import { pathAnchors, smoothPath } from "./smoothPath.js";
import { useStageCreate } from "./useStageCreate.js";
import { useActorBox } from "./useActorBox.js";
import { StageOverlay } from "./StageOverlay.js";
import { OnionSkin } from "./OnionSkin.js";
import { TransformOverlay } from "./TransformOverlay.js";
import { guidesFor } from "./stageGuides.js";
import { SelectionBox } from "./SelectionBox.js";
import { useMeasuredBox } from "./useMeasuredBox.js";
import { baseOf, stageActorStyle } from "./actorGeometry.js";
import { resolveActor } from "./symbolOps.js";
import { ActorArtwork } from "./ActorArtwork.js";
import { OUTLINE_COLORS } from "../data.js";

export function Stage({
  tl,
  doc,
  committedDoc,
  selected,
  actorSel,
  drawing,
  tool,
  fill,
  stroke,
  strokeWidth,
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

  const create = useStageCreate({ tool, fill, stroke, strokeWidth, onCreate: onCreateActor, stagePoint });

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
  const resolvedActors = doc.actors.map((actor) => resolveActor(doc, actor));
  const actorsById = Object.fromEntries(resolvedActors.map((actor) => [actor.id, liveActor(actor)]));
  const selectedActor = actorSel ? actorsById[actorSel] : null;

  const actorPointerDown = (event, actor) => {
    if (drawing) return;
    if (tool === "transform") {
      // Free Transform: clicking selects; the gestures live on the overlay.
      onSelectActor(actor.id);
      return;
    }
    if (tool !== "select") return;
    onSelectActor(actor.id);
    tweenRef.current = tweenTranslation(event.currentTarget);
    actorBox.start(event, actorsById[actor.id], "move", stagePoint);
  };

  // Locked layers keep their selection outline but reject every stage
  // gesture (move/resize) — Flash's padlock. Hidden layers keep their
  // track() binding so the controller stays warm; visibility:hidden also
  // makes them unclickable for free.
  const selectedFlags = actorSel ? layerFlags[actorSel] || {} : {};

  // Selection chrome lives on the MEASURED visual box (see SelectionBox).
  const selMeasured = useMeasuredBox(stageRef, tool === "select" && !drawing ? actorSel : null);

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

  const selectedKeyframe =
    selected.length === 1 &&
    doc.tracks[selected[0].track]?.find((keyframe) => keyframe._id === selected[0].id);
  const editable = !drawing && !create.active && selectedKeyframe?.path ? selected[0] : null;
  const editableKeyframe = editable ? selectedKeyframe : null;
  const editableAnchors = anchorDrag ? anchorDrag.anchors : editableKeyframe ? pathAnchors(editableKeyframe.path) : null;
  const editableBase = editable && actorsById[editable.track] ? baseOf(actorsById[editable.track]) : null;

  const startAnchorDrag = (event, index) => {
    event.stopPropagation();
    setAnchorDrag({ anchors: pathAnchors(editableKeyframe.path), index });
    capturePointer(event);
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
    onEditGuide(editable.track, editable.id, smoothPath(anchorDrag.anchors));
    setAnchorDrag(null);
  };

  const guides = guidesFor({ doc, selected, drawing, actorsById, anchorDrag, editableKeyframe });

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
      // The document's stage color replaces the CSS backdrop (the grid
      // lines stay, as translucent overlays).
      style: {
        backgroundColor: doc.stageColor || "#0d1226",
        backgroundImage:
          "linear-gradient(rgba(79, 124, 255, 0.08) 1px, transparent 1px)," +
          " linear-gradient(90deg, rgba(79, 124, 255, 0.08) 1px, transparent 1px)",
        backgroundSize: "32px 32px, 32px 32px",
      },
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
    resolvedActors.map((actor, layerIndex) => {
      const flags = layerFlags[actor.id] || {};
      return h(
        "div",
        {
          key: actor.id,
          className:
            `me-actor me-kind-${actor.kind} me-actor-${actor.id}` +
            (actorSel === actor.id ? " me-actor-selected" : "") +
            (flags.locked ? " me-actor-locked" : ""),
          style: stageActorStyle(actorsById[actor.id], flags, layerIndex),
          ref: tl.track(actor.id),
          onPointerDown: (e) => actorPointerDown(e, actor),
        },
        h(ActorArtwork, {
          actor,
          outlineColor: flags.outline ? OUTLINE_COLORS[layerIndex % OUTLINE_COLORS.length] : null,
        }),
      );
    }),
    // Selection rect + name tag + resize handles on the visual box.
    selectedActor &&
      selMeasured &&
      h(SelectionBox, {
        box: selMeasured,
        label: selectedActor.label,
        showHandles: !selectedFlags.locked && !selectedFlags.hidden,
        onHandleDown: (e, corner) => actorBox.start(e, selectedActor, corner, stagePoint),
      }),
    tool === "transform" &&
      selectedActor &&
      !drawing &&
      !selectedFlags.locked &&
      !selectedFlags.hidden &&
      h(TransformOverlay, {
        stageRef,
        actorId: actorSel,
        onCommit: (patch) => onKeyPosition(actorSel, patch),
      }),
    h(StageOverlay, {
      guides,
      preview,
      drawingPoints: drawing ? drawing.points : [],
      draftBox: create.draftBox,
      draftVector: create.draftVector,
      draftKind: tool,
      anchors: editableAnchors,
      anchorsBase: editableBase,
      onAnchorDown: startAnchorDrag,
      onAnchorMove: moveAnchorDrag,
      onAnchorUp: endAnchorDrag,
    }),
  );
}
