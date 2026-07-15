// The explorer chrome, pinned to the bottom: a deep-link rail of modules and a
// toolbar wired to the ZoomStage controllerRef — Overview (fitAll), Recenter
// (reset), zoom out/in, and step prev/next.

import { h } from "/dist/nexa.js";

export function Controls({ index, total, regions, activeId, controllerRef }) {
  const c = () => controllerRef.current;

  const part = (id, name, accent) =>
    h(
      "button",
      {
        key: id,
        type: "button",
        className: `sy-part${id === activeId ? " sy-part-on" : ""}`,
        style: id === activeId && accent ? { borderColor: accent, color: "#fff" } : undefined,
        onClick: () => c()?.goTo(id),
      },
      name,
    );

  const icon = (cls, title, onClick) =>
    h("button", { type: "button", className: "sy-icon", title, ariaLabel: title, onClick }, h("i", { className: cls, ariaHidden: "true" }));

  return h(
    "div",
    { className: "sy-chrome" },
    h(
      "div",
      { className: "sy-parts", role: "group", ariaLabel: "Jump to a module" },
      part("overview", "Overview"),
      regions.map((r) => part(r.id, r.name, r.accent)),
    ),
    h(
      "div",
      { className: "sy-toolbar", role: "group", ariaLabel: "View controls" },
      h("button", { type: "button", className: "sy-btn", title: "Fit everything", onClick: () => c()?.fitAll() },
        h("i", { className: "bi bi-arrows-fullscreen", ariaHidden: "true" }), h("span", null, "Overview")),
      h("button", { type: "button", className: "sy-btn", title: "Recenter the module (Esc)", onClick: () => c()?.reset() },
        h("i", { className: "bi bi-bullseye", ariaHidden: "true" }), h("span", null, "Recenter")),
      h("span", { className: "sy-group" },
        icon("bi bi-dash-lg", "Zoom out", () => c()?.zoomOut()),
        icon("bi bi-plus-lg", "Zoom in", () => c()?.zoomIn())),
      h("span", { className: "sy-group" },
        icon("bi bi-chevron-left", "Previous", () => c()?.prev()),
        h("span", { className: "sy-count" }, `${index + 1} / ${total}`),
        icon("bi bi-chevron-right", "Next", () => c()?.next())),
    ),
  );
}
