// Endless capabilities belt. The strip is the signal list tripled, so a
// full copy always covers the viewport with one to spare on each edge. The
// seamless period is the exact distance between an item and its clone one
// copy later — MEASURED, never guessed: rem gaps, padding and font width all
// fold in, so the loop wraps without the sideways jump a hardcoded px hop
// (the old x:-900) caused every pass.
//
// useTimeline captures its spec on first render, before layout exists — so
// this drives createTimeline by hand (AI_SPEC §10) and rebuilds if the
// measured width ever shifts (font swap, browser zoom).

import { h, useEffect, useRef } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { SIGNALS } from "../data.js";

const items = [...SIGNALS, ...SIGNALS, ...SIGNALS];

export function SignalStrip() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let ctrl = null;

    const build = () => {
      const first = track.children[0];
      const clone = track.children[SIGNALS.length];
      if (!first || !clone) return;
      const period = clone.offsetLeft - first.offsetLeft;
      if (!(period > 0)) return;
      const resume = ctrl?.time ?? 0;
      ctrl?.destroy();
      ctrl = createTimeline({
        duration: 18000,
        loop: true,
        tracks: {
          strip: [
            { at: 0, x: 0 },
            { at: 18000, x: -period, ease: "linear" },
          ],
        },
        autoplay: false,
      });
      ctrl.track("strip")(track);
      ctrl.seek(resume);
      ctrl.play();
    };

    build();
    // width: max-content — the observer fires only when the intrinsic width
    // actually changes (a font settling in), which is exactly when the
    // measured period is stale and the belt needs re-fitting.
    const observer = new ResizeObserver(build);
    observer.observe(track);
    return () => {
      observer.disconnect();
      ctrl?.destroy();
    };
  }, []);

  return h(
    "section",
    { className: "ml-signal-strip", ariaLabel: "Featured capabilities" },
    h(
      "div",
      { className: "ml-signal-track", ref: trackRef },
      items.map((label, index) =>
        h(
          "span",
          { key: `${label}-${index}` },
          h("i", { ariaHidden: "true" }),
          label,
        ),
      ),
    ),
  );
}
