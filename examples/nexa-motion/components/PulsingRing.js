// A nested "movie clip": this component carries its OWN looping timeline,
// independent of the master movie — exactly how a Flash MovieClip kept
// animating whatever the parent timeline was doing.

import { h } from "/dist/nexa.js";
import { useTimeline } from "/dist/nexa-motion.js";

export function PulsingRing() {
  const clip = useTimeline({
    duration: 1600,
    loop: true,
    tracks: {
      ring: [
        { at: 0, scale: 0.9, opacity: 0.7 },
        { at: 800, scale: 1.25, opacity: 0.15, ease: "outCubic" },
        { at: 1600, scale: 0.9, opacity: 0.7, ease: "inOutCubic" },
      ],
    },
  });

  return h("span", { className: "fx-ring", ref: clip.track("ring"), ariaHidden: "true" });
}
