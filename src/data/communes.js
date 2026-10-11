import data from "./communes.json" with { type: "json" };

// All 565 Belgian municipalities as of 1 Jan 2025, from Statbel's official REFNIS dataset
// (https://statbel.fgov.be/en/open-data/code-refnis-0). The count reflects the Flemish
// mergers of 2019 and 2025 — do not hand-edit this list; regenerate it from the source.
export const communes = data;

export const regions = ["Flanders", "Wallonia", "Brussels"];

// The nine German-speaking municipalities are legally part of the Walloon Region.
export const germanSpeakingCommunes = [
  "63023", "63040", "63048", "63061", "63001", "63012", "63087", "63013", "63067",
];

const byNis = new Map(data.map((c) => [c.nis, c]));
const byName = new Map();
for (const c of data) {
  for (const lang of ["nl", "fr", "de"]) {
    const key = c[lang].trim().toLowerCase();
    // First writer wins; a name shared by two municipalities would be a data error worth
    // seeing rather than silently resolving to the wrong one.
    if (!byName.has(key)) byName.set(key, c);
  }
}

/**
 * Accepts a NIS code or a municipality name in any of the three official languages, so
 * benefits.json can keep naming communes in whichever language its source used
 * ("Kelmis" and "La Calamine" resolve to the same place).
 */
export function resolveCommune(value) {
  if (!value) return null;
  const key = String(value).trim();
  return byNis.get(key) || byName.get(key.toLowerCase()) || null;
}

export function communeName(commune, lang = "en") {
  const c = typeof commune === "string" ? resolveCommune(commune) : commune;
  if (!c) return "";
  // Statbel publishes nl/fr/de only. English uses the local official name rather than
  // inventing exonyms for a handful of cities and not the rest.
  if (lang === "en") return c.region === "Flanders" ? c.nl : c.fr;
  return c[lang] || c.nl;
}

export const communesByRegion = {
  Flanders: data.filter((c) => c.region === "Flanders"),
  Wallonia: data.filter((c) => c.region === "Wallonia"),
  Brussels: data.filter((c) => c.region === "Brussels"),
};

export function sortedCommunes(region, lang) {
  return [...(communesByRegion[region] || [])].sort((a, b) =>
    communeName(a, lang).localeCompare(communeName(b, lang), lang)
  );
}
