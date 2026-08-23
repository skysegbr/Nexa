import { h } from "/dist/fluxaway.js";
import { LABEL_CARDS } from "../../data.js";

export function LabelsScene({ timeline }) {
  return h("article", { className: "mp-scene mp-labels-scene", ref: timeline.track("labelsScene") },
    h("header", { ref: timeline.track("labelsHeading") },
      h("p", { className: "mp-kicker" }, "SCENES BECOME DESTINATIONS"),
      h("h1", null, "Labels replace slide machinery."),
      h("p", null, "Jump anywhere on the master timeline and let every actor resolve from the same playhead."),
    ),
    h("div", { className: "mp-label-cards" },
      LABEL_CARDS.map((card, index) => h("div", {
        key: card.label,
        className: `mp-label-card mp-label-card-${card.tone}`,
        ref: timeline.track(`labelCard${index}`),
      },
      h("span", null, `0${index + 1}`),
      h("strong", null, card.label),
      h("code", null, card.code))),
    ),
    h("code", { className: "mp-labels-code", ref: timeline.track("labelsCode") },
      'timeline.gotoAndPlay("labels");',
    ),
  );
}
