import { h, useEffect } from "/dist/nexa.js";
import { useTimeline } from "/dist/nexa-motion.js";

export function SceneFX({ kind, active }) {
  const tl = useTimeline({
    duration: 5200,
    loop: true,
    autoplay: false,
    tracks: {
      spin: [{ at: 0, rotate: 0 }, { at: 5200, rotate: 360, ease: "linear" }],
      reverse: [{ at: 0, rotate: 0 }, { at: 5200, rotate: -360, ease: "linear" }],
      scan: [
        { at: 0, y: -280, opacity: 0 },
        { at: 700, opacity: 0.85 },
        { at: 4500, opacity: 0.85 },
        { at: 5200, y: 280, opacity: 0, ease: "linear" },
      ],
      probe: [
        { at: 0, y: 260, opacity: 0, scale: 0.65 },
        { at: 900, opacity: 1 },
        { at: 4300, y: -260, scale: 1, opacity: 1, ease: "inOutCubic" },
        { at: 5200, y: -320, opacity: 0, ease: "inCubic" },
      ],
      pulse: [
        { at: 0, scale: 0.6, opacity: 0.9 },
        { at: 2600, scale: 1.45, opacity: 0.18, ease: "outCubic" },
        { at: 5200, scale: 0.6, opacity: 0.9, ease: "inCubic" },
      ],
    },
  });

  useEffect(() => {
    if (active) tl.gotoAndPlay(0);
    else {
      tl.stop();
      tl.seek(0);
    }
  }, [active, tl]);

  if (kind === "departure") {
    return h("div", { className: "sj-fx sj-fx-departure", ariaHidden: "true" }, h("i", { ref: tl.track("probe") }, "↑"), h("span"));
  }
  if (kind === "orbit") {
    return h("div", { className: "sj-fx sj-fx-orbit", ariaHidden: "true" }, h("span", { ref: tl.track("spin") }), h("i", { ref: tl.track("pulse") }));
  }
  if (kind === "lunar") {
    return h("div", { className: "sj-fx sj-fx-lunar", ariaHidden: "true", ref: tl.track("spin") }, h("span"), h("i"));
  }
  if (kind === "mars") {
    return h("div", { className: "sj-fx sj-fx-mars", ariaHidden: "true" }, h("span", { ref: tl.track("scan") }), h("i", { ref: tl.track("pulse") }));
  }
  if (kind === "saturn") {
    return h("div", { className: "sj-fx sj-fx-saturn", ariaHidden: "true" }, h("span", { ref: tl.track("spin") }), h("i", { ref: tl.track("reverse") }));
  }
  return h("div", { className: "sj-fx sj-fx-deep", ariaHidden: "true" }, h("span", { ref: tl.track("pulse") }), h("i", { ref: tl.track("reverse") }));
}
