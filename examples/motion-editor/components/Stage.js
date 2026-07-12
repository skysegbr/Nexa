// The preview stage: the demo actors bound to the CURRENT controller via
// track() refs, plus an SVG overlay that shows the selected track's motion
// guides (dashed, like Flash's guide layer) and captures clicks while a new
// guide is being drawn.
//
// Guide coordinates live in the actor's translate space; the overlay
// converts to stage space through the actor's static layout box
// (offsetLeft/offsetTop are unaffected by transforms), running the curve
// through the actor's CENTER — the closest thing to Flash's registration
// point.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";

export function Stage({ tl, actors, doc, selected, drawing, onDrawPoint }) {
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
        guides.push({ trackName, d: keyframe.path, base });
      }
    }
  }

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
    ),
  );
}
