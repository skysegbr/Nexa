// Layer-aware stage paint. Normal and guide actors remain ordinary tracked
// DOM nodes; mask actors become animated SVG clipPath geometry.

import { h } from "/dist/nexa.js";
import { ActorContent } from "./MovieClipArtwork.js";
import { stageActorStyle } from "./actorGeometry.js";
import { isPaintLayer, maskForLayer } from "./layerTypes.js";
import { isVectorKind } from "./vectorGeometry.js";
import { OUTLINE_COLORS } from "../data.js";

function maskDomId(layerId) {
  let hash = 0;
  for (const char of layerId) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return `me-mask-${Math.abs(hash)}`;
}

function maskGeometry(actor) {
  const paint = {
    fill: "var(--me-mask-fill, #fff)",
    stroke: "var(--me-mask-stroke, #fff)",
    "stroke-width": actor.strokeWidth || 1.5,
  };
  if (actor.kind === "ellipse") {
    return h("ellipse", { ...paint, cx: actor.x + actor.w / 2, cy: actor.y + actor.h / 2, rx: actor.w / 2, ry: actor.h / 2 });
  }
  if (actor.kind === "text") {
    return h(
      "text",
      { ...paint, x: actor.x + actor.w / 2, y: actor.y + actor.h * 0.8, textAnchor: "middle", fontSize: actor.h * 0.8 },
      actor.text || "",
    );
  }
  if (isVectorKind(actor.kind)) {
    const sx = actor.w / Math.max(1, actor.vectorW || actor.w);
    const sy = actor.h / Math.max(1, actor.vectorH || actor.h);
    return h("path", {
      ...paint,
      d: actor.path,
      transform: `translate(${actor.x} ${actor.y}) scale(${sx} ${sy})`,
    });
  }
  return h("rect", { ...paint, x: actor.x, y: actor.y, width: actor.w, height: actor.h, rx: actor.kind === "rect" ? 10 : 0 });
}

function MaskDefinitions({ doc, masks, actorsById, tl }) {
  return h(
    "svg",
    { className: "me-mask-defs", ariaHidden: "true" },
    h(
      "defs",
      null,
      masks.map((layer) =>
        h(
          "clipPath",
          { key: layer.id, id: maskDomId(layer.id), clipPathUnits: "userSpaceOnUse" },
          layer.actorIds.map((actorId, index) => {
            const actor = actorsById[actorId];
            if (!actor) return null;
            return h(
              "g",
              {
                key: actor.id,
                id: `${maskDomId(layer.id)}-actor-${index}`,
                className: "me-mask-shape",
                style: { transformOrigin: `${actor.x + actor.w / 2}px ${actor.y + actor.h / 2}px` },
                ref: tl.track(actor.id),
              },
              maskGeometry(actor),
            );
          }),
        ),
      ),
    ),
  );
}

function PaintedActor({ doc, actor, layer, layerIndex, flags, tl, actorSel, onActorPointerDown }) {
  const guide = layer.type === "guide";
  const paintFlags = guide ? { ...flags, outline: true } : flags;
  return h(
    "div",
    {
      key: actor.id,
      className:
        `me-actor me-kind-${actor.kind} me-actor-${actor.id}` +
        (actorSel === actor.id ? " me-actor-selected" : "") +
        (paintFlags.locked ? " me-actor-locked" : ""),
      style: stageActorStyle(actor, paintFlags, layerIndex),
      ref: tl.track(actor.id),
      onPointerDown: (event) => onActorPointerDown(event, actor),
    },
    h(ActorContent, {
      doc,
      actor,
      parentTl: tl,
      outlineColor: paintFlags.outline ? OUTLINE_COLORS[layerIndex % OUTLINE_COLORS.length] : null,
    }),
  );
}

function MaskEditorOverlay({ layer, actorsById, actorSel, flagsByLayer, onActorPointerDown }) {
  if (!layer) return null;
  const flags = flagsByLayer[layer.id] || {};
  if (flags.hidden) return null;
  return h(
    "svg",
    { className: "me-mask-editor", ariaLabel: `${layer.name} mask artwork` },
    layer.actorIds.map((actorId, index) => {
      const actor = actorsById[actorId];
      if (!actor) return null;
      // The padlock covers mask artwork too — a locked mask must reject
      // stage gestures exactly like a locked normal layer.
      return h("use", {
        key: actor.id,
        href: `#${maskDomId(layer.id)}-actor-${index}`,
        className: `me-mask-use me-actor-${actor.id}${actorSel === actor.id ? " me-actor-selected" : ""}`,
        style: flags.locked ? { pointerEvents: "none" } : undefined,
        onPointerDown: flags.locked ? undefined : (event) => onActorPointerDown(event, actor),
      });
    }),
  );
}

export function StageActors({ doc, actorsById, activeLayerId, actorSel, flagsByLayer, tl, onActorPointerDown }) {
  const masks = doc.layers.filter((layer) => layer.type === "mask");
  const activeMask = masks.find((layer) => layer.id === activeLayerId);
  return h(
    "div",
    { className: "me-stage-art" },
    h(MaskDefinitions, { doc, masks, actorsById, tl }),
    [...doc.layers].reverse().map((layer) => {
      if (!isPaintLayer(layer) || layer.type === "mask") return null;
      const layerIndex = doc.layers.indexOf(layer);
      const flags = flagsByLayer[layer.id] || {};
      const mask = maskForLayer(doc, layer.id);
      return h(
        "div",
        {
          key: layer.id,
          className: `me-stage-layer${layer.type === "guide" ? " me-stage-guide" : ""}`,
          style: mask ? { clipPath: `url(#${maskDomId(mask.id)})` } : undefined,
        },
        layer.actorIds.map((actorId) => actorsById[actorId] && h(PaintedActor, {
          key: actorId,
          doc,
          actor: actorsById[actorId],
          layer,
          layerIndex,
          flags,
          tl,
          actorSel,
          onActorPointerDown,
        })),
      );
    }),
    h(MaskEditorOverlay, { layer: activeMask, actorsById, actorSel, flagsByLayer, onActorPointerDown }),
  );
}
