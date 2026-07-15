// Fixed caption in the corner: the current constellation's name, subtitle and
// story — or a welcome when the camera sits on the whole-sky overview. Keyed
// by id so it fades in fresh on every navigation. Non-interactive, so drags
// pass straight through it to the stage.

import { h } from "/dist/nexa.js";

export function InfoPanel({ current }) {
  if (!current) {
    return h(
      "div",
      { className: "sa-info", key: "sky" },
      h("p", { className: "sa-info-eyebrow" }, "Nexa · ZoomStage"),
      h("h1", { className: "sa-info-title" }, "Star Atlas"),
      h(
        "p",
        { className: "sa-info-blurb" },
        "Scroll to zoom and drag to roam the night sky. Step through the constellations with the arrows — or press play for a guided tour.",
      ),
    );
  }
  return h(
    "div",
    { className: "sa-info", key: current.id },
    h("p", { className: "sa-info-eyebrow" }, current.subtitle),
    h("h1", { className: "sa-info-title" }, current.name),
    h("p", { className: "sa-info-blurb" }, current.blurb),
  );
}
