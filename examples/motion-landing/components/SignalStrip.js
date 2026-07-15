import { h } from "/dist/nexa.js";
import { useTimeline } from "/dist/nexa-motion.js";
import { SIGNALS } from "../data.js";

export function SignalStrip() {
  const tl = useTimeline({
    duration: 18000,
    loop: true,
    tracks: {
      strip: [
        { at: 0, x: 0 },
        { at: 18000, x: -900, ease: "linear" },
      ],
    },
  });
  const items = [...SIGNALS, ...SIGNALS, ...SIGNALS];

  return h(
    "section",
    { className: "ml-signal-strip", ariaLabel: "Featured capabilities" },
    h(
      "div",
      { className: "ml-signal-track", ref: tl.track("strip") },
      items.map((label, index) =>
        h(
          "span",
          { key: `${label}-${index}` },
          h("i", { ariaHidden: "true" }),
          label,
        ),
      ),
    ),
  );
}
