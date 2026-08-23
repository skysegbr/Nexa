import { h } from "/dist/fluxaway.js";
import { PhotoPlate } from "./PhotoPlate.js";
import { useSceneEntrance } from "./useSceneEntrance.js";

const ENTRANCE = {
  duration: 1700,
  tracks: {
    photo: [{ at: 0, scale: 1.08, opacity: 0 }, { at: 1450, scale: 1, opacity: 1, ease: "outCubic" }],
    copy: [{ at: 300, y: 38, opacity: 0 }, { at: 1650, y: 0, opacity: 1, ease: "outCubic" }],
  },
};

export function ThresholdScene({ scene, active }) {
  const entrance = useSceneEntrance(ENTRANCE, active);
  const [bodyBefore = scene.body, bodyAfter = ""] = scene.contrastText
    ? scene.body.split(scene.contrastText)
    : [scene.body];

  return h(
    "article",
    { className: "vp-scene-inner vp-threshold" },
    h(PhotoPlate, { src: scene.image, className: "vp-threshold-photo", imageRef: entrance.track("photo") }),
    h("div", { className: "vp-scene-copy vp-threshold-copy", ref: entrance.track("copy") },
      h("span", { className: "vp-scene-index" }, scene.index),
      h("p", { className: "vp-scene-eyebrow" }, scene.eyebrow),
      h("h1", null, scene.title),
      h("p", null,
        bodyBefore,
        scene.contrastText
          ? h("span", { className: "vp-threshold-contrast-text" }, scene.contrastText)
          : null,
        bodyAfter,
      ),
    ),
  );
}
