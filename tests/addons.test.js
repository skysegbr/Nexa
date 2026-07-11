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
