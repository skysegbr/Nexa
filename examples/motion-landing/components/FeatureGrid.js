import { h } from "/dist/nexa.js";
import { useTimeline, stagger } from "/dist/nexa-motion.js";
import { FEATURES } from "../data.js";
import { useInViewTimeline } from "./useInViewTimeline.js";

function OrbitIcon({ symbol }) {
  const tl = useTimeline({
    duration: 5200,
    loop: true,
    tracks: {
      orbit: [{ at: 0, rotate: 0 }, { at: 5200, rotate: 360, ease: "linear" }],
      symbol: [
        { at: 0, scale: 0.92, opacity: 0.72 },
        { at: 2600, scale: 1.12, opacity: 1, ease: "inOutCubic" },
        { at: 5200, scale: 0.92, opacity: 0.72, ease: "inOutCubic" },
      ],
    },
  });

  return h(
    "span",
    { className: "ml-feature-icon" },
    h("i", { ref: tl.track("orbit"), ariaHidden: "true" }),
    h("b", { ref: tl.track("symbol"), ariaHidden: "true" }, symbol),
  );
}

export function FeatureGrid() {
  const cardTrack = [
    { at: 0, y: 80, rotate: 2, opacity: 0 },
    { at: 1000, y: 0, rotate: 0, opacity: 1, ease: "outBack" },
  ];
  const tracks = {
    heading: [{ at: 0, y: 50, opacity: 0 }, { at: 850, y: 0, opacity: 1, ease: "outCubic" }],
  };
  FEATURES.forEach((_, index) => {
    tracks[`card-${index}`] = stagger(cardTrack, 170, index + 2);
  });
  const tl = useTimeline({ duration: 2200, autoplay: false, tracks });
  const sectionRef = useInViewTimeline(tl, 0.16);

  return h(
    "section",
    { className: "ml-features", id: "features", ref: sectionRef },
    h(
      "div",
      { className: "ml-features-inner" },
      h(
        "header",
        { className: "ml-features-head", ref: tl.track("heading") },
        h("div", null, h("p", { className: "ml-kicker" }, "AUTHORING TOOLS"), h("h2", { className: "ml-section-title" }, "Control every frame.", h("br"), h("em", null, "Release every idea."))),
        h("p", null, "A small, direct, and familiar API. Enough to create expressive motion without turning the page into a dependency machine."),
      ),
      h(
        "div",
        { className: "ml-feature-grid" },
        FEATURES.map((feature, index) =>
          h(
            "article",
            { key: feature.number, className: "ml-feature-card", ref: tl.track(`card-${index}`) },
            h("span", { className: "ml-feature-number" }, feature.number),
            h(OrbitIcon, { symbol: feature.icon }),
            h("h3", null, feature.title),
            h("p", null, feature.text),
            h("footer", null, feature.meta),
          ),
        ),
      ),
    ),
  );
}
