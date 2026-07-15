// Nested MovieClip playback inside a symbol instance. Each instance owns a
// small controller slaved to its parent timeline's playhead.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { ActorArtwork } from "./ActorArtwork.js";
import { actorStyle } from "./actorGeometry.js";
import { layerForActor, orderedActors } from "./layerOps.js";
import { resolveActor } from "./symbolOps.js";
import { runtimeTracks } from "./frameOps.js";

function buildController(timeline) {
  return createTimeline({
    duration: timeline.duration,
    tracks: runtimeTracks(timeline.tracks),
    labels: timeline.labels,
    loop: timeline.loop,
    autoplay: false,
  });
}

function MovieClipArtwork({ doc, actor, symbol, parentTl, depth }) {
  const timeline = symbol.timeline;
  const [controller, setController] = useState(() => buildController(timeline));

  // Rebuild only on REPLACEMENT (same pattern as useStageController) — the
  // old effect also ran on first mount, building a second controller and
  // destroying the initializer's for nothing, per instance, per commit.
  const lastTimelineRef = useRef(timeline);
  useEffect(() => {
    if (lastTimelineRef.current === timeline) return;
    lastTimelineRef.current = timeline;
    const fresh = buildController(timeline);
    setController((current) => {
      current.destroy();
      return fresh;
    });
  });

  const controllerRef = useRef(controller);
  controllerRef.current = controller;
  useEffect(() => () => controllerRef.current.destroy(), []);

  useEffect(() => {
    let lastParentTime = null;
    const sync = () => {
      const parentTime = parentTl.time || 0;
      // The parent is parked most of the time in an editor — skip the
      // full seek/style pass when nothing moved.
      if (parentTime === lastParentTime) return;
      lastParentTime = parentTime;
      const duration = Math.max(1, timeline.duration);
      // Looping clips wrap with the parent clock; a non-looping MovieClip
      // parks on its final pose instead of rewinding every cycle.
      controller.seek(timeline.loop ? parentTime % duration : Math.min(parentTime, duration));
    };
    sync();
    const id = setInterval(sync, 50);
    return () => clearInterval(id);
  }, [controller, parentTl, timeline.duration, timeline.loop]);

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
