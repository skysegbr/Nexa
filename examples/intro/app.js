import { h, render, useEffect, useState } from "/dist/nexa.js";
import { IntroPanel }  from "./components/IntroPanel.js";
import { IntroTopbar } from "./components/IntroTopbar.js";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    setMessage("Nexa imported directly from dist/nexa.js - no build.");
  }, []);

  return h(
    "div",
    { className: "i-shell" },
    h(IntroTopbar),
    h(IntroPanel, { count, setCount, message }),
  );
}

render(App, document.getElementById("app"));
