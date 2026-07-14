// Live code export: the current document rendered as ready-to-paste
// useTimeline() source. What you scrubbed is what you ship — and the
// road runs both ways: ✎ edit turns the pane into a textarea, ✓ apply
// parses the code back into the document (one undoable step).

import { h, useMemo, useState } from "/dist/nexa.js";
import { parseTimelineCode } from "./codeParse.js";
import { publishedTrackEntries } from "./layerTypes.js";

// new RegExp(string) instead of a literal: the repo's lightweight syntax
// validator balances brackets and would trip on the character class.
const IDENTIFIER_RE = new RegExp("^[A-Za-z_$][A-Za-z0-9_$]*$");

function formatKeyframe(keyframe) {
  // `_`-prefixed keys (the editor's keyframe ids) never reach the export.
  const parts = Object.entries(keyframe)
    .filter(([key]) => !key.startsWith("_"))
    .map(([key, value]) =>
      typeof value === "string" ? `${key}: ${JSON.stringify(value)}` : `${key}: ${value}`,
    );
  return `      { ${parts.join(", ")} },`;
}

export function generateCode(doc) {
  const lines = [
    "const tl = useTimeline({",
    `  duration: ${doc.duration},`,
    "  tracks: {",
  ];

  for (const [name, keyframes] of publishedTrackEntries(doc)) {
    // Editor-generated track names (rect-1, text-2) are not valid JS
    // identifiers — quote them or the "ready-to-paste" code is a
    // SyntaxError.
    const key = IDENTIFIER_RE.test(name) ? name : JSON.stringify(name);
    lines.push(`    ${key}: [`);
    for (const keyframe of [...keyframes].sort((a, b) => a.at - b.at)) {
      lines.push(formatKeyframe(keyframe));
    }
    lines.push("    ],");
  }

  lines.push("  },");
  if (doc.labels && Object.keys(doc.labels).length > 0) {
    const parts = Object.entries(doc.labels).map(([name, ms]) => `${JSON.stringify(name)}: ${ms}`);
    lines.push(`  labels: { ${parts.join(", ")} },`);
  }
  if (doc.loop) {
    // `loop` may be true or a number of extra passes — keep it verbatim.
    lines.push(`  loop: ${JSON.stringify(doc.loop)},`);
  }
  lines.push("});");
  return lines.join("\n");
}

export function CodePane({ doc, onApply }) {
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(null); // edited source | null
  const [error, setError] = useState(null);
  const code = useMemo(() => generateCode(doc), [doc]);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const apply = () => {
    try {
      onApply(parseTimelineCode(draft));
      setDraft(null);
      setError(null);
    } catch (failure) {
      setError(failure.message);
    }
  };

  const cancel = () => {
    setDraft(null);
    setError(null);
  };

  return h(
    "section",
    { className: "me-code" },
    h(
      "div",
      { className: "me-code-head" },
      h("h2", { className: "me-panel-title" }, "Export"),
      draft === null
        ? h(
            "div",
            { className: "me-code-actions" },
            h("button", { type: "button", className: "me-btn", onClick: () => setDraft(code) }, "✎ edit"),
            h("button", { type: "button", className: "me-btn", onClick: copy }, copied ? "copied ✓" : "copy"),
          )
        : h(
            "div",
            { className: "me-code-actions" },
            h("button", { type: "button", className: "me-btn", onClick: apply }, "✓ apply"),
            h("button", { type: "button", className: "me-btn", onClick: cancel }, "✕ cancel"),
          ),
    ),
    draft === null
      ? h("pre", { className: "me-code-body" }, code)
      : h("textarea", {
          className: "me-code-body me-code-edit",
          value: draft,
          spellcheck: false,
          onInput: (e) => setDraft(e.target.value),
        }),
    error && h("p", { className: "me-code-error" }, `⚠ ${error}`),
  );
}
