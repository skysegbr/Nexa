// Actor/layer mutation facade for useEditorDoc. Keeping these related
// transactions together prevents the root document hook from becoming the
// monolith warned about in the Nexa AI spec.

import {
  addActorDoc,
  deleteActorDoc,
  duplicateActorDoc,
  moveActorLayerDoc,
} from "./docOps.js";
import {
  addLayerDoc,
  deleteLayerDoc,
  indentLayerDoc,
  layerActorIds,
  moveActorToLayerDoc,
  moveLayerDoc,
  outdentLayerDoc,
} from "./layerOps.js";
import { addMaskLayerDoc } from "./layerSpecialOps.js";

export function createActorActions({ effective, setDoc, setSelected }) {
  // Merge + drop keys patched to `undefined` — like updateKeyframe and
  // symbolOps.applyPatch, so a cleared field can't survive as a literal
  // `undefined` property in saved JSON.
  const merged = (target, patch) => {
    const next = { ...target, ...patch };
    for (const key of Object.keys(next)) {
      if (next[key] === undefined) delete next[key];
    }
    return next;
  };

  const updateActor = (id, patch) => {
    const current = effective.actors.find((actor) => actor.id === id);
    if (!current || Object.keys(patch).every((key) => Object.is(current[key], patch[key]))) return;
    setDoc({
      ...effective,
      actors: effective.actors.map((actor) => (actor.id === id ? merged(actor, patch) : actor)),
    });
  };

  const addActor = (actor, layerId) => {
    const next = addActorDoc(effective, actor, layerId);
    setDoc(next.doc);
    setSelected([{ track: next.id, id: next.doc.tracks[next.id][0]._id }]);
    return next.id;
  };

  const duplicateActor = (id) => {
    const next = duplicateActorDoc(effective, id);
    if (!next) return null;
    setDoc(next.doc);
    setSelected([]);
    return next.id;
  };

  const arrangeActor = (id, delta) => {
    const next = moveActorLayerDoc(effective, id, delta);
    if (next) setDoc(next);
  };

  const deleteActor = (id) => {
    const next = deleteActorDoc(effective, id);
    if (!next) return;
    setDoc(next);
    setSelected((current) => current.filter((entry) => entry.track !== id));
  };

  const addLayer = (name, type, parentId) => {
    const next = addLayerDoc(effective, name, type, parentId);
    setDoc(next.doc);
    return next.id;
  };

  const addMaskLayer = (targetId) => {
    const next = addMaskLayerDoc(effective, targetId);
    setDoc(next.doc);
    return next.id;
  };

  const updateLayer = (id, patch) => {
    const current = effective.layers.find((layer) => layer.id === id);
    if (!current || Object.keys(patch).every((key) => Object.is(current[key], patch[key]))) return;
    setDoc({
      ...effective,
      layers: effective.layers.map((layer) => (layer.id === id ? merged(layer, patch) : layer)),
    });
  };

  const moveLayer = (id, delta) => {
    const next = moveLayerDoc(effective, id, delta);
    if (next) setDoc(next);
  };

  const indentLayer = (id) => {
    const next = indentLayerDoc(effective, id);
    if (next) setDoc(next);
  };

  const outdentLayer = (id) => {
    const next = outdentLayerDoc(effective, id);
    if (next) setDoc(next);
  };

  const moveActorToLayer = (actorId, layerId) => {
    const next = moveActorToLayerDoc(effective, actorId, layerId);
    if (next) setDoc(next);
  };

  const deleteLayer = (id) => {
    const doomed = new Set(layerActorIds(effective, id));
    const next = deleteLayerDoc(effective, id);
    if (!next) return;
    setDoc(next);
    setSelected((current) => current.filter((entry) => !doomed.has(entry.track)));
  };

  return {
    addActor,
    duplicateActor,
    deleteActor,
    updateActor,
    arrangeActor,
    addLayer,
    addMaskLayer,
    updateLayer,
    moveLayer,
    indentLayer,
    outdentLayer,
    moveActorToLayer,
    deleteLayer,
  };
}
