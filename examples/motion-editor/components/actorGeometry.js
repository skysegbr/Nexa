// Shared geometry/paint helpers for stage actors.

import { OUTLINE_COLORS } from "../data.js";
import { isVectorKind } from "./vectorGeometry.js";

export const HANDLES = ["nw", "ne", "sw", "se"];

// actorStyle + the layer chrome: hidden layers keep their track() binding
// (visibility, not unmount), outline layers paint as Flash's colored
// outlines.
export function stageActorStyle(live, flags, layerIndex) {
  const style = actorStyle(live);
  if (flags.hidden) style.visibility = "hidden";
  if (flags.outline) {
    const color = OUTLINE_COLORS[layerIndex % OUTLINE_COLORS.length];
    if (live.kind === "text") style.color = color;
    else if (isVectorKind(live.kind)) style.background = "none";
    else {
      style.background = "none";
      style.border = `1.5px solid ${color}`;
    }
  }
  return style;
}

// Guide coordinates live in the actor's translate space anchored on its
// CENTER — the closest thing to Flash's registration point.
export const baseOf = (actor) => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });

// The actor's static box + paint, straight from the document. The timeline
// controller layers transform/opacity on top of this via the track() ref.
export function actorStyle(actor) {
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
  } else if (!isVectorKind(actor.kind)) {
    style.background = actor.fill;
    style.borderRadius = actor.kind === "ellipse" ? "50%" : "10px";
  }
  return style;
}
