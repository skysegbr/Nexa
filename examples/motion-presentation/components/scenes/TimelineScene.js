import { h } from "/dist/fluxaway.js";
import { TIMELINE_LAYERS } from "../../data.js";

export function TimelineScene({ timeline }) {
  return h("article", { className: "mp-scene mp-timeline-scene", ref: timeline.track("timelineScene") },
    h("header", { ref: timeline.track("timelineHeading") },
      h("p", { className: "mp-kicker" }, "THE STAGE IS STATIC. THE PLAYHEAD MOVES."),
      h("h1", null, "One timeline.", h("br"), "Many actors."),
    ),
    h("div", { className: "mp-timeline-panel" },
      h("span", { className: "mp-timeline-playhead", ref: timeline.track("playhead"), ariaHidden: "true" }),
      h("div", { className: "mp-timeline-ruler", ariaHidden: "true" },
        Array.from({ length: 13 }, (_, index) => h("i", { key: index }, index * 8)),
      ),
      TIMELINE_LAYERS.map((layer, index) => h("div", {
        key: layer.name,
        className: "mp-timeline-layer",
        ref: timeline.track(`layer${index}`),
      },
      h("strong", null, layer.name),
      h("div", { className: "mp-timeline-track" },
        layer.frames.map((frame) => h("span", { key: frame, style: { left: `${frame}%`, background: layer.color } })),
      ))),
    ),
  );
}
