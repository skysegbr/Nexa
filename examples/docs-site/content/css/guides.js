import { h } from "/dist/fluxaway.js";

export const row = (name, type, description) => ({ name, type, description });

export const cssEntry = (entry) => ({
  category: "css",
  stylesheet: true,
  module: "fluxaway-ui-base.css",
  ...entry,
});

export const CODE = {
  monolithic: `<link rel="stylesheet" href="/dist/fluxaway-ui.css" />`,
  split: `<link rel="stylesheet" href="/dist/fluxaway-ui-base.css" />
<link rel="stylesheet" href="/dist/fluxaway-ui-core.css" />
<link rel="stylesheet" href="/dist/fluxaway-ui-forms.css" />

<!-- Add only when the page uses these categories -->
<link rel="stylesheet" href="/dist/fluxaway-ui-overlay.css" />
<link rel="stylesheet" href="/dist/fluxaway-ui-data.css" />
<link rel="stylesheet" href="/dist/fluxaway-ui-nav.css" />
<link rel="stylesheet" href="/dist/fluxaway-ui-theme.css" />`,
  cdn: `<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/skysegbr/FluxaWay@v0.24.2/dist/fluxaway-ui.min.css"
/>`,
  tokenOverride: `:root {
  --m-primary: #3157d5;
  --m-primary-hover: #2746b5;
  --m-primary-soft: #e0e7ff;
  --m-focus: #a5b4fc;
  --m-radius: 12px;
}`,
  themeAttributes: `<html data-theme="dark" data-palette="violet">
  <!-- The whole FluxaWay UI tree follows both choices. -->
</html>`,
  gridBasic: `<div class="m-row">
  <div class="m-col-12 m-col-md-8">Main</div>
  <div class="m-col-12 m-col-md-4">Aside</div>
</div>`,
  gridNested: `<div class="m-container">
  <div class="m-row m-row-gap-2">
    <article class="m-col-12 m-col-sm-6 m-col-lg-3">One</article>
    <article class="m-col-12 m-col-sm-6 m-col-lg-3">Two</article>
    <article class="m-col-12 m-col-sm-6 m-col-lg-3">Three</article>
    <article class="m-col-12 m-col-sm-6 m-col-lg-3">Four</article>
  </div>
</div>`,
  layout: `<section class="m-stack">
  <h2>Vertical rhythm</h2>
  <p>Items follow the spacing scale.</p>
</section>

<div class="m-cluster"><button>Save</button><button>Cancel</button></div>
<header class="m-split"><strong>Project</strong><nav>Actions</nav></header>`,
  spacing: `<article class="m-p-6 m-mb-4">
  <h2 class="m-mt-0 m-mb-2">Card title</h2>
  <p class="m-m-0">Card copy</p>
</article>

<div class="m-d-flex m-gap-3"><button>Back</button><button>Continue</button></div>`,
  typography: `<p class="m-eyebrow">Release notes</p>
<h1 class="m-title">A readable heading</h1>
<p class="m-body">Supporting copy uses the muted text token.</p>
<p class="m-text-sm m-text-primary m-fw-bold">Small emphasized label</p>`,
  responsiveDisplay: `<aside class="m-d-none m-d-lg-block">Desktop sidebar</aside>
<button class="m-d-inline-flex m-d-lg-none">Open menu</button>`,
  flex: `<div class="m-d-flex m-flex-wrap m-align-center m-justify-between m-gap-3">
  <strong class="m-flex-grow">Project</strong>
  <button>Preview</button><button>Publish</button>
</div>`,
  animation: `<article class="m-card m-card-padded m-anim-fade-up">Enters once from below</article>
<button class="m-button m-button-contained m-anim-pulse-glow">Needs attention</button>`,
};

const box = (label) => h("span", null, label);

export const PREVIEW = {
  tokens: () =>
    h(
      "div",
      { className: "nd-css-token-grid" },
      [
        ["Primary", "var(--m-primary)"], ["Surface", "var(--m-surface)"],
        ["Success", "var(--m-success)"], ["Warning", "var(--m-warning)"],
        ["Danger", "var(--m-danger)"], ["Info", "var(--m-info)"],
      ].map(([label, color]) =>
        h(
          "div",
          { key: label, className: "nd-css-token" },
          h("span", { className: "nd-css-token-swatch", style: { background: color } }),
          h("code", null, label),
        ),
      ),
    ),
  grid: () =>
    h(
      "div",
      { className: "m-row nd-css-grid" },
      h("div", { className: "m-col-12 m-col-md-8" }, box("m-col-md-8")),
      h("div", { className: "m-col-12 m-col-md-4" }, box("m-col-md-4")),
    ),
  responsiveGrid: () =>
    h(
      "div",
      { className: "m-row m-row-gap-2 nd-css-grid" },
      ["One", "Two", "Three", "Four"].map((label) =>
        h("div", { key: label, className: "m-col-12 m-col-sm-6 m-col-lg-3" }, box(label)),
      ),
    ),
  layout: () =>
    h(
      "div",
      { className: "m-stack nd-css-layout" },
      h("div", { className: "m-stack" }, box("Stack"), box("Vertical")),
      h("div", { className: "m-cluster" }, box("Cluster"), box("Wraps")),
      h("div", { className: "m-split" }, box("Split"), box("Edges")),
    ),
  spacing: () =>
    h(
      "div",
      { className: "m-d-flex m-flex-wrap m-align-end m-gap-4 nd-css-spacing" },
      [1, 2, 3, 4, 6, 8].map((step) =>
        h("div", { key: step, className: `m-p-${step}` }, h("code", null, `p-${step}`)),
      ),
    ),
  typography: () =>
    h(
      "div",
      { className: "m-stack nd-css-type" },
      h("p", { className: "m-eyebrow" }, "FluxaWay UI"),
      h("h2", { className: "m-title" }, "Typography follows tokens"),
      h("p", { className: "m-body" }, "Body copy keeps readable measure and muted contrast."),
      h("p", { className: "m-text-sm m-text-primary m-fw-bold" }, "Small primary label"),
    ),
  display: () =>
    h(
      "div",
      { className: "m-d-flex m-flex-wrap m-align-center m-justify-between m-gap-3 nd-css-utility" },
      h("strong", { className: "m-flex-grow m-text-truncate" }, "A flexible item that can truncate"),
      h("span", { className: "m-text-primary m-cursor-pointer" }, "Action"),
    ),
  animation: () =>
    h(
      "div",
      { className: "m-cluster nd-css-animation" },
      h("div", { className: "m-card m-card-padded m-anim-fade-up" }, "Fade up"),
      h("button", { className: "m-button m-button-contained m-anim-pulse-glow" }, "Pulse glow"),
    ),
};
