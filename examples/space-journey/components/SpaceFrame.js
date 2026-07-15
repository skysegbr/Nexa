import { h, useEffect } from "/dist/nexa.js";
import { useTimeline, stagger } from "/dist/nexa-motion.js";
import { SceneFX } from "./SceneFX.js";

export function SpaceFrame({ scene, active, sceneIndex }) {
  const rise = [
    { at: 0, y: 70, opacity: 0 },
    { at: 1050, y: 0, opacity: 1, ease: "outCubic" },
  ];
  const tl = useTimeline({
    duration: 4400,
    autoplay: false,
    tracks: {
      image: [
        { at: 0, scale: 1.16, opacity: 0.25 },
        { at: 1500, scale: 1, opacity: 1, ease: "outCubic" },
        { at: 4400, scale: 1.035, ease: "inOutCubic" },
      ],
      grid: [{ at: 0, opacity: 0 }, { at: 900, opacity: 0.55, ease: "outCubic" }],
      chapter: rise,
      title: stagger(rise, 130, 1),
      body: stagger(rise, 130, 2),
      fact: stagger(rise, 150, 3),
      credit: [{ at: 900, opacity: 0 }, { at: 1700, opacity: 1, ease: "outCubic" }],
    },
  });

  useEffect(() => {
    if (active) tl.gotoAndPlay(0);
    else tl.gotoAndStop(0);
  }, [active, tl]);

  return h(
    "article",
    { className: `sj-frame-content sj-frame-${scene.id}${active ? " sj-frame-live" : ""}` },
    h("img", { className: "sj-frame-image", src: scene.image, alt: scene.alt, ref: tl.track("image") }),
    h("div", { className: "sj-frame-vignette", ariaHidden: "true" }),
    h("div", { className: "sj-frame-grid", ref: tl.track("grid"), ariaHidden: "true" }),
    h(SceneFX, { kind: scene.id, active }),
    h(
      "div",
      { className: "sj-frame-copy" },
      h("p", { className: "sj-frame-chapter", ref: tl.track("chapter") }, scene.chapter),
      h("h1", { ref: tl.track("title") }, scene.title),
      h("p", { className: "sj-frame-body", ref: tl.track("body") }, scene.body),
    ),
    h(
      "div",
      { className: "sj-frame-fact", ref: tl.track("fact") },
      h("span", null, "MISSION DATA"),
      h("strong", null, scene.fact),
      h("small", null, scene.distance),
    ),
    h(
      "a",
      { className: "sj-frame-credit", href: scene.source, target: "_blank", rel: "noreferrer", ref: tl.track("credit") },
      h("span", null, `IMAGE ${String(sceneIndex + 1).padStart(2, "0")} / 06`),
      h("span", null, scene.credit),
      h("b", null, "↗"),
    ),
    h("span", { className: "sj-corner sj-corner-tl", ariaHidden: "true" }),
    h("span", { className: "sj-corner sj-corner-br", ariaHidden: "true" }),
  );
}
