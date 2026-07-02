// Frame geometry (world px) + plain content descriptors — no h() calls here.
// components/FrameContent.js turns each descriptor into vdom.
export const FRAMES = [
  {
    id: "title",
    x: 0, y: 0, w: 900, h: 560, rotate: 0,
    data: {
      kind: "title",
      eyebrow: "Nexa framework",
      heading: "Build Prezi-style presentations",
      body: "PreziStage turns a big freeform canvas into a zooming, camera-driven slideshow — no build step required.",
      cta: "Click anywhere or press → to begin",
    },
  },
  {
    id: "nobuild",
    x: 1050, y: -150, w: 520, h: 380, rotate: -6,
    data: {
      kind: "point",
      icon: "bi-lightning-charge",
      heading: "No build step",
      body: "Everything ships as plain ESM modules. Open index.html, no bundler, no npm install.",
    },
  },
  {
    id: "hooks",
    x: 1700, y: 250, w: 520, h: 380, rotate: 5,
    data: {
      kind: "point",
      icon: "bi-diagram-2",
      heading: "Familiar hooks API",
      body: "useState, useEffect, useRef and friends — the same mental model, running directly in the browser.",
    },
  },
  {
    id: "components",
    x: 1050, y: 750, w: 520, h: 380, rotate: -4,
    data: {
      kind: "point",
      icon: "bi-grid-1x2",
      heading: "~38 UI components",
      body: "Buttons, dialogs, forms, tables — a full design system ready to import from nexa-components.js.",
    },
  },
  {
    id: "code",
    x: 1750, y: 850, w: 620, h: 420, rotate: 3,
    data: {
      kind: "code",
      heading: "This slide is real markup",
      code:
`import { PreziStage } from "/dist/nexa-prezi.js";

h(PreziStage, {
  frames,
  onIndexChange: setIndex,
  controllerRef,
})`,
    },
  },
  {
    id: "overview",
    x: -60, y: -210, w: 2500, h: 1550, rotate: 0,
    data: {
      kind: "overview",
      heading: "That's PreziStage",
      bullets: [
        "One big world, positioned with plain CSS",
        "A single imperative camera transform, eased with requestAnimationFrame",
        "Everything else stays ordinary Nexa vdom",
      ],
    },
  },
];
