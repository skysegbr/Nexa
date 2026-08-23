// Static site configuration. Reference metadata and lazy content loaders live
// in content/catalog.js; this file owns only shell and landing-page data.

export const NAV_LINKS = [
  { label: "Docs", href: "#/getting-started", match: "/getting-started" },
  { label: "AI & security", href: "#/ai-security", match: "/ai-security" },
  { label: "CSS", href: "#/css/installation", match: "/css" },
  { label: "Components", href: "#/components/button", match: "/components" },
];

// Public examples copied into build/docs-site/examples. Keep this manifest in
// sync with the deploy bundle; the docs smoke protects the complete href list.
export const EXAMPLE_LINKS = [
  { label: "Basic", href: "/examples/basic/" },
  { label: "Complete page", href: "/examples/complete-page/" },
  { label: "Components", href: "/examples/components/" },
  { label: "Designer", href: "/examples/designer/" },
  { label: "Drug recalls", href: "/examples/drug-recalls/" },
  { label: "FluxaWay Architecture", href: "/examples/fluxaway-architecture/" },
  { label: "FluxaWay Atlas", href: "/examples/fluxaway-atlas/" },
  { label: "FluxaWay Motion", href: "/examples/fluxaway-motion/" },
  { label: "Form", href: "/examples/form/" },
  { label: "Gallery", href: "/examples/gallery/" },
  { label: "Inox Landing", href: "/examples/inox-landing/" },
  { label: "Landing", href: "/examples/landing/" },
  { label: "Metallic themes", href: "/examples/metallic-themes/" },
  { label: "Mind map", href: "/examples/mindmap/" },
  { label: "Minified build", href: "/examples/minified/" },
  { label: "Mobile", href: "/examples/mobile/" },
  { label: "Motion Editor", href: "/examples/motion-editor/" },
  { label: "Motion Landing", href: "/examples/motion-landing/" },
  { label: "Palate Journey", href: "/examples/palate-journey/" },
  { label: "SSR", href: "/examples/ssr/" },
  { label: "Star Atlas", href: "/examples/star-atlas/" },
  { label: "Storefront", href: "/examples/storefront/" },
  { label: "VITRA Protocol", href: "/examples/vitra-protocol/" },
  { label: "Zoom Motion Lab", href: "/examples/zoom-lab/" },
];

export const QUICK_START = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/dist/fluxaway-ui.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>`;

export const FIRST_APP = `import { h, render, useState } from "/dist/fluxaway.js";
import { Button, Card } from "/dist/fluxaway-components-core.js";

function App() {
  const [count, setCount] = useState(0);

  return h(
    Card,
    { padded: true },
    h("h1", null, "Clicks: ", count),
    h(Button, { variant: "contained", onClick: () => setCount((value) => value + 1) }, "Add"),
  );
}

// A function reference — never render(h(App), ...)
render(App, document.getElementById("app"));`;

export const CDN_SNIPPET = `<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/skysegbr/FluxaWay@main/dist/fluxaway-ui.css" />

<script type="module">
  import { h, render } from "https://cdn.jsdelivr.net/gh/skysegbr/FluxaWay@main/dist/fluxaway.js";

  render(() => h("h1", null, "Hello from the CDN"), document.body);
</script>`;

export const CATEGORY_IMPORTS = `// Preferred: only the categories the page actually uses
import { Button, Card } from "/dist/fluxaway-components-core.js";
import { TextField } from "/dist/fluxaway-components-forms.js";

// Also valid: the barrel — same names, but downloads every category
import { Button, Card, TextField } from "/dist/fluxaway-components.js";`;

export const HOME_CARDS = [
  {
    icon: "bi-lightning-charge",
    title: "Zero build step",
    body: "Plain ES modules over HTTP. No bundler, no transpiler, no node_modules to audit.",
  },
  {
    icon: "bi-braces",
    title: "Hooks you already know",
    body: "useState, useEffect, useMemo, useForm, useRouter — a React-shaped API with FluxaWay's own eager rendering.",
  },
  {
    icon: "bi-palette",
    title: "Themes and palettes",
    body: "Light/dark plus six palettes drive every component through --m-* custom properties.",
  },
  {
    icon: "bi-box-seam",
    title: "Split by category",
    body: "Six JS modules and seven CSS files, so a page ships only the part of the library it renders.",
  },
  {
    icon: "bi-shield-check",
    title: "Security and AI",
    body: "Zero runtime dependencies reduce supply-chain risk, while AI_SPEC gives assistants explicit rules for generating reviewable FluxaWay code.",
  },
];

export const ADDON_LINKS = [
  { label: "FluxaWay Motion", href: "#/addons/fluxaway-motion" },
  { label: "ZoomStage", href: "#/addons/zoom-stage" },
  { label: "PipelineCanvas", href: "#/addons/pipeline-canvas" },
  { label: "FullCodeEditor", href: "#/addons/full-code-editor" },
];

export const GUIDE_STEPS = [
  {
    id: "install",
    title: "1. Serve the files",
    body:
      "Copy dist/ next to your page (or point at the CDN) and serve the folder over HTTP — " +
      "opening index.html from the filesystem will not work, because ES modules need a real origin.",
    code: QUICK_START,
    lang: "html",
  },
  {
    id: "first-app",
    title: "2. Write a component",
    body:
      "Components are plain functions returning h() nodes. render() takes the function itself, " +
      "not h(App) — passing a call result throws \"App can only be used during rendering\".",
    code: FIRST_APP,
  },
  {
    id: "imports",
    title: "3. Import only what you render",
    body:
      "The component library is split into six category modules. The barrel re-exports all of " +
      "them, which is convenient but downloads the whole library in a no-build setup.",
    code: CATEGORY_IMPORTS,
  },
  {
    id: "cdn",
    title: "4. Or skip the download entirely",
    body:
      "Every module is on jsDelivr. Use @main while you explore and pin a release tag in production.",
    code: CDN_SNIPPET,
    lang: "html",
  },
];
