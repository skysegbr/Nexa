import { h } from "/dist/fluxaway.js";

export function SceneFrame({ data, state, selectable = false, onSelect }) {
  const selectWithKeyboard = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect?.();
  };

  return h(
    "article",
    {
      className: `zl-scene zl-scene-${data.kind}${selectable ? " zl-scene-selectable" : ""}`,
      dataset: { phase: state.phase },
      role: selectable ? "button" : undefined,
      tabIndex: selectable ? 0 : undefined,
      ariaLabel: selectable ? `Open frame: ${data.title}` : undefined,
      title: selectable ? `Open ${data.title}` : undefined,
      onClick: selectable ? onSelect : undefined,
      onKeyDown: selectable ? selectWithKeyboard : undefined,
    },
    h("span", { className: "zl-scene-index" }, data.index),
    data.kind !== "focus" && h("span", { className: "zl-scene-eyebrow" }, data.eyebrow),
    data.kind !== "focus" && h("h1", null, data.title),
    data.kind !== "focus" && h("p", null, data.body),
    h("div", { className: "zl-scene-geometry", ariaHidden: "true" },
      h("span", { className: "zl-geometry-a" }),
      h("span", { className: "zl-geometry-b" }),
      h("span", { className: "zl-geometry-c" }),
    ),
    data.kind === "focus" && h(
      "div",
      { className: "zl-focus-instrument" },
      h("small", null, "FOCUS TARGET"),
      h("h1", null, data.title),
      h("p", null, "Camera bounds and visible scene are now independent."),
      h("div", { className: "zl-focus-readout" },
        h("strong", null, "0.92×"),
        h("span", null, state.phase.toUpperCase()),
      ),
    ),
  );
}
