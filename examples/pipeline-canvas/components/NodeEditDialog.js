import { h, useState, useEffect } from "/dist/nexa.js";
import { Button, Dialog, TextField, Select } from "/dist/nexa-components.js";
import { FullCodeEditor } from "/dist/nexa-editor.js";
import { BOILERPLATES, CYTHON_BOILERPLATES, GOLANG_BOILERPLATES, RUST_BOILERPLATES, KOTLIN_BOILERPLATES } from "/dist/nexa-editor-snippets.js";

const ALL_SNIPPETS = { BOILERPLATES, CYTHON_BOILERPLATES, GOLANG_BOILERPLATES, RUST_BOILERPLATES, KOTLIN_BOILERPLATES };

const COLORS = [
  { label: "Teal",    value: "#0f766e" },
  { label: "Violet",  value: "#7c3aed" },
  { label: "Blue",    value: "#1d4ed8" },
  { label: "Amber",   value: "#b45309" },
  { label: "Pink",    value: "#be185d" },
  { label: "Cyan",    value: "#0e7490" },
];

const STATUS_OPTIONS = [
  { label: "Idle",    value: "idle"    },
  { label: "Running", value: "running" },
  { label: "Success", value: "success" },
  { label: "Error",   value: "error"   },
];

export function NodeEditDialog({ node, onSave, onClose }) {
  const [label,    setLabel]    = useState("");
  const [body,     setBody]     = useState("");
  const [color,    setColor]    = useState(COLORS[0].value);
  const [status,   setStatus]   = useState("idle");
  const [language, setLanguage] = useState("python");

  useEffect(() => {
    if (!node) return;
    setLabel(node.label       || "");
    setBody(node.body         || "");
    setColor(node.color       || COLORS[0].value);
    setStatus(node.status     || "idle");
    setLanguage(node.language || "python");
  }, [node?.id]);

  const handleSave = () => {
    onSave({ ...node, label: label.trim() || node.label, body, color, status, language });
    onClose();
  };

  return h(Dialog, {
    open:    !!node,
    title:   node ? `Edit - ${node.label}` : "",
    size:    "lg",
    onClose,
    actions: h("div", { style: "display:flex;gap:8px;justify-content:flex-end" },
      h(Button, { variant: "text",      onClick: onClose    }, "Cancel"),
      h(Button, { variant: "contained", onClick: handleSave }, "Save"),
    ),
  },
    h("div", { className: "m-stack" },

      h(TextField, {
        label:   "Node name",
        value:   label,
        onInput: (e) => setLabel(e.target.value),
        style:   "width:100%",
      }),

      h(Select, {
        label:    "Status",
        value:    status,
        onChange: (e) => setStatus(e.target.value),
        options:  STATUS_OPTIONS,
        style:    "width:100%",
      }),

      h("div", null,
        h("p", { className: "m-label m-mb-2" }, "Color"),
        h("div", { style: "display:flex;gap:8px;flex-wrap:wrap" },
          COLORS.map(c =>
            h("button", {
              key:     c.value,
              type:    "button",
              title:   c.label,
              onClick: () => setColor(c.value),
              style: `width:28px;height:28px;border-radius:50%;cursor:pointer;outline:none;
                border:3px solid ${color === c.value ? "#fff" : "transparent"};
                background:${c.value};
                box-shadow:${color === c.value ? "0 0 0 2px " + c.value : "none"};`,
            }),
          ),
        ),
      ),

      node && h("div", null,
        h("p", { className: "m-label m-mb-2" }, "Code"),
        h(FullCodeEditor, {
          value:            body,
          onChange:         setBody,
          language,
          onLanguageChange: setLanguage,
          snippets:         ALL_SNIPPETS,
          showToolbar:      true,
          showSnippets:     true,
          height:           260,
          style:            "border-radius:var(--m-radius);overflow:hidden",
        }),
      ),
    ),
  );
}
