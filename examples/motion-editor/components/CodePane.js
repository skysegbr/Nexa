// Live code export: the current document rendered as ready-to-paste
// useTimeline() source. What you scrubbed is what you ship.

import { h, useMemo, useState } from "/dist/nexa.js";

// new RegExp(string) instead of a literal: the repo's lightweight syntax
// validator balances brackets and would trip on the character class.
const IDENTIFIER_RE = new RegExp("^[A-Za-z_$][A-Za-z0-9_$]*$");

function formatKeyframe(keyframe) {
  const parts = Object.entries(keyframe).map(([key, value]) =>
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

  for (const [name, keyframes] of Object.entries(doc.tracks)) {
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

  lines.push("  },", "});");
  return lines.join("\n");
}

export function CodePane({ doc }) {
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => generateCode(doc), [doc]);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return h(
    "section",
    { className: "me-code" },
    h(
      "div",
      { className: "me-code-head" },
      h("h2", { className: "me-panel-title" }, "Export"),
      h("button", { type: "button", className: "me-btn", onClick: copy }, copied ? "copied ✓" : "copy"),
    ),
    h("pre", { className: "me-code-body" }, code),
  );
}
