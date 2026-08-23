import { h, render, useRef, useState } from "/dist/fluxaway.js";
import { ZoomStage } from "/dist/fluxaway-zoom.js";
import { LAB_FRAMES } from "./data.js";
import { MotionConsole } from "./components/MotionConsole.js";
import { SceneFrame } from "./components/SceneFrame.js";

function App() {
  const [index, setIndex] = useState(0);
  const [settledIndex, setSettledIndex] = useState(0);
  const [status, setStatus] = useState("READY / GLIDE");
  const [moving, setMoving] = useState(false);
  const [activePreset, setActivePreset] = useState("glide");
  const [overview, setOverview] = useState(false);
  const controllerRef = useRef(null);

  const focusFrame = (targetIndex) => {
    if (!overview || moving) return;
    const frame = LAB_FRAMES[targetIndex];
    if (!frame) return;
    controllerRef.current?.goTo(targetIndex, {
      transition: frame.transition,
    });
  };

  const frames = LAB_FRAMES.map((frame, targetIndex) => ({
    ...frame,
    render: (state) => h(SceneFrame, {
      data: frame.data,
      state,
      selectable: overview && !moving,
      onSelect: () => focusFrame(targetIndex),
    }),
  }));

  const fly = (preset) => {
    const targetIndex = frames.findIndex((frame) => frame.transition?.preset === preset);
    if (targetIndex < 0) return;
    controllerRef.current?.goTo(targetIndex, {
      transition: { preset, duration: "auto" },
    });
  };

  return h(
    "main",
    { className: `zl-app${overview ? " zl-app-overview" : ""}` },
    h("div", { className: "zl-coordinate zl-coordinate-x", ariaHidden: "true" }),
    h("div", { className: "zl-coordinate zl-coordinate-y", ariaHidden: "true" }),
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      onSettledIndexChange: setSettledIndex,
      onTransitionStart: ({ preset }) => {
        setOverview(false);
        setMoving(true);
        setActivePreset(preset);
        setStatus(`FLIGHT / ${preset.toUpperCase()}`);
      },
      onTransitionEnd: ({ preset }) => {
        setMoving(false);
        setStatus(`SETTLED / ${preset.toUpperCase()}`);
      },
      controllerRef,
      duration: "auto",
      padding: 0.1,
      advanceOnClick: false,
      preload: false,
      className: "zl-stage",
      ariaLabel: "FluxaWay ZoomStage motion language laboratory",
    }),
    h(MotionConsole, {
      active: overview
        ? "Select a frame"
        : frames[settledIndex]?.label || frames[index]?.label || "—",
      status: overview ? "FIT / CLICK TO FOCUS" : status,
      moving,
      overview,
      activePreset,
      onFly: fly,
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
