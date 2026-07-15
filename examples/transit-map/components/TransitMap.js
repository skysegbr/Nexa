// The whole network as one SVG in world space — the content of the "overview"
// frame. Lines are polylines through shared station points; a station on two
// or more lines is drawn as a bigger interchange. Region frames on top are
// transparent camera targets.

import { h } from "/dist/nexa.js";
import { WORLD, NETWORK, STATIONS, LINES } from "../data.js";

const degree = {};
const lineColor = {};
for (const line of LINES) {
  for (const id of line.stops) {
    degree[id] = (degree[id] || 0) + 1;
    if (!lineColor[id]) lineColor[id] = line.color;
  }
}

export function TransitMap() {
  return h(
    "svg",
    { className: "tx-map", viewBox: `0 0 ${WORLD.w} ${WORLD.h}`, width: WORLD.w, height: WORLD.h, ariaHidden: "true" },
    h("rect", { x: 20, y: 20, width: WORLD.w - 40, height: WORLD.h - 40, rx: 28, className: "tx-base" }),
    h("text", { x: WORLD.w - 68, y: 96, className: "tx-brand", style: { textAnchor: "end" } }, NETWORK.name),
    h("text", { x: WORLD.w - 68, y: 122, className: "tx-tagline", style: { textAnchor: "end" } }, NETWORK.tagline),
    LINES.map((line) =>
      h("polyline", {
        key: line.id,
        points: line.stops.map((id) => `${STATIONS[id].x},${STATIONS[id].y}`).join(" "),
        className: "tx-line",
        style: { stroke: line.color },
      }),
    ),
    Object.entries(STATIONS).map(([id, st]) => {
      const inter = (degree[id] || 0) >= 2;
      return h(
        "g",
        { key: id, transform: `translate(${st.x},${st.y})` },
        inter
          ? h("circle", { r: 27, className: "tx-inter-ring" })
          : h("circle", { r: 15, className: "tx-stop-ring", style: { stroke: lineColor[id] } }),
        h("circle", { r: inter ? 14 : 7, className: inter ? "tx-inter" : "tx-stop" }),
        h("text", { x: 0, y: inter ? -42 : -28, className: "tx-name" }, st.name),
      );
    }),
  );
}
