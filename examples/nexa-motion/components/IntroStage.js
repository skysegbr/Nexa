// The movie's stage: starfield backdrop, preloader, flying logo, cascading
// title, tagline and the finale badge — every animated element binds to the
// master timeline through tl.track(name). The pulsing logo ring is a nested
// "movie clip" (its own looping timeline), and SKIP INTRO does what every
// 2003 visitor wished for.

import { h } from "/dist/nexa.js";
import { PulsingRing } from "./PulsingRing.js";

// Deterministic pseudo-random starfield — no assets, just divs.
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: ((i * 37) % 100) + (i % 3) * 0.3,
  top: ((i * 53) % 100) + (i % 7) * 0.2,
  size: 1 + (i % 3),
  delay: (i * 137) % 4000,
}));

export function IntroStage({ tl, letters, tagline }) {
  return h(
    "section",
    { className: "fx-stage", ariaLabel: "Animated intro" },

    // Starfield (pure CSS twinkle — the timeline drives the actors, not the set).
    h(
      "div",
      { className: "fx-stars", ariaHidden: "true" },
      STARS.map((star) =>
        h("i", {
          key: star.id,
          className: "fx-star",
          style: {
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}ms`,
          },
        }),
      ),
    ),

    // Preloader.
    h(
      "div",
      { className: "fx-loader", ref: tl.track("loader") },
      h("div", { className: "fx-loader-label" }, "LOADING…"),
      h(
        "div",
        { className: "fx-loader-track" },
        h("div", { className: "fx-loader-bar", ref: tl.track("loaderBar") }),
      ),
    ),

    // The actors.
    h(
      "div",
      { className: "fx-scene" },
      h(
        "div",
        { className: "fx-logo", ref: tl.track("logo") },
        h(PulsingRing),
        h("span", { className: "fx-logo-mark" }, "⬡"),
      ),
      h(
        "h1",
        { className: "fx-title", ariaLabel: "MOTION" },
        letters.map((letter, i) =>
          h("span", { key: i, className: "fx-letter", ref: tl.track(`letter-${i}`) }, letter),
        ),
      ),
      h("p", { className: "fx-tagline", ref: tl.track("tagline") }, tagline),
      h("div", { className: "fx-badge", ref: tl.track("badge") }, "no plugin required"),
    ),

    h(
      "button",
      {
        type: "button",
        className: "fx-skip",
        onClick: () => tl.gotoAndStop(tl.duration),
      },
      "SKIP INTRO ▸",
    ),
  );
}
