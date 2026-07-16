import { h, useTheme } from "/dist/nexa.js";
import { ThemeToggle } from "/dist/nexa-components-theme.js";

export function CoreHeader() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "header",
    { className: "core-header" },
    h(
      "div",
      { className: "core-header-top" },
      h(
        "div",
        { className: "m-brand core-brand" },
        h(
          "span",
          { className: "m-brand-mark" },
          h("img", { src: logoSrc, alt: "", width: 100, height: 100 }),
        ),
        h("p", { className: "m-eyebrow" }, "Nexa core"),
      ),
      h(ThemeToggle, null),
    ),
    h("h1", { className: "m-title-xl" }, "Foundation for complete pages"),
    h(
      "p",
      { className: "m-body" },
      "This example exercises the engine's advanced features with no external dependencies.",
    ),
  );
}
