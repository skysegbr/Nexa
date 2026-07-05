export const ARCHITECTURE_FRAMES = [
  {
    id: "cover",
    x: 0, y: 0, w: 1120, h: 640, rotate: 0,
    data: {
      kind: "cover",
      eyebrow: "Nexa 0.8.0 | A View for Architects",
      heading: "A complete frontend framework, without the build chain",
      body: "Nexa is an ESM-native JavaScript framework for building real applications straight in the browser. A runtime with VDOM, hooks, context, routing and SSR, plus a design system with 61 components. All of it with no bundler, no JSX and no mandatory build step.",
      meta: ["Full runtime", "ESM native", "Hooks", "Routing", "SSR + hydration", "Design system"],
      hint: "Use the arrows or click any frame to navigate",
    },
  },
  {
    id: "why",
    x: 1280, y: -260, w: 820, h: 780, rotate: -5,
    data: {
      kind: "lens",
      eyebrow: "Architectural question",
      icon: "bi-bounding-box-circles",
      heading: "What does Nexa deliver without requiring a tooling chain?",
      body: "Nexa covers what a standard framework has to cover: state, effects, context, routing, lists with reconciliation and server-side rendering. The difference is that it runs standard JavaScript modules in the browser, so you get these capabilities without transpilers, bundlers or mandatory pipelines between the code and the runtime.",
      points: [
        { label: "Complete capability", text: "Hooks, context, router and SSR in the core itself." },
        { label: "Smaller supply chain", text: "Fewer mandatory dependencies between code and runtime." },
        { label: "More direct debugging", text: "What runs in the browser matches what is in the repository." },
      ],
    },
  },
  {
    id: "runtime",
    x: 2180, y: 40, w: 860, h: 780, rotate: 4,
    data: {
      kind: "map",
      eyebrow: "Technical surface",
      heading: "Robust core, opt-in extensions",
      body: "The architecture separates runtime, components, design system and add-ons. The core already sustains an entire application; the team loads extra layers only when it makes sense.",
      layers: [
        { name: "dist/nexa.js", role: "VDOM, render, hooks, context, routing and SSR hydration" },
        { name: "dist/nexa-components.js", role: "61 production-ready UI components on top of h()" },
        { name: "dist/nexa-ui.css", role: "tokens, grid, dark mode, mobile shell and utilities" },
        { name: "dist/nexa-server.js", role: "renderToString(App) for SEO and first paint" },
        { name: "Add-ons", role: "PipelineCanvas, ZoomStage and FullCodeEditor outside the core" },
      ],
    },
  },
  {
    id: "contracts",
    x: 3020, y: -420, w: 820, h: 620, rotate: -4,
    data: {
      kind: "decision",
      eyebrow: "Implementation contracts",
      heading: "The mental model that keeps large apps predictable",
      body: "Nexa makes a deliberate choice: components called by h() execute immediately. This keeps the runtime lean and rendering predictable, even in large applications, as long as context and composition follow the contracts below.",
      decisions: [
        { icon: "bi-check2-circle", title: "render(App, el)", detail: "The entry point takes the function reference, not h(App)." },
        { icon: "bi-diagram-3", title: "ctx.provide(value, fn)", detail: "Context is scoped by function, with no Provider component." },
        { icon: "bi-key", title: "key in lists", detail: "Explicit identity preserves state during reconciliation." },
      ],
    },
  },
  {
    id: "composition",
    x: 2820, y: 420, w: 860, h: 780, rotate: 3,
    data: {
      kind: "lens",
      eyebrow: "System composition",
      icon: "bi-node-plus",
      heading: "A structure that scales by domain",
      body: "The recommended pattern is domain-componentized: each visual domain has its own component, paired CSS and external data. This splits ownership cleanly across large applications and multiple teams, without relying on a heavy platform to organize the code.",
      points: [
        { label: "No artificial src", text: "Each module lives directly in its domain folder." },
        { label: "CSS next to its owner", text: "The global file only imports the components' CSS." },
        { label: "app.js as orchestrator", text: "Minimal global state, explicit domain boundaries." },
      ],
    },
  },
  {
    id: "integration",
    x: 1440, y: 620, w: 860, h: 880, rotate: -3,
    data: {
      kind: "map",
      eyebrow: "Integration and delivery",
      heading: "Enters via CDN, local artifact or your own server",
      body: "For architects, the decision goes beyond the technical: it is how you govern versions, security, cache and production environments. Nexa keeps these choices explicit instead of hidden in the build.",
      layers: [
        { name: "Pinned CDN", role: "Pin to a version tag for simple, cacheable distribution." },
        { name: "Local artifact", role: "Copy dist/ into the product when policy demands immutability." },
        { name: "SSR in production", role: "Generate initial HTML with renderToString and hydrate on the client." },
        { name: "Local HMR", role: "server.py speeds up development without entering the production chain." },
        { name: "No build lock-in", role: "Coexists with existing pipelines without requiring a bundler." },
      ],
    },
  },
  {
    id: "tradeoffs",
    x: 520, y: 780, w: 880, h: 640, rotate: 5,
    data: {
      kind: "decision",
      eyebrow: "Trade-offs to discuss",
      heading: "Nexa trades tooling abstraction for operational clarity",
      body: "The gain shows up when the value is in transparent delivery, simple governance and direct execution in the browser. Nexa does not give up capability: it sustains complete applications, but it requires module and ownership discipline instead of a build to enforce structure.",
      decisions: [
        { icon: "bi-speedometer2", title: "Shorter cycle", detail: "Fewer mandatory tools between commit and execution." },
        { icon: "bi-shield-check", title: "Visible governance", detail: "ESM and CSS files that are auditable and versioned directly." },
        { icon: "bi-diagram-2", title: "Modular discipline", detail: "The domain-based structure is what keeps large apps healthy." },
      ],
    },
  },
  {
    id: "adoption",
    x: -420, y: 220, w: 840, h: 760, rotate: -4,
    data: {
      kind: "adoption",
      eyebrow: "Adoption path",
      heading: "Incremental entry, no heroic migration",
      steps: [
        { title: "1. Prove the runtime", text: "A real screen with h(), hooks, routing and components." },
        { title: "2. Define contracts", text: "Version, hosting of the dist/ files, tokens and folder pattern." },
        { title: "3. Ship a domain", text: "Take one product area end to end into production." },
        { title: "4. Scale by domain", text: "Replicate the pattern to new teams without re-engineering." },
      ],
    },
  },
  {
    id: "code",
    x: 620, y: -760, w: 820, h: 580, rotate: 5,
    data: {
      kind: "code",
      eyebrow: "Minimal contract",
      heading: "A Nexa application is standard JavaScript",
      body: "This is the starting point architects need to validate: the runtime enters as a module, the UI is a function, and the browser executes. The same model scales from the first component up to the entire application.",
      code: `import { h, render, useState } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components.js";

function App() {
  const [count, setCount] = useState(0);

  return h("main", { className: "m-page" },
    h("h1", null, "Nexa"),
    h(Button, {
      variant: "contained",
      onClick: () => setCount((value) => value + 1),
    }, \`Events: \${count}\`),
  );
}

render(App, document.getElementById("app"));`,
    },
  },
  {
    id: "overview",
    x: -1780, y: -120, w: 1200, h: 820, rotate: 0,
    data: {
      kind: "overview",
      eyebrow: "Executive summary",
      heading: "Nexa as a long-term architectural decision",
      columns: [
        {
          title: "Where it holds up",
          items: ["Complete product applications", "Frontends with routing and SSR", "Teams that want to reduce mandatory tooling"],
        },
        {
          title: "What to watch",
          items: ["Version governance of the dist/ files", "Component-per-domain pattern", "SSR and hydration when SEO matters"],
        },
        {
          title: "How to defend it",
          items: ["A complete framework, without a build chain", "Native, auditable web contracts", "Opt-in add-ons for canvas, zoom and editor"],
        },
      ],
    },
  },
  {
    id: "close",
    x: 3800, y: 260, w: 780, h: 560, rotate: 4,
    data: {
      kind: "cover",
      eyebrow: "Closing",
      heading: "The question is not whether Nexa can handle it. It is where it becomes an advantage.",
      body: "Nexa is a complete framework for architectures that value operational simplicity, transparent delivery and direct composition in the browser, from the first component to the application in production.",
      meta: ["Validate", "Standardize", "Scale by domain"],
      hint: "Next step: Grow with Nexa!",
    },
  },
];
