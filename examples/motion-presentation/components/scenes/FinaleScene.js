import { h } from "/dist/fluxaway.js";

export function FinaleScene({ timeline }) {
  return h("article", { className: "mp-scene mp-finale", ref: timeline.track("finaleScene") },
    h("div", { className: "mp-finale-halo", ref: timeline.track("finaleHalo"), ariaHidden: "true" },
      h("span", null, "FW"),
    ),
    h("div", { className: "mp-finale-copy" },
      h("p", { className: "mp-kicker" }, "THE TIMELINE IS STILL A GREAT INTERFACE"),
      h("h1", { ref: timeline.track("finaleTitle") }, "No plugin required."),
      h("p", { ref: timeline.track("finaleCopy") },
        "Normal DOM. Accessible controls. Flash-style timing — rebuilt for the browser.",
      ),
      h("span", { className: "mp-finale-badge", ref: timeline.track("finaleBadge") }, "FLUXAWAY MOTION"),
    ),
  );
}
