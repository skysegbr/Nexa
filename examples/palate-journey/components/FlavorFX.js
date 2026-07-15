import { h, useEffect } from "/dist/nexa.js";
import { useTimeline } from "/dist/nexa-motion.js";

function Visual({ kind, tl }) {
  if (kind === "aperitivo") return h("div", { className: "pj-fx-bubbles", ref: tl.track("float") }, h("i"), h("i"), h("i"), h("i"));
  if (kind === "garden") return h("div", { className: "pj-fx-garden", ref: tl.track("spin") }, h("i"), h("i"), h("b"));
  if (kind === "sushi") return h("div", { className: "pj-fx-chop", ref: tl.track("sweep") }, h("i"), h("i"));
  if (kind === "carbonara") return h("div", { className: "pj-fx-swirl", ref: tl.track("spin") }, h("i"), h("i"), h("b"));
  if (kind === "ember") return h("div", { className: "pj-fx-ember", ref: tl.track("float") }, h("i"), h("i"), h("i"));
  if (kind === "wine") return h("div", { className: "pj-fx-wine", ref: tl.track("pulse") }, h("i"), h("span", null, "PAIR / 06"));
  if (kind === "cheese") return h("div", { className: "pj-fx-cheese", ref: tl.track("spin") }, h("i"), h("i"), h("b"));
  if (kind === "dessert") return h("div", { className: "pj-fx-cacao", ref: tl.track("float") }, h("i"), h("i"), h("i"), h("i"), h("i"));
  if (kind === "coffee") return h("div", { className: "pj-fx-steam", ref: tl.track("float") }, h("i"), h("i"), h("i"));
  return h("div", { className: "pj-fx-nightcap", ref: tl.track("pulse") }, h("i"), h("i"), h("b"), h("span", null, "10 / LATE"));
}

export function FlavorFX({ kind, active }) {
  const tl = useTimeline({
    duration: 5200,
    loop: true,
    autoplay: false,
    tracks: {
      float: [{ at: 0, y: 38, opacity: 0.1 }, { at: 2600, y: -18, opacity: 0.8, ease: "inOutCubic" }, { at: 5200, y: 38, opacity: 0.1, ease: "inOutCubic" }],
      spin: [{ at: 0, rotate: 0, opacity: 0.25 }, { at: 2600, rotate: 180, opacity: 0.75 }, { at: 5200, rotate: 360, opacity: 0.25 }],
      sweep: [{ at: 0, x: -70, opacity: 0 }, { at: 2300, x: 0, opacity: 0.75, ease: "outCubic" }, { at: 5200, x: 50, opacity: 0 }],
      pulse: [{ at: 0, scale: 0.82, opacity: 0.2 }, { at: 2600, scale: 1.08, opacity: 0.8, ease: "inOutCubic" }, { at: 5200, scale: 0.82, opacity: 0.2, ease: "inOutCubic" }],
    },
  });

  useEffect(() => {
    if (active) tl.gotoAndPlay(0);
    else tl.gotoAndStop(0);
  }, [active, tl]);

  return h("div", { className: `pj-flavor-fx pj-flavor-${kind}`, ariaHidden: "true" }, h(Visual, { kind, tl }));
}
