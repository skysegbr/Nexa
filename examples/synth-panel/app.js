// Nexa Synth Explorer — a ZoomStage "freeZoom" explorer over one big SVG
// control panel. Region frames are transparent camera targets layered over the
// panel; the toolbar drives the controllerRef (fitAll / reset / zoom), and
// hashNav deep-links each module to the URL. app.js orchestrates.

import { h, render, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { WORLD, REGIONS, TOUR } from "./data.js";
import { Synth } from "./components/Synth.js";
import { Controls } from "./components/Controls.js";
import { InfoCard } from "./components/InfoCard.js";

// Geometry only — no h() at module scope. The panel art lives in the big
// "overview" frame; each module is a transparent hotspot layered on top.
const FRAME_META = [
  { id: "overview", label: "The whole panel", x: 0, y: 0, w: WORLD.w, h: WORLD.h },
  ...REGIONS.map((r) => ({ id: r.id, label: `${r.name} module`, x: r.x, y: r.y, w: r.w, h: r.h })),
];
const STOPS = FRAME_META.length;

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);

  const frames = FRAME_META.map((f, i) => ({ ...f, content: i === 0 ? h(Synth) : null }));
  const activeId = FRAME_META[index]?.id;
  const region = index === 0 ? null : REGIONS[index - 1];

  return h(
    "div",
    { className: "sy-app" },
    h(ZoomStage, {
      frames,
      path: TOUR,
      index,
      onIndexChange: setIndex,
      controllerRef,
      freeZoom: true,
      advanceOnClick: false, // taps don't step → double-click dives into a module
      hashNav: true,
      padding: 0.14,
      ariaLabel: "Nexa Synth — an explorable control panel",
      className: "sy-stage",
    }),
    h("p", { className: "sy-hint" }, "scroll / +− zoom · drag to roam · double-click to dive · Esc recenters"),
    h(InfoCard, { region }),
    h(Controls, { index, total: STOPS, regions: REGIONS, activeId, controllerRef }),
  );
}

render(App, document.getElementById("app"));
