import { h, render, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { FRAMES } from "./data.js";
import { FrameContent } from "./components/FrameContent.js";
import { Compass } from "./components/Compass.js";

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);

  const activeId = FRAMES[index]?.id;

  // Clicking a background (non-active) frame should zoom straight to it,
  // not just fall through to ZoomStage's default "click = advance one
  // step" — controllerRef.current is read lazily inside the handler
  // (never destructured here), so it's always the fresh value set by
  // THIS render's h(ZoomStage, ...) call below by the time a click fires.
  const frames = FRAMES.map((f) => ({
    ...f,
    content: h(
      "div",
      {
        className: `atl-frame-click-target${f.id === activeId ? "" : " atl-frame-click-target-inactive"}`,
        onClick: f.id === activeId ? undefined : (e) => {
          e.stopPropagation();
          controllerRef.current?.goTo(f.id);
        },
      },
      h(FrameContent, { data: f.data }),
    ),
  }));
  const label = FRAMES[index]?.data.eyebrow ?? "";

  return h(
    "div",
    { className: "atl-app" },
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      className: "atl-stage",
      duration: 900,
    }),
    h(Compass, { index, total: frames.length, label, controllerRef }),
  );
}

render(App, document.getElementById("app"));
