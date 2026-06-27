import { h } from "/dist/nexa.js";
import { Button, Chip, Table } from "/dist/nexa-components.js";

const STATUS_LABEL = { active: "Active", review: "Under review", paused: "Paused" };

export function ProjectTable({ projects, onOpen }) {
  return h(Table, {
    columns: [
      {
        key: "name", header: "Project",
        render: (p) => h("div", { className: "project-cell" },
          h("strong", null, p.name),
          h("span", null, p.description),
        ),
      },
      { key: "owner",  header: "Owner" },
      { key: "status", header: "Status",  render: (p) => h(Chip, { active: p.status === "active" }, STATUS_LABEL[p.status] || p.status) },
      { key: "health", header: "Health" },
      { key: "budget", header: "Budget", align: "right" },
      { key: "due",    header: "Due",    align: "right" },
      { key: "actions", header: "", align: "right", render: (p) => h(Button, { variant: "tonal", onClick: () => onOpen(p) }, "Open") },
    ],
    rows: projects,
    emptyTitle: "No projects found",
    emptyDescription: "Clear the search or choose a different status.",
  });
}
