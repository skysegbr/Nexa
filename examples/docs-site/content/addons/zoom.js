import { h } from "/dist/fluxaway.js";
import { ZoomStage } from "/dist/fluxaway-zoom.js";

function ZoomPreview() {
  const frames = [
    {
      id: "start",
      x: 0,
      y: 0,
      w: 520,
      h: 280,
      label: "Start",
      content: h(
        "section",
        { className: "nd-addon-frame" },
        h("h3", null, "A spatial presentation"),
        h("p", null, "Click the stage or press →"),
      ),
    },
    {
      id: "detail",
      x: 680,
      y: 180,
      w: 360,
      h: 360,
      rotate: -6,
      surface: "none",
      shape: "circle",
      transition: { preset: "arc", duration: "auto", curve: 0.28 },
      label: "Detail",
      content: h(
        "section",
        { className: "nd-addon-frame" },
        h("h3", null, "Normal FluxaWay content"),
        h("p", null, "One canvas, an animated camera."),
      ),
    },
  ];

  return h(
    "div",
    { className: "nd-addon-stage" },
    h(ZoomStage, { frames, duration: "auto", ariaLabel: "ZoomStage documentation demo" }),
  );
}

export const ADDON_ENTRIES = [
  {
    name: "ZoomStage",
    slug: "zoom-stage",
    category: "addons",
    module: "fluxaway-zoom.js",
    summary:
      "A spatial presentation canvas with stable flight lifecycle, five camera trajectories and surfaces beyond rectangular slides.",
    demos: [
      {
        id: "zoom-preview",
        title: "Arc into a frameless subject",
        note: "Click the stage or use the arrow keys. The destination uses an Arc trajectory and a circular surface.",
        render: ZoomPreview,
        code: `const frames = [
  { id: "start", x: 0, y: 0, w: 520, h: 280, content: h(TitleFrame) },
  {
    id: "detail", x: 680, y: 180, w: 360, h: 360,
    surface: "none", shape: "circle",
    transition: { preset: "arc", duration: "auto" },
    content: h(DetailFrame),
  },
];

return h(ZoomStage, {
  frames,
  duration: "auto",
  ariaLabel: "Product tour",
});`,
      },
    ],
    props: [
      { name: "frames", type: "ZoomFrame[]", default: "[]", description: "World geometry, surface/camera options and vdom content or a state-aware renderer." },
      { name: "path", type: "string[]", description: "Optional frame-id sequence; defaults to frames order." },
      { name: "index", type: "number", description: "Controlled selected-frame index." },
      { name: "defaultIndex", type: "number", default: "0", description: "Initial index for uncontrolled navigation." },
      { name: "onIndexChange", type: "(index) => void", description: "Reports selection immediately, before the camera necessarily settles." },
      { name: "transition", type: "Preset | object | resolver", default: '"glide"', description: "Glide, Arc, Dolly, Orbit, Focus or Cut camera language." },
      { name: "duration", type: 'number | "auto"', default: "900", description: "Fixed flight duration or distance-aware automatic timing." },
      { name: "easing", type: "(progress) => number", description: "Default easing function for camera interpolation." },
      { name: "padding", type: "number", default: "0.06", description: "Viewport-margin fraction reserved around the camera target." },
      { name: "controllerRef", type: "Ref<ZoomController>", description: "Exposes navigation, fit, zoom, preparation and settled/moving state." },
      { name: "keyboardNav", type: "boolean", default: "true", description: "Enables arrows, Space, Home/End and free-camera shortcuts." },
      { name: "advanceOnClick", type: "boolean", default: "true", description: "Advances when the stage background is clicked or tapped." },
      { name: "swipeNav", type: "boolean", default: "true", description: "Enables horizontal touch/pen frame navigation outside freeZoom." },
      { name: "freeZoom", type: "boolean", default: "false", description: "Enables wheel/pinch zoom and pan." },
      { name: "minZoom / maxZoom", type: "number", default: "0.2 / 12", description: "Free-camera scale bounds relative to the current frame fit." },
      { name: "autoplay", type: "boolean | number", default: "false", description: "Loops automatically; a number supplies the interval in milliseconds." },
      { name: "hashNav", type: "boolean", default: "false", description: "Synchronizes the selected frame id with location.hash." },
      { name: "onInteract", type: "() => void", description: "Reports the first wheel, pinch or drag interaction with the free camera." },
      { name: "onTransitionStart / onTransitionEnd", type: "(event) => void", description: "Reports the camera-flight lifecycle and resolved transition." },
      { name: "onSettledIndexChange", type: "(index) => void", description: "Reports the destination only after the camera has arrived." },
      { name: "preload", type: 'false | "adjacent" | "all"', default: '"adjacent"', description: "Decodes images around the active frame before navigation." },
      { name: "ariaLabel", type: "string", description: "Accessible name for the presentation stage." },
      { name: "className / style", type: "string | object", description: "Adds application-specific styling to the stage viewport." },
    ],
    resources: [
      { label: "Architecture presentation", href: "#/source/architecture-example" },
      { label: "Atlas presentation", href: "#/source/atlas-example" },
      { label: "Free-zoom star atlas", href: "#/source/star-atlas-example" },
      { label: "Zoom motion laboratory", href: "#/source/zoom-lab-example" },
      { label: "VITRA Protocol: Zoom + Motion", href: "#/source/vitra-protocol-example" },
    ],
    notes: [
      "ZoomStage v2 upgrades the existing /dist/fluxaway-zoom.js module in place; v1 frame and prop usage remains compatible.",
      "Load /dist/fluxaway-zoom.css next to the module.",
      "Use frame.camera when the camera target must differ from the visible surface.",
      "Use frame.render(state) to coordinate content with departing, arriving and settled phases.",
      "Use ZoomStage for presentations and tours instead of scroll-snap sections.",
    ],
  },
];
