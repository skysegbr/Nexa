// Nested MovieClip playback inside a symbol instance. Each instance owns a
// small controller slaved to its parent timeline's playhead.

import { h, useEffect, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { ActorArtwork } from "./ActorArtwork.js";
import { actorStyle } from "./actorGeometry.js";
import { layerForActor, orderedActors } from "./layerOps.js";
import { resolveActor } from "./symbolOps.js";

function buildController(timeline) {
  return createTimeline({
    duration: timeline.duration,
    tracks: timeline.tracks,
    labels: timeline.labels,
    loop: timeline.loop,
    autoplay: false,
  });
}

function MovieClipArtwork({ doc, actor, symbol, parentTl, depth }) {
  const timeline = symbol.timeline;
  const [controller, setController] = useState(() => buildController(timeline));

  useEffect(() => {
    const fresh = buildController(timeline);
    setController((current) => {
      current.destroy();
      return fresh;
    });
    return () => fresh.destroy();
  }, [timeline]);

  useEffect(() => {
    const sync = () => {
      const duration = Math.max(1, timeline.duration);
      controller.seek((parentTl.time || 0) % duration);
    };
    sync();
    const id = setInterval(sync, 50);
    return () => clearInterval(id);
  }, [controller, parentTl, timeline.duration]);

  const children = orderedActors(timeline)
    .filter((child) => {
      const layer = layerForActor(timeline, child.id);
      return layer?.type !== "guide" && layer?.type !== "mask";
    })
    .map((child) => resolveActor(doc, child));
  const width = Math.max(1, symbol.w || actor.w);
  const height = Math.max(1, symbol.h || actor.h);

  return h(
    "div",
    { className: "me-movieclip-art" },
    h(
      "div",
      {
        className: "me-movieclip-world",
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${actor.w / width}, ${actor.h / height})`,
        },
      },
      children.map((child) =>
        h(
          "div",
          {
            key: child.id,
            className: `me-movieclip-child me-kind-${child.kind}`,
            style: actorStyle(child),
            ref: controller.track(child.id),
          },
          h(ActorContent, { doc, actor: child, parentTl: controller, depth: depth + 1 }),
        )),
    ),
  );
}

export function ActorContent({ doc, actor, parentTl, depth = 0, outlineColor }) {
  const symbol = actor.symbolId && doc.library.find((item) => item.id === actor.symbolId);
  if (symbol?.timeline && depth < 6) {
    return h(MovieClipArtwork, { doc, actor, symbol, parentTl, depth });
  }
  return h(ActorArtwork, { actor, outlineColor });
}
