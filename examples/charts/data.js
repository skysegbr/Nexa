export const DATASETS = {
  q1: {
    label: "Sales — Q1",
    slices: [
      { id: "site", label: "Site", value: 42, color: "#22c55e" },
      { id: "app", label: "App", value: 35, color: "#3b82f6" },
      { id: "loja", label: "Physical store", value: 23, color: "#f59e0b" },
    ],
  },
  q2: {
    label: "Sales — Q2",
    slices: [
      { id: "site", label: "Site", value: 30, color: "#22c55e" },
      { id: "app", label: "App", value: 48, color: "#3b82f6" },
      { id: "loja", label: "Physical store", value: 22, color: "#f59e0b" },
    ],
  },
  corrupted: {
    label: "Corrupted feed",
    // Simulates a malformed API response — without this the boundary has no
    // real error to catch.
    slices: null,
  },
};
