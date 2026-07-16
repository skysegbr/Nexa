import { h, useTheme } from "/dist/nexa.js";
import { Badge, Button } from "/dist/nexa-components-core.js";

const navItems = ["Overview", "Projects", "Reports", "Settings"];

export function WorkspaceSidebar() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "aside",
    { className: "m-sidebar workspace-sidebar" },
    h(
      "div",
      { className: "m-brand" },
      h("span", { className: "m-brand-mark" },
        h("img", { src: logoSrc, alt: "" }),
      ),
      h("div", null,
        h("p", { className: "workspace-kicker" }, "Nexa"),
        h("strong", null, "Workspace"),
      ),
    ),
    h(
      "nav",
      { className: "workspace-nav", ariaLabel: "Workspace navigation" },
      navItems.map((item, i) =>
        h(Button, { key: item, className: i === 1 ? "workspace-nav-active" : "", variant: "text" },
          item,
          i === 1 && h(Badge, null, "4"),
        ),
      ),
    ),
  );
}
