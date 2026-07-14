// The VISUAL box of an actor element in stage coordinates — measured from
// the DOM, so it includes whatever transform the tween is applying (the
// document box alone points at the wrong place the moment x/y tween).
// Scrubbing, playback and edits all move the element, so the box follows
// on a light interval; the setState no-ops while nothing changed. Pass a
// null id to park the hook.

import { useEffect, useState } from "/dist/nexa.js";

export function useMeasuredBox(stageRef, actorId, intervalMs = 80) {
  const [box, setBox] = useState(null);

  useEffect(() => {
    if (!actorId) {
      setBox((previous) => (previous === null ? previous : null));
      return undefined;
    }
    const measure = () => {
      const stage = stageRef.current;
      const element = stage && stage.querySelector(`.me-actor-${CSS.escape(actorId)}`);
      if (!element) {
        setBox((previous) => (previous === null ? previous : null));
        return;
      }
      const er = element.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const next = { x: er.left - sr.left, y: er.top - sr.top, w: er.width, h: er.height };
      setBox((previous) =>
        previous &&
        Math.abs(previous.x - next.x) < 0.5 &&
        Math.abs(previous.y - next.y) < 0.5 &&
        Math.abs(previous.w - next.w) < 0.5 &&
        Math.abs(previous.h - next.h) < 0.5
          ? previous
          : next,
      );
    };
    measure();
    const id = setInterval(measure, intervalMs);
    return () => clearInterval(id);
  }, [actorId]);

  return box;
}
