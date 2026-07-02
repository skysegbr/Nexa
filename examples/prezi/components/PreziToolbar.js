import { h } from "/dist/nexa.js";
import { IconButton } from "/dist/nexa-components.js";

export function PreziToolbar({ index, total, controllerRef }) {
  const nav = controllerRef.current;

  return h(
    "footer",
    { className: "pz-toolbar" },
    h(IconButton, {
      label: "Previous frame",
      variant: "tonal",
      disabled: index === 0,
      onClick: () => nav?.prev(),
    }, h("i", { className: "bi-chevron-left", ariaHidden: "true" })),
    h(
      "div",
      { className: "pz-dots" },
      Array.from({ length: total }, (_, i) =>
        h("button", {
          key: i,
          type: "button",
          className: `pz-dot${i === index ? " pz-dot-active" : ""}`,
          ariaLabel: `Go to frame ${i + 1}`,
          onClick: () => nav?.goTo(i),
        }),
      ),
    ),
    h(IconButton, {
      label: "Next frame",
      variant: "tonal",
      disabled: index === total - 1,
      onClick: () => nav?.next(),
    }, h("i", { className: "bi-chevron-right", ariaHidden: "true" })),
    h("span", { className: "pz-hint" }, "Use ← → or click the stage to navigate"),
  );
}
