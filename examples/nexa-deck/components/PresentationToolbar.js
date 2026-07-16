import { h } from "/dist/nexa.js";
import { Button, IconButton } from "/dist/nexa-components-core.js";

export function PresentationToolbar({ index, total, controllerRef }) {
  const nav = controllerRef.current;

  return h(
    "footer",
    { className: "nx-toolbar" },
    h(IconButton, {
      label: "Previous frame",
      variant: "tonal",
      disabled: index === 0,
      onClick: () => nav?.prev(),
    }, h("i", { className: "bi-chevron-left", ariaHidden: "true" })),
    h(
      "nav",
      { className: "nx-dots", ariaLabel: "Presentation frames" },
      Array.from({ length: total }, (_, i) =>
        h("button", {
          key: i,
          type: "button",
          className: `nx-dot${i === index ? " nx-dot-active" : ""}`,
          ariaLabel: `Go to frame ${i + 1}`,
          title: `Frame ${i + 1}`,
          onClick: () => nav?.goTo(i),
        }),
      ),
    ),
    h("span", { className: "nx-counter" }, `${index + 1}/${total}`),
    h(Button, {
      variant: "contained",
      disabled: index === total - 1,
      onClick: () => nav?.next(),
    }, "Next", h("i", { className: "bi-arrow-right-short", ariaHidden: "true" })),
  );
}
