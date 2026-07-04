import { h, useState } from "/dist/nexa.js";
import { Accordion } from "/dist/nexa-components.js";

const FAQ_ITEMS = [
  {
    key: "what",
    title: "What is Nexa?",
    children: h(
      "p",
      null,
      "Nexa is a no-build, ESM-native JavaScript frontend framework with a React-like hooks API. It runs directly in the browser — no bundler, transpiler, or npm install required.",
    ),
  },
  {
    key: "why",
    title: "Why no build step?",
    children: h(
      "p",
      null,
      "Eliminating the build step makes projects easier to start, debug, and deploy. You open an HTML file and it just works. Modern browsers understand ES modules natively, so there's nothing extra to set up.",
    ),
  },
  {
    key: "hooks",
    title: "Does it support hooks like React?",
    children: h(
      "p",
      null,
      "Yes — Nexa ships useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, and many more. The API is intentionally close to React's so it feels familiar.",
    ),
  },
  {
    key: "compat",
    title: "Is it compatible with TypeScript?",
    children: h(
      "p",
      null,
      "Nexa ships ",
      h("code", null, "dist/nexa.d.ts"),
      " and ",
      h("code", null, "dist/nexa-components.d.ts"),
      " covering all 39 core exports and all 41 UI components. Use it in any project that loads the files via ",
      h("code", null, '<script type="module">'),
      " or via a CDN.",
    ),
  },
  {
    key: "disabled",
    title: "This panel is disabled and cannot be toggled.",
    children: h("p", null, "You should never see this text."),
    disabled: true,
  },
];

const SETTINGS_ITEMS = [
  {
    key: "account",
    title: "Account settings",
    children: h(
      "div",
      null,
      h("p", null, "Manage your display name, email address, and avatar."),
    ),
  },
  {
    key: "security",
    title: "Security & privacy",
    children: h(
      "div",
      null,
      h("p", null, "Change your password, configure two-factor authentication, and review active sessions."),
    ),
  },
  {
    key: "notifications",
    title: "Notifications",
    children: h(
      "div",
      null,
      h("p", null, "Choose which events send you email or push notifications."),
    ),
  },
  {
    key: "billing",
    title: "Billing & plans",
    children: h(
      "div",
      null,
      h("p", null, "View invoices, update your payment method, or change your subscription plan."),
    ),
  },
];

export function PageAccordion() {
  const [controlledOpen, setControlledOpen] = useState(["account"]);

  return h(
    "div",
    null,

    h("h1", { className: "m-page-title" }, "Accordion"),

    /* ── Uncontrolled (single-open) ──────────────────────── */
    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Uncontrolled — single open"),
      h(
        "div",
        { className: "accordion-demo-wrap" },
        h(Accordion, {
          items: FAQ_ITEMS,
          defaultOpen: "what",
        }),
      ),
    ),

    /* ── Uncontrolled (multiple) ─────────────────────────── */
    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Uncontrolled — multiple open"),
      h(
        "div",
        { className: "accordion-demo-wrap" },
        h(Accordion, {
          items: FAQ_ITEMS.slice(0, 4),
          multiple: true,
          defaultOpen: ["what", "hooks"],
        }),
      ),
    ),

    /* ── Controlled ──────────────────────────────────────── */
    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Controlled — multiple open"),
      h(
        "div",
        { className: "accordion-demo-wrap" },
        h(Accordion, {
          items: SETTINGS_ITEMS,
          multiple: true,
          open: controlledOpen,
          onToggle: (_key, nextKeys) => setControlledOpen(nextKeys),
        }),
      ),
      h(
        "p",
        { style: { marginTop: "var(--m-space-3)", fontSize: "var(--m-font-size-xs)", color: "var(--m-text-muted)" } },
        "Open panels: ",
        h("code", null, controlledOpen.join(", ") || "(none)"),
      ),
    ),
  );
}
