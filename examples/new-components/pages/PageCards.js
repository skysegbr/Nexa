import { h } from "/dist/nexa.js";
import { SpeedDial } from "/dist/nexa-components.js";
import { SectionCardMedia, SectionCardGlow } from "./SectionCardMedia.js";
import { SectionCardExpand, SectionCardPricing } from "./SectionCardExpandPricing.js";

/* ── SpeedDial ─────────────────────────────────────────── */

function SectionSpeedDial() {
  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "SpeedDial"),
    h("p", { className: "m-text-sm m-text-muted", style: { marginBottom: "var(--m-space-4)" } },
      "Trigger expands a row of IconButtons. Click outside or pick an action to close.",
    ),
    h(
      "div",
      { className: "demo-row", style: { gap: "var(--m-space-8)" } },
      h(
        "div",
        null,
        h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "Inline"),
        h(SpeedDial, {
          label: "Quick actions",
          icon: h("i", { className: "bi bi-plus-lg" }),
          items: [
            { label: "Message", icon: h("i", { className: "bi bi-chat-dots" }) },
            { label: "Favorite", icon: h("i", { className: "bi bi-heart" }) },
            { label: "Share", icon: h("i", { className: "bi bi-share" }) },
          ],
        }),
      ),
      h(
        "div",
        { style: { paddingTop: "3rem" } },
        h("p", { className: "m-text-xs m-text-muted", style: { marginBottom: "var(--m-space-3)" } }, "Orbit (upward)"),
        h(SpeedDial, {
          orbit: true,
          label: "Social links",
          icon: h("i", { className: "bi bi-share-fill" }),
          items: [
            { label: "Facebook", icon: h("i", { className: "bi bi-facebook" }) },
            { label: "Instagram", icon: h("i", { className: "bi bi-instagram" }) },
            { label: "Twitter", icon: h("i", { className: "bi bi-twitter-x" }) },
          ],
        }),
      ),
    ),
  );
}

/* ── Page root ─────────────────────────────────────────── */

export function PageCards() {
  return h(
    "div",
    { className: "m-stack" },
    h("div", null,
      h("h2", { className: "m-title", style: { fontSize: "1.5rem" } }, "Card variants & SpeedDial"),
      h("p", { className: "m-body m-text-sm", style: { marginTop: "var(--m-space-2)" } },
        "Card techniques adapted from CSS-only reference designs, rebuilt as composable m-card-* classes plus the new SpeedDial component.",
      ),
    ),
    h(SectionCardMedia),
    h(SectionCardGlow),
    h(SectionCardExpand),
    h(SectionCardPricing),
    h(SectionSpeedDial),
  );
}
