import { h } from "/dist/nexa.js";
import { Avatar as AvatarComponent, AvatarGroup } from "/dist/nexa-components-core.js";

export function Avatar() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Avatar"),

    h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "Sizes — initials derived from name"),
    h("div", { className: "m-cluster" },
      h(AvatarComponent, { name: "Ana", size: "xs" }),
      h(AvatarComponent, { name: "Ana Braga", size: "sm" }),
      h(AvatarComponent, { name: "Carla Dias", size: "md" }),
      h(AvatarComponent, { name: "Edu Faria", size: "lg" }),
      h(AvatarComponent, { name: "Gil Horta", size: "xl" }),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-4) 0 var(--m-space-3)" } }, "With custom colors"),
    h("div", { className: "m-cluster" },
      h(AvatarComponent, { name: "Bia Reis", style: { background: "#dbeafe", color: "#175cd3" } }),
      h(AvatarComponent, { name: "Caio Melo", style: { background: "#fef0c7", color: "#b54708" } }),
      h(AvatarComponent, { name: "Duda Klein", style: { background: "#fee4e2", color: "#b42318" } }),
      h(AvatarComponent, { name: "Eli Lopes", style: { background: "#dcfae6", color: "#067647" } }),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-4) 0 var(--m-space-3)" } }, "AvatarGroup — extras collapse into +N"),
    h("div", { className: "m-cluster" },
      h(AvatarGroup, {
        size: "sm",
        max: 3,
        avatars: [
          { name: "Caio Melo", style: { background: "#fef0c7", color: "#b54708" } },
          { name: "Bia Reis", style: { background: "#dbeafe", color: "#175cd3" } },
          { name: "Ana Lima" },
          { name: "Duda Klein" }, { name: "Eli Lopes" }, { name: "Fabi Nunes" },
          { name: "Gil Horta" }, { name: "Hugo Prado" },
        ],
      }),
      h("span", { className: "m-text-sm m-text-muted" }, "8 members"),
    ),
  );
}
