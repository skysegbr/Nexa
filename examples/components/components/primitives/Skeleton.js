import { h, useState, useEffect } from "/dist/nexa.js";
import { Skeleton as SkeletonComponent, Avatar } from "/dist/nexa-components-core.js";
import { USERS } from "../../data.js";

function SkeletonCard() {
  return h(
    "div",
    { className: "m-card m-card-padded", style: { display: "grid", gap: "var(--m-space-3)" } },
    h("div", { className: "m-cluster" },
      h(SkeletonComponent, { variant: "circle", width: 40, height: 40 }),
      h("div", { style: { flex: 1, display: "grid", gap: "var(--m-space-2)" } },
        h(SkeletonComponent, { variant: "text", width: "55%" }),
        h(SkeletonComponent, { variant: "text", width: "35%", height: "0.75em" }),
      ),
    ),
    h(SkeletonComponent, { variant: "text", lines: 3 }),
  );
}

function UserCard({ user }) {
  return h(
    "div",
    { className: "m-card m-card-padded m-card-hover", style: { display: "grid", gap: "var(--m-space-3)" } },
    h("div", { className: "m-cluster" },
      h(Avatar, { name: user.name, style: { background: user.color, color: "var(--m-text)" } }),
      h("div", null,
        h("p", { style: { margin: 0, fontWeight: 700 } }, user.name),
        h("p", { className: "m-text-sm m-text-muted", style: { margin: 0 } }, user.role),
      ),
    ),
  );
}

export function Skeleton() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(t);
  }, [loading]);

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Skeleton — loading placeholder"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Cards load in 2.2 s. ",
      h("button", {
        className: "m-button m-button-tonal m-text-sm",
        style: { minHeight: 28, padding: "0 10px" },
        onClick: () => setLoading(true),
      }, "Reload"),
    ),
    h(
      "div",
      { className: "m-grid-3" },
      loading
        ? [1, 2, 3].map((i) => h(SkeletonCard, { key: i }))
        : USERS.map((u) => h(UserCard, { key: u.id, user: u })),
    ),
  );
}
