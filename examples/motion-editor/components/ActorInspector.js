// Inspector panel for the selected ACTOR (selection tool): box, fill
// (swatches + a small color mixer with free CSS input and alpha), label,
// text content for text actors, arrange, library save, duplication and
// deletion. Number edits commit through updateActor's no-op guard, so
// blur re-fires never pollute the history.

import { h } from "/dist/nexa.js";
import { FILLS } from "../data.js";
import { TrackEditor } from "./TrackEditor.js";
import { isVectorKind } from "./vectorGeometry.js";

// #rgb / #rrggbb / #rrggbbaa / rgb() / rgba() → [r, g, b, a]; null for
// anything else (gradients keep the mixer's alpha slider hidden).
// new RegExp(string): the repo's lightweight validator trips on literals.
const RGBA_RE = new RegExp("^rgba?\\(([^)]+)\\)$");

function parseFill(fill) {
  const text = String(fill).trim();
  if (text.startsWith("#")) {
    const hex = text.slice(1);
    const n = (s) => parseInt(s, 16);
    if (hex.length === 3) return [n(hex[0] + hex[0]), n(hex[1] + hex[1]), n(hex[2] + hex[2]), 1];
    if (hex.length === 6 || hex.length === 8) {
      return [n(hex.slice(0, 2)), n(hex.slice(2, 4)), n(hex.slice(4, 6)), hex.length === 8 ? n(hex.slice(6, 8)) / 255 : 1];
    }
  }
  const match = RGBA_RE.exec(text);
  if (match) {
    const parts = match[1].split(",").map((part) => parseFloat(part));
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  }
  return null;
}

export function ActorInspector({
  actor,
  symbolName,
  layers,
  layerId,
  keyframes,
  fps,
  onEdit,
  onDelete,
  onArrange,
  onDuplicate,
  onSaveSymbol,
  onMoveToLayer,
  onJumpKeyframe,
  onApplyTrack,
}) {
  const paintField = isVectorKind(actor.kind) ? "stroke" : "fill";
  const paint = actor[paintField] || "#4f7cff";
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
          const raw = Number(e.target.value);
          if (!Number.isFinite(raw)) return;
          // The HTML `min` attribute doesn't stop typed values — clamp here
          // or a typed 0/negative collapses the actor into an invisible,
          // unclickable box with coincident resize handles.
          const next = min !== undefined ? Math.max(min, Math.round(raw)) : Math.round(raw);
          onEdit({ [name]: next });
        },
      }),
    );

  return h(
    "section",
    { className: "me-inspector" },
    h("h2", { className: "me-panel-title" }, `Actor — ${actor.label}`),
    symbolName && h("p", { className: "me-symbol-link" }, `◆ instance of ${symbolName}`),

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
      "label",
      { className: "me-field" },
      h("span", null, "layer"),
      h(
        "select",
        { value: layerId || "", onChange: (e) => onMoveToLayer(e.target.value) },
        layers.map((layer) => h("option", { key: layer.id, value: layer.id }, layer.name)),
      ),
    ),

    h(
      "div",
      { className: "me-field" },
      h("span", null, paintField),
      h(
        "div",
        { className: "me-fill-row" },
        FILLS.map((color) =>
          h("button", {
            key: color,
            type: "button",
            className: `me-swatch${paint === color ? " me-swatch-active" : ""}`,
            title: color,
            ariaLabel: `${paintField} ${color}`,
            style: { background: color },
            onClick: () => onEdit({ [paintField]: color }),
          }),
        ),
        h("input", {
          type: "color",
          className: "me-fill-custom",
          ariaLabel: `Custom ${paintField}`,
          value: paint.startsWith("#") ? paint.slice(0, 7) : "#4f7cff",
          onInput: (e) => onEdit({ [paintField]: e.target.value }),
        }),
      ),
    ),

    // The color mixer: free CSS value (hex/rgba/gradient) + alpha slider
    // for the simple colors.
    (() => {
      const rgba = parseFill(paint);
      const alpha = rgba ? Math.round(rgba[3] * 100) : 100;
      return h(
        "div",
        { className: "me-field" },
        h("span", null, "mix"),
        h(
          "div",
          { className: "me-mixer" },
          h("input", {
            type: "text",
            className: "me-mixer-value",
            ariaLabel: `${paintField} (any CSS color)`,
            value: paint,
            onChange: (e) => e.target.value.trim() && onEdit({ [paintField]: e.target.value.trim() }),
          }),
          rgba &&
            h("input", {
              type: "range",
              className: "me-mixer-alpha",
              min: 0,
              max: 100,
              value: alpha,
              ariaLabel: `${paintField} alpha`,
              title: `alpha ${alpha}%`,
              onInput: (e) =>
                onEdit({ [paintField]: `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${Number(e.target.value) / 100})` }),
            }),
        ),
      );
    })(),

    isVectorKind(actor.kind) && numberField("strokeWidth", actor.strokeWidth || 2, 1),

    // Flash's Arrange: paint order = layer order.
    h(
      "div",
      { className: "me-field" },
      h("span", null, "arrange"),
      h(
        "div",
        { className: "me-arrange-row" },
        h("button", { type: "button", className: "me-btn me-btn-small", title: "Send to back", onClick: () => onArrange(-Infinity) }, "⤓"),
        h("button", { type: "button", className: "me-btn me-btn-small", title: "Send backward", onClick: () => onArrange(-1) }, "↓"),
        h("button", { type: "button", className: "me-btn me-btn-small", title: "Bring forward", onClick: () => onArrange(1) }, "↑"),
        h("button", { type: "button", className: "me-btn me-btn-small", title: "Bring to front", onClick: () => onArrange(Infinity) }, "⤒"),
      ),
    ),

    h(TrackEditor, { keyframes, fps, onJump: onJumpKeyframe, onApplyTrack }),

    h(
      "div",
      { className: "me-actor-actions" },
      h(
        "button",
        { type: "button", className: "me-btn", title: "Duplicate actor + keyframes (Ctrl+D)", onClick: onDuplicate },
        "⧉ duplicate",
      ),
      h(
        "button",
        {
          type: "button",
          className: "me-btn",
          disabled: Boolean(symbolName),
          title: symbolName ? `Linked to “${symbolName}”` : "Convert this actor to a linked library symbol",
          onClick: onSaveSymbol,
        },
        symbolName ? "◆ linked symbol" : "☆ convert to symbol",
      ),
      h(
        "button",
        { type: "button", className: "me-btn me-btn-danger", onClick: onDelete },
        "delete actor",
      ),
    ),
  );
}
