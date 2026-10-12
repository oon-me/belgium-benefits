import { getContent } from "../i18n.js";
import { resolveCommune } from "../data/communes.js";

// The single source of truth for "does this benefit apply to this person?".
// scripts/check-data.mjs imports this too, so the validation exercises the same rules the UI uses.

// Communes are compared by NIS code, never by name: benefits.json names them in whichever
// language its source used, and a French speaker in "La Calamine" must still match an entry
// that says "Kelmis".
const nisOf = (value) => resolveCommune(value)?.nis || null;

export function matchesBenefit(b, { region, commune, category, situations = [], query, lang = "en", fund = null } = {}) {
  const userNis = nisOf(commune);

  // "Federal" means available anywhere in Belgium, so it matches every region.
  if (region && !b.region.includes("Federal") && !b.region.includes(region)) return false;
  // An empty communes list means the benefit is region-wide.
  if (userNis && b.communes.length > 0 && !b.communes.some((c) => nisOf(c) === userNis)) return false;
  // Some region-wide benefits carve out specific communes (id 7 excludes the German-speaking
  // Community). Optional field — absent on every other entry.
  if (userNis && b.excluded_communes?.some((c) => nisOf(c) === userNis)) return false;
  // A health fund's own extras only apply to its members, so they stay hidden until the person
  // has said which fund they are with.
  if (b.health_funds && !(fund && b.health_funds.includes(fund))) return false;
  if (category && b.category !== category) return false;
  if (situations.length > 0 && !b.situations.some((s) => situations.includes(s))) return false;
  if (query) {
    const q = query.toLowerCase();
    const content = getContent(b, lang);
    const haystack = [content.title, content.desc, b.institution].join(" ").toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export function filterBenefits(benefits, criteria) {
  return benefits.filter((b) => matchesBenefit(b, criteria));
}
