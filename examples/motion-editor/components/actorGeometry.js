// Shared geometry/paint helpers for stage actors.

export const HANDLES = ["nw", "ne", "sw", "se"];

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
  } else {
    style.background = actor.fill;
    style.borderRadius = actor.kind === "ellipse" ? "50%" : "10px";
  }
  return style;
}
