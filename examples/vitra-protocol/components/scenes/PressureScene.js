import { h } from "/dist/fluxaway.js";
import { PhotoPlate } from "./PhotoPlate.js";
import { useSceneEntrance } from "./useSceneEntrance.js";

const ENTRANCE = {
  duration: 1560,
  tracks: {
    photo: [{ at: 0, scale: 1.08, opacity: 0 }, { at: 1320, scale: 1, opacity: 1, ease: "outCubic" }],
    copy: [{ at: 180, y: 50, opacity: 0 }, { at: 1500, y: 0, opacity: 1, ease: "outCubic" }],
  },
};

export function PressureScene({ scene, active, phase }) {
  const entrance = useSceneEntrance(ENTRANCE, active, phase);

  return h(
    "article",
    { className: "vp-scene-inner vp-pressure" },
    h(PhotoPlate, { src: scene.image, className: "vp-pressure-photo", imageRef: entrance.track("photo") }),
    h("div", { className: "vp-scene-copy vp-pressure-copy", ref: entrance.track("copy") },
      h("span", { className: "vp-scene-index" }, scene.index),
      h("p", { className: "vp-scene-eyebrow" }, scene.eyebrow),
      h("h1", null, scene.title),
      h("p", null, scene.body),
    ),
  );
}
