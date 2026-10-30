import { useEffect, useState } from "react";
import { index, loaders } from "virtual:benefits";
import { groupByChunk, placeKeys } from "./chunks.js";
import { parseBenefitParam } from "./slug.js";
import { loadPrefs } from "./prefs.js";

// Loaded chunks, by key. The prerender seeds every chunk up front (seed), so server rendering
// stays synchronous; in the browser chunks arrive on demand.
const cache = new Map();

export const allKeys = Object.keys(loaders);
export const regionKeys = ["flanders", "wallonia", "brussels"];
export const keysForId = (id) => (index[id] ? [index[id]] : []);
export { placeKeys };

export function seed(benefits) {
  for (const [k, list] of Object.entries(groupByChunk(benefits))) cache.set(k, list);
}

// A commune with no local entries has no chunk; it simply contributes nothing.
const known = (keys) => keys.filter((k) => k in loaders);

export function loadKeys(keys) {
  return Promise.all(known(keys).filter((k) => !cache.has(k)).map((k) => loaders[k]().then((m) => cache.set(k, m.default))));
}

// The benefits in these chunks in benefits.json order (by id), each once, or null until loaded.
// Kept per key set, so a page gets the same array on every render and its useMemo holds.
const merged = new Map();
function read(keys) {
  const ks = known(keys);
  if (!ks.every((k) => cache.has(k))) return null;
  const sig = ks.join(",");
  if (!merged.has(sig)) {
    const byId = new Map();
    for (const k of ks) for (const b of cache.get(k)) byId.set(b.id, b);
    merged.set(sig, [...byId.values()].sort((a, b) => a.id - b.id));
  }
  return merged.get(sig);
}

// Returns { benefits, failed }: benefits is null while loading.
export function useBenefits(keys) {
  const sig = keys.join(",");
  const [, rerender] = useState(0);
  const [failed, setFailed] = useState(false);
  const benefits = read(keys);
  useEffect(() => {
    if (benefits) return;
    let live = true;
    loadKeys(keys).then(
      () => live && rerender((n) => n + 1),
      () => live && setFailed(true),
    );
    return () => { live = false; };
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  return { benefits, failed };
}

// The chunks the page at this URL needs, so main.jsx can fetch them before the first render and
// the prerendered HTML stays on screen instead of flashing a loading state.
export function keysForRoute(pathname, search) {
  const [, , page, param] = pathname.split("/");
  if (page === "benefit") return keysForId(parseBenefitParam(param ?? "").id);
  if (page === "benefits") {
    const q = new URLSearchParams(search);
    const prefs = loadPrefs();
    return placeKeys(q.get("region") || prefs.region, q.get("commune") || prefs.commune);
  }
  if (page === "all" || page === "search") return allKeys;
  if (page === "health-funds") return regionKeys;
  return [];
}
