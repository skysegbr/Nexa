import { h, render, useRef, useState } from "/dist/nexa.js";
import { PreziStage } from "/dist/nexa-prezi.js";
import { FRAMES } from "./data.js";
import { FrameContent } from "./components/FrameContent.js";
import { PreziToolbar } from "./components/PreziToolbar.js";

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);

  const frames = FRAMES.map((f) => ({ ...f, content: h(FrameContent, { data: f.data }) }));

  return h(
    "div",
    { className: "pz-app" },
    h(PreziStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      className: "pz-stage",
    }),
    h(PreziToolbar, { index, total: frames.length, controllerRef }),
  );
}

render(App, document.getElementById("app"));
