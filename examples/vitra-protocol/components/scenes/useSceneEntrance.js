import { useEffect } from "/dist/fluxaway.js";
import { useTimeline } from "/dist/fluxaway-motion.js";

export function useSceneEntrance(spec, active) {
  const timeline = useTimeline({ ...spec, autoplay: false });

  useEffect(() => {
    if (active) timeline.gotoAndPlay(0);
    else timeline.gotoAndStop(timeline.duration);
  }, [active, timeline]);

  return timeline;
}
