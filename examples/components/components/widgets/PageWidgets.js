import { h } from "/dist/nexa.js";
import { FormControls } from "./FormControls.js";
import { StatsDemo } from "./StatsDemo.js";
import { TreeViewDemo } from "./TreeViewDemo.js";
import { PopoverDemo } from "./PopoverDemo.js";
import { CommandPaletteDemo } from "./CommandPaletteDemo.js";

export function PageWidgets({ toast }) {
  return h(
    "div",
    { className: "m-stack" },
    h(
      "div",
      null,
      h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Forms & Widgets"),
      h(
        "p",
        { className: "m-body m-text-sm", style: { marginTop: "var(--m-space-2)" } },
        "RadioGroup, NumberInput, TimePicker, Stat, TreeView, Popover and CommandPalette. (Avatar, Breadcrumb, Skeleton and Divider live on the UI Primitives page.)",
      ),
    ),
    h(FormControls),
    h(StatsDemo),
    h(TreeViewDemo),
    h(PopoverDemo),
    h(CommandPaletteDemo, { toast }),
  );
}
