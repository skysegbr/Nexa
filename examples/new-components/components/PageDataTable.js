import { h } from "/dist/nexa.js";
import { DataTable, Badge } from "/dist/nexa-components.js";

const ROLES = ["Admin", "Editor", "Viewer"];
const FIRST_NAMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fabio", "Gabi", "Hugo", "Ines", "Joao"];

const USERS = Array.from({ length: 27 }, (_, i) => ({
  id: i + 1,
  name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${String.fromCharCode(65 + (i % 26))}.`,
  email: `user${i + 1}@example.com`,
  role: ROLES[i % ROLES.length],
}));

export function PageDataTable() {
  return h(
    "div",
    null,

    h("h1", { className: "m-page-title" }, "DataTable"),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Sort + paginate (27 rows, 10 per page)"),
      h(DataTable, {
        columns: [
          { key: "name", header: "Name" },
          { key: "email", header: "E-mail" },
          {
            key: "role",
            header: "Role",
            align: "right",
            render: (row) => h(Badge, null, row.role),
          },
        ],
        rows: USERS,
        pageSize: 10,
        getRowKey: (row) => row.id,
      }),
    ),
  );
}
