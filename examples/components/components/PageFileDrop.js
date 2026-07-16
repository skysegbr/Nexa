import { h, useState } from "/dist/nexa.js";
import { FileDropZone } from "/dist/nexa-components-forms.js";

export function PageFileDrop({ toast }) {
  const [files,    setFiles]    = useState([]);
  const [progress, setProgress] = useState(null);

  const handleFiles = (incoming) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setFiles((prev) => [...prev, ...incoming]);
          setProgress(null);
          toast.success(`${incoming.length} file(s) uploaded!`);
          return null;
        }
        return p + 20;
      });
    }, 200);
  };

  return h(
    "div",
    { className: "m-stack" },
    h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "FileDropZone"),
    h(FileDropZone, {
      onFiles:  handleFiles,
      multiple: true,
      accept:   ".csv,.json,.txt",
      label:    "Drag files or click to select",
      hint:     "CSV, JSON, and TXT - up to 10 MB each",
      progress: progress,
    }),
    files.length > 0 && h(
      "div",
      { className: "m-stack" },
      h("p", { className: "demo-label" }, `${files.length} file(s) uploaded`),
      files.map((f, i) =>
        h(
          "div",
          {
            key: i,
            className: "m-list-item",
          },
          h("span", null,
            h("i", { className: "bi bi-file-earmark m-me-2 m-text-muted" }),
            f.name,
          ),
          h("span", { className: "m-text-muted m-text-sm" }, `${(f.size / 1024).toFixed(1)} KB`),
        ),
      ),
    ),
  );
}
