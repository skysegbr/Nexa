// The timeline's transport row: play/stop/rewind, the clock, onion-skin
// controls, zoom, loop, playback speed (preview-only), named labels and
// the document duration.

import { h, useState } from "/dist/nexa.js";
import { TransportReadout } from "./TransportReadout.js";

const ZOOMS = [1, 2, 3, 4, 6, 8];
const SPEEDS = [0.25, 0.5, 1, 2, 4];

export function TransportBar({
  tl,
  fps,
  duration,
  onSetDuration,
  onSetFps,
  onRewind,
  onion,
  onOnionToggle,
  onOnionCount,
  zoom,
  onZoom,
  loop,
  onToggleLoop,
  speed,
  onSpeed,
  onAddLabel,
}) {
  const [labelDraft, setLabelDraft] = useState(null); // name being typed | null

  const commitLabel = () => {
    const name = (labelDraft || "").trim();
    if (name) onAddLabel(name);
    setLabelDraft(null);
  };

  return h(
    "div",
    { className: "me-transport" },
    h("button", { type: "button", className: "me-btn", onClick: () => tl.play() }, "▶ play"),
    h("button", { type: "button", className: "me-btn", onClick: () => tl.stop() }, "■ stop"),
    h("button", { type: "button", className: "me-btn", onClick: onRewind }, "⏮ start"),
    // Flash's readout: current frame · frame rate · elapsed time (self-clocked).
    h(TransportReadout, { tl, fps }),

    h(
      "button",
      {
        type: "button",
        className: `me-btn${onion.on ? " me-btn-active" : ""}`,
        title: "Onion skin: ghost the frames around the playhead",
        ariaPressed: onion.on ? "true" : "false",
        onClick: onOnionToggle,
      },
      "◉ onion",
    ),
    onion.on &&
      h(
        "label",
        { className: "me-onion-range", title: "Ghost FRAMES each side of the playhead" },
        "±",
        h("input", {
          type: "number",
          min: 1,
          max: 12,
          value: onion.count,
          onChange: (e) => onOnionCount(Number(e.target.value)),
        }),
      ),

    h(
      "button",
      {
        type: "button",
        className: `me-btn${loop ? " me-btn-active" : ""}`,
        title: "Loop playback (exported with the timeline)",
        ariaPressed: loop ? "true" : "false",
        onClick: onToggleLoop,
      },
      "∞ loop",
    ),

    h(
      "label",
      { className: "me-speed", title: "Preview playback speed (not exported)" },
      "spd",
      h(
        "select",
        { value: String(speed), onChange: (e) => onSpeed(Number(e.target.value)) },
        SPEEDS.map((value) => h("option", { key: value, value: String(value) }, `${value}×`)),
      ),
    ),

    h(
      "label",
      { className: "me-speed", title: "Timeline zoom" },
      "zoom",
      h(
        "select",
        { value: String(zoom), onChange: (e) => onZoom(Number(e.target.value)) },
        ZOOMS.map((value) => h("option", { key: value, value: String(value) }, `${value}×`)),
      ),
    ),

    labelDraft === null
      ? h(
          "button",
          {
            type: "button",
            className: "me-btn",
            title: "Add a named label at the playhead (gotoAndPlay targets)",
            onClick: () => setLabelDraft(""),
          },
          "🏷 label",
        )
      : h("input", {
          className: "me-label-input",
          placeholder: "label name…",
          value: labelDraft,
          ref: (node) => node && node.focus(),
          onInput: (e) => setLabelDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") commitLabel();
            else if (e.key === "Escape") setLabelDraft(null);
          },
          onBlur: commitLabel,
        }),

    h(
      "label",
      { className: "me-fps", title: "Frame rate — the editor's frame grid" },
      "fps ",
      h("input", {
        type: "number",
        min: 1,
        max: 120,
        value: fps,
        onChange: (e) => onSetFps(Number(e.target.value)),
      }),
    ),

    h(
      "label",
      { className: "me-duration" },
      "duration (ms) ",
      h("input", {
        type: "number",
        min: 100,
        step: 100,
        value: duration,
        onChange: (e) => onSetDuration(Number(e.target.value)),
      }),
    ),
  );
}
