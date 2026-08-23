import { h } from "/dist/fluxaway.js";
import { Button } from "/dist/fluxaway-components-core.js";
import { PRESET_LABELS } from "../data.js";

export function MotionConsole({ active, status, moving, overview, activePreset, onFly, onPrev, onNext, onFit }) {
  return h(
    "aside",
    { className: "zl-console", ariaLabel: "Zoom motion controls" },
    h("div", { className: "zl-console-brand" },
      h("strong", null, "FluxaWay"),
      h("span", null, "ZOOM MOTION LAB / V2"),
    ),
    h("div", { className: "zl-console-readout" },
      h("span", null, overview ? "WORLD OVERVIEW" : moving ? "CAMERA IN FLIGHT" : "CAMERA SETTLED"),
      h("strong", null, active),
      h("small", null, status),
    ),
    h("div", { className: "zl-console-presets" },
      Object.entries(PRESET_LABELS).map(([preset, label]) =>
        h(Button, {
          key: preset,
          variant: !overview && activePreset === preset ? "tonal" : "outline",
          className: !overview && activePreset === preset ? "zl-preset-active" : "",
          ariaPressed: !overview && activePreset === preset ? "true" : "false",
          disabled: moving,
          onClick: () => onFly(preset),
        }, label),
      ),
    ),
    h("div", { className: "zl-console-nav" },
      h(Button, { variant: "text", onClick: onPrev, disabled: moving }, "← Prev"),
      h(Button, {
        variant: overview ? "tonal" : "text",
        className: overview ? "zl-fit-active" : "",
        ariaPressed: overview ? "true" : "false",
        onClick: onFit,
        disabled: moving,
      }, "Fit world"),
      h(Button, { variant: "text", onClick: onNext, disabled: moving }, "Next →"),
    ),
  );
}
