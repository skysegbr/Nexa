import { h, render, useEffect, useRef, useState } from "/dist/nexa.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { COURSES, TABLE_GEOMETRY } from "./data.js";
import { DishFrame } from "./components/DishFrame.js";
import { TastingHUD } from "./components/TastingHUD.js";

function App() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!auto) return undefined;
    const timer = setTimeout(() => {
      if (index === COURSES.length - 1) controllerRef.current?.goTo(0);
      else controllerRef.current?.next();
    }, 6200);
    return () => clearTimeout(timer);
  }, [auto, index]);

  const frames = COURSES.map((course, courseIndex) => ({
    id: course.id,
    ...TABLE_GEOMETRY[courseIndex],
    content: h(DishFrame, { course, active: index === courseIndex, courseIndex }),
  }));

  return h(
    "main",
    { className: `pj-app pj-tone-${COURSES[index].tone}` },
    h("div", { className: "pj-table-texture", ariaHidden: "true" }),
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      duration: 1550,
      padding: 0.014,
      advanceOnClick: false,
      className: "pj-stage",
    }),
    h(TastingHUD, {
      courses: COURSES,
      index,
      auto,
      onAuto: () => setAuto((value) => !value),
      controllerRef,
    }),
  );
}

render(App, document.getElementById("app"));
