// The transport, pinned to the bottom: step back/forward, a play/pause guided
// tour, and a row of dots (click to jump). Everything drives the ZoomStage
// through its controllerRef.

import { h } from "/dist/nexa.js";

export function Controls({ index, total, playing, controllerRef, onToggleTour }) {
  const go = (fn) => () => controllerRef.current && fn(controllerRef.current);

  return h(
    "div",
    { className: "sa-controls", role: "group", ariaLabel: "Atlas navigation" },
    h(
      "button",
      { type: "button", className: "sa-btn", ariaLabel: "Previous", onClick: go((c) => c.prev()) },
      h("i", { className: "bi bi-chevron-left", ariaHidden: "true" }),
    ),
    h(
      "button",
      {
        type: "button",
        className: `sa-btn sa-btn-tour${playing ? " sa-btn-on" : ""}`,
        ariaPressed: playing ? "true" : "false",
        onClick: onToggleTour,
      },
      h("i", { className: playing ? "bi bi-pause-fill" : "bi bi-play-fill", ariaHidden: "true" }),
      h("span", null, playing ? "Touring" : "Tour"),
    ),
    h(
      "button",
      { type: "button", className: "sa-btn", ariaLabel: "Next", onClick: go((c) => c.next()) },
      h("i", { className: "bi bi-chevron-right", ariaHidden: "true" }),
    ),
    h(
      "div",
      { className: "sa-dots" },
      Array.from({ length: total }, (_, i) =>
        h("button", {
          key: i,
          type: "button",
          className: `sa-dot${i === index ? " sa-dot-on" : ""}`,
          ariaLabel: `Go to stop ${i + 1}`,
          ariaCurrent: i === index ? "true" : undefined,
          onClick: go((c) => c.goTo(i)),
        }),
      ),
    ),
  );
}
