import { h } from "/dist/fluxaway.js";
import { SignalMovieClip } from "../SignalMovieClip.js";

export function OpeningScene({ timeline, active }) {
  return h("article", { className: "mp-scene mp-opening", ref: timeline.track("openingScene") },
    h("div", { className: "mp-opening-copy" },
      h("p", { className: "mp-kicker", ref: timeline.track("openingKicker") }, "A PRESENTATION MADE OF TIME"),
      h("h1", null,
        h("span", { ref: timeline.track("openingTitleA") }, "Make time"),
        h("span", { ref: timeline.track("openingTitleB") }, "visible."),
      ),
      h("span", { className: "mp-opening-rule", ref: timeline.track("openingRule"), ariaHidden: "true" }),
      h("p", { className: "mp-opening-note", ref: timeline.track("openingNote") },
        "A fixed stage. Four scenes. One FluxaWay Motion timeline.",
      ),
    ),
    h("div", { className: "mp-opening-signal" }, h(SignalMovieClip, { active })),
  );
}
