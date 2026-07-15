// Nexa Star Atlas — a zoomable night sky built on the ZoomStage add-on.
// freeZoom lets you scroll/pinch to zoom and drag to roam; the guided tour
// flies the camera from constellation to constellation. app.js is the
// orchestrator: it builds the frames and wires the transport.

import { h, render, useEffect, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { CONSTELLATIONS, TOUR, WORLD } from "./data.js";
import { Starfield } from "./components/Starfield.js";
import { Constellation } from "./components/Constellation.js";
import { InfoPanel } from "./components/InfoPanel.js";
import { Controls } from "./components/Controls.js";

// Frame geometry only — NO h() at module scope (components run during render).
// The whole sky is the first (largest → painted-behind) frame; each
// constellation is a frame positioned in world pixels.
const FRAME_META = [
  { id: "sky", label: "The whole sky", x: 0, y: 0, w: WORLD.w, h: WORLD.h },
  ...CONSTELLATIONS.map((c) => ({
    id: c.id,
    label: `${c.name} — ${c.subtitle}`,
    x: c.x,
    y: c.y,
    w: c.w,
    h: c.h,
  })),
];
const STOPS = FRAME_META.length;

function App() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const controllerRef = useRef(null);

  // Content is built here, during render (h() can't run at module scope).
  const frames = FRAME_META.map((f, i) => ({
    ...f,
    content: i === 0 ? h(Starfield) : h(Constellation, { data: CONSTELLATIONS[i - 1] }),
  }));

  // Guided tour: fly to the next stop every few seconds, looping back to the
  // whole-sky view at the end.
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const ctrl = controllerRef.current;
      if (!ctrl) return;
      if (ctrl.index >= STOPS - 1) ctrl.goTo(0);
      else ctrl.next();
    }, 3800);
    return () => clearInterval(id);
  }, [playing]);

  const current = index === 0 ? null : CONSTELLATIONS[index - 1];

  return h(
    "div",
    { className: "sa-app" },
    h(ZoomStage, {
      frames,
      path: TOUR,
      index,
      onIndexChange: setIndex,
      controllerRef,
      freeZoom: true,
      padding: 0.12,
      duration: 1400,
      ariaLabel: "Interactive star atlas — a zoomable night sky",
      className: "sa-stage",
    }),
    h("p", { className: "sa-hint" }, "scroll to zoom · drag to roam · tap to fly onward"),
    h(InfoPanel, { current }),
    h(Controls, {
      index,
      total: STOPS,
      playing,
      controllerRef,
      onToggleTour: () => setPlaying((p) => !p),
    }),
  );
}

render(App, document.getElementById("app"));
