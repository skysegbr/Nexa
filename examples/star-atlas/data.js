// The star atlas world: one big dark canvas the camera roams across. Each
// constellation is a ZoomStage "frame" positioned in world pixels; its stars
// and connecting lines are LOCAL to that frame. No h() calls live here —
// components/ turns this data into vdom.

export const WORLD = { w: 4200, h: 2800 };

// stars: { x, y, m, name?, color? }  — m is a magnitude-ish radius (2–6).
// lines: pairs of star indices to connect.
export const CONSTELLATIONS = [
  {
    id: "orion",
    name: "Orion",
    subtitle: "The Hunter",
    blurb: "Red Betelgeuse burns at his shoulder while blue-white Rigel marks his heel. The three belt stars point the way across the winter sky.",
    x: 380, y: 320, w: 600, h: 820,
    stars: [
      { x: 150, y: 120, m: 5.5, name: "Betelgeuse", color: "#ffb27a" },
      { x: 430, y: 90, m: 4 },
      { x: 250, y: 400, m: 3.5 },
      { x: 320, y: 420, m: 3.5 },
      { x: 390, y: 440, m: 3.5 },
      { x: 470, y: 700, m: 4 },
      { x: 170, y: 730, m: 5.5, name: "Rigel", color: "#bcd4ff" },
      { x: 300, y: 520, m: 2.5 },
      { x: 312, y: 585, m: 2.5 },
    ],
    lines: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 6], [4, 5], [3, 7], [7, 8]],
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    subtitle: "The Great Bear · Big Dipper",
    blurb: "The seven bright stars of the Plough. Trace the two front bowl stars upward and they point straight at Polaris, the north star.",
    x: 2380, y: 240, w: 720, h: 420,
    stars: [
      { x: 90, y: 300, m: 4 },
      { x: 100, y: 180, m: 4.5, name: "Dubhe", color: "#ffd9a8" },
      { x: 250, y: 150, m: 3.5 },
      { x: 270, y: 280, m: 3.5 },
      { x: 400, y: 230, m: 3.5 },
      { x: 520, y: 180, m: 3.5 },
      { x: 630, y: 120, m: 4.5, name: "Alkaid" },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    subtitle: "The Queen",
    blurb: "An unmistakable W (or M) of five stars wheeling around the pole opposite the Great Bear — the vain queen chained to her throne.",
    x: 3180, y: 1380, w: 620, h: 320,
    stars: [
      { x: 70, y: 130, m: 4 },
      { x: 180, y: 230, m: 3.5 },
      { x: 310, y: 120, m: 4.5, name: "Schedar", color: "#ffd0a0" },
      { x: 440, y: 240, m: 3.5 },
      { x: 560, y: 120, m: 4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: "lyra",
    name: "Lyra",
    subtitle: "The Harp",
    blurb: "Small but brilliant: Vega, one of the brightest stars in the sky, hangs above a tidy little parallelogram — the strings of the harp.",
    x: 1520, y: 1720, w: 360, h: 440,
    stars: [
      { x: 130, y: 70, m: 6, name: "Vega", color: "#cfe0ff" },
      { x: 70, y: 210, m: 3 },
      { x: 210, y: 190, m: 3 },
      { x: 110, y: 350, m: 3 },
      { x: 250, y: 330, m: 3 },
    ],
    lines: [[0, 2], [1, 2], [2, 4], [4, 3], [3, 1]],
  },
  {
    id: "scorpius",
    name: "Scorpius",
    subtitle: "The Scorpion",
    blurb: "A long curving tail ending in the sting, with the red heart of Antares glowing at its centre — a rival to Mars in colour.",
    x: 430, y: 1640, w: 520, h: 780,
    stars: [
      { x: 120, y: 80, m: 3.5 },
      { x: 210, y: 140, m: 3.5 },
      { x: 240, y: 250, m: 6, name: "Antares", color: "#ff8a6a" },
      { x: 270, y: 360, m: 3.5 },
      { x: 320, y: 470, m: 3.5 },
      { x: 360, y: 580, m: 3.5 },
      { x: 300, y: 670, m: 3.5 },
      { x: 210, y: 700, m: 4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  {
    id: "crux",
    name: "Crux",
    subtitle: "The Southern Cross",
    blurb: "The smallest constellation, yet the compass of the southern sky. Its long axis points the way to the celestial south pole.",
    x: 2720, y: 1960, w: 340, h: 440,
    stars: [
      { x: 110, y: 40, m: 4 },
      { x: 150, y: 390, m: 5.5, name: "Acrux", color: "#cfe0ff" },
      { x: 20, y: 220, m: 3.5 },
      { x: 260, y: 190, m: 4 },
      { x: 170, y: 250, m: 2.5 },
    ],
    lines: [[0, 1], [2, 3]],
  },
];

// The guided tour: start zoomed out on the whole sky, then fly star to star.
export const TOUR = ["sky", ...CONSTELLATIONS.map((c) => c.id)];
