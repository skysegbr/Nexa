import { h } from "/dist/nexa.js";

export function Avatar() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Avatar"),

    h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "Sizes"),
    h("div", { className: "m-cluster" },
      h("span", { className: "m-avatar m-avatar-xs" }, "A"),
      h("span", { className: "m-avatar m-avatar-sm" }, "AB"),
      h("span", { className: "m-avatar m-avatar-md" }, "CD"),
      h("span", { className: "m-avatar m-avatar-lg" }, "EF"),
      h("span", { className: "m-avatar m-avatar-xl" }, "GH"),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-4) 0 var(--m-space-3)" } }, "With custom colors"),
    h("div", { className: "m-cluster" },
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#dbeafe", color: "#175cd3" } }, "BR"),
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#fef0c7", color: "#b54708" } }, "CM"),
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#fee4e2", color: "#b42318" } }, "DK"),
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#dcfae6", color: "#067647" } }, "EL"),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-4) 0 var(--m-space-3)" } }, "Group with overlap"),
    h("div", { className: "m-cluster" },
      h("div", { className: "m-avatar-group" },
        h("span", { className: "m-avatar m-avatar-sm", style: { background: "#fef0c7", color: "#b54708" } }, "CM"),
        h("span", { className: "m-avatar m-avatar-sm", style: { background: "#dbeafe", color: "#175cd3" } }, "BR"),
        h("span", { className: "m-avatar m-avatar-sm" }, "AL"),
        h("span", { className: "m-avatar m-avatar-sm", style: { background: "var(--m-surface-raised)", color: "var(--m-text-muted)" } }, "+5"),
      ),
      h("span", { className: "m-text-sm m-text-muted" }, "8 members"),
    ),
  );
}
