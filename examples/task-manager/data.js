// Static option lists shared by FilterBar and TaskDrawer. Everything else
// (tasks, stats, categories) is dynamic — it comes from server.py's API.

export const STATUS_OPTIONS = [
  { value: "todo", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Creation date" },
  { value: "title", label: "Title (A-Z)" },
  { value: "priority", label: "Priority" },
];
