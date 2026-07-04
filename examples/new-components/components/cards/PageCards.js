import { h } from "/dist/nexa.js";
import { CardMedia } from "./CardMedia.js";
import { CardGlow } from "./CardGlow.js";
import { CardFloat } from "./CardFloat.js";
import { CardExpand } from "./CardExpand.js";
import { CardPricing } from "./CardPricing.js";
import { SpeedDialDemo } from "./SpeedDialDemo.js";

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
    h(CardMedia),
    h(CardFloat),
    h(CardGlow),
    h(CardExpand),
    h(CardPricing),
    h(SpeedDialDemo),
  );
}
