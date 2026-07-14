// Pure document-model tests for the visual motion editor. These run in the
// same browser-native harness as the runtime: no Node and no build step.

import { test, assert, assertEqual } from "./runner.js";
import {
  MOTION_DOCUMENT_VERSION,
  normalizeMotionDocument,
  serializeMotionDocument,
} from "../examples/motion-editor/components/documentSchema.js";
import {
  convertActorToSymbolDoc,
  editActorOrSymbolDoc,
  removeSymbolDoc,
  resolveActor,
} from "../examples/motion-editor/components/symbolOps.js";
import { vectorActorFromPoints } from "../examples/motion-editor/components/vectorGeometry.js";
import { addLayerDoc, deleteLayerDoc, moveActorToLayerDoc, normalizeLayers, orderedActors } from "../examples/motion-editor/components/layerOps.js";
import { addActorDoc } from "../examples/motion-editor/components/docOps.js";

const legacyDoc = () => ({
  duration: 1000,
  actors: [{ id: "box", label: "Box", kind: "rect", x: 0, y: 0, w: 40, h: 40, fill: "#f00" }],
  tracks: { box: [{ at: 0, x: 0, _id: "session-only" }] },
  library: [{ name: "Old symbol", kind: "ellipse", w: 20, h: 20, fill: "#0f0" }],
});

test("motion editor: legacy documents normalize to the current schema", async () => {
  const doc = normalizeMotionDocument(legacyDoc());
  assertEqual(doc.schemaVersion, MOTION_DOCUMENT_VERSION);
  assertEqual(doc.fps, 24);
  assertEqual(doc.library[0].id, "symbol-1");
  assertEqual(doc.layers[0].actorIds[0], "box");
});

test("motion editor: layers normalize membership without duplicating actors", async () => {
  const actors = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
  const layers = normalizeLayers(
    [{ id: "front", name: "Front", actorIds: ["a", "a", "missing"] }],
    actors,
  );
  assertEqual(layers[0].actorIds.join(","), "a");
  assertEqual(layers[1].actorIds.join(","), "b");
});

test("motion editor: actors can move between independent layers", async () => {
  let doc = normalizeMotionDocument({ ...legacyDoc(), actors: [
    ...legacyDoc().actors,
    { id: "ball", label: "Ball", kind: "ellipse", x: 0, y: 0, w: 20, h: 20, fill: "#0f0" },
  ], tracks: { ...legacyDoc().tracks, ball: [{ at: 0 }] } });
  const boxLayer = doc.layers.find((layer) => layer.actorIds.includes("box"));
  doc = moveActorToLayerDoc(doc, "ball", boxLayer.id);
  assertEqual(doc.layers.find((layer) => layer.id === boxLayer.id).actorIds.join(","), "box,ball");
  assertEqual(orderedActors(doc).map((actor) => actor.id).join(","), "box,ball");
});

test("motion editor: v2 migration preserves paint order behind Flash-style rows", async () => {
  const old = legacyDoc();
  old.actors.push({ id: "front", label: "Front", kind: "rect", x: 0, y: 0, w: 10, h: 10, fill: "#fff" });
  old.tracks.front = [{ at: 0 }];
  const doc = normalizeMotionDocument(old);
  assertEqual(doc.layers[0].actorIds[0], "front", "top row should be the front actor");
  assertEqual(orderedActors(doc).map((actor) => actor.id).join(","), "box,front");
});

test("motion editor: new actors join the active layer", async () => {
  const doc = normalizeMotionDocument(legacyDoc());
  const next = addActorDoc(
    doc,
    { kind: "rect", x: 10, y: 10, w: 20, h: 20, fill: "#00f" },
    doc.layers[0].id,
  );
  assertEqual(next.doc.layers.length, 1);
  assertEqual(next.doc.layers[0].actorIds.includes(next.id), true);
});

test("motion editor: new layers are inserted at the top of the Flash stack", async () => {
  const doc = normalizeMotionDocument(legacyDoc());
  const next = addLayerDoc(doc);
  assertEqual(next.doc.layers[0].id, next.id);
  assertEqual(next.doc.layers[1].actorIds[0], "box");
});

test("motion editor: deleting a layer removes its member tracks atomically", async () => {
  const doc = normalizeMotionDocument(legacyDoc());
  const next = deleteLayerDoc(doc, doc.layers[0].id);
  assertEqual(next.actors.length, 0);
  assertEqual(next.tracks.box, undefined);
  assertEqual(next.layers.length, 1, "an empty document should retain one layer");
});

test("motion editor: serialization removes session keyframe ids", async () => {
  const saved = serializeMotionDocument(normalizeMotionDocument(legacyDoc()));
  assertEqual(saved.tracks.box[0]._id, undefined);
  assertEqual(saved.tracks.box[0].x, 0);
});

test("motion editor: converting an actor creates a linked symbol", async () => {
  const converted = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const actor = converted.actors[0];
  assert(actor.symbolId, "actor should reference the new symbol");
  assertEqual(converted.library.length, 2);
  assertEqual(resolveActor(converted, actor).fill, "#f00");
});

test("motion editor: editing linked artwork updates every instance", async () => {
  let doc = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const source = doc.actors[0];
  doc = { ...doc, actors: [...doc.actors, { ...source, id: "box-copy", label: "Box copy" }] };
  doc = editActorOrSymbolDoc(doc, "box", { fill: "#00f" });
  assertEqual(resolveActor(doc, doc.actors[0]).fill, "#00f");
  assertEqual(resolveActor(doc, doc.actors[1]).fill, "#00f");
});

test("motion editor: removing a symbol safely detaches its instances", async () => {
  let doc = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const symbolId = doc.actors[0].symbolId;
  doc = removeSymbolDoc(doc, symbolId);
  assertEqual(doc.actors[0].symbolId, undefined);
  assertEqual(doc.actors[0].fill, "#f00");
  assertEqual(doc.library.some((item) => item.id === symbolId), false);
});

test("motion editor: line tool creates portable local vector geometry", async () => {
  const actor = vectorActorFromPoints(
    "line",
    [{ x: 80, y: 60 }, { x: 20, y: 10 }],
    { stroke: "#123456", strokeWidth: 4 },
  );
  assert(actor.x < 20 && actor.y < 10, "stroke padding should be included in the actor box");
  assert(actor.path.startsWith("M "), "line should be stored as an SVG path");
  assertEqual(actor.vectorW, actor.w);
  assertEqual(actor.stroke, "#123456");
});
