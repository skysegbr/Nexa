import { h, useState } from "/dist/nexa.js";
import { CodeEditor, Alert } from "/dist/nexa-components.js";

const INITIAL_CODE = `def process_pipeline(nodes, docker=False):
    results = []
    for node in nodes:
        result = node.run(docker=docker)
        results.append(result)
    return results
`;

export function PageCodeEditor() {
  const [code, setCode] = useState(INITIAL_CODE);

  return h(
    "div",
    { className: "m-stack" },
    h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "CodeEditor"),
    h(Alert, { variant: "info" },
      "Wrapper for CodeMirror or Monaco. Without the library loaded, it displays a working ",
      h("code", null, "<textarea>"),
      " as a fallback.",
    ),
    h(CodeEditor, {
      value:    code,
      onChange: setCode,
      mode:     "python",
      theme:    "material-darker",
      style:    { height: 280 },
      options:  { lineNumbers: true },
    }),
    h("details", { className: "m-mt-2" },
      h("summary", { className: "m-text-sm m-text-muted", style: { cursor: "pointer" } }, "View current value"),
      h("pre", {
        className: "m-text-sm m-text-muted m-mt-2",
        style: { whiteSpace: "pre-wrap", background: "var(--m-surface)", padding: "var(--m-space-3)", borderRadius: "var(--m-radius)", border: "1px solid var(--m-border)" },
      }, code),
    ),
  );
}
