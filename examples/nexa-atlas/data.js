// Frame geometry (px in "world" space) + content descriptors — no h() calls here.
// components/FrameContent.js converts each descriptor into vdom.
export const FRAMES = [
  {
    id: "capa",
    x: 0, y: 0, w: 1040, h: 640, rotate: 0,
    data: {
      kind: "cover",
      eyebrow: "Nexa Atlas",
      heading: "A no-build JS framework, mapped frame by frame",
      body: "Every territory in this map is a piece of Nexa — h(), hooks, components and the visual add-ons — all running straight in the browser, without a bundler.",
      hint: "Use ← → or click the map to explore",
      meta: ["ESM native", "Zero bundler", "Hook-based API"],
    },
  },
  {
    id: "fundacao",
    x: 1260, y: -280, w: 600, h: 480, rotate: -7,
    data: {
      kind: "territory",
      eyebrow: "Territory I · Foundation",
      icon: "bi-cloud",
      heading: "The browser is the build environment",
      body: "Nexa arrives as three ESM files ready to import. One <script type=\"module\"> and the application is up — no Vite, Babel or npm install.",
      items: [
        "dist/nexa.js — core (h, render, hooks, context)",
        "dist/nexa-components.js — 47 UI components",
        "dist/nexa-ui.css — tokens and design system",
      ],
    },
  },
  {
    id: "gramatica",
    x: 2020, y: 30, w: 700, h: 580, rotate: 5,
    data: {
      kind: "diagram",
      variant: "api",
      eyebrow: "Territory II · Grammar",
      icon: "bi-diagram-3",
      heading: "h() draws, render() plants the flag",
      intro: "h(type, props, ...children) creates a virtual node. When type is a function, it runs IMMEDIATELY — execution is not deferred.",
      steps: [
        { code: "h('div', props, ...)", note: "regular HTML element" },
        { code: "h(Component, props)", note: "executes the function now, eagerly" },
        { code: "render(App, container)", note: "function reference — never h(App)" },
      ],
      warning: "render(h(App), el) explodes with \"App can only be used during rendering\".",
    },
  },
  {
    id: "estreito",
    x: 2860, y: -220, w: 760, h: 640, rotate: -4,
    data: {
      kind: "diagram",
      variant: "context",
      eyebrow: "Territory III · The Context Strait",
      icon: "bi-signpost-2",
      heading: "There is no <Provider>. And there is a geographical reason.",
      intro: "h(Child) has already executed before the provider body even begins — there is no way to \"hold\" that value afterwards. The right crossing: build the subtree INSIDE the thunk itself.",
      wrongLabel: "Route that sinks",
      wrongCode: "ThemeCtx.provide(v, () => children)\n// children already ran before this",
      rightLabel: "Route that crosses",
      rightCode: "ThemeCtx.provide(v, () =>\n  h(App, null)\n)",
    },
  },
  {
    id: "bussola",
    x: 2520, y: 560, w: 780, h: 640, rotate: 3,
    data: {
      kind: "rules",
      eyebrow: "Three landmarks that prevent almost every shipwreck",
      heading: "The critical rules compass",
      rules: [
        { dir: "N", tone: "danger", icon: "bi-x-octagon", title: "render(App, el)", body: "Never render(h(App), el) — pass the function reference, not the result of the call." },
        { dir: "E", tone: "warning", icon: "bi-signpost-2", title: "No Provider component", body: "Use ctx.provide(value, () => ...) — even a Provider that only receives children won't work." },
        { dir: "S", tone: "success", icon: "bi-check2-circle", title: "key in every list", body: "Without key, list items lose state and behave incorrectly on re-render." },
      ],
    },
  },
  {
    id: "arquipelago",
    x: 1580, y: 720, w: 820, h: 600, rotate: -5,
    data: {
      kind: "hooks",
      eyebrow: "Territory IV · The Hook Archipelago",
      heading: "32 hooks exported by dist/nexa.js",
      caption: "From basic state to WebSocket with auto-reconnect — without a single line of compilation.",
      words: [
        { text: "useState", size: "xl" }, { text: "useEffect", size: "xl" },
        { text: "useRef", size: "lg" }, { text: "useMemo", size: "lg" },
        { text: "useCallback", size: "lg" }, { text: "useReducer", size: "md" },
        { text: "useContext", size: "lg" }, { text: "useForm", size: "xl" },
        { text: "useErrorBoundary", size: "sm" }, { text: "useLocalStorage", size: "md" },
        { text: "useFetch", size: "md" }, { text: "useToast", size: "md" },
        { text: "useRouter", size: "lg" }, { text: "useRoutes", size: "md" },
        { text: "useTheme", size: "md" },
        { text: "usePalette", size: "sm" }, { text: "useDesign", size: "sm" },
        { text: "useSwipe", size: "sm" }, { text: "useLongPress", size: "sm" },
        { text: "useNetworkStatus", size: "sm" }, { text: "useOrientation", size: "sm" },
        { text: "useVibrate", size: "sm" }, { text: "useHistory", size: "md" },
        { text: "useId", size: "md" }, { text: "useDebounce", size: "md" },
        { text: "useThrottle", size: "sm" }, { text: "useMediaQuery", size: "md" },
        { text: "useIntersectionObserver", size: "sm" }, { text: "useWebSocket", size: "md" },
        { text: "useVirtualList", size: "sm" }, { text: "useTranslation", size: "sm" },
        { text: "useContextMenu", size: "sm" },
      ],
    },
  },
  {
    id: "farol-vivo",
    x: 660, y: 820, w: 860, h: 640, rotate: 4,
    data: {
      kind: "live",
      eyebrow: "Territory V · The Live Lighthouse",
      heading: "This frame is not a screenshot",
      body: "It is a real Button, Switch, TextField and Progress — rendered right now, inside the very presentation you are navigating.",
    },
  },
  {
    id: "recife",
    x: -320, y: 940, w: 680, h: 580, rotate: -3,
    data: {
      kind: "tokens",
      eyebrow: "Territory VI · The Token Reef",
      heading: "Colors and spacing live in CSS variables",
      caption: "All under --m-*, inherited from dist/nexa-ui.css — override in :root or by local scope.",
      swatches: [
        { name: "primary", varName: "--m-primary" },
        { name: "secondary", varName: "--m-secondary" },
        { name: "success", varName: "--m-success" },
        { name: "warning", varName: "--m-warning" },
        { name: "danger", varName: "--m-danger" },
        { name: "info", varName: "--m-info" },
      ],
      spacing: ["--m-space-1", "--m-space-2", "--m-space-3", "--m-space-4", "--m-space-6", "--m-space-8", "--m-space-12"],
    },
  },
  {
    id: "ilhas",
    x: -420, y: -420, w: 740, h: 560, rotate: 6,
    data: {
      kind: "addons",
      eyebrow: "Territory VII · The Add-on Islands",
      heading: "Three extensions, outside the core, in the same archipelago",
      addons: [
        { icon: "bi-diagram-3", name: "PipelineCanvas", desc: "SVG node-and-edge editor — drag, zoom, mini-map, undo/redo." },
        { icon: "bi-compass", name: "ZoomStage", desc: "animated camera over a giant canvas — this is exactly the engine powering this atlas.", wink: true },
        { icon: "bi-code-slash", name: "FullCodeEditor", desc: "CodeMirror with toolbar, snippets and language switching." },
      ],
    },
  },
  {
    id: "posto-avancado",
    x: 380, y: -740, w: 700, h: 580, rotate: -4,
    data: {
      kind: "filetree",
      eyebrow: "Territory VIII · The Forward Post",
      heading: "The domain-componentized structure",
      caption: "app.js only orchestrates. data.js only holds data. Each domain manages its own context.",
      tree: [
        { depth: 0, label: "app.js", note: "orchestrator" },
        { depth: 0, label: "data.js", note: "data in UPPER_CASE" },
        { depth: 0, label: "styles.css", note: "central @import" },
        { depth: 0, label: "components/" },
        { depth: 1, label: "cart/CartContext.js", note: "context + state" },
        { depth: 1, label: "cart/CartButton.js" },
        { depth: 1, label: "auth/AuthContext.js" },
        { depth: 1, label: "auth/AuthMenu.js" },
      ],
    },
  },
  {
    id: "cartografia",
    x: 1260, y: -880, w: 760, h: 600, rotate: 3,
    data: {
      kind: "code",
      eyebrow: "Territory IX · The Cartographer's Board",
      heading: "An entire Nexa app fits on one board",
      body: "No build step between this code and the browser — the module runs as-is.",
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
    id: "marcos",
    x: 2140, y: -740, w: 700, h: 480, rotate: -5,
    data: {
      kind: "stats",
      eyebrow: "Territory X · The Landmarks",
      heading: "The size of the journey, in numbers",
      stats: [
        { value: "0", label: "build steps" },
        { value: "47", label: "UI components" },
        { value: "32", label: "exported hooks" },
        { value: "3", label: "core files" },
        { value: "1", label: "<script type=\"module\">" },
      ],
    },
  },
  {
    id: "mapa-mundi",
    x: -600, y: -980, w: 4760, h: 3760, rotate: 0,
    data: {
      kind: "overview",
      eyebrow: "The complete Atlas",
      heading: "Ten territories, one single path to the interface",
      legend: [
        {
          title: "To create",
          items: ["Components are plain functions", "h() manufactures virtual nodes", "Hooks handle state and effects"],
        },
        {
          title: "To navigate",
          items: ["render(App, container) plants the flag", "ctx.provide() replaces <Provider>", "key keeps list memory intact"],
        },
        {
          title: "To expand",
          items: ["47 ready-made components in nexa-components.js", "Canvas, Zoom and editor as add-ons", "All on the same --m-* tokens"],
        },
      ],
    },
  },
  {
    id: "novo-horizonte",
    x: 3260, y: 420, w: 780, h: 580, rotate: 5,
    data: {
      kind: "cta",
      eyebrow: "End of the map, start of the expedition",
      heading: "The horizon is just one <script type=\"module\"> away",
      body: "Point to the local dist/ files or pin a CDN version tag — and start drawing your own territory.",
      code: `<link rel="stylesheet" href="/dist/nexa-ui.css">
<script type="module" src="./app.js"></script>`,
      cdn: "cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js",
    },
  },
];
