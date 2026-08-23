import { h } from "/dist/fluxaway.js";
import { PhotoPlate } from "./PhotoPlate.js";
import { useSceneEntrance } from "./useSceneEntrance.js";

const ENTRANCE = {
  duration: 1500,
  tracks: {
    copy: [{ at: 0, x: -48, opacity: 0 }, { at: 1100, x: 0, opacity: 1, ease: "outCubic" }],
    photo: [{ at: 160, scale: 1.06, opacity: 0 }, { at: 1450, scale: 1, opacity: 1, ease: "outCubic" }],
  },
};

export function VesselScene({ scene, active }) {
  const entrance = useSceneEntrance(ENTRANCE, active);

  return h(
    "article",
    { className: "vp-scene-inner vp-vessel" },
    h(PhotoPlate, { src: scene.image, className: "vp-vessel-photo", imageRef: entrance.track("photo") }),
    h("div", { className: "vp-scene-copy vp-vessel-copy", ref: entrance.track("copy") },
      h("span", { className: "vp-scene-index" }, scene.index),
      h("p", { className: "vp-scene-eyebrow" }, scene.eyebrow),
      h("h1", null, scene.title),
      h("p", null, scene.body),
    ),
  );
}
