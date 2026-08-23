import { h, useEffect } from "/dist/fluxaway.js";
import { stagger, useTimeline } from "/dist/fluxaway-motion.js";
import { PROTOCOL_READOUTS } from "../../data.js";
import { PhotoPlate } from "./PhotoPlate.js";
import { useSceneEntrance } from "./useSceneEntrance.js";

const METRIC_TRACK = [{ at: 0, x: 34, opacity: 0 }, { at: 1200, x: 0, opacity: 1, ease: "outCubic" }];
const ENTRANCE = {
  duration: 1700,
  tracks: {
    photo: [{ at: 0, scale: 1.07, opacity: 0 }, { at: 1400, scale: 1, opacity: 1, ease: "outCubic" }],
    console: [{ at: 100, x: -34, opacity: 0 }, { at: 1300, x: 0, opacity: 1, ease: "outCubic" }],
    heading: [{ at: 180, y: 36, opacity: 0 }, { at: 1420, y: 0, opacity: 1, ease: "outCubic" }],
    metric0: stagger(METRIC_TRACK, 120, 0),
    metric1: stagger(METRIC_TRACK, 120, 1),
    metric2: stagger(METRIC_TRACK, 120, 2),
  },
};

export function ProtocolScene({ scene, active }) {
  const entrance = useSceneEntrance(ENTRANCE, active);
  const beacon = useTimeline({
    duration: 3200,
    loop: true,
    autoplay: false,
    tracks: {
      beacon: [
        { at: 0, scale: 0.72, opacity: 0.5 },
        { at: 800, scale: 1, opacity: 1, ease: "inOutCubic" },
        { at: 1600, scale: 0.82, opacity: 0.66, ease: "inOutCubic" },
        { at: 2400, scale: 1.08, opacity: 0.92, ease: "inOutCubic" },
        { at: 3200, scale: 0.72, opacity: 0.5, ease: "inOutCubic" },
      ],
    },
  });

  useEffect(() => {
    if (active) beacon.gotoAndPlay(0);
    else beacon.gotoAndStop(0);
  }, [active, beacon]);

  return h(
    "article",
    { className: "vp-scene-inner vp-protocol" },
    h(PhotoPlate, { src: scene.image, className: "vp-protocol-photo", imageRef: entrance.track("photo") }),
    h("div", { className: "vp-protocol-console", ref: entrance.track("console") },
      h("header", { ref: entrance.track("heading") },
        h("div", null, h("span", { className: "vp-scene-index" }, scene.index), h("p", { className: "vp-scene-eyebrow" }, scene.eyebrow)),
        h("span", { className: "vp-protocol-beacon", ref: beacon.track("beacon"), ariaHidden: "true" }),
      ),
      h("h1", null, scene.title),
      h("p", null, scene.body),
      h("dl", { className: "vp-protocol-readouts" },
        PROTOCOL_READOUTS.map((readout, readoutIndex) => h("div", { key: readout.label, ref: entrance.track(`metric${readoutIndex}`) }, h("dt", null, readout.label), h("dd", null, readout.value))),
      ),
      h("footer", null, h("span", null, "SYSTEM READY"), h("strong", null, "VITRA / 05")),
    ),
  );
}
