// Tests for the canvas add-ons: PipelineCanvas (nexa-canvas.js) and
// ZoomStage (nexa-zoom.js). Both are imperative controllers wrapped in a
// Nexa component, so the tests drive them through real DOM events and the
// controllerRef API.

import { h, render, unmount, useState } from "../dist/nexa.js";
import { PipelineCanvas } from "../dist/nexa-canvas.js";
import { ZoomStage } from "../dist/nexa-zoom.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mouse(type, target, opts = {}) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...opts }));
}

function pointer(type, target, opts = {}) {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, button: 0, ...opts }));
}

function key(target, k) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
}

const CANVAS_SIZE = "width:400px;height:300px";

const PIPELINE_NODES = [
  { id: 1, label: "Extract", x: 40, y: 40, status: "success" },
  { id: 2, label: "Transform", x: 40, y: 260, deps: [1] },
  { id: 3, label: "Load", x: 300, y: 260, deps: [1] },
];

// ── PipelineCanvas ──────────────────────────────────────────

test("PipelineCanvas: renders a node group per node and a connection per dep", async () => {
  const container = mountPoint();

  function App() {
    return h(PipelineCanvas, { nodes: PIPELINE_NODES, style: CANVAS_SIZE });
  }

  render(App, container);
  await flush();

  const nodeEls = container.querySelectorAll(".m-pnode");
  assertEqual(nodeEls.length, 3, "expected one SVG group per node");
  const labels = [...container.querySelectorAll(".m-pnode-label")].map((t) => t.textContent);
  assertEqual(labels.join(","), "Extract,Transform,Load");
  assertEqual(container.querySelectorAll(".m-pipeline-conn").length, 2, "expected one connection per dep edge");
  assert(container.querySelector(".m-minimap-wrap"), "expected the mini-map to render");
});

test("PipelineCanvas: updating the nodes prop adds/removes nodes and connections", async () => {
  const container = mountPoint();
  let setNodes;

  function App() {
    const [nodes, set] = useState(PIPELINE_NODES);
    setNodes = set;
    return h(PipelineCanvas, { nodes, style: CANVAS_SIZE });
  }

  render(App, container);
  await flush();
  assertEqual(container.querySelectorAll(".m-pnode").length, 3);

  setNodes(PIPELINE_NODES.filter((n) => n.id !== 3));
  await flush();
  assertEqual(container.querySelectorAll(".m-pnode").length, 2, "expected the removed node to leave the DOM");
  assertEqual(container.querySelectorAll(".m-pipeline-conn").length, 1, "expected the removed node's connection to go too");

  setNodes([...PIPELINE_NODES, { id: 4, label: "Report", x: 300, y: 40, deps: [3] }]);
  await flush();
  assertEqual(container.querySelectorAll(".m-pnode").length, 4);
  assertEqual(container.querySelectorAll(".m-pipeline-conn").length, 3);
});

test("PipelineCanvas: edit and delete buttons report the node id", async () => {
  const container = mountPoint();
  const edited = [];
  const deleted = [];

  function App() {
    return h(PipelineCanvas, {
      nodes: PIPELINE_NODES,
      style: CANVAS_SIZE,
      onNodeEdit: (id) => edited.push(id),
      onNodeDelete: (id) => deleted.push(id),
    });
  }

  render(App, container);
  await flush();

  const firstNode = container.querySelector(".m-pnode");
  mouse("mousedown", firstNode.querySelector(".m-pnode-edit-btn"));
  assertEqual(edited.join(","), "1", "expected onNodeEdit with the node's id");

  mouse("mousedown", firstNode.querySelector(".m-pnode-del-btn"));
  assertEqual(deleted.join(","), "1", "expected onNodeDelete with the node's id");
});

test("PipelineCanvas: selecting a node and pressing Delete reports onNodeDelete", async () => {
  const container = mountPoint();
  const deleted = [];

  function App() {
    return h(PipelineCanvas, {
      nodes: PIPELINE_NODES,
      style: CANVAS_SIZE,
      onNodeDelete: (id) => deleted.push(id),
    });
  }

  render(App, container);
  await flush();

  const nodes = container.querySelectorAll(".m-pnode");
  mouse("mousedown", nodes[1]); // select "Transform"
  mouse("mouseup", document);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));
  assertEqual(deleted.join(","), "2", "expected Delete to remove the selected node");
});

test("PipelineCanvas: dragging from an output port to another node's input port connects them", async () => {
  const container = mountPoint();
  const connected = [];

  function App() {
    return h(PipelineCanvas, {
      nodes: PIPELINE_NODES,
      style: CANVAS_SIZE,
      onNodeConnect: (fromId, toId) => connected.push(`${fromId}->${toId}`),
    });
  }

  render(App, container);
  await flush();

  const nodes = container.querySelectorAll(".m-pnode");
  mouse("mousedown", nodes[1].querySelector(".m-pnode-port-out")); // from "Transform"
  mouse("mouseup", nodes[2].querySelector(".m-pnode-port-in"));    // to "Load"
  assertEqual(connected.join(","), "2->3", "expected onNodeConnect(fromId, toId)");

  // Dropping a connection on its own node must not connect.
  mouse("mousedown", nodes[0].querySelector(".m-pnode-port-out"));
  mouse("mouseup", nodes[0].querySelector(".m-pnode-port-in"));
  assertEqual(connected.length, 1, "expected a self-connection to be ignored");
});

test("PipelineCanvas: double-clicking a connection reports onConnectionDelete", async () => {
  const container = mountPoint();
  const removed = [];

  function App() {
    return h(PipelineCanvas, {
      nodes: PIPELINE_NODES,
      style: CANVAS_SIZE,
      onConnectionDelete: (fromId, toId) => removed.push(`${fromId}->${toId}`),
    });
  }

  render(App, container);
  await flush();

  const hit = container.querySelector(".m-pipeline-conn-hit");
  hit.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  assertEqual(removed.length, 1, "expected onConnectionDelete on double-click");
  assert(/^1->/.test(removed[0]), "expected the connection to originate from the dep");
});

test("PipelineCanvas: controllerRef exposes the controller; zoomStep rescales the world transform", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };

  function App() {
    return h(PipelineCanvas, { nodes: PIPELINE_NODES, style: CANVAS_SIZE, controllerRef });
  }

  render(App, container);
  await flush();
  await sleep(30); // let the mount-time fitView (scheduled via rAF) settle

  const ctrl = controllerRef.current;
  assert(ctrl, "expected controllerRef.current to be set on mount");
  const before = ctrl.scale;
  ctrl.zoomStep(2);
  assert(Math.abs(ctrl.scale - Math.min(4, before * 2)) < 1e-9, "expected zoomStep to multiply the scale (clamped)");

  const world = container.querySelector("svg > g");
  assert(world.getAttribute("transform").includes(`scale(${ctrl.scale})`), "expected the world transform to reflect the new scale");
});

test("PipelineCanvas: unmount destroys the controller and empties the wrapper", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };

  function App() {
    return h(PipelineCanvas, { nodes: PIPELINE_NODES, style: CANVAS_SIZE, controllerRef });
  }

  render(App, container);
  await flush();
  assert(container.querySelector("svg"), "sanity: canvas mounted");

  unmount(container);
  assertEqual(container.querySelector("svg"), null, "expected the SVG to be removed on unmount");
  assertEqual(controllerRef.current, null, "expected controllerRef to be cleared on unmount");
});

// ── ZoomStage ───────────────────────────────────────────────

const ZOOM_FRAMES = [
  { id: "intro", x: 0, y: 0, w: 400, h: 300, content: h("p", null, "intro") },
  { id: "detail", x: 500, y: 100, w: 200, h: 150, content: h("p", null, "detail") },
  { id: "overview", x: 0, y: 0, w: 1200, h: 900, content: h("p", null, "overview") },
];

function zoomApp(extraProps = {}) {
  return () => h(ZoomStage, {
    frames: ZOOM_FRAMES,
    padding: 0,
    style: CANVAS_SIZE,
    ...extraProps,
  });
}

test("ZoomStage: renders every frame at its world position, painting larger frames behind", async () => {
  const container = mountPoint();
  render(zoomApp(), container);
  await flush();

  const frameEls = container.querySelectorAll(".m-zoom-frame");
  assertEqual(frameEls.length, 3, "expected every frame mounted simultaneously");

  // DOM order is area-descending so overview (biggest) paints first.
  assertEqual(frameEls[0].textContent, "overview");

  const detail = [...frameEls].find((el) => el.textContent === "detail");
  assertEqual(detail.style.left, "500px");
  assertEqual(detail.style.top, "100px");
  assertEqual(detail.style.width, "200px");
  assertEqual(detail.style.height, "150px");

  const active = container.querySelector(".m-zoom-frame-active");
  assertEqual(active.textContent, "intro", "expected the first frame in the sequence to start active");
});

test("ZoomStage: mount fits the camera to the first frame", async () => {
  const container = mountPoint();
  render(zoomApp(), container);
  await flush();

  // Viewport 400x300, frame intro is 400x300 at (0,0) with padding 0:
  // scale 1, centered on (200,150).
  const world = container.querySelector(".m-zoom-world");
  assertEqual(
    world.style.transform,
    "translate(200px, 150px) scale(1) rotate(0deg) translate(-200px, -150px)",
    "expected the camera to frame the initial frame exactly",
  );
});

test("ZoomStage: de-promotes an oversized world so it can't tile and flicker", async () => {
  // A normal deck (world 1200x900) stays composited for a smooth GPU tween.
  const small = mountPoint();
  render(zoomApp(), small);
  await flush();
  assertEqual(
    small.querySelector(".m-zoom-world").style.willChange,
    "transform",
    "a world within the GPU budget stays promoted",
  );

  // A world past the ~4096px texture limit would tile as a compositor layer,
  // blanking tiles as the camera scales — so it is painted on the main thread.
  const big = mountPoint();
  const bigFrames = [
    { id: "a", x: 0, y: 0, w: 800, h: 600, content: h("p", null, "a") },
    { id: "overview", x: 0, y: 0, w: 6500, h: 4800, content: h("p", null, "overview") },
  ];
  render(() => h(ZoomStage, { frames: bigFrames, padding: 0, style: CANVAS_SIZE }), big);
  await flush();
  assertEqual(
    big.querySelector(".m-zoom-world").style.willChange,
    "auto",
    "an oversized world is painted on the main thread, not tiled",
  );
});

test("ZoomStage: controllerRef next/prev/goTo drive the active frame and onIndexChange", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };
  const indexes = [];

  render(zoomApp({ controllerRef, onIndexChange: (i) => indexes.push(i) }), container);
  await flush();

  const ctrl = controllerRef.current;
  assertEqual(ctrl.index, 0);
  assertEqual(ctrl.frames.length, 3);

  ctrl.goTo("detail", { animate: false });
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "detail");
  assertEqual(controllerRef.current.index, 1, "expected the exposed index to track navigation");

  // Camera jumped (no animation): viewport 400x300 vs frame 200x150 → scale 2.
  const world = container.querySelector(".m-zoom-world");
  assertEqual(
    world.style.transform,
    "translate(200px, 150px) scale(2) rotate(0deg) translate(-600px, -175px)",
    "expected jumpTo to re-fit the camera onto the target frame",
  );

  controllerRef.current.prev();
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro");
  assertEqual(indexes.join(","), "1,0", "expected onIndexChange for each navigation");
});

test("ZoomStage: prev at the first frame and next at the last frame are no-ops", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };
  const indexes = [];

  render(zoomApp({ controllerRef, onIndexChange: (i) => indexes.push(i) }), container);
  await flush();

  controllerRef.current.prev();
  await flush();
  assertEqual(indexes.length, 0, "expected prev on the first frame to do nothing");

  controllerRef.current.goTo(2, { animate: false });
  await flush();
  controllerRef.current.next();
  await flush();
  assertEqual(indexes.join(","), "2", "expected next on the last frame to do nothing");
});

test("ZoomStage: ArrowRight advances, but not while typing in an input", async () => {
  const container = mountPoint();
  render(zoomApp(), container);
  await flush();

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "detail");

  const input = document.createElement("input");
  container.appendChild(input);
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "detail", "expected keyboard nav to ignore key presses inside form fields");
  input.remove();
});

test("ZoomStage: clicking the stage advances only when advanceOnClick is enabled", async () => {
  const container = mountPoint();
  render(zoomApp({ advanceOnClick: false }), container);
  await flush();

  mouse("click", container.querySelector(".m-zoom-stage"));
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro", "expected advanceOnClick:false to disable click navigation");

  const container2 = mountPoint();
  render(zoomApp(), container2);
  await flush();
  mouse("click", container2.querySelector(".m-zoom-stage"));
  await flush();
  assertEqual(container2.querySelector(".m-zoom-frame-active").textContent, "detail", "expected a stage click to advance by default");
});

test("ZoomStage: the path prop reorders and filters the navigation sequence", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };

  render(zoomApp({ path: ["overview", "intro"], controllerRef }), container);
  await flush();

  assertEqual(controllerRef.current.frames.length, 2, "expected the sequence to contain only path entries");
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "overview", "expected the path order to define the starting frame");

  controllerRef.current.next();
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro");
});

test("ZoomStage: Home and End jump to the first and last frame", async () => {
  const container = mountPoint();
  render(zoomApp(), container);
  await flush();

  key(document, "End");
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "overview", "End jumps to the last frame");

  key(document, "Home");
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro", "Home jumps to the first frame");
});

test("ZoomStage: keyboard nav ignores SELECT and contentEditable, not just inputs", async () => {
  const container = mountPoint();
  render(zoomApp(), container);
  await flush();

  const select = document.createElement("select");
  container.appendChild(select);
  key(select, "ArrowRight");
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro", "an arrow inside a <select> must not advance the stage");

  const editable = document.createElement("div");
  editable.contentEditable = "true";
  container.appendChild(editable);
  key(editable, "ArrowRight");
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro", "an arrow inside contentEditable must not advance the stage");

  select.remove();
  editable.remove();
});

test("ZoomStage: changing the padding prop re-fits the current frame immediately", async () => {
  const container = mountPoint();
  let setPad;
  const App = () => {
    const [pad, sp] = useState(0.3);
    setPad = sp;
    return h(ZoomStage, { frames: ZOOM_FRAMES, padding: pad, style: CANVAS_SIZE });
  };
  render(App, container);
  await flush();

  const world = container.querySelector(".m-zoom-world");
  // 400x300 frame in a 400x300 viewport: padding 0.3 → scale 0.4.
  assert(/scale\(0\.4\)/.test(world.style.transform), `expected padding to shrink the fit, got ${world.style.transform}`);

  setPad(0);
  await flush();
  assert(/scale\(1\)/.test(world.style.transform), `expected the padding change to re-fit immediately (scale 1 at padding 0), got ${world.style.transform}`);
});

test("ZoomStage: a horizontal swipe steps through the sequence", async () => {
  const container = mountPoint();
  render(zoomApp(), container);
  await flush();
  const stage = container.querySelector(".m-zoom-stage");

  pointer("pointerdown", stage, { clientX: 300, clientY: 100 });
  pointer("pointerup", stage, { clientX: 200, clientY: 100 });
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "detail", "a leftward swipe advances");

  pointer("pointerdown", stage, { clientX: 200, clientY: 100 });
  pointer("pointerup", stage, { clientX: 320, clientY: 100 });
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "intro", "a rightward swipe retreats");
});

test("ZoomStage: freeZoom wheels to zoom and drags to pan the camera", async () => {
  const container = mountPoint();
  render(zoomApp({ freeZoom: true, padding: 0 }), container);
  await flush();
  const stage = container.querySelector(".m-zoom-stage");
  const world = container.querySelector(".m-zoom-world");

  // intro fits at scale 1; a scroll-up over the centre zooms in around it.
  stage.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, clientX: 200, clientY: 150, bubbles: true, cancelable: true }));
  await flush();
  const scale = Number(/scale\(([\d.]+)\)/.exec(world.style.transform)?.[1]);
  assert(scale > 1.0001, `expected wheel-up to zoom in, got scale ${scale}`);

  // Reset by jumping back, then drag right 50px → camera centre shifts left.
  const container2 = mountPoint();
  render(zoomApp({ freeZoom: true, padding: 0 }), container2);
  await flush();
  const stage2 = container2.querySelector(".m-zoom-stage");
  const world2 = container2.querySelector(".m-zoom-world");
  pointer("pointerdown", stage2, { clientX: 200, clientY: 150 });
  pointer("pointermove", stage2, { clientX: 250, clientY: 150 });
  pointer("pointerup", stage2, { clientX: 250, clientY: 150 });
  await flush();
  assert(/translate\(-150px, -150px\)$/.test(world2.style.transform), `expected the drag to pan the camera, got ${world2.style.transform}`);
});

test("ZoomStage: announces the active frame to screen readers", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };
  const FRAMES = [
    { id: "a", x: 0, y: 0, w: 400, h: 300, label: "Welcome", content: h("p", null, "a") },
    { id: "b", x: 500, y: 0, w: 200, h: 150, content: h("p", null, "b") },
  ];
  render(() => h(ZoomStage, { frames: FRAMES, controllerRef, style: CANVAS_SIZE }), container);
  await flush();

  const live = container.querySelector(".m-zoom-live");
  assertEqual(live.getAttribute("aria-live"), "polite");
  assertEqual(live.textContent, "Welcome", "expected the frame's label to be announced");

  controllerRef.current.next();
  await flush();
  assertEqual(live.textContent, "Frame 2 of 2", "expected a labelless frame to fall back to its position");
});

// Note: two-finger pinch shares the same zoomBy() path the wheel test above
// exercises; it isn't unit-tested here because dispatchEvent can't faithfully
// simulate a synthetic two-pointer sequence in Chromium (it works in Firefox).

test("ZoomStage: freeZoom fires onInteract once when the user grabs the camera", async () => {
  const container = mountPoint();
  let interacts = 0;
  render(zoomApp({ freeZoom: true, padding: 0, onInteract: () => { interacts += 1; } }), container);
  await flush();
  const stage = container.querySelector(".m-zoom-stage");
  stage.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, clientX: 200, clientY: 150, bubbles: true, cancelable: true }));
  stage.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, clientX: 200, clientY: 150, bubbles: true, cancelable: true }));
  await flush();
  assertEqual(interacts, 1, "expected onInteract to fire once per exploration, not per wheel tick");
});

test("ZoomStage: freeZoom clamps zoom to the maxZoom bound", async () => {
  const container = mountPoint();
  render(zoomApp({ freeZoom: true, padding: 0, maxZoom: 2 }), container);
  await flush();
  const stage = container.querySelector(".m-zoom-stage");
  const world = container.querySelector(".m-zoom-world");
  for (let i = 0; i < 20; i += 1) {
    stage.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, clientX: 200, clientY: 150, bubbles: true, cancelable: true }));
  }
  await flush();
  const scale = Number(/scale\(([\d.]+)\)/.exec(world.style.transform)?.[1]);
  // intro fits at scale 1 (padding 0), so maxZoom 2 caps the scale at 2.
  assert(scale > 1.9 && scale <= 2.0001, `expected scale clamped near maxZoom×fit=2, got ${scale}`);
});

test("ZoomStage: with freeZoom the +/- keys zoom the camera", async () => {
  const container = mountPoint();
  render(zoomApp({ freeZoom: true, padding: 0 }), container);
  await flush();
  const world = container.querySelector(".m-zoom-world");
  key(document, "+");
  await flush();
  const zoomed = Number(/scale\(([\d.]+)\)/.exec(world.style.transform)?.[1]);
  assert(zoomed > 1.0001, `expected + to zoom in, got ${zoomed}`);
  key(document, "-");
  key(document, "-");
  await flush();
  const out = Number(/scale\(([\d.]+)\)/.exec(world.style.transform)?.[1]);
  assert(out < zoomed - 0.05, `expected - to zoom back out, got ${out}`);
});

test("ZoomStage: autoplay advances on an interval", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };
  render(zoomApp({ autoplay: 40, controllerRef }), container);
  await flush();
  assertEqual(controllerRef.current.index, 0);
  await sleep(70);
  await flush();
  assert(controllerRef.current.index >= 1, `expected autoplay to advance, got index ${controllerRef.current.index}`);
});

test("ZoomStage: hashNav syncs the URL hash both ways", async () => {
  location.hash = "";
  const container = mountPoint();
  const controllerRef = { current: null };
  render(zoomApp({ hashNav: true, controllerRef }), container);
  await flush();

  controllerRef.current.goTo("detail", { animate: false });
  await flush();
  assertEqual(decodeURIComponent(location.hash), "#detail", "expected navigation to write the frame id to the hash");

  location.hash = "#overview";
  window.dispatchEvent(new Event("hashchange"));
  await flush();
  assertEqual(container.querySelector(".m-zoom-frame-active").textContent, "overview", "expected a hash change to navigate the stage");
  location.hash = "";
});

test("ZoomStage: controllerRef zoomIn/zoomOut zoom the camera", async () => {
  const container = mountPoint();
  const controllerRef = { current: null };
  render(zoomApp({ freeZoom: true, padding: 0, controllerRef }), container);
  await flush();
  const world = container.querySelector(".m-zoom-world");

  controllerRef.current.zoomIn();
  await flush();
  const inScale = Number(/scale\(([\d.]+)\)/.exec(world.style.transform)?.[1]);
  assert(inScale > 1.0001, `expected zoomIn to raise the scale, got ${inScale}`);

  controllerRef.current.zoomOut();
  controllerRef.current.zoomOut();
  await flush();
  const outScale = Number(/scale\(([\d.]+)\)/.exec(world.style.transform)?.[1]);
  assert(outScale < inScale, `expected zoomOut to lower the scale, got ${outScale}`);
});
