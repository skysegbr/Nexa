// Controller lifecycle for the preview stage: rebuild on every COMMITTED
// document change, parked at the same playhead so scrub position survives
// edits and undo. Drag drafts deliberately don't rebuild — recompiling
// every track (and re-measuring every guide path) per pointermove janks the
// exact interaction the editor is built around; the preview catches up on
// release, when the gesture commits.

import { useEffect, useRef, useState } from "/dist/nexa.js";
import { createTimeline } from "/dist/nexa-motion.js";

function buildController(doc) {
  return createTimeline({
    duration: doc.duration,
    tracks: doc.tracks,
    labels: doc.labels,
    loop: doc.loop,
    autoplay: false,
  });
}

export function useStageController(initialDoc, committedDoc, playheadRef) {
  const [tl, setTl] = useState(() => buildController(initialDoc));
  const lastBuiltRef = useRef(initialDoc);
  useEffect(() => {
    if (lastBuiltRef.current === committedDoc) return;
    lastBuiltRef.current = committedDoc;
    tl.destroy();
    const fresh = buildController(committedDoc);
    fresh.seek(Math.min(playheadRef.current, fresh.duration));
    setTl(fresh);
  });

  // The rebuild effect above only destroys on REPLACEMENT — this one owns
  // the final controller when the editor unmounts (rAF ticker + guide
  // paths in the shared hidden svg must not outlive the app).
  const tlRef = useRef(tl);
  tlRef.current = tl;
  useEffect(() => () => tlRef.current.destroy(), []);

  return tl;
}
