export const BRANCH_COLORS = [
  "#0f766e", // teal
  "#b54708", // orange
  "#3f4f9f", // indigo
  "#7c3aed", // purple
  "#b42318", // red
  "#067647", // green
];

export const INITIAL_NODES = [
  { id: "root", parentId: null, text: "Product launch", x: 60, y: 420, color: "#0f766e" },

  { id: "mkt",    parentId: "root", text: "Marketing",    x: 340, y: 180, color: "#b54708" },
  { id: "eng",    parentId: "root", text: "Engineering",  x: 340, y: 420, color: "#3f4f9f" },
  { id: "design", parentId: "root", text: "Design",       x: 340, y: 660, color: "#7c3aed" },

  { id: "mkt-1", parentId: "mkt", text: "Social media campaign", x: 640, y: 100, color: "#b54708" },
  { id: "mkt-2", parentId: "mkt", text: "Launch event",          x: 640, y: 220, color: "#b54708" },

  { id: "eng-1", parentId: "eng", text: "API stability",  x: 640, y: 360, color: "#3f4f9f" },
  { id: "eng-2", parentId: "eng", text: "Mobile app beta", x: 640, y: 480, color: "#3f4f9f" },

  { id: "design-1", parentId: "design", text: "Brand refresh",  x: 640, y: 600, color: "#7c3aed" },
  { id: "design-2", parentId: "design", text: "Landing page",   x: 640, y: 720, color: "#7c3aed" },
];
