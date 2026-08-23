import { h, useEffect } from "/dist/fluxaway.js";
import { useTimeline } from "/dist/fluxaway-motion.js";

export function SignalMovieClip({ active }) {
  const clip = useTimeline({
    duration: 2600,
    loop: true,
    autoplay: false,
    tracks: {
      ringA: [
        { at: 0, scale: 0.72, rotate: 0, opacity: 0.35 },
        { at: 1300, scale: 1, rotate: 90, opacity: 0.9, ease: "inOutCubic" },
        { at: 2600, scale: 0.72, rotate: 180, opacity: 0.35, ease: "inOutCubic" },
      ],
      ringB: [
        { at: 0, scale: 1, rotate: 0, opacity: 0.72 },
        { at: 1300, scale: 0.78, rotate: -90, opacity: 0.3, ease: "inOutCubic" },
        { at: 2600, scale: 1, rotate: -180, opacity: 0.72, ease: "inOutCubic" },
      ],
      core: [
        { at: 0, scale: 0.9, opacity: 0.72 },
        { at: 650, scale: 1.08, opacity: 1, ease: "inOutCubic" },
        { at: 1300, scale: 0.9, opacity: 0.72, ease: "inOutCubic" },
        { at: 1950, scale: 1.08, opacity: 1, ease: "inOutCubic" },
        { at: 2600, scale: 0.9, opacity: 0.72, ease: "inOutCubic" },
      ],
    },
  });

  useEffect(() => {
    if (active) clip.gotoAndPlay(0);
    else clip.gotoAndStop(0);
  }, [active, clip]);

  return h("div", { className: "mp-signal", ariaHidden: "true" },
    h("span", { className: "mp-signal-ring mp-signal-ring-a", ref: clip.track("ringA") }),
    h("span", { className: "mp-signal-ring mp-signal-ring-b", ref: clip.track("ringB") }),
    h("span", { className: "mp-signal-core", ref: clip.track("core") }, "24"),
  );
}
