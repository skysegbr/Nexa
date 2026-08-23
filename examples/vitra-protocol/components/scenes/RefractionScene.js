import { h } from "/dist/fluxaway.js";
import { PhotoPlate } from "./PhotoPlate.js";
import { useSceneEntrance } from "./useSceneEntrance.js";

const ENTRANCE = {
  duration: 1750,
  tracks: {
    photo: [{ at: 0, scale: 1.08, opacity: 0 }, { at: 1450, scale: 1, opacity: 1, ease: "outCubic" }],
    copy: [{ at: 260, y: 42, opacity: 0 }, { at: 1700, y: 0, opacity: 1, ease: "outCubic" }],
  },
};

export function RefractionScene({ scene, active, phase }) {
  const entrance = useSceneEntrance(ENTRANCE, active, phase);

  return h(
    "article",
    { className: "vp-scene-inner vp-refraction" },
    h(PhotoPlate, { src: scene.image, className: "vp-refraction-photo", imageRef: entrance.track("photo") }),
    h("div", { className: "vp-scene-copy vp-refraction-copy", ref: entrance.track("copy") },
      h("span", { className: "vp-scene-index" }, scene.index),
      h("p", { className: "vp-scene-eyebrow" }, scene.eyebrow),
      h("h1", null, scene.title),
      h("p", null, scene.body),
    ),
  );
}
