// Fixed caption top-left: the current district's name and description, or a
// welcome on the whole-network overview. Keyed by id so it fades in on
// navigation; non-interactive so drags pass through it.

import { h } from "/dist/nexa.js";

export function InfoCard({ region }) {
  if (!region) {
    return h(
      "div",
      { className: "tx-info", key: "overview" },
      h("p", { className: "tx-info-eyebrow" }, "Nexa · ZoomStage"),
      h("h1", { className: "tx-info-title" }, "Metro Explorer"),
      h(
        "p",
        { className: "tx-info-blurb" },
        "Scroll to zoom, drag to roam the network, double-click to dive into a district. Pick one below, or hit Overview to see the whole map.",
      ),
    );
  }
  return h(
    "div",
    { className: "tx-info", key: region.id },
    h("p", { className: "tx-info-eyebrow", style: { color: region.accent } }, "District"),
    h("h1", { className: "tx-info-title" }, region.name),
    h("p", { className: "tx-info-blurb" }, region.blurb),
  );
}
