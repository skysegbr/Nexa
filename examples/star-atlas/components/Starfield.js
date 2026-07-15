// The backdrop for the whole world: a few hundred faint stars and a couple of
// soft nebulae, scattered deterministically so the sky is stable across
// renders. This is the content of the big "sky" frame, painted behind every
// constellation (ZoomStage draws the largest-area frame first).

import { h } from "/dist/nexa.js";
import { WORLD } from "../data.js";

function mulberry32(seed) {
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260715);
const STARS = Array.from({ length: 240 }, () => {
  const roll = rng();
  return {
    x: rng() * WORLD.w,
    y: rng() * WORLD.h,
    size: 0.6 + rng() * 2.4,
    opacity: 0.2 + rng() * 0.6,
    twinkle: roll < 0.18,
    delay: rng() * 7,
  };
});

const NEBULAE = [
  { x: 900, y: 620, r: 950, color: "rgba(84,116,255,0.10)" },
  { x: 3300, y: 1950, r: 1150, color: "rgba(178,96,220,0.09)" },
  { x: 2050, y: 2350, r: 820, color: "rgba(74,186,205,0.07)" },
  { x: 3500, y: 500, r: 700, color: "rgba(120,150,255,0.06)" },
];

export function Starfield() {
  return h(
    "div",
    { className: "sa-starfield" },
    NEBULAE.map((n, i) =>
      h("div", {
        key: `neb-${i}`,
        className: "sa-nebula",
        style: {
          left: `${n.x - n.r}px`,
          top: `${n.y - n.r}px`,
          width: `${n.r * 2}px`,
          height: `${n.r * 2}px`,
          background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
        },
      }),
    ),
    STARS.map((s, i) =>
      h("div", {
        key: i,
        className: s.twinkle ? "sa-bgstar sa-twinkle" : "sa-bgstar",
        style: {
          left: `${s.x}px`,
          top: `${s.y}px`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          opacity: s.twinkle ? undefined : s.opacity,
          animationDelay: s.twinkle ? `${s.delay}s` : undefined,
        },
      }),
    ),
  );
}
