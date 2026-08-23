import { h } from "/dist/fluxaway.js";
import { FinaleScene } from "./scenes/FinaleScene.js";
import { LabelsScene } from "./scenes/LabelsScene.js";
import { OpeningScene } from "./scenes/OpeningScene.js";
import { TimelineScene } from "./scenes/TimelineScene.js";

export function PresentationStage({ timeline, activeIndex }) {
  return h(
    "section",
    { className: "mp-stage", ariaLabel: "Motion-only presentation stage" },
    h("header", { className: "mp-stage-header" },
      h("a", { href: "../motion-presentation/", className: "mp-stage-brand", ariaLabel: "Restart Motion Presentation" },
        h("span", null, "FW"),
        h("strong", null, "MOTION DECK"),
      ),
      h("span", { className: "mp-stage-format" }, "16:9 / 24 FPS / HTML"),
      h("span", { className: "mp-stage-counter" }, `${String(activeIndex + 1).padStart(2, "0")} / 04`),
    ),
    h("div", { className: "mp-stage-grid", ariaHidden: "true" }),
    h("div", { className: "mp-stage-scenes" },
      h(OpeningScene, { timeline, active: activeIndex === 0 }),
      h(TimelineScene, { timeline }),
      h(LabelsScene, { timeline }),
      h(FinaleScene, { timeline }),
    ),
    h("footer", { className: "mp-stage-footer" },
      h("span", null, "FLUXAWAY MOTION"),
      h("span", null, "NO ZOOMSTAGE"),
    ),
  );
}
