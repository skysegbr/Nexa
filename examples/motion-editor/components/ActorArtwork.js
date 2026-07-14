// Inner artwork for actors that cannot be painted by the wrapper's CSS.
// The wrapper still owns layout, selection and the nexa-motion track ref.

import { h } from "/dist/nexa.js";
import { isVectorKind } from "./vectorGeometry.js";

export function ActorArtwork({ actor, outlineColor }) {
  if (actor.kind === "text") return actor.text || "";
  if (!isVectorKind(actor.kind)) return null;

  return h(
    "svg",
    {
      className: "me-vector-art",
      viewBox: `0 0 ${actor.vectorW || actor.w} ${actor.vectorH || actor.h}`,
      preserveAspectRatio: "none",
      ariaHidden: "true",
    },
    h("path", {
      d: actor.path,
      fill: actor.fill && actor.fill !== "none" ? actor.fill : "none",
      stroke: outlineColor || actor.stroke || "#111111",
      "stroke-width": actor.strokeWidth || 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "vector-effect": "non-scaling-stroke",
    }),
  );
}
