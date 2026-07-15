// Nexa Probe Explorer — a ZoomStage "freeZoom" explorer over one big SVG
// spacecraft. Subsystem frames are transparent camera targets over the craft;
// the toolbar drives the controllerRef, and hashNav deep-links each subsystem.

import { h, render, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { WORLD, REGIONS, TOUR } from "./data.js";
import { Probe } from "./components/Probe.js";
import { Controls } from "./components/Controls.js";
import { InfoCard } from "./components/InfoCard.js";

const FRAME_META = [
  { id: "overview", label: "The whole probe", x: 0, y: 0, w: WORLD.w, h: WORLD.h },
  ...REGIONS.map((r) => ({ id: r.id, label: `${r.name} subsystem`, x: r.x, y: r.y, w: r.w, h: r.h })),
];
const STOPS = FRAME_META.length;

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);

  const frames = FRAME_META.map((f, i) => ({ ...f, content: i === 0 ? h(Probe) : null }));
  const activeId = FRAME_META[index]?.id;
  const region = index === 0 ? null : REGIONS[index - 1];

  return h(
    "div",
    { className: "sc-app" },
    h(ZoomStage, {
      frames,
      path: TOUR,
      index,
      onIndexChange: setIndex,
      controllerRef,
      freeZoom: true,
      advanceOnClick: false,
      hashNav: true,
      padding: 0.14,
      ariaLabel: "Nexa Probe — an explorable spacecraft",
      className: "sc-stage",
    }),
    h("p", { className: "sc-hint" }, "scroll / +− zoom · drag to roam · double-click to dive · Esc recenters"),
    h(InfoCard, { region }),
    h(Controls, { index, total: STOPS, regions: REGIONS, activeId, controllerRef }),
  );
}

render(App, document.getElementById("app"));
