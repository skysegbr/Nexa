// Inspector panel for the selected ACTOR (selection tool): box, fill,
// label, text content for text actors, and deletion. Number edits commit
// through updateActor's no-op guard, so blur re-fires never pollute the
// history.

import { h } from "/dist/nexa.js";
import { FILLS } from "../data.js";

export function ActorInspector({ actor, onEdit, onDelete }) {
  const numberField = (name, value, min) =>
    h(
      "label",
      { key: name, className: "me-field" },
      h("span", null, name),
      h("input", {
        type: "number",
        min,
        value,
        onChange: (e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onEdit({ [name]: Math.round(next) });
        },
      }),
    );

  return h(
    "section",
    { className: "me-inspector" },
    h("h2", { className: "me-panel-title" }, `Actor — ${actor.label}`),

    h(
      "label",
      { className: "me-field" },
      h("span", null, "label"),
      h("input", {
        type: "text",
        value: actor.label,
        onChange: (e) => e.target.value.trim() && onEdit({ label: e.target.value.trim() }),
      }),
    ),

    actor.kind === "text" &&
      h(
        "label",
        { className: "me-field" },
        h("span", null, "text"),
        h("input", {
          type: "text",
          value: actor.text || "",
          onChange: (e) => onEdit({ text: e.target.value }),
        }),
      ),

    numberField("x", actor.x),
    numberField("y", actor.y),
    numberField("w", actor.w, 12),
    numberField("h", actor.h, 12),

    h(
      "div",
      { className: "me-field" },
      h("span", null, "fill"),
      h(
        "div",
        { className: "me-fill-row" },
        FILLS.map((color) =>
          h("button", {
            key: color,
            type: "button",
            className: `me-swatch${actor.fill === color ? " me-swatch-active" : ""}`,
            title: color,
            ariaLabel: `Fill ${color}`,
            style: { background: color },
            onClick: () => onEdit({ fill: color }),
          }),
        ),
        h("input", {
          type: "color",
          className: "me-fill-custom",
          ariaLabel: "Custom fill",
          value: actor.fill.startsWith("#") ? actor.fill : "#4f7cff",
          onInput: (e) => onEdit({ fill: e.target.value }),
        }),
      ),
    ),

    h(
      "button",
      { type: "button", className: "me-btn me-btn-danger", onClick: onDelete },
      "delete actor",
    ),
  );
}
