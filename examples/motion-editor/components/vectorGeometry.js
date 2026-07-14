// Geometry shared by the Line/Pencil tools and vector actor rendering.

import { smoothPath } from "./smoothPath.js";

export const isVectorKind = (kind) => kind === "line" || kind === "pencil";

const rounded = (value) => Math.round(value * 10) / 10;

export function vectorActorFromPoints(kind, points, { stroke, strokeWidth }) {
  if (!isVectorKind(kind) || points.length < 2) return null;
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const padding = Math.max(3, Math.ceil(strokeWidth / 2) + 1);
  const x = Math.floor(minX - padding);
  const y = Math.floor(minY - padding);
  const w = Math.max(6, Math.ceil(maxX - minX + padding * 2));
  const h = Math.max(6, Math.ceil(maxY - minY + padding * 2));
  const local = points.map((point) => ({ x: rounded(point.x - x), y: rounded(point.y - y) }));
  const path = kind === "line"
    ? `M ${local[0].x} ${local[0].y} L ${local[local.length - 1].x} ${local[local.length - 1].y}`
    : smoothPath(local);

  return { kind, x, y, w, h, vectorW: w, vectorH: h, fill: "none", stroke, strokeWidth, path };
}
