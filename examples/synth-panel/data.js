// The synth panel world: one big control surface the camera roams across.
// Each module is a ZoomStage region (a hotspot to fly to); its controls are
// plain descriptors — components/Synth.js draws them. No h() calls here.

export const WORLD = { w: 2420, h: 1320 };
export const PANEL = { brand: "NEXA SYNTH", model: "MONO · SUBTRACTIVE" };

// type: knob | slider | wave | curve | steps | vu | jacks | led
export const MODULES = [
  {
    id: "osc",
    name: "Oscillators",
    accent: "#5b8cff",
    x: 80, y: 120, w: 640, h: 500,
    blurb: "Two analog-style oscillators — saw, square, triangle — plus a sub octave. The raw harmonic material every other module shapes.",
    controls: [
      { type: "knob", x: 180, y: 300, label: "OSC 1", val: 0.72 },
      { type: "knob", x: 360, y: 300, label: "OSC 2", val: 0.38 },
      { type: "knob", x: 540, y: 300, label: "SUB", val: 0.55 },
      { type: "knob", x: 270, y: 490, label: "TUNE", val: 0.5 },
      { type: "wave", x: 400, y: 430, w: 260, h: 130 },
    ],
  },
  {
    id: "filter",
    name: "Filter",
    accent: "#22c9a8",
    x: 760, y: 120, w: 560, h: 500,
    blurb: "A resonant low-pass with cutoff, resonance and envelope amount. Push resonance up and it sings; open the cutoff and the tone brightens.",
    controls: [
      { type: "knob", x: 160, y: 300, label: "CUTOFF", val: 0.6 },
      { type: "knob", x: 330, y: 300, label: "RESO", val: 0.75 },
      { type: "knob", x: 480, y: 300, label: "ENV", val: 0.45 },
      { type: "curve", x: 120, y: 420, w: 380, h: 150 },
    ],
  },
  {
    id: "env",
    name: "Envelope",
    accent: "#f0a23a",
    x: 1360, y: 120, w: 540, h: 500,
    blurb: "The ADSR that carves each note in time — attack, decay, sustain, release — routed to amplitude and, via ENV, to the filter.",
    controls: [
      { type: "slider", x: 120, y: 260, label: "A", val: 0.3 },
      { type: "slider", x: 230, y: 260, label: "D", val: 0.55 },
      { type: "slider", x: 340, y: 260, label: "S", val: 0.8 },
      { type: "slider", x: 450, y: 260, label: "R", val: 0.4 },
    ],
  },
  {
    id: "seq",
    name: "Sequencer",
    accent: "#c084fc",
    x: 80, y: 700, w: 1400, h: 500,
    blurb: "A sixteen-step gate sequencer with tempo and swing. Each lit step fires the envelope; chain them into a pattern and the patch plays itself.",
    controls: [
      { type: "steps", x: 90, y: 250, w: 1220, count: 16, on: [0, 3, 4, 7, 8, 11, 12, 14] },
      { type: "knob", x: 180, y: 400, label: "TEMPO", val: 0.62 },
      { type: "knob", x: 360, y: 400, label: "SWING", val: 0.4 },
      { type: "led", x: 560, y: 400, label: "RUN", on: true },
    ],
  },
  {
    id: "master",
    name: "Master",
    accent: "#ff6d6d",
    x: 1520, y: 700, w: 820, h: 500,
    blurb: "Output stage: master volume, a stereo VU meter, and a patch bay of jacks to route signals out into the rest of the rig.",
    controls: [
      { type: "knob", x: 180, y: 320, label: "VOLUME", val: 0.68, big: true },
      { type: "vu", x: 360, y: 240, w: 150, h: 200 },
      { type: "jacks", x: 560, y: 240, w: 220, h: 220, count: 6 },
      { type: "led", x: 180, y: 470, label: "PWR", on: true },
    ],
  },
];

export const REGIONS = MODULES.map(({ id, name, blurb, x, y, w, h, accent }) => ({ id, name, blurb, x, y, w, h, accent }));
export const TOUR = ["overview", ...REGIONS.map((r) => r.id)];
