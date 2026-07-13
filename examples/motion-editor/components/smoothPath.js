// Catmull-Rom → cubic bézier: turns clicked points into the smooth curve
// Flash's motion guides were drawn as.

// Recovers the on-curve anchor points from a path smoothPath() generated:
// the M point plus every C endpoint (or the L endpoint for two-point
// guides). This is what makes existing guides editable without storing any
// editor metadata on the keyframe.
export function pathAnchors(d) {
  const numbers = (d.match(new RegExp("-?\\d+(?:\\.\\d+)?", "g")) || []).map(Number);
  const pairs = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    pairs.push({ x: numbers[i], y: numbers[i + 1] });
  }
  if (pairs.length === 0) return [];
  if (!d.includes("C")) return pairs; // "M x y L x y"

  const anchors = [pairs[0]];
  for (let i = 3; i < pairs.length; i += 3) {
    anchors.push(pairs[i]); // each cubic segment's endpoint
  }
  return anchors;
}

export function smoothPath(points) {
  const r = (value) => Math.round(value * 10) / 10;
  if (points.length === 2) {
    return `M ${r(points[0].x)} ${r(points[0].y)} L ${r(points[1].x)} ${r(points[1].y)}`;
  }

  let d = `M ${r(points[0].x)} ${r(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}
