// Flash's transport readout — current frame · frame rate · elapsed time —
// self-clocked so a playing movie updates just this one <span> at 20Hz
// instead of re-rendering the whole transport row (and through it the
// timeline lanes). Single-root on purpose, like TimelineCursor.

import { h, useEffect, useState } from "/dist/nexa.js";
import { frameOf } from "./editorUtils.js";

export function TransportReadout({ tl, fps }) {
  const [playhead, setPlayhead] = useState(() => tl.time);

  useEffect(() => {
    const id = setInterval(() => setPlayhead(tl.time), 50);
    return () => clearInterval(id);
  }, [tl]);

  return h("span", { className: "me-clock" }, `f${frameOf(playhead, fps)} · ${fps} fps · ${(playhead / 1000).toFixed(2)}s`);
}
