// The spacecraft world: an annotated deep-space probe the camera roams across.
// Each subsystem is a ZoomStage region (a camera target); components/Probe.js
// draws the craft. No h() calls here.

export const WORLD = { w: 2600, h: 1700 };
export const CRAFT = { name: "NEXA PROBE", designation: "DEEP-SPACE ORBITER · MK II" };

export const REGIONS = [
  {
    id: "antenna", name: "High-Gain Antenna", accent: "#5b8cff",
    x: 1040, y: 150, w: 520, h: 470,
    blurb: "A 3.2-metre parabolic dish, always pointed home. It carries the whole mission's science downlink on a pencil-thin X-band beam.",
  },
  {
    id: "solar", name: "Solar Arrays", accent: "#f0a23a",
    x: 300, y: 720, w: 840, h: 360,
    blurb: "Two deployable wings of triple-junction cells track the sun to feed the bus and charge the batteries through the long eclipse arcs.",
  },
  {
    id: "bus", name: "Instrument Bus", accent: "#22c9a8",
    x: 1080, y: 660, w: 440, h: 420,
    blurb: "The octagonal core: flight computer, reaction wheels, star trackers, and the science payload booms that fold out on arrival.",
  },
  {
    id: "propulsion", name: "Propulsion", accent: "#ff6d6d",
    x: 1120, y: 1040, w: 360, h: 470,
    blurb: "A bipropellant main engine for orbit insertion, ringed by twelve small thrusters that trim attitude and desaturate the wheels.",
  },
  {
    id: "power", name: "Radioisotope Power", accent: "#c084fc",
    x: 1540, y: 1040, w: 700, h: 460,
    blurb: "An RTG on a deployable boom turns the steady heat of decaying plutonium into a few hundred watts — power that never needs the sun.",
  },
];

export const TOUR = ["overview", ...REGIONS.map((r) => r.id)];
