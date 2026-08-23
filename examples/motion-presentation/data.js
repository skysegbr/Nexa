export const PRESENTATION_DURATION = 16000;

export const SCENES = [
  { id: "opening", label: "Opening", number: "01", at: 0 },
  { id: "timeline", label: "Timeline", number: "02", at: 4000 },
  { id: "labels", label: "Labels", number: "03", at: 8000 },
  { id: "finale", label: "Finale", number: "04", at: 12000 },
];

export const LABELS = Object.fromEntries(SCENES.map((scene) => [scene.id, scene.at]));

export const TIMELINE_LAYERS = [
  { name: "Scene", color: "var(--mp-coral)", frames: [1, 18, 42, 67] },
  { name: "Copy", color: "var(--mp-cream)", frames: [5, 24, 48, 72] },
  { name: "Signal", color: "var(--mp-cyan)", frames: [9, 31, 55, 78] },
  { name: "Controls", color: "var(--mp-yellow)", frames: [13, 37, 61, 84] },
];

export const LABEL_CARDS = [
  { label: "opening", code: 'gotoAndPlay("opening")', tone: "coral" },
  { label: "timeline", code: 'gotoAndPlay("timeline")', tone: "cyan" },
  { label: "labels", code: 'gotoAndPlay("labels")', tone: "yellow" },
];
