import { h, useTheme } from "/dist/nexa.js";

export function BasicBrand() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/assets/nexa-logo-dark-theme.png" : "/assets/nexa-logo-transparent.png";

  return h(
    "div",
    { className: "m-brand basic-brand" },
    h(
      "span",
      { className: "m-brand-mark basic-brand-mark" },
      h("img", { src: logoSrc, alt: "", width: 64, height: 64 }),
    ),
    h("p", { className: "m-eyebrow" }, "Nexa"),
  );
}
