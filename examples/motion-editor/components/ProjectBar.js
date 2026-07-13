// Project persistence on the core's useLocalStorage: save the current
// document under a name, load a saved one (undoable — loading goes through
// the same history as any edit), or start fresh.

import { h, useLocalStorage, useState } from "/dist/nexa.js";

export function ProjectBar({ doc, onLoad, onNew }) {
  const [projects, setProjects] = useLocalStorage("me-projects", {});
  const [name, setName] = useState("my-movie");
  const names = Object.keys(projects).sort();

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjects({ ...projects, [trimmed]: doc });
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
  );
}
