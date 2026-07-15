// The transit network world: a stylised four-line metro map the camera roams
// across. Stations are shared points (so interchanges just belong to two
// lines); each district is a ZoomStage region to fly to. No h() calls here.

export const WORLD = { w: 2600, h: 1720 };
export const NETWORK = { name: "NEXA METRO", tagline: "FOUR LINES · ONE CITY" };

// id → { x, y, name }
export const STATIONS = {
  northgate: { x: 1300, y: 250, name: "Northgate" },
  museum: { x: 1300, y: 500, name: "Museum" },
  central: { x: 1300, y: 860, name: "Central" },
  market: { x: 1300, y: 1180, name: "Market" },
  southyard: { x: 1300, y: 1470, name: "South Yard" },

  westpier: { x: 360, y: 860, name: "West Pier" },
  garden: { x: 760, y: 860, name: "Garden" },
  exchange: { x: 1800, y: 860, name: "Exchange" },
  eastloop: { x: 2260, y: 860, name: "East Loop" },

  university: { x: 470, y: 360, name: "University" },
  park: { x: 850, y: 590, name: "Park" },
  harbor: { x: 1720, y: 1160, name: "Harbor" },
  airport: { x: 2180, y: 1440, name: "Airport" },

  foundry: { x: 520, y: 1420, name: "Foundry" },
  riverside: { x: 940, y: 1180, name: "Riverside" },
  stadium: { x: 2040, y: 560, name: "Stadium" },
  skyline: { x: 2300, y: 300, name: "Skyline" },
};

export const LINES = [
  { id: "red", color: "#ff5a5f", stops: ["northgate", "museum", "central", "market", "southyard"] },
  { id: "blue", color: "#4f7cff", stops: ["westpier", "garden", "central", "exchange", "eastloop"] },
  { id: "green", color: "#22c9a8", stops: ["university", "park", "central", "harbor", "airport"] },
  { id: "amber", color: "#f0a23a", stops: ["foundry", "riverside", "exchange", "stadium", "skyline"] },
];

export const REGIONS = [
  {
    id: "central", name: "Central", accent: "#e6ecff",
    x: 980, y: 560, w: 640, h: 600,
    blurb: "The beating heart of the map, where the Red, Blue and Green lines all interchange. Every corner of the city is four stops away.",
  },
  {
    id: "university", name: "University Quarter", accent: "#22c9a8",
    x: 320, y: 220, w: 700, h: 560,
    blurb: "Leafy campus stops on the Green line — University and Park — climbing north-west toward the old museum district.",
  },
  {
    id: "waterfront", name: "Waterfront", accent: "#4f7cff",
    x: 260, y: 720, w: 780, h: 760,
    blurb: "West Pier, Foundry and Riverside trace the docks, where the Blue and Amber lines run close to the water.",
  },
  {
    id: "airport", name: "Airport & Harbor", accent: "#22c9a8",
    x: 1560, y: 980, w: 820, h: 660,
    blurb: "The Green line's southern run out to Harbor and the Airport terminal — the fastest way in and out of the city.",
  },
  {
    id: "skyline", name: "Skyline District", accent: "#f0a23a",
    x: 1840, y: 200, w: 700, h: 620,
    blurb: "Amber's glittering north-east: Stadium and Skyline, with an Exchange transfer down to the Blue line.",
  },
];

export const TOUR = ["overview", ...REGIONS.map((r) => r.id)];
