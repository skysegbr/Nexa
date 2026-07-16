import { h } from "/dist/nexa.js";
import { Badge, Button } from "/dist/nexa-components-core.js";
import { ThemeToggle } from "/dist/nexa-components-theme.js";

export function WorkspaceTopbar({ onCreate }) {
  return h(
    "header",
    { className: "m-topbar workspace-topbar" },
    h("div", null,
      h("p", { className: "workspace-kicker" }, "Complete page"),
      h("h1", null, "Project command center"),
    ),
    h("div", { className: "m-cluster" },
      h(Badge, null, "Beta"),
      h(ThemeToggle, null),
      h(Button, { variant: "contained", onClick: onCreate }, "New review"),
    ),
  );
}
