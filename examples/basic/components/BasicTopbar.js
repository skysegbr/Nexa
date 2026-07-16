import { h, useTheme } from "/dist/nexa.js";
import { ThemeToggle } from "/dist/nexa-components-theme.js";

export function BasicTopbar() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "header",
    { className: "basic-topbar" },
    h(
      "span",
      { className: "basic-topbar-brand" },
      h("img", { src: logoSrc, alt: "", width: 24, height: 24 }),
      "Nexa",
    ),
    h(ThemeToggle, null),
  );
}
