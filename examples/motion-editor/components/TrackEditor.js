// The selected actor's BEHAVIOR, right in the actor inspector — the
// missing Flash link between the object on stage and its animation.
// Every keyframe of the actor's track as a clickable row (frame number +
// property summary): clicking parks the playhead on it and selects it,
// flipping the inspector to that keyframe's editor, exactly like clicking
// its diamond. "✎ edit track code" opens just THIS actor's keyframe
// array as code; apply replaces the track in one undo step.

import { h, useState } from "/dist/nexa.js";
import { frameOf } from "./editorUtils.js";
import { formatKeyframe, parseTrackCode } from "./codeParse.js";

function summaryOf(keyframe) {
  const parts = Object.entries(keyframe)
    .filter(([key]) => !key.startsWith("_") && key !== "at")
    .map(([key, value]) => (key === "path" ? "path✎" : key === "blank" ? "blank frame" : `${key}:${value}`));
  return parts.join("  ") || "(pose only)";
}

function trackSource(keyframes) {
  const lines = ["["];
  for (const keyframe of [...keyframes].sort((a, b) => a.at - b.at)) {
    lines.push(formatKeyframe(keyframe, "  "));
  }
  lines.push("]");
  return lines.join("\n");
}

export function TrackEditor({ keyframes, fps, onJump, onApplyTrack }) {
  const [draft, setDraft] = useState(null); // edited source | null
  const [error, setError] = useState(null);
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);

  const apply = () => {
    try {
      onApplyTrack(parseTrackCode(draft));
      setDraft(null);
      setError(null);
    } catch (failure) {
      setError(failure.message);
    }
  };

  return h(
    "div",
    { className: "me-track-editor" },
    h("h3", { className: "me-subtitle" }, "Behavior — keyframes"),

    draft === null && sorted.length === 0
      ? h("p", { className: "me-empty" }, "No keyframes yet — move the playhead and drag the actor, or + on its row.")
      : null,

    draft === null
      ? [
          ...sorted.map((keyframe) =>
            h(
              "button",
              {
                key: keyframe._id,
                type: "button",
                className: "me-kf-row",
                title: `Frame ${frameOf(keyframe.at, fps)} (${keyframe.at}ms) — click selects it on the timeline`,
                onClick: () => onJump(keyframe),
              },
              h("span", { className: "me-kf-frame" }, `f${frameOf(keyframe.at, fps)}`),
              h("span", { className: "me-kf-summary" }, summaryOf(keyframe)),
            ),
          ),
          h(
            "button",
            {
              key: "edit",
              type: "button",
              className: "me-btn",
              title: "Edit this actor's keyframes as code",
              onClick: () => setDraft(trackSource(keyframes)),
            },
            "✎ edit track code",
          ),
        ]
      : [
          h("textarea", {
            key: "code",
            className: "me-track-code",
            value: draft,
            spellcheck: false,
            onInput: (e) => setDraft(e.target.value),
          }),
          h(
            "div",
            { key: "actions", className: "me-actor-actions" },
            h("button", { type: "button", className: "me-btn", onClick: apply }, "✓ apply"),
            h(
              "button",
              {
                type: "button",
                className: "me-btn",
                onClick: () => {
                  setDraft(null);
                  setError(null);
                },
              },
              "✕ cancel",
            ),
          ),
          error && h("p", { key: "err", className: "me-code-error" }, `⚠ ${error}`),
        ],
  );
}
