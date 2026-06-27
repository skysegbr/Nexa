export const projects = [
  { id: "orbit",     name: "Orbit dashboard", owner: "Design Ops",          status: "active", health: "On track",       budget: "R$ 18.4k", due: "18 Jun", description: "Refactor the executive dashboard and connect the project table." },
  { id: "atlas",     name: "Atlas catalog",   owner: "Growth",              status: "review", health: "Under review",   budget: "R$ 9.7k",  due: "24 Jun", description: "Publish the product catalog with filters and a detailed view." },
  { id: "pulse",     name: "Pulse forms",     owner: "Platform",            status: "active", health: "On track",       budget: "R$ 12.1k", due: "02 Jul", description: "Build validation states and accessible labels for admin forms." },
  { id: "northstar", name: "Northstar docs",  owner: "Developer Experience", status: "paused", health: "Paused",        budget: "R$ 6.8k",  due: "12 Jul", description: "Document the framework APIs with complete examples." },
];

export const statusOptions = [
  { value: "all",    label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "review", label: "Under review" },
  { value: "paused", label: "Paused" },
];

export const views = [
  { value: "overview",  label: "Overview" },
  { value: "delivery",  label: "Delivery" },
  { value: "finance",   label: "Finance" },
];
