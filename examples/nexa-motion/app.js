// Example: nexa-motion — a Flash-style animated intro, 2003 energy included.
//
// One master timeline drives the whole movie (loading bar → logo flies in →
// title cascade → finale), with labels, frame scripts, easing and a
// SKIP INTRO button — plus a control deck with scrubbing, the play/stop/
// gotoAndPlay quartet, reverse and playback speed. The pulsing logo in the
// finale is a nested "movie clip": a child component with its own looping
// useTimeline.

import { h, render, useState } from "/dist/nexa.js";
import { useTimeline, stagger } from "/dist/nexa-motion.js";
import { TITLE_LETTERS, TAGLINE, SCENES } from "./data.js";
import { IntroStage } from "./components/IntroStage.js";
import { ControlDeck } from "./components/ControlDeck.js";

// Scene labels (ms). The whole movie is 5.2s, then the finale loops visually
// via the nested PulsingLogo clip while the master timeline rests at the end.
const LABELS = { loading: 0, logo: 900, title: 2000, finale: 3800 };

function buildTracks() {
  const tracks = {
    // Fake preloader: the bar fills, then the whole loader fades away.
    loaderBar: [
      { at: 0, scaleX: 0 },
      { at: 700, scaleX: 1, ease: "outCubic" },
    ],
    loader: [
      { at: 0, opacity: 1 },
      { at: 700, opacity: 1 },
      { at: 900, opacity: 0 },
    ],

    // The logo storms in from the left and settles with an outBack snap,
    // then drifts to make room for the title.
    logo: [
      { at: 900, x: -560, rotate: -180, opacity: 0 },
      { at: 1700, x: 0, rotate: 0, opacity: 1, ease: "outBack" },
      { at: 2400, y: 0 },
      { at: 3000, y: -40, scale: 0.85, ease: "inOutCubic" },
    ],

    // Tagline and finale badge.
    tagline: [
      { at: 2900, y: 16, opacity: 0 },
      { at: 3400, y: 0, opacity: 1, ease: "outCubic" },
    ],
    badge: [
      { at: 3800, scale: 0, opacity: 0 },
      { at: 4400, scale: 1, opacity: 1, ease: "outElastic" },
    ],
  };

  // Title letters cascade in — the classic stagger.
  const LETTER = [
    { at: 2000, y: 90, opacity: 0, rotate: 8 },
    { at: 2550, y: 0, opacity: 1, rotate: 0, ease: "outBack" },
  ];
  TITLE_LETTERS.forEach((_, i) => {
    tracks[`letter-${i}`] = stagger(LETTER, 110, i);
  });

  return tracks;
}

function App() {
  const [scene, setScene] = useState("loading");

  const tl = useTimeline({
    duration: 5200,
    labels: LABELS,
    tracks: buildTracks(),
    // Frame scripts: exactly like AS1 code on a frame — the movie reports
    // which scene the playhead entered.
    onFrame: {
      loading: () => setScene("loading"),
      logo: () => setScene("logo"),
      title: () => setScene("title"),
      finale: () => setScene("finale"),
    },
  });

  return h(
    "div",
    { className: "fx-app" },
    h(IntroStage, { tl, letters: TITLE_LETTERS, tagline: TAGLINE }),
    h(ControlDeck, { tl, scenes: SCENES, scene }),
  );
}

render(App, document.getElementById("app"));
