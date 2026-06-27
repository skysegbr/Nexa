import { h, useTheme } from "/dist/nexa.js";

const SunIcon = () => h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true" },
  h("circle", { cx: "12", cy: "12", r: "4" }),
  h("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" }),
);

const MoonIcon = () => h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true" },
  h("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }),
);

export function IntroTopbar() {
  const { theme, toggleTheme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "header",
    { className: "i-topbar" },
    h(
      "div",
      { className: "i-topbar-brand" },
      h(
        "span",
        { className: "i-brand-mark" },
        h("img", { src: logoSrc, alt: "", width: 32, height: 32 }),
      ),
      h("strong", null, "Nexa"),
    ),
    h(
      "div",
      { className: "i-topbar-actions" },
      h("button", {
        type: "button",
        className: "i-theme-btn",
        onClick: toggleTheme,
        title: theme === "dark" ? "Tema claro" : "Tema escuro",
      }, h(theme === "dark" ? SunIcon : MoonIcon, null)),
    ),
  );
}
