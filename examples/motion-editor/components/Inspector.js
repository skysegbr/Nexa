// The inspector: edits the selected keyframe's time, tween fields, easing
// and motion guide. An emptied field un-keys that property on this keyframe
// (the property then tweens straight through it), mirroring nexa-motion's
// per-property keyframe model. With several keyframes selected it offers
// the bulk actions; with one, the full editor.

import { h } from "/dist/nexa.js";
import { easings } from "/dist/nexa-motion.js";
import { KEYFRAME_FIELDS } from "../data.js";

// The easing curve, drawn from the REAL easing function the runtime will
// use (progress 0→1 left to right, eased value bottom to top). The vertical
// range reserves headroom for the overshooting easings — outBack, outElastic
// and inBack all leave [0, 1] on purpose.
const CURVE_W = 180;
const CURVE_H = 84;
const V_MIN = -0.5;
const V_MAX = 1.5;

function EaseCurve({ name }) {
  const fn = easings[name] || easings.linear;
  const yOf = (value) => ((V_MAX - value) / (V_MAX - V_MIN)) * CURVE_H;
  const points = [];
  for (let i = 0; i <= 48; i += 1) {
    const t = i / 48;
    points.push(`${(t * CURVE_W).toFixed(1)},${yOf(fn(t)).toFixed(1)}`);
  }
  return h(
    "svg",
    {
      className: "me-ease-curve",
      viewBox: `0 0 ${CURVE_W} ${CURVE_H}`,
      role: "img",
      ariaLabel: `Easing curve: ${name || "linear"}`,
    },
    // Guide lines at value 0 (start) and 1 (target) — overshoot pokes past.
    h("line", { className: "me-ease-grid", x1: 0, y1: yOf(0), x2: CURVE_W, y2: yOf(0) }),
    h("line", { className: "me-ease-grid", x1: 0, y1: yOf(1), x2: CURVE_W, y2: yOf(1) }),
    h("polyline", { className: "me-ease-line", points: points.join(" ") }),
  );
}

export function Inspector({ doc, selected, drawing, onEdit, onDelete, onStartDrawing, onFinishDrawing, onCancelDrawing }) {
  if (selected.length === 0) {
    return h(
      "section",
      { className: "me-inspector" },
      h("h2", { className: "me-panel-title" }, "Inspector"),
      h("p", { className: "me-empty" }, "Select a keyframe on the timeline (shift-click for multi)."),
    );
  }

  if (selected.length > 1) {
    return h(
      "section",
      { className: "me-inspector" },
      h("h2", { className: "me-panel-title" }, `Inspector — ${selected.length} keyframes`),
      h("p", { className: "me-empty" }, "Drag any selected diamond to move the group together."),
      h(
        "button",
        { type: "button", className: "me-btn me-btn-danger", onClick: onDelete },
        `delete ${selected.length} keyframes`,
      ),
    );
  }

  const { track, index } = selected[0];
  const keyframe = doc.tracks[track][index];

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
    h("h2", { className: "me-panel-title" }, `Inspector — ${track} @ ${keyframe.at}ms`),

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
    h(EaseCurve, { name: keyframe.ease }),

    // ── motion guide (Flash's guide layer) ──
    h("h3", { className: "me-subtitle" }, "Motion guide"),
    drawing
      ? h(
          "div",
          { className: "me-guide-actions" },
          h("p", { className: "me-empty" }, `${drawing.points.length} point(s) — click the stage to add more.`),
          h(
            "button",
            {
              type: "button",
              className: "me-btn",
              disabled: drawing.points.length < 2,
              onClick: onFinishDrawing,
            },
            "✓ finish guide",
          ),
          h("button", { type: "button", className: "me-btn", onClick: onCancelDrawing }, "✕ cancel"),
        )
      : h(
          "div",
          { className: "me-guide-actions" },
          h(
            "button",
            { type: "button", className: "me-btn", onClick: onStartDrawing },
            keyframe.path ? "✎ redraw guide" : "✎ draw guide on stage",
          ),
          keyframe.path &&
            h(
              "label",
              { className: "me-field me-field-check" },
              h("span", null, "orient"),
              h("input", {
                type: "checkbox",
                checked: Boolean(keyframe.orient),
                onChange: (e) => onEdit({ orient: e.target.checked || undefined }),
              }),
            ),
          keyframe.path &&
            h(
              "button",
              { type: "button", className: "me-btn", onClick: () => onEdit({ path: undefined, orient: undefined }) },
              "remove guide",
            ),
        ),

    h(
      "button",
      { type: "button", className: "me-btn me-btn-danger", onClick: onDelete },
      "delete keyframe",
    ),
  );
}
