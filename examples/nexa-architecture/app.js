import { h, render, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { ARCHITECTURE_FRAMES } from "./data.js";
import { FrameContent } from "./components/FrameContent.js";
import { NavDock } from "./components/NavDock.js";

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);
  const activeId = ARCHITECTURE_FRAMES[index]?.id;

  const frames = ARCHITECTURE_FRAMES.map((frame) => ({
    ...frame,
    content: h(
      "div",
      {
        className: `arch-frame-hit${frame.id === activeId ? "" : " arch-frame-hit-idle"}`,
        onClick: frame.id === activeId ? undefined : (event) => {
          event.stopPropagation();
          controllerRef.current?.goTo(frame.id);
        },
      },
      h(FrameContent, { data: frame.data }),
    ),
  }));

  return h(
    "div",
    { className: "arch-app" },
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      className: "arch-stage",
      duration: 820,
      padding: 0.13,
    }),
    h(NavDock, {
      index,
      total: frames.length,
      label: ARCHITECTURE_FRAMES[index]?.data.eyebrow ?? "",
      controllerRef,
    }),
  );
}

render(App, document.getElementById("app"));
