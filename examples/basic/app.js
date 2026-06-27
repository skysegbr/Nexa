import { h, render, useState } from "/dist/nexa.js";
import { AddButton }   from "./components/AddButton.js";
import { BasicBrand }  from "./components/BasicBrand.js";
import { BasicTopbar } from "./components/BasicTopbar.js";
import { ClickCount }  from "./components/ClickCount.js";

function App() {
  const [count, setCount] = useState(0);

  return h(
    "div",
    null,
    h(BasicTopbar),
    h(
      "section",
      { className: "m-page m-stack" },
      h(BasicBrand),
      h("h1", { className: "m-title-xl" }, "No build"),
      h(ClickCount, { count }),
      h(AddButton, { setCount }),
    ),
  );
}

render(App, document.getElementById("app"));
