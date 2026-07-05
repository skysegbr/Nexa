import { h, render, useMemo, useState } from "/dist/nexa.js";
import { Alert, Button, Card, Select, Tabs, TextField, Toast } from "/dist/nexa-components.js";
import { PROJECTS, STATUS_OPTIONS, VIEWS } from "./data.js";
import { MetricCard }       from "./components/MetricCard.js";
import { ProjectDialog }    from "./components/ProjectDialog.js";
import { ProjectTable }     from "./components/ProjectTable.js";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar.js";
import { WorkspaceTopbar }  from "./components/WorkspaceTopbar.js";

function App() {
  const [query, setQuery]               = useState("");
  const [status, setStatus]             = useState("all");
  const [view, setView]                 = useState("overview");
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [toastOpen, setToastOpen]       = useState(false);

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      const matchesStatus = status === "all" || p.status === status;
      const matchesQuery  = `${p.name} ${p.owner} ${p.description}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const metrics = useMemo(() => [
    { label: "In progress", value: PROJECTS.filter((p) => p.status === "active").length, trend: "+2 this month", active: true },
    { label: "Review queue", value: PROJECTS.filter((p) => p.status === "review").length, trend: "Waiting", active: false },
    { label: "Total budget", value: "R$ 47k",  trend: "At limit", active: false },
  ], []);

  return h(
    "div",
    { className: "m-app-shell complete-shell" },
    h(WorkspaceSidebar),
    h(
      "div",
      { className: "complete-main" },
      h(WorkspaceTopbar, { onCreate: () => { setActiveProject(null); setDialogOpen(true); } }),
      h(
        "div",
        { className: "m-container m-content m-stack" },
        h(Alert, { variant: "info", title: "Complete example" },
          "App-shell layout with sidebar, topbar, table, dialog, filters and toast.",
        ),
        h("div", { className: "m-grid-3" },
          metrics.map((m) => h(MetricCard, { key: m.label, ...m })),
        ),
        h(Card, { className: "filters-card" },
          h(Tabs, { value: view, onChange: setView, items: VIEWS }),
          h("div", { className: "filters-grid" },
            h(TextField, { id: "search", label: "Search projects", placeholder: "Name or owner…", value: query, onInput: (e) => setQuery(e.target.value) }),
            h(Select, { id: "status", label: "Status", options: [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS], value: status, onChange: (e) => setStatus(e.target.value) }),
          ),
        ),
        h(ProjectTable, { projects: visibleProjects, onOpen: (p) => { setActiveProject(p); setDialogOpen(true); } }),
      ),
      h(ProjectDialog, {
        project: activeProject,
        open: dialogOpen,
        onClose: () => setDialogOpen(false),
        onSave: () => { setDialogOpen(false); setToastOpen(true); },
      }),
      h(Toast, { open: toastOpen, variant: "success", title: "Review saved!", message: "Project updated successfully.", onClose: () => setToastOpen(false) }),
    ),
  );
}

render(App, document.getElementById("app"));
