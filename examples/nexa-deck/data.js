export const FRAMES = [
  {
    id: "abertura",
    x: 0,
    y: 0,
    w: 980,
    h: 610,
    rotate: 0,
    data: {
      kind: "title",
      eyebrow: "Nexa",
      heading: "Frontend straight in the browser",
      body: "An ESM-native JavaScript framework, no build, with functional components, hooks and visual add-ons ready to run via script type=\"module\".",
      meta: ["No-build", "Plain JavaScript", "React-like hooks"],
    },
  },
  {
    id: "browser",
    x: 1160,
    y: -180,
    w: 560,
    h: 600,
    rotate: -7,
    data: {
      kind: "point",
      eyebrow: "Core idea",
      icon: "bi-browser-chrome",
      heading: "The browser is the development environment",
      body: "Nexa imports ESM modules directly from the file or the CDN. No Vite, Babel, JSX, bundler or mandatory npm install step.",
      items: ["<script type=\"module\">", "CDN via jsDelivr", "Ready-to-use dist files"],
    },
  },
  {
    id: "primitivas",
    x: 1910,
    y: 120,
    w: 580,
    h: 550,
    rotate: 5,
    data: {
      kind: "point",
      eyebrow: "Mental model",
      icon: "bi-diagram-3",
      heading: "Components, h() and render()",
      body: "Components are plain JavaScript functions. h() creates virtual elements and render() mounts the application by passing the root component function.",
      items: ["h('div', props, children)", "h(Component, props)", "render(App, container)"],
    },
  },
  {
    id: "regras",
    x: 1120,
    y: 610,
    w: 700,
    h: 630,
    rotate: -3,
    data: {
      kind: "rules",
      eyebrow: "Critical rules",
      icon: "bi-exclamation-diamond",
      heading: "Three details prevent almost every stumble",
      rules: [
        {
          tone: "danger",
          title: "Do not use render(h(App))",
          body: "render takes the function reference: render(App, container).",
        },
        {
          tone: "warning",
          title: "Context does not use Provider",
          body: "Because h(Component) executes immediately, use ctx.provide(value, fn).",
        },
        {
          tone: "success",
          title: "Lists need key",
          body: "Items without key lose state and may behave incorrectly on re-render.",
        },
      ],
    },
  },
  {
    id: "hooks",
    x: 2050,
    y: 750,
    w: 610,
    h: 520,
    rotate: 4,
    data: {
      kind: "point",
      eyebrow: "State and effects",
      icon: "bi-sliders",
      heading: "Familiar hooks, without compilation",
      body: "The API covers state, effects, refs, memoization, reducer, forms, error boundaries, theme, design and mobile features.",
      items: ["useState, useEffect, useRef", "useMemo, useCallback, useReducer", "useForm, useTheme, useSwipe"],
    },
  },
  {
    id: "ui",
    x: 710,
    y: 1290,
    w: 640,
    h: 520,
    rotate: 6,
    data: {
      kind: "point",
      eyebrow: "Design system",
      icon: "bi-grid-1x2",
      heading: "Components and CSS already bundled",
      body: "nexa-components.js delivers a UI library on top of h(), and nexa-ui.css provides grid, responsiveness, dark mode and mobile-first styles.",
      items: ["Button, Dialog, Drawer, Table", "FormField, Select, Tabs, Toast", "ThemeToggle, PaletteSwitcher, DesignSwitcher"],
    },
  },
  {
    id: "addons",
    x: 1540,
    y: 1450,
    w: 700,
    h: 520,
    rotate: -5,
    data: {
      kind: "point",
      eyebrow: "Add-ons",
      icon: "bi-node-plus",
      heading: "Canvas, Zoom and editor in the same package",
      body: "Beyond the core, Nexa includes extensions for rich no-build experiences: SVG pipeline editor, zoom stage with animated camera and a CodeMirror editor.",
      items: ["PipelineCanvasController", "ZoomStage", "FullCodeEditor + snippets"],
    },
  },
  {
    id: "codigo",
    x: 2520,
    y: 1370,
    w: 760,
    h: 540,
    rotate: 2,
    data: {
      kind: "code",
      eyebrow: "Minimal entry point",
      heading: "A Nexa app fits in just a few imports",
      body: "The page imports CSS, mounts a container and executes a plain ESM module.",
      code: `import { h, render, useState } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components.js";

function App() {
  const [count, setCount] = useState(0);

  return h("section", { className: "m-page" },
    h("h1", null, "Nexa"),
    h(Button, {
      variant: "contained",
      onClick: () => setCount((v) => v + 1),
    }, \`Clicks: \${count}\`),
  );
}

render(App, document.getElementById("app"));`,
    },
  },
  {
    id: "visao-geral",
    x: -120,
    y: -300,
    w: 3550,
    h: 3580,
    rotate: 0,
    data: {
      kind: "overview",
      eyebrow: "Summary",
      heading: "Nexa trades the tooling chain for a short path between code and interface",
      columns: [
        {
          title: "To create",
          items: ["Functions as components", "h() as a vdom factory", "Hooks for state and effects"],
        },
        {
          title: "To run",
          items: ["ESM directly in the browser", "Independent /dist files", "Public CDN with pinnable version"],
        },
        {
          title: "To expand",
          items: ["Component library", "ZoomStage for presentations", "Canvas and editor as add-ons"],
        },
      ],
    },
  },
];
