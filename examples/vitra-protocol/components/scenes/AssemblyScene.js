import { h, useState } from "/dist/fluxaway.js";
import { Button } from "/dist/fluxaway-components-core.js";
import { useTimeline } from "/dist/fluxaway-motion.js";
import { PhotoPlate } from "./PhotoPlate.js";
import { useSceneEntrance } from "./useSceneEntrance.js";

const ENTRANCE = {
  duration: 1700,
  tracks: {
    copy: [{ at: 0, x: -50, opacity: 0 }, { at: 1250, x: 0, opacity: 1, ease: "outCubic" }],
    photoGroup: [{ at: 120, scale: 1.06, opacity: 0 }, { at: 1500, scale: 1, opacity: 1, ease: "outCubic" }],
    panel: [{ at: 300, y: 34, opacity: 0 }, { at: 1650, y: 0, opacity: 1, ease: "outCubic" }],
  },
};

export function AssemblyScene({ scene, active, phase }) {
  const [status, setStatus] = useState("standby");
  const entrance = useSceneEntrance(ENTRANCE, active, phase);
  const assembly = useTimeline({
    duration: 2600,
    autoplay: false,
    tracks: {
      exploded: [
        { at: 0, scale: 1, opacity: 1 },
        { at: 1500, scale: 0.985, opacity: 0.82, ease: "inOutCubic" },
        { at: 2600, scale: 0.97, opacity: 0, ease: "inOutCubic" },
      ],
      sealed: [
        { at: 0, scale: 1.04, opacity: 0 },
        { at: 1400, scale: 1.025, opacity: 0 },
        { at: 2600, scale: 1, opacity: 1, ease: "outCubic" },
      ],
    },
    onComplete: () => setStatus("sealed"),
  });

  const engage = () => {
    setStatus("engaging");
    assembly.gotoAndPlay(0);
  };

  const reset = () => {
    setStatus("standby");
    assembly.gotoAndStop(0);
  };

  return h(
    "article",
    { className: "vp-scene-inner vp-assembly" },
    h("div", { className: "vp-assembly-photo-group", ref: entrance.track("photoGroup") },
      h(PhotoPlate, { src: scene.image, className: "vp-assembly-photo vp-assembly-photo-exploded", imageRef: assembly.track("exploded") }),
      h(PhotoPlate, { src: scene.sealedImage, className: "vp-assembly-photo vp-assembly-photo-sealed", imageRef: assembly.track("sealed") }),
    ),
    h("div", { className: "vp-scene-copy vp-assembly-copy", ref: entrance.track("copy") },
      h("span", { className: "vp-scene-index" }, scene.index),
      h("p", { className: "vp-scene-eyebrow" }, scene.eyebrow),
      h("h1", null, scene.title),
      h("p", null, scene.body),
    ),
    h("aside", { className: "vp-assembly-panel", ref: entrance.track("panel") },
      h("div", { className: "vp-assembly-state" }, h("span", null, "SEAL STATE"), h("strong", null, status.toUpperCase())),
      h("dl", null,
        h("div", null, h("dt", null, "Tolerance"), h("dd", null, status === "sealed" ? "0.02 mm" : "4.80 mm")),
        h("div", null, h("dt", null, "Pressure"), h("dd", null, status === "sealed" ? "86 kN" : "0 kN")),
      ),
      h("div", { className: "vp-assembly-actions" },
        h(Button, { variant: "outline", effect: "conductor", onClick: engage, disabled: !active || status === "engaging" }, status === "sealed" ? "Replay seal" : "Engage seal"),
        h(Button, { variant: "text", onClick: reset, disabled: !active || status === "standby" }, "Release"),
      ),
    ),
  );
}
