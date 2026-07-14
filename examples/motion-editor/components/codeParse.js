// Two-way code editing: parse an edited useTimeline() source back into a
// spec, and merge that spec into the editor's document. The export is
// plain JS (not JSON), so the object literal is evaluated with the
// Function constructor — the editor runs the user's own local code, the
// same trust level as pasting it into their app.

export function parseTimelineCode(source) {
  const start = source.indexOf("useTimeline(");
  if (start === -1) {
    throw new Error("could not find useTimeline( … ) in the code");
  }
  const open = source.indexOf("{", start);
  const close = source.lastIndexOf("}");
  if (open === -1 || close <= open) {
    throw new Error("could not find the spec object literal");
  }

  let spec;
  try {
    spec = new Function(`"use strict"; return (${source.slice(open, close + 1)});`)();
  } catch (error) {
    throw new Error(`not valid JavaScript: ${error.message}`);
  }

  if (!spec || typeof spec !== "object") {
    throw new Error("the spec must be an object");
  }
  if (!Number.isFinite(spec.duration) || spec.duration < 100) {
    throw new Error("duration must be a number ≥ 100");
  }
  if (!spec.tracks || typeof spec.tracks !== "object" || Array.isArray(spec.tracks)) {
    throw new Error("tracks must be an object of keyframe arrays");
  }
  for (const [name, keyframes] of Object.entries(spec.tracks)) {
    if (!Array.isArray(keyframes)) {
      throw new Error(`track "${name}" must be an array`);
    }
    for (const keyframe of keyframes) {
      if (!keyframe || typeof keyframe !== "object" || !Number.isFinite(keyframe.at) || keyframe.at < 0) {
        throw new Error(`track "${name}": every keyframe needs a numeric \`at\` ≥ 0`);
      }
    }
  }
  if (spec.labels !== undefined) {
    if (typeof spec.labels !== "object" || Array.isArray(spec.labels)) {
      throw new Error("labels must be an object of { name: ms }");
    }
    for (const [name, ms] of Object.entries(spec.labels)) {
      if (!Number.isFinite(ms) || ms < 0) {
        throw new Error(`label "${name}" must map to a number ≥ 0`);
      }
    }
  }
  return spec;
}

// A single track's keyframe array — the actor-level "behavior" editor
// commits through this (select the object, edit its code, Flash-style).
export function parseTrackCode(source) {
  const open = source.indexOf("[");
  const close = source.lastIndexOf("]");
  if (open === -1 || close <= open) {
    throw new Error("expected a [ … ] keyframe array");
  }
  let keyframes;
  try {
    keyframes = new Function(`"use strict"; return (${source.slice(open, close + 1)});`)();
  } catch (error) {
    throw new Error(`not valid JavaScript: ${error.message}`);
  }
  if (!Array.isArray(keyframes)) {
    throw new Error("the track must be an array of keyframes");
  }
  for (const keyframe of keyframes) {
    if (!keyframe || typeof keyframe !== "object" || !Number.isFinite(keyframe.at) || keyframe.at < 0) {
      throw new Error("every keyframe needs a numeric `at` ≥ 0");
    }
  }
  return keyframes;
}

// Actors survive the round-trip (the code carries no geometry); tracks,
// duration, labels and loop come from the spec. A track name the document
// doesn't know yet gets a starter actor so it lands on stage editable.
export function applySpecToDoc(doc, spec) {
  const actors = [...doc.actors];
  const known = new Set(actors.map((actor) => actor.id));
  let added = 0;
  for (const name of Object.keys(spec.tracks)) {
    if (!known.has(name)) {
      actors.push({
        id: name,
        label: name,
        kind: "rect",
        x: 40 + (added % 5) * 72,
        y: 40 + Math.floor(added / 5) * 72,
        w: 48,
        h: 48,
        fill: "#4f7cff",
      });
      added += 1;
    }
  }
  const tracks = {};
  for (const actor of actors) {
    tracks[actor.id] = (spec.tracks[actor.id] || []).map((keyframe) => ({ ...keyframe }));
  }
  return {
    ...doc,
    duration: spec.duration,
    tracks,
    actors,
    labels: spec.labels,
    loop: spec.loop || undefined,
  };
}
