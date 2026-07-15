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
  symbolUsage,
} from "../examples/motion-editor/components/symbolOps.js";
import { vectorActorFromPoints } from "../examples/motion-editor/components/vectorGeometry.js";
import {
  addLayerDoc,
  deleteLayerDoc,
  indentLayerDoc,
  moveActorToLayerDoc,
  moveLayerDoc,
  normalizeLayers,
  orderedActors,
  outdentLayerDoc,
  resolvedLayerFlags,
  visibleLayers,
} from "../examples/motion-editor/components/layerOps.js";
import { addActorDoc } from "../examples/motion-editor/components/docOps.js";
import { generateCode } from "../examples/motion-editor/components/CodePane.js";
import { applySpecToDoc, parseTimelineCode } from "../examples/motion-editor/components/codeParse.js";
import { addMaskLayerDoc } from "../examples/motion-editor/components/layerSpecialOps.js";
import { maskForLayer } from "../examples/motion-editor/components/layerTypes.js";
import { enterSymbolDoc, exitSymbolDoc } from "../examples/motion-editor/components/symbolTimelineOps.js";
import {
  addSceneDoc,
  deleteSceneDoc,
  duplicateSceneDoc,
  moveSceneDoc,
  selectSceneDoc,
} from "../examples/motion-editor/components/sceneOps.js";
import {
  clearLayerKeyframeDoc,
  insertLayerFrameDoc,
  insertLayerKeyframeDoc,
  runtimeTrack,
} from "../examples/motion-editor/components/frameOps.js";

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
  assertEqual(doc.library[0].timeline.actors.length, 1);
  assertEqual(doc.layers[0].actorIds[0], "box");
  assertEqual(doc.scenes.length, 1);
  assertEqual(doc.activeSceneId, doc.scenes[0].id);
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

test("motion editor: folder hierarchy normalizes to preorder without owning actors", async () => {
  const actors = [{ id: "a" }, { id: "b" }];
  const layers = normalizeLayers([
    { id: "child", name: "Child", parentId: "group", actorIds: ["a"] },
    { id: "group", name: "Group", type: "folder", actorIds: ["b"] },
    { id: "back", name: "Back", actorIds: ["b"] },
  ], actors);
  assertEqual(layers.map((layer) => layer.id).join(","), "group,child,back");
  assertEqual(layers[0].actorIds.length, 0, "folders must never own runtime actors");
  assertEqual(layers[1].parentId, "group");
});

test("motion editor: layers indent into and out of folders", async () => {
  let doc = normalizeMotionDocument(legacyDoc());
  doc = addLayerDoc(doc, "Assets", "folder").doc;
  doc = indentLayerDoc(doc, doc.layers[1].id);
  assertEqual(doc.layers[1].parentId, doc.layers[0].id);
  assertEqual(visibleLayers(doc.layers, { [doc.layers[0].id]: { collapsed: true } }).length, 1);
  assertEqual(resolvedLayerFlags(doc, { [doc.layers[0].id]: { locked: true } }, doc.layers[1].id).locked, true);
  doc = outdentLayerDoc(doc, doc.layers[1].id);
  assertEqual(doc.layers[1].parentId, undefined);
});

test("motion editor: actors cannot be placed directly in an authoring folder", async () => {
  let doc = normalizeMotionDocument(legacyDoc());
  const folder = addLayerDoc(doc, "Assets", "folder");
  doc = folder.doc;
  const next = addActorDoc(doc, { kind: "ellipse", x: 0, y: 0, w: 20, h: 20, fill: "#fff" }, folder.id);
  assertEqual(next.doc.layers.find((layer) => layer.id === folder.id).actorIds.length, 0);
  assertEqual(next.doc.layers.find((layer) => layer.actorIds.includes(next.id)).type, "normal");
});

test("motion editor: adding a mask wraps the selected layer", async () => {
  const doc = normalizeMotionDocument(legacyDoc());
  const targetId = doc.layers[0].id;
  const next = addMaskLayerDoc(doc, targetId);
  assertEqual(next.doc.layers[0].type, "mask");
  assertEqual(next.doc.layers[1].parentId, next.id);
  assertEqual(maskForLayer(next.doc, targetId).id, next.id);
  const actor = addActorDoc(next.doc, { kind: "ellipse", x: 0, y: 0, w: 20, h: 20, fill: "#fff" }, next.id);
  assertEqual(actor.doc.layers[0].actorIds.includes(actor.id), true, "mask layers should own editable artwork");
  const second = addMaskLayerDoc(next.doc, targetId);
  assertEqual(second.doc.layers.find((layer) => layer.id === second.id).parentId, undefined, "nested masks are avoided");
  assertEqual(second.doc.layers.find((layer) => layer.id === targetId).parentId, next.id);
});

test("motion editor: schema v5 preserves mask and guide layer types", async () => {
  const doc = normalizeMotionDocument({
    duration: 1000,
    actors: [{ id: "mask-art" }, { id: "content" }, { id: "guide-art" }],
    tracks: { "mask-art": [{ at: 0 }], content: [{ at: 0 }], "guide-art": [{ at: 0 }] },
    layers: [
      { id: "mask", type: "mask", name: "Mask", actorIds: ["mask-art"] },
      { id: "content-layer", type: "normal", name: "Content", parentId: "mask", actorIds: ["content"] },
      { id: "guide", type: "guide", name: "Guide", actorIds: ["guide-art"] },
    ],
  });
  assertEqual(doc.layers.map((layer) => layer.type).join(","), "mask,normal,guide");
  assertEqual(doc.layers[1].parentId, "mask");
});

test("motion editor: mask and guide tracks stay editor-only on code export", async () => {
  const doc = normalizeMotionDocument({
    duration: 1000,
    actors: [{ id: "maskArt" }, { id: "content" }, { id: "guideArt" }],
    tracks: { maskArt: [{ at: 0 }], content: [{ at: 0 }], guideArt: [{ at: 0 }] },
    layers: [
      { id: "mask", type: "mask", actorIds: ["maskArt"] },
      { id: "content-layer", type: "normal", parentId: "mask", actorIds: ["content"] },
      { id: "guide", type: "guide", actorIds: ["guideArt"] },
    ],
  });
  const code = generateCode(doc);
  assertEqual(code.includes("maskArt:"), false);
  assertEqual(code.includes("guideArt:"), false);
  assertEqual(code.includes("content:"), true);
  const applied = applySpecToDoc(doc, { duration: 1200, tracks: { content: [{ at: 100 }] } });
  assertEqual(applied.tracks.maskArt[0].at, 0);
  assertEqual(applied.tracks.guideArt[0].at, 0);
});

test("motion editor: moving a folder carries its complete subtree", async () => {
  const doc = normalizeMotionDocument({
    ...legacyDoc(),
    layers: [
      { id: "group", name: "Group", type: "folder", actorIds: [] },
      { id: "child", name: "Child", parentId: "group", actorIds: ["box"] },
      { id: "other", name: "Other", actorIds: [] },
    ],
  });
  const moved = moveLayerDoc(doc, "group", 1);
  assertEqual(moved.layers.map((layer) => layer.id).join(","), "other,group,child");
});

test("motion editor: deleting a folder removes descendant actors atomically", async () => {
  const doc = normalizeMotionDocument({
    ...legacyDoc(),
    layers: [
      { id: "group", name: "Group", type: "folder", actorIds: [] },
      { id: "child", name: "Child", parentId: "group", actorIds: ["box"] },
    ],
  });
  const next = deleteLayerDoc(doc, "group");
  assertEqual(next.actors.length, 0);
  assertEqual(next.tracks.box, undefined);
  assertEqual(next.layers.some((layer) => layer.type === "normal"), true);
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
  assertEqual(saved.scenes[0].tracks.box[0]._id, undefined);
  assertEqual(saved.tracks.box[0].x, 0);
});

test("motion editor: F6 copies the current layer exposure atomically", async () => {
  const doc = normalizeMotionDocument({
    ...legacyDoc(),
    tracks: { box: [{ at: 0, x: 12, opacity: 0.5 }, { at: 1000, x: 200 }] },
  });
  const result = insertLayerKeyframeDoc(doc, doc.layers[0].id, 500);
  const inserted = result.doc.tracks.box.find((keyframe) => keyframe.at === 500);
  assertEqual(inserted.x, 12);
  assertEqual(inserted.opacity, 0.5);
  assert(inserted._id, "inserted keyframe should receive a session id");
  assertEqual(result.selected[0].id, inserted._id);
});

test("motion editor: F7 persists a blank exposure and compiles runtime visibility", async () => {
  let doc = normalizeMotionDocument({
    ...legacyDoc(),
    tracks: { box: [{ at: 0, x: 10 }, { at: 1000, x: 40 }] },
  });
  doc = insertLayerKeyframeDoc(doc, doc.layers[0].id, 500, true).doc;
  const compiled = runtimeTrack(doc.tracks.box);
  assertEqual(compiled.find((keyframe) => keyframe.at === 500).set.visibility, "hidden");
  assertEqual(compiled.find((keyframe) => keyframe.at === 1000).set.visibility, "visible");
  const saved = serializeMotionDocument(doc);
  assertEqual(saved.tracks.box.find((keyframe) => keyframe.at === 500).blank, true);
  const spec = parseTimelineCode(generateCode(doc));
  assertEqual(spec.tracks.box.find((keyframe) => keyframe.at === 500).set.visibility, "hidden");
  assertEqual(spec.tracks.box.some((keyframe) => keyframe.blank), false);
});

test("motion editor: blank keyframes survive the code-pane export → apply round-trip", async () => {
  let doc = normalizeMotionDocument({
    ...legacyDoc(),
    tracks: { box: [{ at: 0, x: 10 }, { at: 1000, x: 40 }] },
  });
  doc = insertLayerKeyframeDoc(doc, doc.layers[0].id, 500, true).doc;

  // The export is runtime-faithful: blank compiles to discrete visibility.
  const spec = parseTimelineCode(generateCode(doc));
  assertEqual(spec.tracks.box.some((keyframe) => keyframe.blank), false);

  // Applying that same code back must rebuild the blank marker, not persist
  // the compiled visibility set (the pre-fix bug: F7 → export → apply erased
  // every blank keyframe, so the lanes and the blank toggle stopped seeing it).
  const applied = applySpecToDoc(doc, spec);
  const at500 = applied.tracks.box.find((keyframe) => keyframe.at === 500);
  assertEqual(at500.blank, true);
  assert(!at500.set, "restored blank keyframe sheds the compiled visibility set");

  // Visible keyframes shed the injected visibility set and keep their pose.
  const at1000 = applied.tracks.box.find((keyframe) => keyframe.at === 1000);
  assertEqual(at1000.blank, undefined);
  assert(!at1000.set, "visible keyframes shed the compiled visibility set");
  assertEqual(at1000.x, 40);
});

test("motion editor: F6 ends a blank exposure with copied content", async () => {
  let doc = normalizeMotionDocument({
    ...legacyDoc(),
    tracks: { box: [{ at: 0, x: 10 }, { at: 500, blank: true }] },
  });
  doc = insertLayerKeyframeDoc(doc, doc.layers[0].id, 800).doc;
  const content = doc.tracks.box.find((keyframe) => keyframe.at === 800);
  assertEqual(content.blank, undefined);
  assertEqual(content.x, 10);
  assertEqual(runtimeTrack(doc.tracks.box).find((keyframe) => keyframe.at === 800).set.visibility, "visible");
});

test("motion editor: F5 extends the exposure under the playhead and shifts only later keys", async () => {
  const doc = normalizeMotionDocument({
    ...legacyDoc(),
    fps: 10,
    tracks: { box: [{ at: 0 }, { at: 500 }, { at: 1000 }] },
  });
  const next = insertLayerFrameDoc(doc, doc.layers[0].id, 500);
  // Flash's F5: the key under the playhead KEEPS its frame (that is how an
  // exposure is extended); keys strictly after it slide one frame right.
  assertEqual(next.tracks.box.map((keyframe) => keyframe.at).join(","), "0,500,1100");
  assertEqual(next.duration, 1100);
});

test("motion editor: Shift+F6 clears into the previous exposure", async () => {
  let doc = normalizeMotionDocument({
    ...legacyDoc(),
    tracks: { box: [{ at: 0, x: 0 }, { at: 500, x: 50 }] },
  });
  doc = clearLayerKeyframeDoc(doc, doc.layers[0].id, 500);
  assertEqual(doc.tracks.box.length, 1);
  doc = clearLayerKeyframeDoc(doc, doc.layers[0].id, 0);
  assertEqual(doc.tracks.box[0].blank, true, "clearing the first content frame should leave a blank exposure");
});

test("motion editor: switching scenes preserves each scene snapshot", async () => {
  let doc = normalizeMotionDocument(legacyDoc());
  const firstId = doc.activeSceneId;
  doc = { ...doc, actors: doc.actors.map((actor) => ({ ...actor, label: "Edited in scene 1" })) };
  const added = addSceneDoc(doc);
  assertEqual(added.doc.actors.length, 0);
  assertEqual(added.doc.scenes.length, 2);
  const restored = selectSceneDoc(added.doc, firstId);
  assertEqual(restored.actors[0].label, "Edited in scene 1");
  assertEqual(restored.activeSceneId, firstId);
});

test("motion editor: duplicating a scene creates an independent editable copy", async () => {
  const doc = normalizeMotionDocument(legacyDoc());
  const originalId = doc.activeSceneId;
  const duplicated = duplicateSceneDoc(doc);
  const editedCopy = { ...duplicated.doc, actors: duplicated.doc.actors.map((actor) => ({ ...actor, label: "Copy only" })) };
  const original = selectSceneDoc(editedCopy, originalId);
  assertEqual(original.actors[0].label, "Box");
  assertEqual(duplicated.doc.scenes[1].name, "Scene 1 copy");
});

test("motion editor: scenes reorder and active deletion chooses a neighbor", async () => {
  let doc = addSceneDoc(normalizeMotionDocument(legacyDoc()), "Second").doc;
  const secondId = doc.activeSceneId;
  doc = moveSceneDoc(doc, secondId, -1);
  assertEqual(doc.scenes[0].id, secondId);
  doc = deleteSceneDoc(doc, secondId);
  assertEqual(doc.scenes.length, 1);
  assertEqual(doc.activeSceneId, doc.scenes[0].id);
  assertEqual(deleteSceneDoc(doc, doc.activeSceneId), null);
});

test("motion editor: converting an actor creates a linked symbol", async () => {
  const converted = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const actor = converted.actors[0];
  assert(actor.symbolId, "actor should reference the new symbol");
  assertEqual(converted.library.length, 2);
  assertEqual(converted.library[1].timeline.actors[0].kind, "rect");
  assertEqual(resolveActor(converted, actor).fill, "#f00");
});

test("motion editor: symbol editing isolates and commits a MovieClip timeline", async () => {
  let doc = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const symbolId = doc.actors[0].symbolId;
  doc = enterSymbolDoc(doc, symbolId);
  assertEqual(doc.editingSymbolId, symbolId);
  assertEqual(doc.actors[0].id, "artwork-1");
  doc = { ...doc, actors: doc.actors.map((actor) => ({ ...actor, fill: "#00f" })) };
  doc = exitSymbolDoc(doc);
  assertEqual(doc.editingSymbolId, undefined);
  assertEqual(doc.actors[0].symbolId, symbolId);
  assertEqual(doc.library.find((symbol) => symbol.id === symbolId).timeline.actors[0].fill, "#00f");
});

test("motion editor: nested MovieClip editing uses a cycle-safe context stack", async () => {
  let doc = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const outerId = doc.actors[0].symbolId;
  doc = enterSymbolDoc(doc, outerId);
  doc = convertActorToSymbolDoc(doc, "artwork-1");
  const innerId = doc.actors[0].symbolId;
  doc = enterSymbolDoc(doc, innerId);
  assertEqual(doc.symbolEditStack.join(","), outerId);
  assertEqual(enterSymbolDoc(doc, outerId), null);
  doc = exitSymbolDoc(doc);
  assertEqual(doc.editingSymbolId, outerId);
  doc = exitSymbolDoc(doc);
  assertEqual(doc.editingSymbolId, undefined);
});

test("motion editor: saving inside a symbol persists it without replacing the scene", async () => {
  let doc = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const symbolId = doc.actors[0].symbolId;
  doc = enterSymbolDoc(doc, symbolId);
  doc = { ...doc, actors: doc.actors.map((actor) => ({ ...actor, fill: "#35e0c2" })) };
  const loaded = normalizeMotionDocument(serializeMotionDocument(doc));
  assertEqual(loaded.actors[0].symbolId, symbolId);
  assertEqual(loaded.library.find((symbol) => symbol.id === symbolId).timeline.actors[0].fill, "#35e0c2");
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

test("motion editor: shared library usage spans every scene", async () => {
  let doc = convertActorToSymbolDoc(normalizeMotionDocument(legacyDoc()), "box");
  const symbolId = doc.actors[0].symbolId;
  doc = duplicateSceneDoc(doc).doc;
  assertEqual(symbolUsage(doc)[symbolId], 2);
  doc = removeSymbolDoc(doc, symbolId);
  assertEqual(doc.scenes.some((scene) => scene.actors.some((actor) => actor.symbolId === symbolId)), false);
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
