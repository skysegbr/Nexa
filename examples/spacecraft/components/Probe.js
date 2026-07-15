// The whole probe as one SVG in world space — the content of the "overview"
// frame. Fixed technical illustration; the subsystem region frames layered on
// top are transparent camera targets. (`h` is hyperscript, so panel sizes use
// pw/ph, never h.)

import { h } from "/dist/nexa.js";
import { WORLD, CRAFT } from "../data.js";

function octagon(cx, cy, r) {
  const k = r * 0.414;
  return [
    [cx - k, cy - r], [cx + k, cy - r], [cx + r, cy - k], [cx + r, cy + k],
    [cx + k, cy + r], [cx - k, cy + r], [cx - r, cy + k], [cx - r, cy - k],
  ].map((p) => p.join(",")).join(" ");
}

function panel(key, px, py, pw, ph, cols, rows) {
  const cells = [];
  for (let c = 1; c < cols; c += 1) {
    cells.push(h("line", { key: `v${c}`, x1: px + (pw / cols) * c, y1: py, x2: px + (pw / cols) * c, y2: py + ph, className: "sc-cell" }));
  }
  for (let r = 1; r < rows; r += 1) {
    cells.push(h("line", { key: `r${r}`, x1: px, y1: py + (ph / rows) * r, x2: px + pw, y2: py + (ph / rows) * r, className: "sc-cell" }));
  }
  return h("g", { key }, h("rect", { x: px, y: py, width: pw, height: ph, rx: 8, className: "sc-panel" }), cells);
}

function label(key, x, y, lx, ly, text, anchor) {
  return h(
    "g",
    { key },
    h("line", { x1: x, y1: y, x2: lx, y2: ly, className: "sc-leader" }),
    h("circle", { cx: x, cy: y, r: 5, className: "sc-leader-dot" }),
    h("text", { x: lx, y: ly - 12, className: "sc-tag", style: { textAnchor: anchor || "start" } }, text),
  );
}

export function Probe() {
  const cx = 1300;
  const cy = 870;
  return h(
    "svg",
    { className: "sc-probe", viewBox: `0 0 ${WORLD.w} ${WORLD.h}`, width: WORLD.w, height: WORLD.h, ariaHidden: "true" },
    h("rect", { x: 20, y: 20, width: WORLD.w - 40, height: WORLD.h - 40, rx: 28, className: "sc-base" }),
    h("text", { x: WORLD.w - 68, y: 96, className: "sc-brand", style: { textAnchor: "end" } }, CRAFT.name),
    h("text", { x: WORLD.w - 68, y: 122, className: "sc-desig", style: { textAnchor: "end" } }, CRAFT.designation),

    // ── solar arrays ──
    h("line", { x1: cx - 150, y1: cy, x2: 1080, y2: cy, className: "sc-spar" }),
    h("line", { x1: cx + 150, y1: cy, x2: 1520, y2: cy, className: "sc-spar" }),
    panel("pl", 360, 770, 720, 200, 8, 3),
    panel("pr", 1520, 770, 720, 200, 8, 3),

    // ── high-gain antenna ──
    h("line", { x1: cx, y1: 700, x2: cx, y2: 470, className: "sc-mast" }),
    h("ellipse", { cx, cy: 400, rx: 220, ry: 70, className: "sc-dish" }),
    h("ellipse", { cx, cy: 408, rx: 176, ry: 52, className: "sc-dish-inner" }),
    h("line", { x1: cx - 150, y1: 372, x2: cx, y2: 262, className: "sc-strut" }),
    h("line", { x1: cx + 150, y1: 372, x2: cx, y2: 262, className: "sc-strut" }),
    h("line", { x1: cx, y1: 400, x2: cx, y2: 262, className: "sc-strut" }),
    h("circle", { cx, cy: 258, r: 16, className: "sc-feed" }),

    // ── instrument bus ──
    h("polygon", { points: octagon(cx, cy, 176), className: "sc-bus" }),
    h("polygon", { points: octagon(cx, cy, 176), className: "sc-bus-edge" }),
    h("rect", { x: cx - 96, y: cy - 96, width: 192, height: 192, rx: 10, className: "sc-bus-panel" }),
    h("rect", { x: cx - 70, y: cy - 70, width: 60, height: 60, rx: 6, className: "sc-box" }),
    h("rect", { x: cx + 12, y: cy - 70, width: 60, height: 60, rx: 6, className: "sc-box" }),
    h("circle", { cx: cx - 40, cy: cy + 44, r: 22, className: "sc-tracker" }),
    h("circle", { cx: cx + 40, cy: cy + 44, r: 22, className: "sc-tracker" }),

    // sensor booms
    h("line", { x1: cx - 160, y1: cy - 90, x2: cx - 320, y2: cy - 210, className: "sc-boom" }),
    h("circle", { cx: cx - 320, cy: cy - 210, r: 14, className: "sc-sensor" }),
    h("line", { x1: cx + 160, y1: cy - 90, x2: cx + 320, y2: cy - 210, className: "sc-boom" }),
    h("circle", { cx: cx + 320, cy: cy - 210, r: 14, className: "sc-sensor" }),

    // ── propulsion ──
    h("rect", { x: cx - 70, y: cy + 176, width: 140, height: 150, rx: 10, className: "sc-tank" }),
    h("path", { d: `M ${cx - 54} ${cy + 326} L ${cx - 92} ${cy + 470} Q ${cx} ${cy + 512} ${cx + 92} ${cy + 470} L ${cx + 54} ${cy + 326} Z`, className: "sc-nozzle" }),
    h("path", { d: `M ${cx - 92} ${cy + 470} Q ${cx} ${cy + 512} ${cx + 92} ${cy + 470}`, className: "sc-nozzle-rim" }),
    h("rect", { x: cx - 150, y: cy + 200, width: 34, height: 34, rx: 5, className: "sc-thruster" }),
    h("rect", { x: cx + 116, y: cy + 200, width: 34, height: 34, rx: 5, className: "sc-thruster" }),

    // ── RTG on a boom ──
    h("line", { x1: cx + 150, y1: cy + 90, x2: 1720, y2: cy + 300, className: "sc-boom" }),
    h("g", { transform: `translate(1790, ${cy + 340}) rotate(24)` },
      h("rect", { x: -54, y: -110, width: 108, height: 220, rx: 14, className: "sc-rtg" }),
      Array.from({ length: 7 }, (_, i) => h("line", { key: i, x1: -74, y1: -90 + i * 30, x2: 74, y2: -90 + i * 30, className: "sc-fin" })),
    ),

    // ── labels ──
    label("l1", cx, 340, cx + 300, 300, "HIGH-GAIN ANTENNA"),
    label("l2", 520, 870, 520, 700, "SOLAR ARRAY", "middle"),
    label("l3", cx + 96, cy - 40, cx + 300, cy - 40, "INSTRUMENT BUS"),
    label("l4", cx, cy + 470, cx - 260, cy + 470, "MAIN ENGINE", "end"),
    label("l5", 1790, cy + 300, 1980, cy + 250, "RTG POWER"),
  );
}
