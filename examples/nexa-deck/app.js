import { h, render, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { FRAMES } from "./data.js";
import { FrameContent } from "./components/FrameContent.js";
import { PresentationToolbar } from "./components/PresentationToolbar.js";

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);
  const frames = FRAMES.map((frame) => ({
    ...frame,
    content: h(FrameContent, { data: frame.data }),
  }));

  return h(
    "main",
    { className: "nx-app" },
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      className: "nx-stage",
      duration: 850,
    }),
    h(PresentationToolbar, { index, total: frames.length, controllerRef }),
  );
}

render(App, document.getElementById("app"));
