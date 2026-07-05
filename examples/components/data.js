/* ── Code Editor ───────────────────────────────────────── */

export const INITIAL_CODE = `def process_pipeline(nodes, docker=False):
    results = []
    for node in nodes:
        result = node.run(docker=docker)
        results.append(result)
    return results
`;

/* ── Combobox ──────────────────────────────────────────── */

export const PIPELINES = [
  { value: "1", label: "Sales ETL" },
  { value: "2", label: "Inventory sync" },
  { value: "3", label: "Daily revenue report" },
  { value: "4", label: "ERP to CRM integration" },
  { value: "5", label: "Export to S3" },
];

/* ── Switches (run history table) ─────────────────────────── */

export const RUNS = [
  { id: 1, pipeline: "Sales ETL",       status: "success", duration: "1m 23s", start: "2026-06-05 08:00" },
  { id: 2, pipeline: "Daily report",    status: "running", duration: "-",      start: "2026-06-05 09:15" },
  { id: 3, pipeline: "Inventory sync",  status: "error",   duration: "0m 12s", start: "2026-06-05 09:30" },
  { id: 4, pipeline: "Sales ETL",       status: "success", duration: "1m 18s", start: "2026-06-05 10:00" },
];

/* ── New UI: Sidebar nav ───────────────────────────────── */

export const SIDEBAR_NAV_ITEMS = [
  { icon: "bi-speedometer2",   label: "Dashboard",  badge: null,  active: true  },
  { icon: "bi-kanban",         label: "Projects",   badge: "3",   active: false },
  { icon: "bi-people",         label: "Team",       badge: null,  active: false },
  { icon: "bi-bar-chart-line", label: "Analytics",  badge: null,  active: false },
  { icon: "bi-gear",           label: "Settings",   badge: null,  active: false },
];

/* ── New UI: Skeleton (loaded users) ───────────────────── */

export const USERS = [
  { id: 1, name: "Ana Lima",    role: "Designer",  initials: "AL", color: "#d9f3ef" },
  { id: 2, name: "Bruno Rios",  role: "Engineer",  initials: "BR", color: "#dbeafe" },
  { id: 3, name: "Carla Mota",  role: "PM",        initials: "CM", color: "#fef0c7" },
];

/* ── Cards: media ──────────────────────────────────────── */

export const MEDIA_ITEMS = [
  { id: "jinx", name: "Jinx", role: "Frontend Developer", image: "https://picsum.photos/id/1027/600/600" },
  { id: "yaik", name: "Yaik", role: "Web Designer",        image: "https://picsum.photos/id/823/600/600" },
  { id: "xima", name: "Xima", role: "Data Analytics",      image: "https://picsum.photos/id/661/600/600" },
];

/* ── Cards: glow ───────────────────────────────────────── */

export const GLOW_ITEMS = [
  { id: "default", variant: "", icon: "bi-lightning-charge-fill", title: "Awesome Card 01" },
  { id: "amber",   variant: "m-card-glow-amber",   icon: "bi-fire",         title: "Awesome Card 02" },
  { id: "emerald", variant: "m-card-glow-emerald", icon: "bi-stars",        title: "Awesome Card 03" },
];

/* ── Cards: float ──────────────────────────────────────── */

export const FLOAT_ITEMS = [
  { id: "path",   place: "Vancouver Mountains, Canada", title: "The Great Path",  image: "https://picsum.photos/id/16/700/500" },
  { id: "night",  place: "Poon Hill, Nepal",             title: "Starry Night",    image: "https://picsum.photos/id/29/700/500" },
  { id: "peace",  place: "Bojcin Forest, Serbia",        title: "Path Of Peace",   image: "https://picsum.photos/id/28/700/500" },
];

/* ── Cards: expand group ───────────────────────────────── */

export const EXPAND_ITEMS = [
  { id: "fog",    title: "Majestic Fog",    icon: "bi-cloud-fog2-fill", image: "https://picsum.photos/id/11/800/600" },
  { id: "autumn", title: "Autumn Trees",    icon: "bi-tree-fill",       image: "https://picsum.photos/id/116/800/600" },
  { id: "winter", title: "Winter Forest",   icon: "bi-snow2",           image: "https://picsum.photos/id/227/800/600" },
  { id: "lake",   title: "Hidden Lake",     icon: "bi-water",           image: "https://picsum.photos/id/450/800/600" },
];

/* ── Cards: pricing ────────────────────────────────────── */

export const PRICING_ITEMS = [
  { id: "basic", subtitle: "Free plan", title: "Basic", price: "0", icon: "bi-box-seam",
    features: ["3 user requests", "10 downloads per day", "Daily content updates"] },
  { id: "pro", subtitle: "Most popular", title: "Professional", price: "19", icon: "bi-rocket-takeoff-fill",
    features: ["100 user requests", "Unlimited downloads", "Unlock all features", "Daily content updates"] },
  { id: "enterprise", subtitle: "For agencies", title: "Enterprise", price: "29", icon: "bi-building-fill-gear",
    features: ["Unlimited user requests", "Unlimited downloads", "Unlock all features", "Fully editable files"] },
];
