// Example: server-side rendering + hydration, entirely in the browser.
//
// This demonstrates the full SSR cycle without needing a separate JS server
// runtime: we call renderToString(App) to produce an HTML string (what a real
// server would send), drop it into #app as if it arrived over the wire, then
// hydrate(App, #app) adopts that existing DOM — attaching event handlers and
// refs in place instead of recreating the nodes.
//
// renderToString + hydrate come from the server entry (dist/nexa-server.js);
// h + useState come from the core. See docs/AI_SPEC.md §6.

import { h, useState } from "/dist/nexa.js";
import { renderToString, hydrate } from "/dist/nexa-server.js";
import { Card, Button, Badge } from "/dist/nexa-components.js";

function App() {
  const [n, setN] = useState(3);

  return h(
    "section",
    { className: "m-page m-stack ssr-app" },
    h("h1", { className: "m-title-lg" }, "SSR + hydrate"),
    h(
      Card,
      null,
      h(
        "p",
        { className: "m-body" },
        "This card was rendered on the “server” with ",
        h("code", null, "renderToString"),
        ", then ",
        h("code", null, "hydrate"),
        " adopted the exact DOM below.",
      ),
      h("p", { className: "m-body" }, "Count: ", h(Badge, null, String(n))),
      h(
        "div",
        { className: "ssr-row" },
        h(Button, { variant: "contained", onClick: () => setN((v) => v + 1) }, "Add"),
        h(Button, { variant: "outlined", onClick: () => setN(0) }, "Reset"),
      ),
    ),
  );
}

const mount = document.getElementById("app");

// 1) "Server": build the HTML string with no DOM involved.
const html = renderToString(App);

// 2) Deliver it (as a server response would) and show the raw string.
mount.innerHTML = html;
document.getElementById("source").textContent = html;

// 3) Capture a node up front to prove hydration reuses it, not recreates it.
const cardBefore = mount.querySelector(".m-card");

// 4) Hydrate: adopt the existing DOM and wire up the click handlers.
hydrate(App, mount);

// 5) Report whether the same node survived hydration.
const reused = mount.querySelector(".m-card") === cardBefore;
document.getElementById("status").textContent = reused
  ? "hydrated ✓ — existing server DOM reused, handlers now live (try the buttons)"
  : "note: hydration had to recreate the DOM";
document.getElementById("status").classList.toggle("ssr-ok", reused);
