// The preview stage: the demo actors bound to the CURRENT controller via
// track() refs. When app.js swaps in a fresh controller after an edit, the
// new refs rebind automatically on the next render — the preview is always
// the real nexa-motion runtime.

import { h } from "/dist/nexa.js";

export function Stage({ tl, actors }) {
  return h(
    "section",
    { className: "me-stage", ariaLabel: "Preview stage" },
    actors.map((actor) =>
      h(
        "div",
        { key: actor.id, className: `me-actor ${actor.className}`, ref: tl.track(actor.id) },
        actor.id === "star" ? "★" : "",
      ),
    ),
  );
}
