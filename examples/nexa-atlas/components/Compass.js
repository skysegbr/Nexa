import { h } from "/dist/nexa.js";
import { IconButton } from "/dist/nexa-components-core.js";

export function Compass({ index, total, label, controllerRef }) {
  const nav = controllerRef.current;

  return h(
    "footer",
    { className: "atl-compass" },
    h(IconButton, {
      label: "Previous territory",
      variant: "tonal",
      className: "atl-compass-btn",
      disabled: index === 0,
      onClick: () => nav?.prev(),
    }, h("i", { className: "bi-chevron-left", ariaHidden: "true" })),
    h(
      "div",
      { className: "atl-compass-dial" },
      h("i", { className: "bi-compass atl-compass-icon", ariaHidden: "true" }),
      h(
        "div",
        { className: "atl-compass-readout" },
        h("span", { className: "atl-compass-index" }, `${index + 1} / ${total}`),
        h("span", { className: "atl-compass-label" }, label),
      ),
    ),
    h(
      "nav",
      { className: "atl-compass-dots", ariaLabel: "Atlas territories" },
      Array.from({ length: total }, (_, i) =>
        h("button", {
          key: i,
          type: "button",
          className: `atl-dot${i === index ? " atl-dot-active" : ""}`,
          ariaLabel: `Ir para o território ${i + 1}`,
          onClick: () => nav?.goTo(i),
        }),
      ),
    ),
    h(IconButton, {
      label: "Next territory",
      variant: "tonal",
      className: "atl-compass-btn",
      disabled: index === total - 1,
      onClick: () => nav?.next(),
    }, h("i", { className: "bi-chevron-right", ariaHidden: "true" })),
  );
}
