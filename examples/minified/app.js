// Example: running Nexa from the MINIFIED build.
//
// Everything here imports from the *.min.js bundles produced by
// `python scripts/minify.py` (or `npm run minify`) instead of the readable
// dist/*.js sources. The minifier is safe by construction — same API, same
// behavior — so this demo also exercises the nested router (useRoutes) to
// prove features work identically when minified.
//
// For a real, multi-section app use the domain-componentized layout
// (see docs/AI_SPEC.md §12/§14). A single inline app.js like this is only
// meant as a throwaway showcase.

import { h, render, useState, useRoutes, useRouter } from "/dist/nexa.min.js";
import { Button, Card, ThemeToggle, Badge } from "/dist/nexa-components.min.js";

function Nav() {
  const { path } = useRouter();
  const link = (href, label) =>
    h(
      "a",
      { href, className: "mn-link" + (path === href.slice(1) ? " mn-link-active" : "") },
      label,
    );
  return h("nav", { className: "mn-nav" }, link("#/", "Home"), link("#/counter", "Counter"), link("#/about", "About"));
}

function Home() {
  return h(
    Card,
    null,
    h("h2", { className: "m-title-md" }, "Loaded from the minified build"),
    h(
      "p",
      { className: "m-body" },
      "This page imports ",
      h("code", null, "/dist/nexa.min.js"),
      " and ",
      h("code", null, "/dist/nexa-components.min.js"),
      ". Same API, ~25% smaller uncompressed.",
    ),
  );
}

function Counter() {
  const [n, setN] = useState(0);
  return h(
    Card,
    null,
    h("h2", { className: "m-title-md" }, "Counter"),
    h("p", { className: "m-body" }, "Clicks: ", h(Badge, null, String(n))),
    h("div", { className: "mn-row" },
      h(Button, { variant: "contained", onClick: () => setN((v) => v + 1) }, "Add"),
      h(Button, { variant: "outlined", onClick: () => setN(0) }, "Reset"),
    ),
  );
}

function About() {
  return h(
    Card,
    null,
    h("h2", { className: "m-title-md" }, "About"),
    h("p", { className: "m-body" }, "Nexa is a no-build, ESM-native frontend framework. This demo runs its minified bundles directly in the browser."),
  );
}

// Nested-router config resolved against the current hash path.
const routes = [
  { path: "/", component: Home },
  { path: "/counter", component: Counter },
  { path: "/about", component: About },
  { path: "*", element: h("p", { className: "m-body" }, "Not found") },
];

function App() {
  const view = useRoutes(routes);
  return h(
    "section",
    { className: "m-page m-stack mn-page" },
    h("header", { className: "mn-header" },
      h("h1", { className: "m-title-xl" }, "⬡ Nexa · minified"),
      h(ThemeToggle, null),
    ),
    h(Nav),
    view,
  );
}

render(App, document.getElementById("app"));
