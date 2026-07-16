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
      // Seamless breathe: same scale at time 0 and the end, so arriving on the
      // frame (gotoAndPlay 0) never jumps the image. No opacity key — inactive
      // frames rest revealed, so the image stays fully shown.
      image: [
        { at: 0, scale: 1 },
        { at: 2200, scale: 1.035, ease: "inOutCubic" },
        { at: 4400, scale: 1, ease: "inOutCubic" },
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
    // The active frame plays its entrance; an inactive one rests fully REVEALED
    // (the timeline's end), not at time 0. Resting at 0 blanks a frame the
    // instant you navigate away, so it shows empty while the camera pans past.
    if (active) tl.gotoAndPlay(0);
    else tl.gotoAndStop(tl.duration);
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
