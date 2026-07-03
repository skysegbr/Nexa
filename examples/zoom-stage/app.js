import { h, render, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { FRAMES } from "./data.js";
import { FrameContent } from "./components/FrameContent.js";
import { ZoomToolbar } from "./components/ZoomToolbar.js";

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);

  const frames = FRAMES.map((f) => ({ ...f, content: h(FrameContent, { data: f.data }) }));

  return h(
    "div",
    { className: "pz-app" },
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      className: "pz-stage",
    }),
    h(ZoomToolbar, { index, total: frames.length, controllerRef }),
  );
}

render(App, document.getElementById("app"));
