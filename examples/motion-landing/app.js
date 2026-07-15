// A production-shaped landing page animated by Nexa's browser-native
// component model and nexa-motion timelines. No JSX, bundler or build step.

import { h, render } from "/dist/nexa.js";
import { Header } from "./components/Header.js";
import { Hero } from "./components/Hero.js";
import { SignalStrip } from "./components/SignalStrip.js";
import { MotionLab } from "./components/MotionLab.js";
import { FeatureGrid } from "./components/FeatureGrid.js";
import { ClosingCta } from "./components/ClosingCta.js";

function App() {
  return h(
    "div",
    { className: "ml-page" },
    h(Header, null),
    h(
      "main",
      null,
      h(Hero, null),
      h(SignalStrip, null),
      h(MotionLab, null),
      h(FeatureGrid, null),
      h(ClosingCta, null),
    ),
    h(
      "footer",
      { className: "ml-footer" },
      h("a", { href: "#top", className: "ml-footer-brand" }, "NEXA / MOTION"),
      h("p", null, "A build-free experience. Made directly in the browser."),
      h("span", null, "© 2026 — frame 001"),
    ),
  );
}

render(App, document.getElementById("app"));
