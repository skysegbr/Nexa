// The inspector: edits the selected keyframe's time, tween fields and
// easing. An emptied field un-keys that property on this keyframe (the
// property then tweens straight through it), mirroring nexa-motion's
// per-property keyframe model.

import { h } from "/dist/nexa.js";
import { easings } from "/dist/nexa-motion.js";
import { KEYFRAME_FIELDS } from "../data.js";

export function Inspector({ doc, selected, onEdit, onDelete }) {
  if (!selected) {
    return h(
      "section",
      { className: "me-inspector" },
      h("h2", { className: "me-panel-title" }, "Inspector"),
      h("p", { className: "me-empty" }, "Select a keyframe on the timeline."),
    );
  }

  const keyframe = doc.tracks[selected.track][selected.index];

  const numberField = (name, value, onValue, { step = 1, min } = {}) =>
    h(
      "label",
      { key: name, className: "me-field" },
      h("span", null, name),
      h("input", {
        type: "number",
        step,
        min,
        value: value === undefined ? "" : value,
        placeholder: "—",
        onChange: (e) => onValue(e.target.value === "" ? undefined : Number(e.target.value)),
      }),
    );

  return h(
    "section",
    { className: "me-inspector" },
    h("h2", { className: "me-panel-title" }, `Inspector — ${selected.track} @ ${keyframe.at}ms`),

    numberField("at (ms)", keyframe.at, (v) => v !== undefined && onEdit({ at: v }), { step: 25, min: 0 }),
    KEYFRAME_FIELDS.map((field) =>
      numberField(field, keyframe[field], (v) => onEdit({ [field]: v }), {
        step: field === "opacity" || field === "scale" ? 0.1 : 1,
      }),
    ),

    h(
      "label",
      { className: "me-field" },
      h("span", null, "ease"),
      h(
        "select",
        {
          value: keyframe.ease || "",
          onChange: (e) => onEdit({ ease: e.target.value || undefined }),
        },
        h("option", { value: "" }, "(linear)"),
        Object.keys(easings)
          .filter((name) => name !== "linear")
          .map((name) => h("option", { key: name, value: name }, name)),
      ),
    ),

    h(
      "button",
      { type: "button", className: "me-btn me-btn-danger", onClick: onDelete },
      "delete keyframe",
    ),
  );
}
