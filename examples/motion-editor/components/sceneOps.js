// Flash-style scene snapshots. Shared document properties (fps, stage color,
// library) stay at the root; timeline/stage branches belong to each scene.

export const SCENE_FIELDS = ["duration", "actors", "tracks", "layers", "labels", "loop"];

function nextSceneId(scenes) {
  const used = new Set(scenes.map((scene) => scene.id));
  let index = 1;
  while (used.has(`scene-${index}`)) index += 1;
  return `scene-${index}`;
}

export function sceneSnapshot(doc, identity = {}) {
  return Object.assign(
    { id: identity.id || doc.activeSceneId || "scene-1", name: identity.name || "Scene 1" },
    Object.fromEntries(SCENE_FIELDS.map((key) => [key, doc[key]])),
  );
}

export function syncActiveScene(doc) {
  if (doc.editingSymbolId) return doc;
  if (!Array.isArray(doc.scenes) || !doc.scenes.length) return doc;
  return {
    ...doc,
    scenes: doc.scenes.map((scene) =>
      scene.id === doc.activeSceneId ? { ...scene, ...sceneSnapshot(doc, scene) } : scene),
  };
}

export function applyScene(doc, scene) {
  return {
    ...doc,
    ...Object.fromEntries(SCENE_FIELDS.map((key) => [key, scene[key]])),
    activeSceneId: scene.id,
  };
}

export function selectSceneDoc(doc, id) {
  if (doc.editingSymbolId) return null;
  if (id === doc.activeSceneId) return null;
  const synced = syncActiveScene(doc);
  const scene = synced.scenes.find((entry) => entry.id === id);
  return scene ? applyScene(synced, scene) : null;
}

export function addSceneDoc(doc, name) {
  if (doc.editingSymbolId) return null;
  const synced = syncActiveScene(doc);
  const id = nextSceneId(synced.scenes);
  const scene = {
    id,
    name: name || `Scene ${synced.scenes.length + 1}`,
    duration: synced.duration,
    actors: [],
    tracks: {},
    layers: [{ id: "layer-1", name: "Layer 1", type: "normal", actorIds: [] }],
    labels: undefined,
    loop: undefined,
  };
  const index = synced.scenes.findIndex((entry) => entry.id === synced.activeSceneId);
  const scenes = [...synced.scenes];
  scenes.splice(index + 1, 0, scene);
  return { id, doc: applyScene({ ...synced, scenes }, scene) };
}

function cloneScene(scene, id, name) {
  return {
    ...scene,
    id,
    name,
    actors: scene.actors.map((actor) => ({ ...actor })),
    tracks: Object.fromEntries(Object.entries(scene.tracks).map(([track, keyframes]) =>
      [track, keyframes.map((keyframe) => ({ ...keyframe }))])),
    layers: scene.layers.map((layer) => ({ ...layer, actorIds: [...layer.actorIds] })),
    labels: scene.labels ? { ...scene.labels } : undefined,
  };
}

export function duplicateSceneDoc(doc) {
  if (doc.editingSymbolId) return null;
  const synced = syncActiveScene(doc);
  const source = synced.scenes.find((scene) => scene.id === synced.activeSceneId);
  if (!source) return null;
  const id = nextSceneId(synced.scenes);
  const copy = cloneScene(source, id, `${source.name} copy`);
  const index = synced.scenes.indexOf(source);
  const scenes = [...synced.scenes];
  scenes.splice(index + 1, 0, copy);
  return { id, doc: applyScene({ ...synced, scenes }, copy) };
}

export function renameSceneDoc(doc, id, name) {
  const label = name.trim();
  const current = doc.scenes.find((scene) => scene.id === id);
  if (!label || !current || current.name === label) return null;
  return { ...doc, scenes: doc.scenes.map((scene) => (scene.id === id ? { ...scene, name: label } : scene)) };
}

export function moveSceneDoc(doc, id, delta) {
  const index = doc.scenes.findIndex((scene) => scene.id === id);
  const target = Math.max(0, Math.min(doc.scenes.length - 1, index + delta));
  if (index < 0 || index === target) return null;
  const scenes = [...doc.scenes];
  const [moved] = scenes.splice(index, 1);
  scenes.splice(target, 0, moved);
  return { ...doc, scenes };
}

export function deleteSceneDoc(doc, id) {
  if (doc.editingSymbolId) return null;
  if (doc.scenes.length <= 1) return null;
  const synced = syncActiveScene(doc);
  const index = synced.scenes.findIndex((scene) => scene.id === id);
  if (index < 0) return null;
  const scenes = synced.scenes.filter((scene) => scene.id !== id);
  if (id !== synced.activeSceneId) return { ...synced, scenes };
  const next = scenes[Math.min(index, scenes.length - 1)];
  return applyScene({ ...synced, scenes }, next);
}
