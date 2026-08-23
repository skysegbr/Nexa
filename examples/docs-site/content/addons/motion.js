import { h } from "/dist/fluxaway.js";
import { useTimeline } from "/dist/fluxaway-motion.js";

function MotionPreview() {
  const timeline = useTimeline({
    duration: 1200,
    loop: true,
    tracks: {
      mark: [
        { at: 0, x: -90, rotate: -20, opacity: 0.35 },
        { at: 600, x: 90, rotate: 20, opacity: 1, ease: "inOutCubic" },
        { at: 1200, x: -90, rotate: -20, opacity: 0.35, ease: "inOutCubic" },
      ],
    },
  });

  return h(
    "div",
    { className: "nd-addon-motion" },
    h("div", { ref: timeline.track("mark"), className: "nd-addon-motion-mark" }, "FW"),
  );
}

export const ADDON_ENTRIES = [
  {
    name: "FluxaWay Motion",
    slug: "fluxaway-motion",
    category: "addons",
    module: "fluxaway-motion.js",
    summary:
      "Flash-style timeline animation with keyframes, Penner easings, labels, frame scripts and motion guides.",
    signature: "const timeline = useTimeline(spec)",
    demos: [
      {
        id: "motion-preview",
        title: "A looping timeline",
        render: MotionPreview,
        code: `const timeline = useTimeline({
  duration: 1200,
  loop: true,
  tracks: {
    mark: [
      { at: 0, x: -90, opacity: 0.35 },
      { at: 600, x: 90, opacity: 1, ease: "inOutCubic" },
      { at: 1200, x: -90, opacity: 0.35, ease: "inOutCubic" },
    ],
  },
});

return h("div", { ref: timeline.track("mark") }, "FW");`,
      },
    ],
    params: [
      { name: "duration", type: "number", description: "Timeline length in milliseconds." },
      { name: "tracks", type: "Record<string, Keyframe[]>", description: "Named element tracks." },
      { name: "loop", type: "boolean | number", default: "false", description: "Repeat behavior." },
      { name: "autoplay", type: "boolean", default: "true", description: "Play after mount." },
    ],
    returns: [
      { name: "track", type: "(name) => ref", description: "Binds an element to a named track." },
      { name: "play / stop", type: "functions", description: "Playback controls." },
      { name: "gotoAndPlay / gotoAndStop", type: "functions", description: "Seek by time or label." },
    ],
    resources: [
      { label: "Runtime showcase", href: "#/source/motion-runtime-example" },
      { label: "Motion-only presentation", href: "#/source/motion-presentation-example" },
      { label: "Motion editor", href: "#/source/motion-editor-example" },
      { label: "Motion guide", href: "#/source/motion-guide" },
    ],
    notes: [
      "Animate transform and opacity on reasonably-sized elements; avoid promoting giant canvas nodes.",
      "Use examples/motion-presentation for a fixed-stage labelled deck; use ZoomStage when camera travel or spatial relationships carry the presentation.",
      "See examples/fluxaway-motion and examples/motion-editor for the full runtime and visual authoring flow.",
    ],
  },
];
