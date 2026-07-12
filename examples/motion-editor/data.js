// Initial document for the motion editor: three actors with a small movie
// already on the timeline, so there is something to scrub the moment the
// page opens.

export const ACTORS = [
  { id: "box", label: "Box", className: "me-actor-box" },
  { id: "ball", label: "Ball", className: "me-actor-ball" },
  { id: "star", label: "Star", className: "me-actor-star" },
];

export const INITIAL_DOC = {
  duration: 3000,
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

// Editable tween fields shown by the inspector, in display order.
export const KEYFRAME_FIELDS = ["x", "y", "scale", "rotate", "opacity"];
