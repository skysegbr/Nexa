// The player deck: scrubber, the Flash quartet (play/stop/gotoAndPlay/
// gotoAndStop via scene buttons), reverse and speed. It polls the playhead
// on its own small interval — state lives HERE, so only the deck re-renders
// while the movie plays (Nexa's targeted subtree re-rendering at work).

import { h, useEffect, useState } from "/dist/nexa.js";

const SPEEDS = [0.5, 1, 2];

export function ControlDeck({ tl, scenes, scene }) {
  const [time, setTime] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(Math.round(tl.time)), 50);
    return () => clearInterval(id);
  }, []);

  const pickSpeed = (value) => {
    setSpeedState(value);
    tl.setSpeed(value);
  };

  const flip = () => {
    tl.reverse();
    setReversed((r) => !r);
  };

  return h(
    "section",
    { className: "fx-deck", ariaLabel: "Playback controls" },

    h(
      "div",
      { className: "fx-deck-row" },
      h("button", { type: "button", className: "fx-btn", onClick: () => tl.play() }, "▶ play"),
      h("button", { type: "button", className: "fx-btn", onClick: () => tl.stop() }, "■ stop"),
      h(
        "button",
        {
          type: "button",
          className: `fx-btn${reversed ? " fx-btn-active" : ""}`,
          onClick: flip,
        },
        "◀ reverse",
      ),
      h(
        "span",
        { className: "fx-speed", role: "group", ariaLabel: "Playback speed" },
        SPEEDS.map((value) =>
          h(
            "button",
            {
              key: value,
              type: "button",
              className: `fx-btn fx-btn-small${speed === value ? " fx-btn-active" : ""}`,
              onClick: () => pickSpeed(value),
            },
            `${value}×`,
          ),
        ),
      ),
      h("span", { className: "fx-clock" }, `${(time / 1000).toFixed(2)}s / ${(tl.duration / 1000).toFixed(2)}s`),
    ),

    h("input", {
      className: "fx-scrub",
      type: "range",
      min: 0,
      max: tl.duration,
      step: 10,
      value: time,
      ariaLabel: "Timeline scrubber",
      onInput: (e) => {
        tl.stop();
        tl.seek(Number(e.target.value));
        setTime(Number(e.target.value));
      },
    }),

    h(
      "div",
      { className: "fx-deck-row fx-deck-scenes" },
      scenes.map((entry) =>
        h(
          "button",
          {
            key: entry.label,
            type: "button",
            className: `fx-btn fx-btn-small${scene === entry.label ? " fx-btn-active" : ""}`,
            onClick: () => tl.gotoAndPlay(entry.label),
          },
          entry.caption,
        ),
      ),
    ),
  );
}
