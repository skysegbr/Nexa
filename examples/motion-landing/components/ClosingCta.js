import { h } from "/dist/nexa.js";
import { useTimeline } from "/dist/nexa-motion.js";
import { useInViewTimeline } from "./useInViewTimeline.js";

function KineticMark() {
  const tl = useTimeline({
    duration: 4400,
    loop: true,
    tracks: {
      outer: [{ at: 0, rotate: 0 }, { at: 4400, rotate: 360, ease: "linear" }],
      inner: [{ at: 0, rotate: 0, scale: 0.8 }, { at: 4400, rotate: -360, scale: 1.12, ease: "inOutCubic" }],
      core: [
        { at: 0, scale: 0.9, backgroundColor: "#ff745e" },
        { at: 2200, scale: 1.18, backgroundColor: "#52e7ff", ease: "inOutCubic" },
        { at: 4400, scale: 0.9, backgroundColor: "#ff745e", ease: "inOutCubic" },
      ],
    },
  });

  return h(
    "div",
    { className: "ml-kinetic-mark", ariaHidden: "true" },
    h("span", { className: "ml-kinetic-outer", ref: tl.track("outer") }),
    h("span", { className: "ml-kinetic-inner", ref: tl.track("inner") }),
    h("span", { className: "ml-kinetic-core", ref: tl.track("core") }),
  );
}

export function ClosingCta() {
  const tl = useTimeline({
    duration: 1500,
    autoplay: false,
    tracks: {
      mark: [{ at: 0, scale: 0.4, rotate: -90, opacity: 0 }, { at: 1000, scale: 1, rotate: 0, opacity: 1, ease: "outElastic" }],
      copy: [{ at: 180, y: 80, opacity: 0 }, { at: 1100, y: 0, opacity: 1, ease: "outBack" }],
      action: [{ at: 420, y: 30, opacity: 0 }, { at: 1250, y: 0, opacity: 1, ease: "outCubic" }],
    },
  });
  const sectionRef = useInViewTimeline(tl, 0.3);

  return h(
    "section",
    { className: "ml-closing", ref: sectionRef },
    h("div", { ref: tl.track("mark") }, h(KineticMark, null)),
    h(
      "div",
      { className: "ml-closing-copy", ref: tl.track("copy") },
      h("p", { className: "ml-kicker" }, "READY TO PLAY"),
      h("h2", null, "The browser is the stage."),
      h("p", null, "Nexa delivers the structure. Nexa Motion puts everything in motion."),
    ),
    h(
      "a",
      { className: "ml-closing-action", href: "../nexa-motion/", ref: tl.track("action") },
      h("span", null, "View timeline demo"),
      h("b", null, "↗"),
    ),
  );
}
