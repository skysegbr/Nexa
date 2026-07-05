import { h } from "/dist/nexa.js";

export function NavDock({ index, total, label, controllerRef }) {
  const current = index + 1;

  return h(
    "nav",
    { className: "arch-nav", ariaLabel: "Presentation navigation" },
    h(
      "button",
      {
        type: "button",
        className: "arch-nav-button",
        ariaLabel: "Previous frame",
        onClick: () => controllerRef.current?.prev(),
      },
      h("i", { className: "bi-chevron-left", ariaHidden: "true" }),
    ),
    h(
      "div",
      { className: "arch-nav-status" },
      h("strong", null, `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`),
      h("span", null, label),
    ),
    h(
      "button",
      {
        type: "button",
        className: "arch-nav-button",
        ariaLabel: "Next frame",
        onClick: () => controllerRef.current?.next(),
      },
      h("i", { className: "bi-chevron-right", ariaHidden: "true" }),
    ),
  );
}
