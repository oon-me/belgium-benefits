import { resolveCommune } from "../data/communes.js";

// benefits.json stays the one file people edit, but the app does not ship all of it to everyone:
// the Vite plugin in vite.config.js cuts it into chunks, and a page loads only the chunks it needs.
// Local rights get one chunk per commune, so thousands of them never reach someone living elsewhere.
// scripts/check-data.mjs proves that a place's chunks hold every benefit that matches it.

// The chunk(s) an entry lives in. A multi-region or multi-commune entry is copied into each.
export function chunkKeys(b) {
  if (b.communes.length > 0) return [...new Set(b.communes.map((cm) => `c${resolveCommune(cm).nis}`))];
  if (b.region.includes("Federal")) return ["federal"];
  return b.region.map((r) => r.toLowerCase());
}

// The chunks that can hold a benefit matching this region and commune (see matchesPlace).
export function placeKeys(region, commune) {
  const nis = resolveCommune(commune)?.nis;
  return ["federal", ...(region ? [region.toLowerCase()] : []), ...(nis ? [`c${nis}`] : [])];
}

export function groupByChunk(benefits) {
  const groups = {};
  for (const b of benefits) for (const k of chunkKeys(b)) (groups[k] ??= []).push(b);
  return groups;
}
