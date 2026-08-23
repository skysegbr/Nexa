import { h, render, useMediaQuery, useRef, useState } from "/dist/fluxaway.js";
import { ZoomStage } from "/dist/fluxaway-zoom.js";
import { VITRA_FRAMES } from "./data.js";
import { ControlDeck } from "./components/navigation/ControlDeck.js";
import { SceneContent } from "./components/scenes/SceneContent.js";

function App() {
  const [index, setIndex] = useState(0);
  const [settledIndex, setSettledIndex] = useState(0);
  const [moving, setMoving] = useState(false);
  const [overview, setOverview] = useState(false);
  const [flight, setFlight] = useState("GLIDE");
  const controllerRef = useRef(null);
  const compact = useMediaQuery("(max-width: 760px)");

  const focusFrame = (targetIndex) => {
    if (!overview || moving) return;
    const frame = VITRA_FRAMES[targetIndex];
    controllerRef.current?.goTo(targetIndex, { transition: frame.transition });
  };

  const frames = VITRA_FRAMES.map(({ compact: compactGeometry, ...frame }, frameIndex) => ({
    ...frame,
    ...(compact ? compactGeometry : null),
    render: (state) => h(SceneContent, {
      scene: frame.data,
      state,
      selectable: overview && !moving,
      onSelect: () => focusFrame(frameIndex),
    }),
  }));

  return h(
    "main",
    { className: `vp-app${overview ? " vp-app-overview" : ""}` },
    h("span", { className: "vp-world-axis vp-world-axis-x", ariaHidden: "true" }),
    h("span", { className: "vp-world-axis vp-world-axis-y", ariaHidden: "true" }),
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      onSettledIndexChange: setSettledIndex,
      onTransitionStart: ({ preset }) => {
        setOverview(false);
        setMoving(true);
        setFlight(preset.toUpperCase());
      },
      onTransitionEnd: () => setMoving(false),
      controllerRef,
      duration: "auto",
      padding: 0.1,
      advanceOnClick: false,
      preload: "adjacent",
      className: "vp-stage",
      ariaLabel: "VITRA material protocol presentation",
    }),
    h(ControlDeck, {
      frames: VITRA_FRAMES,
      index,
      settledIndex,
      moving,
      overview,
      flight,
      onSelect: (targetIndex) => controllerRef.current?.goTo(targetIndex),
      onPrev: () => controllerRef.current?.prev(),
      onNext: () => controllerRef.current?.next(),
      onFit: () => {
        setOverview(true);
        controllerRef.current?.fitAll();
      },
    }),
  );
}

render(App, document.getElementById("app"));
