export const COLORS = ["#0f766e", "#7c3aed", "#1d4ed8", "#b45309", "#be185d", "#0e7490"];

export const INITIAL = [
  { id: 1, label: "Load Data",   x: 80,  y: 120, body: "import pandas as pd\n\ndf = pd.read_csv(\n  'data.csv')",                               color: COLORS[0], status: "success", deps: []    },
  { id: 2, label: "Preprocess",  x: 80,  y: 330, body: "from sklearn.preprocessing\\\n  import StandardScaler\n\nX = scaler.fit_transform(df)", color: COLORS[1], status: "success", deps: []    },
  { id: 3, label: "Train Model", x: 360, y: 200, body: "from numba import njit, prange\n\n@njit(parallel=True)\ndef run(X, y):",                  color: COLORS[0], status: "idle",    deps: [1, 2] },
  { id: 4, label: "Evaluate",    x: 640, y: 120, body: "from sklearn.metrics\\\n  import accuracy_score\n\nprint(score)",                        color: COLORS[1], status: "idle",    deps: [3]    },
  { id: 5, label: "Export",      x: 640, y: 330, body: "import joblib\n\njoblib.dump(\n  model, 'model.pkl')",                                   color: COLORS[2], status: "idle",    deps: [3]    },
];

export let nextId = 6;
export function consumeNextId() { return nextId++; }

// Topological sort — returns node ids in execution order respecting deps
export function topoSort(nodes) {
  const order = [], visited = new Set();
  const visit = (id) => {
    if (visited.has(id)) return;
    visited.add(id);
    nodes.find(n => n.id === id)?.deps?.forEach(visit);
    order.push(id);
  };
  nodes.forEach(n => visit(n.id));
  return order;
}

// Download pipeline as .json file
export function exportJSON(nodes) {
  const blob = new Blob([JSON.stringify(nodes, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: "pipeline.json" }).click();
  URL.revokeObjectURL(url);
}

// Pick a .json file and parse it (returns Promise<nodes>)
export function importJSON() {
  return new Promise((resolve, reject) => {
    const input = Object.assign(document.createElement("input"), { type: "file", accept: ".json" });
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload  = (ev) => { try { resolve(JSON.parse(ev.target.result)); } catch { reject(new Error("Invalid JSON")); } };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    };
    input.click();
  });
}
