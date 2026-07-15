import { h } from "/dist/nexa.js";
import { useTimeline, stagger } from "/dist/nexa-motion.js";

const LINKS = [
  ["Manifesto", "#manifesto"],
  ["System", "#system"],
  ["Features", "#features"],
];

export function Header() {
  const itemTrack = [
    { at: 0, y: -16, opacity: 0 },
    { at: 700, y: 0, opacity: 1, ease: "outCubic" },
  ];
  const tl = useTimeline({
    duration: 1000,
    tracks: {
      brand: itemTrack,
      nav: stagger(itemTrack, 120, 1),
      action: stagger(itemTrack, 120, 2),
    },
  });

  return h(
    "header",
    { className: "ml-header" },
    h(
      "div",
      { className: "ml-header-inner" },
      h(
        "a",
        { className: "ml-brand", href: "#top", ref: tl.track("brand"), ariaLabel: "Nexa Motion — home" },
        h("span", { className: "ml-brand-mark" }, "N"),
        h("span", null, "NEXA / MOTION"),
      ),
      h(
        "nav",
        { className: "ml-nav", ref: tl.track("nav"), ariaLabel: "Main navigation" },
        LINKS.map(([label, href]) => h("a", { key: href, href }, label)),
      ),
      h(
        "a",
        { className: "ml-header-cta", href: "#system", ref: tl.track("action") },
        h("span", null, "Open experience"),
        h("span", { ariaHidden: "true" }, "↗"),
      ),
    ),
  );
}
