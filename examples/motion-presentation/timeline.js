import { stagger } from "/dist/fluxaway-motion.js";
import { LABEL_CARDS, TIMELINE_LAYERS } from "./data.js";

const sceneTrack = (at, nextAt) => {
  if (at === 0) {
    return [
      { at: 0, scale: 1, opacity: 1 },
      { at: nextAt - 700, scale: 1, opacity: 1 },
      { at: nextAt, scale: 0.965, opacity: 0, ease: "inCubic" },
    ];
  }

  const track = [
    { at: 0, x: 64, scale: 1.035, opacity: 0 },
    { at, x: 64, scale: 1.035, opacity: 0 },
    { at: at + 680, x: 0, scale: 1, opacity: 1, ease: "outCubic" },
  ];

  if (nextAt) {
    track.push(
      { at: nextAt - 700, x: 0, scale: 1, opacity: 1 },
      { at: nextAt, x: -54, scale: 0.97, opacity: 0, ease: "inCubic" },
    );
  }

  return track;
};

export function buildPresentationTracks() {
  const tracks = {
    openingScene: sceneTrack(0, 4000),
    timelineScene: sceneTrack(4000, 8000),
    labelsScene: sceneTrack(8000, 12000),
    finaleScene: sceneTrack(12000, null),

    openingKicker: [
      { at: 0, x: -30, opacity: 0 },
      { at: 520, x: 0, opacity: 1, ease: "outCubic" },
    ],
    openingTitleA: [
      { at: 140, y: 64, opacity: 0 },
      { at: 820, y: 0, opacity: 1, ease: "outBack" },
    ],
    openingTitleB: [
      { at: 300, y: 64, opacity: 0 },
      { at: 1000, y: 0, opacity: 1, ease: "outBack" },
    ],
    openingRule: [
      { at: 720, scaleX: 0, opacity: 0 },
      { at: 1320, scaleX: 1, opacity: 1, ease: "outCubic" },
    ],
    openingNote: [
      { at: 980, y: 18, opacity: 0 },
      { at: 1540, y: 0, opacity: 1, ease: "outCubic" },
    ],

    timelineHeading: [
      { at: 4000, y: 34, opacity: 0 },
      { at: 4620, y: 0, opacity: 1, ease: "outCubic" },
    ],
    playhead: [
      { at: 4700, x: -238, opacity: 0 },
      { at: 4920, x: -238, opacity: 1 },
      { at: 7200, x: 238, opacity: 1, ease: "inOutCubic" },
    ],

    labelsHeading: [
      { at: 8000, x: -34, opacity: 0 },
      { at: 8660, x: 0, opacity: 1, ease: "outCubic" },
    ],
    labelsCode: [
      { at: 9000, y: 22, opacity: 0 },
      { at: 9580, y: 0, opacity: 1, ease: "outCubic" },
    ],

    finaleHalo: [
      { at: 12000, scale: 0.72, rotate: -28, opacity: 0 },
      { at: 12800, scale: 1, rotate: 0, opacity: 1, ease: "outBack" },
    ],
    finaleTitle: [
      { at: 12400, y: 42, opacity: 0 },
      { at: 13200, y: 0, opacity: 1, ease: "outCubic" },
    ],
    finaleCopy: [
      { at: 12800, y: 24, opacity: 0 },
      { at: 13700, y: 0, opacity: 1, ease: "outCubic" },
    ],
    finaleBadge: [
      { at: 13400, scale: 0.7, opacity: 0 },
      { at: 14400, scale: 1, opacity: 1, ease: "outElastic" },
    ],
  };

  const layerKeys = [
    { at: 4400, x: -42, opacity: 0 },
    { at: 5100, x: 0, opacity: 1, ease: "outCubic" },
  ];
  TIMELINE_LAYERS.forEach((_, index) => {
    tracks[`layer${index}`] = stagger(layerKeys, 130, index);
  });

  const cardKeys = [
    { at: 8440, y: 52, rotate: 3, opacity: 0 },
    { at: 9160, y: 0, rotate: 0, opacity: 1, ease: "outBack" },
  ];
  LABEL_CARDS.forEach((_, index) => {
    tracks[`labelCard${index}`] = stagger(cardKeys, 170, index);
  });

  return tracks;
}
