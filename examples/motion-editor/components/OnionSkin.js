// Onion skinning, Flash's ghost frames: outline copies of every actor at
// the moments around the playhead — past frames red, future frames green,
// fading with distance. Each offset gets its own createTimeline() over the
// COMMITTED document (drag drafts don't rebuild, same policy as the main
// controller), so the ghosts are the real runtime seeked to another time,
// never an approximation.
//
// The per-offset transparency lives on a wrapper layer, not on the ghosts:
// the controller owns element.style.opacity for tracks that tween it, and
// the two must compose instead of fighting.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { DEFAULT_FPS } from "./editorUtils.js";
import { resolveActor } from "./symbolOps.js";
import { ActorArtwork } from "./ActorArtwork.js";
import { isVectorKind } from "./vectorGeometry.js";
import { isPublishedActor } from "./layerTypes.js";
import { layerForActor, orderedActors, resolvedLayerFlags } from "./layerOps.js";
import { runtimeTracks } from "./frameOps.js";

function buildGhosts(doc, count) {
  const ghosts = [];
  for (let offset = -count; offset <= count; offset += 1) {
    if (offset === 0) continue;
    ghosts.push({
      offset,
      ctrl: createTimeline({ duration: doc.duration, tracks: runtimeTracks(doc.tracks), autoplay: false }),
    });
  }
  return ghosts;
}

const ghostColor = (offset) => offset < 0 ? "rgba(255, 109, 109, 0.9)" : "rgba(87, 227, 158, 0.9)";

function ghostStyle(actor, offset) {
  const color = ghostColor(offset);
  const style = {
    left: `${actor.x}px`,
    top: `${actor.y}px`,
    width: `${actor.w}px`,
    height: `${actor.h}px`,
    borderColor: color,
  };
  if (actor.kind === "text") {
    style.border = "none";
    style.color = color;
    style.fontSize = `${actor.h * 0.8}px`;
    style.lineHeight = `${actor.h}px`;
  } else if (isVectorKind(actor.kind)) {
    style.border = "none";
  } else if (actor.kind === "ellipse") {
    style.borderRadius = "50%";
  }
  return style;
}

export function OnionSkin({ doc, playheadRef, count, layerFlags }) {
  const [ghosts, setGhosts] = useState(() => buildGhosts(doc, count));
  const lastBuiltRef = useRef({ doc, count });

  useEffect(() => {
    const last = lastBuiltRef.current;
    if (last.doc === doc && last.count === count) return;
    lastBuiltRef.current = { doc, count };
    for (const ghost of ghosts) ghost.ctrl.destroy();
    setGhosts(buildGhosts(doc, count));
  });

  // Unmount cleanup (toggling onion off) — the effect above only destroys
  // on replacement.
  const ghostsRef = useRef(ghosts);
  ghostsRef.current = ghosts;
  useEffect(
    () => () => {
      for (const ghost of ghostsRef.current) ghost.ctrl.destroy();
    },
    [],
  );

  // Follow the playhead on the same 50ms clock the timeline panel uses —
  // one ghost per FRAME of the document's fps, like Flash. seek() clamps
  // to [0, duration] itself, so edge offsets pile up at the movie's ends.
  useEffect(() => {
    const stepMs = 1000 / (doc.fps || DEFAULT_FPS);
    const follow = () => {
      for (const { offset, ctrl } of ghosts) {
        ctrl.seek(playheadRef.current + offset * stepMs);
      }
    };
    follow();
    const id = setInterval(follow, 50);
    return () => clearInterval(id);
  }, [ghosts]);

  return h(
    "div",
    { className: "me-onion", ariaHidden: "true" },
    ghosts.map(({ offset, ctrl }) =>
      h(
        "div",
        {
          key: offset,
          className: "me-onion-layer",
          style: { opacity: 0.45 - 0.09 * (Math.abs(offset) - 1) },
        },
        orderedActors(doc)
          .filter((actor) => {
            // The stage and the published code both drop mask AND guide
            // layers; the canonical predicate keeps the ghosts in step so
            // guide artwork never bleeds into the onion frames.
            if (!isPublishedActor(doc, actor.id)) return false;
            const layer = layerForActor(doc, actor.id);
            return !layer || !resolvedLayerFlags(doc, layerFlags, layer.id).hidden;
          })
          .map((actor) => resolveActor(doc, actor))
          .map((actor) =>
            h(
              "div",
              {
                key: actor.id,
                className: `me-ghost me-ghost-${actor.kind}`,
                style: ghostStyle(actor, offset),
                ref: ctrl.track(actor.id),
              },
              h(ActorArtwork, { actor, outlineColor: ghostColor(offset) }),
            ),
          ),
      ),
    ),
  );
}
