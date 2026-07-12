// Example: server-side rendering + hydration, entirely in the browser.
//
// This demonstrates the full SSR cycle without needing a separate JS server
// runtime: we call renderToString(App) to produce an HTML string (what a real
// server would send), drop it into #app as if it arrived over the wire, then
// hydrate(App, #app) adopts that existing DOM — attaching event handlers and
// refs in place instead of recreating the nodes.
//
// useHead declares the page's document metadata: renderToString collects the
// calls, and renderHeadToString() returns the <title>/<meta> markup a real
// server would place in the document <head> (shown below the body string).
//
// renderToString + renderHeadToString + hydrate come from the server entry
// (dist/nexa-server.js); h + useState + useHead from the core.
// See docs/AI_SPEC.md §6.

import { h, useState, useHead } from "/dist/nexa.js";
import { renderToString, renderHeadToString, hydrate } from "/dist/nexa-server.js";
import { Card, Button, Badge } from "/dist/nexa-components.js";

function App() {
  const [n, setN] = useState(3);

  useHead({
    title: "Nexa — SSR + hydrate",
    meta: [
      { name: "description", content: "Server-side rendering demo: renderToString + useHead + hydrate." },
      { property: "og:title", content: "Nexa SSR demo" },
    ],
  });

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

// 1) "Server": build the HTML string with no DOM involved. renderToString
//    also collects the useHead() calls made during the render...
const html = renderToString(App);

// ...so renderHeadToString() (called AFTER) returns the <head> markup the
// server would send. On the client, useHead applies the same metadata as an
// effect once the app hydrates.
const head = renderHeadToString();

// 2) Deliver it (as a server response would) and show the raw strings.
mount.innerHTML = html;
document.getElementById("source").textContent = html;
document.getElementById("head-source").textContent = head;

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
