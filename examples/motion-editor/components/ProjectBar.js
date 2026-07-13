// Project persistence: named saves on the core's useLocalStorage, plus
// file-based portability — download the document as JSON, import one back
// (both loading paths are undoable; they go through the same history as any
// edit).

import { h, useLocalStorage, useRef, useState } from "/dist/nexa.js";

export function ProjectBar({ doc, onLoad, onNew }) {
  const [projects, setProjects] = useLocalStorage("me-projects", {});
  const [name, setName] = useState("my-movie");
  const fileRef = useRef(null);
  const names = Object.keys(projects).sort();

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjects({ ...projects, [trimmed]: doc });
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.trim() || "movie"}.nexa-motion.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-importing the same file
    if (!file) return;
    file.text().then((text) => {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== "object" || !parsed || typeof parsed.duration !== "number" || !parsed.tracks) {
          throw new Error("not a motion document");
        }
        setName(file.name.replace(new RegExp("\\.nexa-motion\\.json$|\\.json$"), ""));
        onLoad(parsed);
      } catch (error) {
        console.error("motion-editor: could not import this file.", error);
      }
    });
  };

  return h(
    "div",
    { className: "me-projects" },
    h("input", {
      className: "me-project-name",
      type: "text",
      value: name,
      ariaLabel: "Project name",
      onInput: (e) => setName(e.target.value),
    }),
    h("button", { type: "button", className: "me-btn", onClick: save }, "💾 save"),
    h(
      "select",
      {
        className: "me-project-list",
        ariaLabel: "Load project",
        value: "",
        onChange: (e) => {
          const picked = e.target.value;
          if (picked && projects[picked]) {
            setName(picked);
            onLoad(projects[picked]);
          }
        },
      },
      h("option", { value: "" }, names.length ? "load…" : "no saved projects"),
      names.map((saved) => h("option", { key: saved, value: saved }, saved)),
    ),
    h("button", { type: "button", className: "me-btn", onClick: onNew }, "✦ new"),
    h("button", { type: "button", className: "me-btn", title: "Download as JSON", onClick: download }, "⇩"),
    h("button", { type: "button", className: "me-btn", title: "Import a JSON project", onClick: () => fileRef.current?.click() }, "⇪"),
    h("input", {
      ref: fileRef,
      type: "file",
      accept: ".json,application/json",
      className: "me-file-input",
      ariaLabel: "Import project file",
      onChange: importFile,
    }),
  );
}
