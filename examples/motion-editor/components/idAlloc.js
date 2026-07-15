// The single id allocator behind nextLayerId / nextSceneId / nextSymbolId and
// the schema normalizers: the lowest-numbered `${prefix}-N` (N ≥ 1) not already
// in `used`, so no two id-bearing entities can drift their own numbering.
export function uniqueId(used, prefix) {
  let index = 1;
  while (used.has(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}
