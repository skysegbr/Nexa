// Fixed caption top-left: the current subsystem's name and description, or a
// welcome on the whole-craft overview. Keyed by id so it fades in on
// navigation; non-interactive so drags pass through it.

import { h } from "/dist/nexa.js";

export function InfoCard({ region }) {
  if (!region) {
    return h(
      "div",
      { className: "sc-info", key: "overview" },
      h("p", { className: "sc-info-eyebrow" }, "Nexa · ZoomStage"),
      h("h1", { className: "sc-info-title" }, "Probe Explorer"),
      h(
        "p",
        { className: "sc-info-blurb" },
        "Scroll to zoom, drag to roam the craft, double-click a subsystem to dive in. Pick one below, or hit Overview to see the whole probe.",
      ),
    );
  }
  return h(
    "div",
    { className: "sc-info", key: region.id },
    h("p", { className: "sc-info-eyebrow", style: { color: region.accent } }, "Subsystem"),
    h("h1", { className: "sc-info-title" }, region.name),
    h("p", { className: "sc-info-blurb" }, region.blurb),
  );
}
