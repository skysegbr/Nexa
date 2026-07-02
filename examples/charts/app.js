import { h, render, useState, useErrorBoundary } from "/dist/nexa.js";
import { DATASETS } from "./data.js";
import { DonutChart } from "./components/DonutChart.js";
import { Toolbar } from "./components/Toolbar.js";
import { ChartFallback } from "./components/ChartFallback.js";

function App() {
  const [datasetKey, setDatasetKey] = useState("q1");
  const [error, reset, guard] = useErrorBoundary();

  // Picking a period is also the fix for a broken render, so reset alongside
  // it — that gives the next dataset a clean attempt instead of leaving the
  // boundary latched on the previous error.
  function selectDataset(key) {
    setDatasetKey(key);
    reset();
  }

  return h(
    "section",
    { className: "c-page" },
    h(
      "header",
      { className: "c-header" },
      h("p", { className: "c-eyebrow" }, "h() + SVG + useErrorBoundary"),
      h("h1", null, "Sales dashboard"),
      h(
        "p",
        { className: "c-copy" },
        "The chart is pure SVG built with h() — no libraries, no build. Choose the ",
        h("strong", null, '"corrupted feed"'),
        " to see useErrorBoundary catch the rendering error and show a fallback, without crashing the rest of the page.",
      ),
    ),
    h(Toolbar, { datasetKey, onSelect: selectDataset }),
    h(
      "div",
      { className: "c-stage" },
      error
        ? h(ChartFallback, { error, onRecover: () => selectDataset("q1") })
        : guard(() => h(DonutChart, { dataset: DATASETS[datasetKey] })),
    ),
  );
}

render(App, document.getElementById("app"));
