// Fixed caption top-left: the current module's name and description, or a
// welcome on the whole-panel overview. Keyed by id so it fades in on
// navigation; non-interactive so drags pass through it.

import { h } from "/dist/nexa.js";

export function InfoCard({ region }) {
  if (!region) {
    return h(
      "div",
      { className: "sy-info", key: "overview" },
      h("p", { className: "sy-info-eyebrow" }, "Nexa · ZoomStage"),
      h("h1", { className: "sy-info-title" }, "Synth Explorer"),
      h(
        "p",
        { className: "sy-info-blurb" },
        "Scroll to zoom, drag to roam the panel, double-click a module to dive in. Pick a module below, or hit Overview to see the whole synth.",
      ),
    );
  }
  return h(
    "div",
    { className: "sy-info", key: region.id },
    h("p", { className: "sy-info-eyebrow", style: { color: region.accent } }, "Module"),
    h("h1", { className: "sy-info-title" }, region.name),
    h("p", { className: "sy-info-blurb" }, region.blurb),
  );
}
