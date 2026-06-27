import { h, useLocalStorage, useState } from "/dist/nexa.js";
import { Switch, Collapse, Button, Badge, Table } from "/dist/nexa-components.js";

const RUNS = [
  { id: 1, pipeline: "Sales ETL",       status: "success", duration: "1m 23s", start: "2026-06-05 08:00" },
  { id: 2, pipeline: "Daily report",    status: "running", duration: "-",      start: "2026-06-05 09:15" },
  { id: 3, pipeline: "Inventory sync",  status: "error",   duration: "0m 12s", start: "2026-06-05 09:30" },
  { id: 4, pipeline: "Sales ETL",       status: "success", duration: "1m 18s", start: "2026-06-05 10:00" },
];

function StatusBadge({ status }) {
  return h("span", { className: `m-badge badge-${status}` }, status);
}

export function PageSwitches() {
  const [docker,   setDocker]   = useLocalStorage("demo-docker",   false);
  const [approval, setApproval] = useLocalStorage("demo-approval", true);
  const [notify]                = useState(false);

  return h(
    "div",
    { className: "m-stack" },
    h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Switch & Collapse"),
    h("p", { className: "m-text-muted m-text-sm" },
      "The first two switches persist through ",
      h("code", null, "useLocalStorage"),
      " - reload the page and the state is preserved.",
    ),

    h(
      "div",
      { className: "demo-section" },
      h("p", { className: "demo-label" }, "Switch"),
      h(
        "div",
        { className: "demo-row" },
        h(Switch, { label: "Docker mode (persists)",     checked: docker,   onChange: (e) => setDocker(e.target.checked)   }),
        h(Switch, { label: "Requires approval (persists)", checked: approval, onChange: (e) => setApproval(e.target.checked) }),
        h(Switch, { label: "Notifications (disabled)",   checked: notify,   disabled: true }),
      ),
    ),

    h(
      "div",
      { className: "demo-section" },
      h("p", { className: "demo-label" }, "Animated collapse"),
      h(
        "div",
        { className: "m-stack" },
        h(
          Collapse,
          {
            title:       "Run history",
            defaultOpen: true,
            badge:       h(Badge, null, RUNS.length),
            actions:     h(Button, { variant: "text" },
              h("i", { className: "bi bi-arrow-clockwise" }), " Refresh",
            ),
          },
          h(Table, {
            sortable: true,
            columns: [
              { key: "id",       header: "#",        sortable: false, render: (r) => h("span", { className: "m-text-muted" }, r.id) },
              { key: "pipeline", header: "Pipeline" },
              { key: "status",   header: "Status",   render: (r) => h(StatusBadge, { status: r.status }) },
              { key: "duration", header: "Duration" },
              { key: "start",    header: "Start",    render: (r) => h("span", { className: "m-text-sm m-text-muted" }, r.start) },
            ],
            rows: RUNS,
          }),
        ),
        h(
          Collapse,
          { title: "Advanced settings" },
          h(
            "div",
            { className: "m-stack" },
            h(Switch, { label: "Enable automatic retry", checked: false }),
            h(Switch, { label: "Detailed log",           checked: true  }),
          ),
        ),
      ),
    ),
  );
}
