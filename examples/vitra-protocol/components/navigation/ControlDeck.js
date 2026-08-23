import { h } from "/dist/fluxaway.js";
import { Button } from "/dist/fluxaway-components-core.js";

export function ControlDeck({ frames, index, settledIndex, moving, overview, flight, onSelect, onPrev, onNext, onFit }) {
  const current = frames[index];
  const settled = frames[settledIndex];

  return h(
    "div",
    { className: "vp-interface" },
    h("header", { className: "vp-header" },
      h("a", { className: "vp-brand", href: "../vitra-protocol/", ariaLabel: "Restart VITRA Protocol" },
        h("span", null, "V"),
        h("div", null, h("strong", null, "VITRA"), h("small", null, "REDLINE MATERIAL SYSTEM")),
      ),
      h("div", { className: "vp-header-state", ariaLive: "polite" },
        h("small", null, moving ? "CAMERA IN FLIGHT" : overview ? "WORLD OVERVIEW" : "CAMERA SETTLED"),
        h("strong", null, overview ? "SELECT A FRAME" : moving ? `${flight} → ${current.label}` : settled.label),
      ),
      h("span", { className: "vp-header-count" }, `${String(index + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`),
    ),
    h("footer", { className: "vp-deck" },
      h("div", { className: "vp-deck-meta" }, h("strong", null, "FluxaWay"), h("span", null, "ZOOM + MOTION / INOX")),
      h("nav", { className: "vp-stations", ariaLabel: "VITRA scenes" },
        frames.map((frame, frameIndex) => h("button", {
          key: frame.id,
          type: "button",
          className: `vp-station${!overview && frameIndex === index ? " vp-station-active" : ""}`,
          ariaPressed: !overview && frameIndex === index ? "true" : "false",
          disabled: moving,
          onClick: () => onSelect(frameIndex),
        }, h("i"), h("span", null, frame.label))),
      ),
      h("div", { className: "vp-deck-actions" },
        h(Button, { variant: "text", onClick: onPrev, disabled: moving || index === 0 }, "← Prev"),
        h(Button, { variant: overview ? "tonal" : "outline", effect: "conductor", ariaPressed: overview ? "true" : "false", onClick: onFit, disabled: moving }, "Fit system"),
        h(Button, { variant: "text", onClick: onNext, disabled: moving || index === frames.length - 1 }, "Next →"),
      ),
    ),
  );
}
