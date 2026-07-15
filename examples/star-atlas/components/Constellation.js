// One constellation as an SVG floating on the transparent frame: faint lines
// between the stars, then each star as a blurred halo + a bright core (so the
// glow costs no per-element filter on the core), and a small label for the
// named stars. Decorative — the active name is announced by ZoomStage's
// aria-live region and shown in the InfoPanel.

import { h } from "/dist/nexa.js";

export function Constellation({ data }) {
  const { w, h: height, stars, lines } = data;
  return h(
    "svg",
    { className: "sa-constellation", viewBox: `0 0 ${w} ${height}`, width: w, height, ariaHidden: "true" },
    lines.map(([a, b], i) =>
      h("line", {
        key: `l${i}`,
        x1: stars[a].x,
        y1: stars[a].y,
        x2: stars[b].x,
        y2: stars[b].y,
        className: "sa-line",
      }),
    ),
    stars.flatMap((s, i) => {
      const paint = s.color ? { fill: s.color } : undefined;
      return [
        h("circle", { key: `h${i}`, cx: s.x, cy: s.y, r: s.m * 2.7, className: "sa-halo", style: paint }),
        h("circle", { key: `c${i}`, cx: s.x, cy: s.y, r: s.m, className: "sa-core", style: paint }),
        s.name
          ? h("text", { key: `t${i}`, x: s.x + s.m + 12, y: s.y + 6, className: "sa-starname" }, s.name)
          : null,
      ];
    }),
  );
}
