import { h, useTheme } from "/dist/nexa.js";
import { Counter }       from "./Counter.js";
import { ServerMessage } from "./ServerMessage.js";

export function IntroPanel({ count, setCount, message }) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "article",
    { className: "i-panel" },
    h(
      "span",
      { className: "i-hero-mark" },
      h("img", { src: logoSrc, alt: "", width: 140, height: 140 }),
    ),
    h("p", { className: "i-eyebrow" }, "Pure JavaScript"),
    h("h1", { className: "i-title" }, "Nexa in the browser"),
    h(
      "p",
      { className: "i-copy" },
      "Components are functions, state updates the screen, and events work directly in the browser.",
    ),
    h(Counter, { count, setCount }),
    h(ServerMessage, { message }),
  );
}
