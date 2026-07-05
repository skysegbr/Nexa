import { h } from "/dist/nexa.js";
import { Skeleton } from "./Skeleton.js";
import { Avatar } from "./Avatar.js";
import { Breadcrumb } from "./Breadcrumb.js";
import { SidebarNav } from "./SidebarNav.js";
import { Variants } from "./Variants.js";

export function PageNewUI() {
  return h(
    "div",
    { className: "m-stack" },
    h("div", null,
      h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "New UI Components"),
      h("p", { className: "m-body m-text-sm", style: { marginTop: "var(--m-space-2)" } },
        "Skeleton, Avatar, Breadcrumb, Sidebar nav links and CSS-only variants.",
      ),
    ),
    h(Skeleton),
    h(Avatar),
    h(Breadcrumb),
    h(SidebarNav),
    h(Variants),
  );
}
