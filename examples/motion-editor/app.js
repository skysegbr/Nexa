// Example: motion-editor — a visual timeline editor for nexa-motion, in the
// spirit of the Flash IDE: stage preview on top, timeline panel with
// draggable keyframes below, an inspector for the selected keyframe, and
// live code export.
//
// The document (duration + tracks of keyframes) is plain state; every edit
// rebuilds the createTimeline() controller and the stage rebinds through
// fresh track() refs — the preview is always the real runtime, never an
// approximation.

import { h, render, useRef, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";
import { ACTORS, INITIAL_DOC } from "./data.js";
import { Stage } from "./components/Stage.js";
import { TimelinePanel } from "./components/TimelinePanel.js";
import { Inspector } from "./components/Inspector.js";
import { CodePane } from "./components/CodePane.js";

function buildController(doc) {
  return createTimeline({
    duration: doc.duration,
    tracks: doc.tracks,
    autoplay: false,
  });
}

function App() {
  const [doc, setDoc] = useState(INITIAL_DOC);
  const [tl, setTl] = useState(() => buildController(INITIAL_DOC));
  const [selected, setSelected] = useState(null); // { track, index } | null
  const playheadRef = useRef(0);

  // Every document edit swaps in a fresh controller parked at the same
  // playhead, so scrub position survives edits.
  const updateDoc = (next) => {
    setDoc(next);
    tl.destroy();
    const fresh = buildController(next);
    fresh.seek(Math.min(playheadRef.current, fresh.duration));
    setTl(fresh);
  };

  const updateKeyframe = (trackName, index, patch) => {
    const nextTrack = doc.tracks[trackName].map((keyframe, i) =>
      i === index ? { ...keyframe, ...patch } : keyframe,
    );
    // `undefined` values un-key the property on this keyframe.
    for (const key of Object.keys(nextTrack[index])) {
      if (nextTrack[index][key] === undefined) {
        delete nextTrack[index][key];
      }
    }
    updateDoc({ ...doc, tracks: { ...doc.tracks, [trackName]: nextTrack } });
  };

  const addKeyframe = (trackName) => {
    const at = Math.round(playheadRef.current / 25) * 25;
    const nextTrack = [...doc.tracks[trackName], { at }];
    updateDoc({ ...doc, tracks: { ...doc.tracks, [trackName]: nextTrack } });
    setSelected({ track: trackName, index: nextTrack.length - 1 });
  };

  const deleteKeyframe = (trackName, index) => {
    const nextTrack = doc.tracks[trackName].filter((_, i) => i !== index);
    updateDoc({ ...doc, tracks: { ...doc.tracks, [trackName]: nextTrack } });
    setSelected(null);
  };

  const setDuration = (duration) => {
    if (Number.isFinite(duration) && duration >= 100) {
      updateDoc({ ...doc, duration });
    }
  };

  return h(
    "div",
    { className: "me-app" },
    h(
      "header",
      { className: "me-header" },
      h("h1", { className: "me-brand" }, "⬡ Nexa ", h("em", null, "Motion Editor")),
      h("p", { className: "me-hint" }, "drag the diamonds · click a row's + to add a keyframe at the playhead · edit in the inspector"),
    ),
    h(
      "main",
      { className: "me-main" },
      h(
        "div",
        { className: "me-left" },
        h(Stage, { tl, actors: ACTORS }),
        h(TimelinePanel, {
          tl,
          doc,
          actors: ACTORS,
          selected,
          playheadRef,
          onSelect: setSelected,
          onMoveKeyframe: (track, index, at) => updateKeyframe(track, index, { at }),
          onAddKeyframe: addKeyframe,
          onSetDuration: setDuration,
        }),
      ),
      h(
        "aside",
        { className: "me-right" },
        h(Inspector, {
          doc,
          selected,
          onEdit: (patch) => selected && updateKeyframe(selected.track, selected.index, patch),
          onDelete: () => selected && deleteKeyframe(selected.track, selected.index),
        }),
        h(CodePane, { doc }),
      ),
    ),
  );
}

render(App, document.getElementById("app"));
