import { h, useTheme } from "/dist/nexa.js";
import { ThemeToggle } from "/dist/nexa-components.js";

export function FormHero() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "header",
    { className: "form-hero" },
    h("div", { className: "form-hero-topbar" }, h(ThemeToggle, null)),
    h(
      "span",
      { className: "form-logo" },
      h("img", { src: logoSrc, alt: "Nexa" }),
    ),
    h("p", { className: "form-kicker" }, "Forms"),
    h("h1", null, "Validated contact flow"),
    h(
      "p",
      null,
      "Nexa form with no build step — controlled fields, per-field errors, loading on submit and serialized output.",
    ),
  );
}
