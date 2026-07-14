// Which motion guides the stage overlay should draw: every path keyframe
// of the selected tracks (or of the track being drawn), positioned at the
// owning actor's center base. The guide under an anchor drag previews
// from the local anchors instead of the committed path.

import { smoothPath } from "./smoothPath.js";
import { baseOf } from "./actorGeometry.js";

export function guidesFor({ doc, selected, drawing, actorsById, anchorDrag, editableKeyframe }) {
  const guideTracks = new Set(selected.map((entry) => entry.track));
  if (drawing) guideTracks.add(drawing.track);

  const guides = [];
  for (const trackName of guideTracks) {
    const actor = actorsById[trackName];
    if (!actor) continue;
    const base = baseOf(actor);
    for (const keyframe of doc.tracks[trackName] || []) {
      if (keyframe.path) {
        const d = anchorDrag && keyframe === editableKeyframe ? smoothPath(anchorDrag.anchors) : keyframe.path;
        guides.push({ trackName, d, base });
      }
    }
  }
  return guides;
}
