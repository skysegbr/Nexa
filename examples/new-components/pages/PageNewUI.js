import { h, useState, useEffect } from "/dist/nexa.js";
import { Button, Badge } from "/dist/nexa-components.js";

/* ── Skeleton demo ─────────────────────────────────────── */

function SkeletonCard() {
  return h(
    "div",
    { className: "m-card m-card-padded", style: { display: "grid", gap: "var(--m-space-3)" } },
    h("div", { className: "m-cluster" },
      h("div", { className: "m-skeleton m-skeleton-circle", style: { width: 40, height: 40 } }),
      h("div", { style: { flex: 1, display: "grid", gap: "var(--m-space-2)" } },
        h("div", { className: "m-skeleton m-skeleton-text", style: { width: "55%" } }),
        h("div", { className: "m-skeleton m-skeleton-text", style: { width: "35%", height: "0.75em" } }),
      ),
    ),
    h("div", { className: "m-skeleton m-skeleton-text", style: { width: "100%" } }),
    h("div", { className: "m-skeleton m-skeleton-text", style: { width: "90%" } }),
    h("div", { className: "m-skeleton m-skeleton-text", style: { width: "70%" } }),
  );
}

const USERS = [
  { id: 1, name: "Ana Lima",    role: "Designer",  initials: "AL", color: "#d9f3ef" },
  { id: 2, name: "Bruno Rios",  role: "Engineer",  initials: "BR", color: "#dbeafe" },
  { id: 3, name: "Carla Mota",  role: "PM",        initials: "CM", color: "#fef0c7" },
];

function UserCard({ user }) {
  return h(
    "div",
    { className: "m-card m-card-padded m-card-hover", style: { display: "grid", gap: "var(--m-space-3)" } },
    h("div", { className: "m-cluster" },
      h("span", {
        className: "m-avatar m-avatar-md",
        style: { background: user.color, color: "var(--m-text)" },
      }, user.initials),
      h("div", null,
        h("p", { style: { margin: 0, fontWeight: 700 } }, user.name),
        h("p", { className: "m-text-sm m-text-muted", style: { margin: 0 } }, user.role),
      ),
    ),
  );
}

function SectionSkeleton() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Skeleton — loading placeholder"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Cards carregam em 2.2 s. ",
      h("button", {
        className: "m-button m-button-tonal m-text-sm",
        style: { minHeight: 28, padding: "0 10px" },
        onClick: () => setLoading(true),
      }, "Recarregar"),
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

/* ── Avatar demo ───────────────────────────────────────── */

function SectionAvatar() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Avatar"),

    h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "Tamanhos"),
    h("div", { className: "m-cluster" },
      h("span", { className: "m-avatar m-avatar-xs" }, "A"),
      h("span", { className: "m-avatar m-avatar-sm" }, "AB"),
      h("span", { className: "m-avatar m-avatar-md" }, "CD"),
      h("span", { className: "m-avatar m-avatar-lg" }, "EF"),
      h("span", { className: "m-avatar m-avatar-xl" }, "GH"),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-4) 0 var(--m-space-3)" } }, "Com cores customizadas"),
    h("div", { className: "m-cluster" },
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#dbeafe", color: "#175cd3" } }, "BR"),
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#fef0c7", color: "#b54708" } }, "CM"),
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#fee4e2", color: "#b42318" } }, "DK"),
      h("span", { className: "m-avatar m-avatar-md", style: { background: "#dcfae6", color: "#067647" } }, "EL"),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-4) 0 var(--m-space-3)" } }, "Grupo com sobreposição"),
    h("div", { className: "m-cluster" },
      h("div", { className: "m-avatar-group" },
        h("span", { className: "m-avatar m-avatar-sm", style: { background: "#fef0c7", color: "#b54708" } }, "CM"),
        h("span", { className: "m-avatar m-avatar-sm", style: { background: "#dbeafe", color: "#175cd3" } }, "BR"),
        h("span", { className: "m-avatar m-avatar-sm" }, "AL"),
        h("span", { className: "m-avatar m-avatar-sm", style: { background: "var(--m-surface-raised)", color: "var(--m-text-muted)" } }, "+5"),
      ),
      h("span", { className: "m-text-sm m-text-muted" }, "8 membros"),
    ),
  );
}

/* ── Breadcrumb demo ───────────────────────────────────── */

function SectionBreadcrumb() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Breadcrumb"),

    h("div", { className: "m-stack" },
      h("ol", { className: "m-breadcrumb" },
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Home"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" }, "Dashboard"),
      ),

      h("ol", { className: "m-breadcrumb" },
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Home"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Projects"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" },
          h("a", { className: "m-breadcrumb-link", href: "#" }, "Nexa"),
          h("span", { className: "m-breadcrumb-sep" }, "/"),
        ),
        h("li", { className: "m-breadcrumb-item" }, "nexa-ui.css"),
      ),
    ),
  );
}

/* ── Sidebar nav links demo ────────────────────────────── */

const NAV = [
  { icon: "bi-speedometer2",   label: "Dashboard",  badge: null,  active: true  },
  { icon: "bi-kanban",         label: "Projects",   badge: "3",   active: false },
  { icon: "bi-people",         label: "Team",       badge: null,  active: false },
  { icon: "bi-bar-chart-line", label: "Analytics",  badge: null,  active: false },
  { icon: "bi-gear",           label: "Settings",   badge: null,  active: false },
];

function SectionSidebarNav() {
  const [active, setActive] = useState("Dashboard");

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Sidebar nav links"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Simulação do shell de app com sidebar. Clique nos itens.",
    ),
    h(
      "div",
      { className: "sidebar-demo-shell" },
      h(
        "aside",
        { className: "sidebar-demo-pane" },
        h(
          "nav",
          { className: "m-sidebar-section" },
          h("p", { className: "m-sidebar-label" }, "Menu"),
          NAV.map(({ icon, label, badge }) =>
            h(
              "a",
              {
                key: label,
                href: "#",
                className: `m-sidebar-link${active === label ? " m-sidebar-link-active" : ""}`,
                onClick: (e) => { e.preventDefault(); setActive(label); },
              },
              h("span", { className: "m-sidebar-link-icon" },
                h("i", { className: `bi ${icon}` }),
              ),
              label,
              badge && h("span", { className: "m-sidebar-link-badge m-badge" }, badge),
            ),
          ),
        ),
      ),
      h(
        "div",
        { className: "sidebar-demo-content" },
        h("p", { className: "m-text-muted m-text-sm" }, `Página: ${active}`),
      ),
    ),
  );
}

/* ── Button outline + Card hover demo ─────────────────── */

function SectionVariants() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "Variantes — m-button-outline e m-card-hover"),

    h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "m-button-outline"),
    h("div", { className: "demo-row" },
      h("button", { className: "m-button m-button-outline" }, "Cancelar"),
      h("button", { className: "m-button m-button-outline" },
        h("i", { className: "bi bi-download" }), " Exportar",
      ),
      h("button", { className: "m-button m-button-outline", disabled: true }, "Desativado"),
    ),

    h("p", { className: "m-text-xs m-text-muted", style: { margin: "var(--m-space-5) 0 var(--m-space-3)" } }, "m-card-hover (clicável)"),
    h("div", { className: "m-grid-3" },
      ["Relatório mensal", "Pipeline de dados", "Painel de vendas"].map((title) =>
        h(
          "article",
          {
            key: title,
            className: "m-card m-card-padded m-card-hover",
            onClick: () => {},
          },
          h("p", { style: { margin: "0 0 var(--m-space-2)", fontWeight: 700 } }, title),
          h("p", { className: "m-text-sm m-text-muted", style: { margin: 0 } }, "Clique para abrir"),
        ),
      ),
    ),
  );
}

/* ── Page root ─────────────────────────────────────────── */

export function PageNewUI() {
  return h(
    "div",
    { className: "m-stack" },
    h("div", null,
      h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Novos componentes UI"),
      h("p", { className: "m-body m-text-sm", style: { marginTop: "var(--m-space-2)" } },
        "Skeleton, Avatar, Breadcrumb, Sidebar nav links e variantes CSS-only.",
      ),
    ),
    h(SectionSkeleton),
    h(SectionAvatar),
    h(SectionBreadcrumb),
    h(SectionSidebarNav),
    h(SectionVariants),
  );
}
