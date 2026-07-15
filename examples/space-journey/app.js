import { h, render, useEffect, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { FRAME_GEOMETRY, SCENES } from "./data.js";
import { SpaceFrame } from "./components/SpaceFrame.js";
import { MissionHUD } from "./components/MissionHUD.js";

function App() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!auto) return undefined;
    const id = setTimeout(() => {
      if (index === SCENES.length - 1) controllerRef.current?.goTo(0);
      else controllerRef.current?.next();
    }, 6500);
    return () => clearTimeout(id);
  }, [auto, index]);

  const frames = SCENES.map((scene, sceneIndex) => ({
    id: scene.id,
    ...FRAME_GEOMETRY[sceneIndex],
    content: h(SpaceFrame, { scene, active: sceneIndex === index, sceneIndex }),
  }));

  return h(
    "div",
    { className: `sj-app sj-tone-${SCENES[index].tone}` },
    h("div", { className: "sj-starfield", ariaHidden: "true" }),
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      duration: 1750,
      padding: 0.012,
      advanceOnClick: false,
      className: "sj-stage",
    }),
    h(MissionHUD, {
      scenes: SCENES,
      index,
      auto,
      onAuto: () => setAuto((current) => !current),
      controllerRef,
    }),
  );
}

render(App, document.getElementById("app"));
