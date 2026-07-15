// Flash-style frame authoring. The editor persists blank keyframes as
// `blank: true`; runtimeTracks compiles that authoring marker to ordinary
// discrete visibility steps understood by nexa-motion.

import { freshKeyframeId } from "./docOps.js";
import { layerActorIds } from "./layerOps.js";
import { snapToFrame } from "./editorUtils.js";

// The POSE a keyframe holds — never its segment-specific travel: copying
// `path`/`orient` into an F6 keyframe would make the actor re-travel the
// whole motion guide a second time between the two keys.
const POSE_EXCLUDED = new Set(["at", "_id", "blank", "path", "orient", "ease"]);
const keyframeContent = (keyframe) => Object.fromEntries(
  Object.entries(keyframe).filter(([key]) => !POSE_EXCLUDED.has(key)),
);

const contentExposureAt = (keyframes, at) => [...keyframes]
  .filter((keyframe) => keyframe.at <= at && !keyframe.blank)
  .sort((a, b) => b.at - a.at)[0];

function frameSelection(tracks, actorIds, at) {
  return actorIds.flatMap((track) => {
    const keyframe = tracks[track]?.find((entry) => entry.at === at);
    return keyframe ? [{ track, id: keyframe._id }] : [];
  });
}

export function insertLayerKeyframeDoc(doc, layerId, at, blank = false) {
  const actorIds = layerActorIds(doc, layerId);
  if (!actorIds.length) return null;
  const tracks = { ...doc.tracks };
  let changed = false;

  for (const track of actorIds) {
    const keyframes = tracks[track] || [];
    const index = keyframes.findIndex((keyframe) => keyframe.at === at);
    if (index !== -1) {
      const current = keyframes[index];
      if (blank && !current.blank) {
        tracks[track] = keyframes.map((keyframe, i) =>
          i === index ? { at, blank: true, _id: keyframe._id } : keyframe,
        );
        changed = true;
      } else if (!blank && current.blank) {
        const exposure = contentExposureAt(keyframes, at);
        tracks[track] = keyframes.map((keyframe, i) =>
          i === index ? { at, ...(exposure ? keyframeContent(exposure) : {}), _id: keyframe._id } : keyframe,
        );
        changed = true;
      }
      continue;
    }

    const exposure = contentExposureAt(keyframes, at);
    const keyframe = blank
      ? { at, blank: true, _id: freshKeyframeId() }
      : { at, ...(exposure ? keyframeContent(exposure) : {}), _id: freshKeyframeId() };
    tracks[track] = [...keyframes, keyframe];
    changed = true;
  }

  return {
    doc: changed ? { ...doc, tracks } : doc,
    selected: frameSelection(tracks, actorIds, at),
  };
}

// F5 inserts one frame into the active layer: keys strictly AFTER the
// playhead move right (the key under the playhead keeps its exposure,
// which is exactly how you extend it — Flash's F5), and the movie grows
// by one frame so nothing is clipped.
export function insertLayerFrameDoc(doc, layerId, at) {
  const actorIds = layerActorIds(doc, layerId);
  if (!actorIds.length) return null;
  const shift = (time) => snapToFrame(time + 1000 / doc.fps, doc.fps);
  const tracks = { ...doc.tracks };
  for (const track of actorIds) {
    tracks[track] = (tracks[track] || []).map((keyframe) =>
      keyframe.at > at ? { ...keyframe, at: shift(keyframe.at) } : keyframe,
    );
  }
  return { ...doc, duration: shift(doc.duration), tracks };
}

// Shift+F6 removes the key at the playhead and lets the preceding exposure
// flow through. Without a preceding exposure, the first frame becomes blank.
export function clearLayerKeyframeDoc(doc, layerId, at) {
  const actorIds = layerActorIds(doc, layerId);
  if (!actorIds.length) return null;
  const tracks = { ...doc.tracks };
  let changed = false;
  for (const track of actorIds) {
    const keyframes = tracks[track] || [];
    const current = keyframes.find((keyframe) => keyframe.at === at);
    if (!current) continue;
    const hasPrevious = keyframes.some((keyframe) => keyframe.at < at);
    tracks[track] = hasPrevious
      ? keyframes.filter((keyframe) => keyframe.at !== at)
      : keyframes.map((keyframe) => keyframe.at === at
        ? { at, blank: true, _id: current._id }
        : keyframe);
    if (hasPrevious || !current.blank) changed = true;
  }
  return changed ? { ...doc, tracks } : null;
}

export function runtimeTrack(keyframes) {
  const hasBlank = keyframes.some((keyframe) => keyframe.blank);
  let heldSet = {};
  return [...keyframes].sort((a, b) => a.at - b.at).map((keyframe) => {
    const { blank, ...runtime } = keyframe;
    if (!hasBlank) return runtime;
    if (runtime.set) heldSet = runtime.set;
    return {
      ...runtime,
      set: { ...heldSet, visibility: blank ? "hidden" : "visible" },
    };
  });
}

export const runtimeTracks = (tracks) => Object.fromEntries(
  Object.entries(tracks || {}).map(([name, keyframes]) => [name, runtimeTrack(keyframes)]),
);
