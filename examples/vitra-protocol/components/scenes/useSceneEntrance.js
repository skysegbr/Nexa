import { useEffect } from "/dist/fluxaway.js";
import { useTimeline } from "/dist/fluxaway-motion.js";

export function useSceneEntrance(spec, active, phase) {
  const timeline = useTimeline({ ...spec, autoplay: false });

  useEffect(() => {
    const reduceMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (active && reduceMotion) timeline.gotoAndStop(timeline.duration);
    else if (active) timeline.gotoAndPlay(0);
    else if (phase === "arriving") timeline.gotoAndStop(0);
    else timeline.gotoAndStop(timeline.duration);
  }, [active, phase, timeline]);

  return timeline;
}
