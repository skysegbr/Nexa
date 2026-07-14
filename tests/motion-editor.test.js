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
