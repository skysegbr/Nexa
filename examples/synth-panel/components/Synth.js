// The whole synth as one SVG in world space — the content of the "overview"
// frame. Modules and their controls come from data.js; this just draws them.
// The region frames layered on top are transparent camera targets.

import { h } from "/dist/nexa.js";
import { WORLD, PANEL, MODULES } from "../data.js";

function knob(c, i) {
  const r = c.big ? 48 : 34;
  const a = ((-135 + c.val * 270) * Math.PI) / 180;
  const ix = Math.sin(a) * (r - 9);
  const iy = -Math.cos(a) * (r - 9);
  return h(
    "g",
    { key: `k${i}`, transform: `translate(${c.x},${c.y})` },
    h("circle", { r: r + 3, className: "sy-knob-ring" }),
    h("circle", { r, className: "sy-knob-body" }),
    h("line", { x1: 0, y1: 0, x2: ix, y2: iy, className: "sy-knob-ind" }),
    h("text", { y: r + 30, className: "sy-label" }, c.label),
  );
}

function slider(c, i) {
  const H = 190;
  const hy = H - c.val * H;
  return h(
    "g",
    { key: `s${i}`, transform: `translate(${c.x},${c.y})` },
    h("rect", { x: -4, y: 0, width: 8, height: H, rx: 4, className: "sy-slider-track" }),
    h("rect", { x: -4, y: hy, width: 8, height: H - hy, rx: 4, className: "sy-slider-fill" }),
    h("rect", { x: -20, y: hy - 9, width: 40, height: 18, rx: 5, className: "sy-slider-handle" }),
    h("text", { y: H + 34, className: "sy-label sy-label-lg" }, c.label),
  );
}

function wave(c, i) {
  const teeth = 3;
  const step = c.w / teeth;
  let d = `M 0 ${c.h}`;
  for (let t = 0; t < teeth; t += 1) d += ` L ${t * step} 0 L ${(t + 1) * step} ${c.h}`;
  return h(
    "g",
    { key: `w${i}`, transform: `translate(${c.x},${c.y})` },
    h("rect", { x: -12, y: -12, width: c.w + 24, height: c.h + 24, rx: 8, className: "sy-screen" }),
    h("path", { d, className: "sy-trace" }),
  );
}

function curve(c, i) {
  // A resonant low-pass: flat, a peak at the cutoff, then a roll-off.
  const d = `M 0 ${c.h * 0.55} L ${c.w * 0.4} ${c.h * 0.5} L ${c.w * 0.55} ${c.h * 0.12} `
    + `Q ${c.w * 0.62} ${c.h * 0.02} ${c.w * 0.7} ${c.h * 0.5} L ${c.w} ${c.h}`;
  return h(
    "g",
    { key: `c${i}`, transform: `translate(${c.x},${c.y})` },
    h("rect", { x: -12, y: -12, width: c.w + 24, height: c.h + 24, rx: 8, className: "sy-screen" }),
    h("path", { d, className: "sy-trace" }),
  );
}

function steps(c, i) {
  const on = new Set(c.on);
  const gap = c.w / c.count;
  const cell = gap - 10;
  return h(
    "g",
    { key: `st${i}`, transform: `translate(${c.x},${c.y})` },
    Array.from({ length: c.count }, (_, s) =>
      h("rect", {
        key: s,
        x: s * gap,
        y: 0,
        width: cell,
        height: 62,
        rx: 6,
        className: on.has(s) ? "sy-step sy-step-on" : "sy-step",
      }),
    ),
  );
}

function vu(c, i) {
  const bars = 9;
  const gap = c.w / bars;
  return h(
    "g",
    { key: `vu${i}`, transform: `translate(${c.x},${c.y})` },
    Array.from({ length: bars }, (_, b) => {
      const level = Math.max(0.15, 1 - b / bars - 0.05 * ((b % 2)));
      const hgt = c.h * level;
      return h("rect", {
        key: b,
        x: b * gap,
        y: c.h - hgt,
        width: gap - 8,
        height: hgt,
        rx: 3,
        className: b > bars - 3 ? "sy-vu sy-vu-hot" : "sy-vu",
      });
    }),
  );
}

function jacks(c, i) {
  const cols = 3;
  const gx = c.w / cols;
  const gy = c.h / Math.ceil(c.count / cols);
  return h(
    "g",
    { key: `j${i}`, transform: `translate(${c.x},${c.y})` },
    Array.from({ length: c.count }, (_, j) =>
      h(
        "g",
        { key: j, transform: `translate(${(j % cols) * gx + gx / 2},${Math.floor(j / cols) * gy + gy / 2})` },
        h("circle", { r: 30, className: "sy-jack-ring" }),
        h("circle", { r: 13, className: "sy-jack" }),
      ),
    ),
  );
}

function led(c, i) {
  return h(
    "g",
    { key: `l${i}`, transform: `translate(${c.x},${c.y})` },
    h("circle", { r: 12, className: c.on ? "sy-led sy-led-on" : "sy-led" }),
    h("text", { x: 26, y: 6, className: "sy-label sy-label-left" }, c.label),
  );
}

const RENDER = { knob, slider, wave, curve, steps, vu, jacks, led };

export function Synth() {
  return h(
    "svg",
    { className: "sy-panel", viewBox: `0 0 ${WORLD.w} ${WORLD.h}`, width: WORLD.w, height: WORLD.h, ariaHidden: "true" },
    h("rect", { x: 20, y: 20, width: WORLD.w - 40, height: WORLD.h - 40, rx: 28, className: "sy-base" }),
    h("text", { x: WORLD.w - 70, y: 84, className: "sy-brand", style: { textAnchor: "end" } }, PANEL.brand),
    h("text", { x: WORLD.w - 70, y: 108, className: "sy-model", style: { textAnchor: "end" } }, PANEL.model),
    MODULES.map((m) =>
      h(
        "g",
        { key: m.id, transform: `translate(${m.x},${m.y})` },
        h("rect", { x: 0, y: 0, width: m.w, height: m.h, rx: 18, className: "sy-module" }),
        h("rect", { x: 0, y: 0, width: m.w, height: 8, rx: 4, style: { fill: m.accent } }),
        h("text", { x: 26, y: 58, className: "sy-module-name", style: { fill: m.accent } }, m.name),
        m.controls.map((c, i) => RENDER[c.type](c, i)),
      ),
    ),
  );
}
