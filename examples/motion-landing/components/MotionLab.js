import { h } from "/dist/nexa.js";
import { useTimeline, stagger } from "/dist/nexa-motion.js";
import { useInViewTimeline } from "./useInViewTimeline.js";

function GuideDemo() {
  const tl = useTimeline({
    duration: 3600,
    loop: true,
    tracks: {
      dot: [
        { at: 0, x: 0, y: 0, scale: 0.85, opacity: 1 },
        { at: 2800, path: "M 0 0 C 90 -100 185 100 275 0 S 430 -80 510 0", scale: 1.2, ease: "inOutCubic" },
        { at: 3600, opacity: 0, ease: "outCubic" },
      ],
      halo: [
        { at: 0, scale: 0.7, opacity: 0.8 },
        { at: 1800, scale: 1.8, opacity: 0.1, ease: "outCubic" },
        { at: 3600, scale: 0.7, opacity: 0.8, ease: "inCubic" },
      ],
    },
  });

  return h(
    "div",
    { className: "ml-guide-stage", ariaLabel: "Motion guide demonstration" },
    h(
      "svg",
      { viewBox: "0 -110 530 220", ariaHidden: "true" },
      h("path", { d: "M 10 0 C 100 -100 195 100 285 0 S 440 -80 520 0" }),
    ),
    h("span", { className: "ml-guide-halo", ref: tl.track("halo"), ariaHidden: "true" }),
    h("span", { className: "ml-guide-dot", ref: tl.track("dot"), ariaHidden: "true" }),
  );
}

const SOURCE_LINES = [
  ["const", " scene = useTimeline({"],
  ["dim", "  labels: { reveal: 620 },"],
  ["dim", "  tracks: {"],
  ["accent", "    idea: ["],
  ["dim", "      { at: 0, opacity: 0 },"],
  ["bright", "      { at: 900, opacity: 1,"],
  ["bright", "        ease: 'outBack' }"],
  ["accent", "    ]"],
  ["dim", "  }"],
  ["const", "});"],
];

export function MotionLab() {
  const base = [{ at: 0, y: 70, opacity: 0 }, { at: 900, y: 0, opacity: 1, ease: "outCubic" }];
  const tl = useTimeline({
    duration: 1800,
    autoplay: false,
    tracks: {
      heading: base,
      copy: stagger(base, 100, 2),
      lab: stagger(base, 120, 3),
      code: stagger(base, 120, 4),
    },
  });
  const sectionRef = useInViewTimeline(tl);

  return h(
    "section",
    { className: "ml-motion-lab", id: "manifesto", ref: sectionRef },
    h(
      "div",
      { className: "ml-motion-lab-inner" },
      h(
        "div",
        { className: "ml-motion-intro" },
        h("p", { className: "ml-kicker", ref: tl.track("heading") }, "MOTION IS THE INTERFACE"),
        h("h2", { className: "ml-section-title", ref: tl.track("heading") }, "One timeline.", h("br"), h("em", null, "Infinite scenes.")),
        h(
          "p",
          { ref: tl.track("copy") },
          "Nexa Motion recaptures the clarity of Flash — keyframes, labels, guides, and MovieClips — with the lightness of modern JavaScript.",
        ),
      ),
      h(
        "div",
        { className: "ml-lab-card", id: "system", ref: tl.track("lab") },
        h(
          "div",
          { className: "ml-lab-head" },
          h("span", null, "MOTION GUIDE / LIVE"),
          h("span", null, "03.60 s"),
        ),
        h(GuideDemo, null),
        h(
          "div",
          { className: "ml-mini-timeline" },
          h("span", { className: "ml-mini-playhead" }),
          [0, 1, 2, 3, 4, 5].map((frame) => h("i", { key: frame })),
          h("b", { style: { left: "1%" } }),
          h("b", { style: { left: "54%" } }),
          h("b", { style: { left: "96%" } }),
        ),
      ),
      h(
        "div",
        { className: "ml-code-card", ref: tl.track("code") },
        h("div", { className: "ml-code-head" }, h("span", null, "scene.js"), h("span", null, "ESM")),
        h(
          "pre",
          null,
          SOURCE_LINES.map(([tone, text], index) => h("code", { key: index, className: `ml-code-${tone}` }, text)),
        ),
        h("p", null, h("span", null, "●"), " no compilation · browser ready"),
      ),
    ),
  );
}
