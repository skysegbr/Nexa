// Initial document for the motion editor: three actors with a small movie
// already on the timeline, so there is something to scrub the moment the
// page opens. Actors are part of the document — created with the stage
// tools, deleted from their track row, saved with the project.

export const INITIAL_DOC = {
  schemaVersion: 2,
  duration: 3000,
  fps: 24,
  stageColor: "#0d1226",
  library: [],
  actors: [
    { id: "box", label: "Box", kind: "rect", x: 60, y: 60, w: 56, h: 56, fill: "linear-gradient(135deg, #4f7cff, #35e0c2)" },
    { id: "ball", label: "Ball", kind: "ellipse", x: 60, y: 140, w: 44, h: 44, fill: "radial-gradient(circle at 32% 28%, #ffd166, #ef476f)" },
    { id: "star", label: "Star", kind: "text", x: 200, y: 200, w: 48, h: 48, fill: "#ffd166", text: "★" },
  ],
  tracks: {
    box: [
      { at: 0, x: 0, y: 0, rotate: 0, opacity: 1 },
      { at: 1500, x: 320, rotate: 180, ease: "inOutCubic" },
      { at: 3000, x: 320, y: 120, rotate: 360, ease: "outBack" },
    ],
    ball: [
      { at: 0, x: 40, y: -120, opacity: 0 },
      { at: 600, opacity: 1 },
      { at: 1200, x: 40, y: 60, ease: "outBounce" },
      { at: 2400, x: 420, y: 60, ease: "inOutQuad" },
    ],
    star: [
      { at: 800, scale: 0, opacity: 0 },
      { at: 1600, scale: 1, opacity: 1, ease: "outElastic" },
      { at: 3000, rotate: 180, ease: "inOutCubic" },
    ],
  },
};

// Stage tools, Flash-style (adapted from the drawEasyNexa toolbox).
export const TOOLS = [
  { id: "select", label: "Select (V)", icon: "➤" },
  { id: "transform", label: "Free Transform (Q)", icon: "⤾" },
  { id: "line", label: "Line (N)", icon: "╱" },
  { id: "pencil", label: "Pencil (Y)", icon: "✎" },
  { id: "rect", label: "Rectangle (R)", icon: "▭" },
  { id: "ellipse", label: "Ellipse (O)", icon: "◯" },
  { id: "text", label: "Text (T)", icon: "T" },
];

// Fill palette for newly created actors.
export const FILLS = ["#4f7cff", "#35e0c2", "#ffd166", "#ef476f", "#c084fc"];

// Per-layer outline colors, Flash-style (assigned by layer position).
export const OUTLINE_COLORS = ["#4f7cff", "#35e0c2", "#ffd166", "#ef476f", "#c084fc", "#7dd3fc"];

// Editable tween fields shown by the inspector, in display order.
export const KEYFRAME_FIELDS = ["x", "y", "scale", "rotate", "opacity"];
