// Tree mechanics for the editor's front→back preorder layer array.

export function nextLayerId(layers) {
  const used = new Set(layers.map((layer) => layer.id));
  let index = 1;
  while (used.has(`layer-${index}`)) index += 1;
  return `layer-${index}`;
}

export const parentKey = (layer) => layer.parentId || null;

export function layerDescendantIds(layers, id) {
  const descendants = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const layer of layers) {
      if (layer.parentId && descendants.has(layer.parentId) && !descendants.has(layer.id)) {
        descendants.add(layer.id);
        changed = true;
      }
    }
  }
  return descendants;
}

export function preorderLayers(layers) {
  const children = new Map();
  for (const layer of layers) {
    const key = parentKey(layer);
    children.set(key, [...(children.get(key) || []), layer]);
  }
  const ordered = [];
  const visit = (layer) => {
    ordered.push(layer);
    for (const child of children.get(layer.id) || []) visit(child);
  };
  for (const root of children.get(null) || []) visit(root);
  return ordered;
}

export function visibleLayers(layers, flags) {
  const byId = new Map(layers.map((layer) => [layer.id, layer]));
  return layers.filter((layer) => {
    let parent = byId.get(layer.parentId);
    while (parent) {
      if (flags[parent.id]?.collapsed) return false;
      parent = byId.get(parent.parentId);
    }
    return true;
  });
}

export function layerDepth(layers, id) {
  const byId = new Map(layers.map((layer) => [layer.id, layer]));
  let depth = 0;
  let current = byId.get(id);
  while (current?.parentId && depth < layers.length) {
    depth += 1;
    current = byId.get(current.parentId);
  }
  return depth;
}

export function layerSiblingPosition(layers, id) {
  const layer = layers.find((entry) => entry.id === id);
  const siblings = layer ? layers.filter((entry) => parentKey(entry) === parentKey(layer)) : [];
  return { index: siblings.indexOf(layer), count: siblings.length };
}

export function layerHasAncestorType(layers, id, type) {
  const byId = new Map(layers.map((layer) => [layer.id, layer]));
  let current = byId.get(id);
  while (current?.parentId) {
    current = byId.get(current.parentId);
    if (current?.type === type) return true;
  }
  return false;
}

export function resolvedLayerFlags(doc, flags, id) {
  const byId = new Map(doc.layers.map((layer) => [layer.id, layer]));
  const resolved = { ...(flags[id] || {}) };
  let current = byId.get(id);
  while (current?.parentId) {
    current = byId.get(current.parentId);
    const parentFlags = flags[current?.id] || {};
    resolved.hidden ||= parentFlags.hidden;
    resolved.locked ||= parentFlags.locked;
    resolved.outline ||= parentFlags.outline;
  }
  return resolved;
}

// Resolve hidden/locked/outline for EVERY layer in a single memoized pass —
// a child ORs in its parent's ALREADY-resolved flags, so the ancestor chain
// is walked once per layer instead of rebuilt per lookup. Returns a flat
// { [layerId]: flags } map; equivalent to resolvedLayerFlags for each id but
// O(layers) instead of O(layers²) when the caller needs them all.
export function resolveAllLayerFlags(doc, flags) {
  const byId = new Map((doc.layers || []).map((layer) => [layer.id, layer]));
  const cache = {};
  const resolve = (id) => {
    if (id in cache) return cache[id];
    const layer = byId.get(id);
    const own = flags[id] || {};
    const parent = layer?.parentId ? resolve(layer.parentId) : null;
    return (cache[id] = {
      ...own,
      hidden: Boolean(own.hidden) || Boolean(parent?.hidden),
      locked: Boolean(own.locked) || Boolean(parent?.locked),
      outline: Boolean(own.outline) || Boolean(parent?.outline),
    });
  };
  for (const layer of doc.layers || []) resolve(layer.id);
  return cache;
}
