import { h, useState } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";
import { Checkbox } from "/dist/nexa-components-forms.js";
import { Popover } from "/dist/nexa-components-overlay.js";

export function PopoverDemo() {
  const [onlyActive, setOnlyActive] = useState(true);
  const [includeDrafts, setIncludeDrafts] = useState(false);

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Popover — anchored interactive panel"),
    h(
      "div",
      { className: "demo-row" },
      h(
        Popover,
        {
          id: "filter-popover",
          trigger: h(Button, { variant: "tonal" }, "Filters"),
          title: "Filter pipelines",
          placement: "bottom",
        },
        h(Checkbox, {
          id: "only-active",
          label: "Only active",
          checked: onlyActive,
          onChange: (e) => setOnlyActive(e.target.checked),
        }),
        h(Checkbox, {
          id: "include-drafts",
          label: "Include drafts",
          checked: includeDrafts,
          onChange: (e) => setIncludeDrafts(e.target.checked),
        }),
      ),
      h(
        "span",
        { className: "m-text-sm m-text-muted" },
        `active: ${onlyActive ? "yes" : "no"} · drafts: ${includeDrafts ? "yes" : "no"} — Escape or outside click closes`,
      ),
    ),
  );
}
