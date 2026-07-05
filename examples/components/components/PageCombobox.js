import { h, useState } from "/dist/nexa.js";
import { Combobox, Alert } from "/dist/nexa-components.js";
import { PIPELINES } from "../data.js";

export function PageCombobox() {
  const [pipeline, setPipeline] = useState("");
  const [depends,  setDepends]  = useState("");

  return h(
    "div",
    { className: "m-stack" },
    h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Combobox"),
    h(Alert, { variant: "info" }, "Type to filter options. Supports keyboard and mouse."),
    h(
      "div",
      { style: { maxWidth: 480 }, className: "m-stack" },
      h(Combobox, {
        id:          "pipeline",
        label:       "Pipeline",
        value:       pipeline,
        onChange:    setPipeline,
        options:     PIPELINES,
        placeholder: "Select a pipeline...",
        required:    true,
      }),
      h(Combobox, {
        id:          "depends",
        label:       "Depends on",
        value:       depends,
        onChange:    setDepends,
        options:     PIPELINES.filter((p) => p.value !== pipeline),
        placeholder: "No dependency",
        help:        "This pipeline only runs after the selected one completes.",
      }),
      pipeline && h(
        Alert,
        { variant: "success" },
        "Selected: ", h("strong", null, PIPELINES.find((p) => p.value === pipeline)?.label),
      ),
    ),
  );
}
