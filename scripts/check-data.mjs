// Validates benefits.json against the schema and exercises the matcher over every
// region / commune / situation combination. Run with: npm run check
import benefits from "../src/data/benefits.json" with { type: "json" };
import { communesByRegion, resolveCommune, communeName } from "../src/data/communes.js";
import { matchesBenefit } from "../src/lib/match.js";
import { ageInDays, STALE_AFTER_DAYS } from "../src/lib/freshness.js";

const LANGS = ["en", "nl", "fr", "de"];
const CATEGORIES = new Set(["housing", "family", "health", "employment", "other"]);
const SITUATIONS = new Set(["pregnancy", "job-loss", "buying-home", "renting", "health-issue", "school"]);
const REGIONS = new Set(["Flanders", "Wallonia", "Brussels", "Federal"]);
const REQ_TYPES = new Set(["phone", "card", "id", "doc"]);
const NOTICE_RECHECK_DAYS = 30;

const errors = [];
const warnings = [];


for (const b of benefits) {
  const at = `id ${b.id}`;
  if (!CATEGORIES.has(b.category)) errors.push(`${at}: bad category "${b.category}"`);
  if (!Array.isArray(b.region) || b.region.length === 0) errors.push(`${at}: region must be a non-empty array`);
  for (const r of b.region ?? []) if (!REGIONS.has(r)) errors.push(`${at}: bad region "${r}"`);
  for (const s of b.situations ?? []) if (!SITUATIONS.has(s)) errors.push(`${at}: bad situation "${s}"`);
  if (!["verified", "community"].includes(b.status)) errors.push(`${at}: bad status "${b.status}"`);
  if (b.status === "community" && !b.note) errors.push(`${at}: community entry without a note`);
  if (!/^https:\/\//.test(b.source_url ?? "")) errors.push(`${at}: source_url must be https`);
  if (b.amount_source_url !== undefined && !/^https:\/\//.test(b.amount_source_url)) {
    errors.push(`${at}: amount_source_url must be https`);
  }
  if (!/^\d{1,2} \w{3} \d{4}$/.test(b.verified ?? "")) errors.push(`${at}: verified must be "DD Mon YYYY"`);
  // Amounts are indexed several times a year; an entry nobody has re-checked is a liability.
  const age = ageInDays(b.verified);
  if (age !== null && age >= STALE_AFTER_DAYS) {
    warnings.push(`${at}: last verified ${age} days ago — re-check against ${new URL(b.source_url).hostname}`);
  }

  // A notice describes a change that is announced but not yet law. It goes out of date faster
  // than an amount does — the change passes, is postponed or is dropped — so it gets a shorter fuse.
  if (b.notice) {
    const n = b.notice;
    if (!/^https:\/\//.test(n.source_url ?? "")) errors.push(`${at}: notice.source_url must be https`);
    if (!/^\d{1,2} \w{3} \d{4}$/.test(n.date ?? "")) errors.push(`${at}: notice.date must be "DD Mon YYYY"`);
    for (const L of LANGS) if (!n.text?.[L]?.trim()) errors.push(`${at}: notice missing language "${L}"`);
    const nAge = ageInDays(n.date);
    if (nAge !== null && nAge >= NOTICE_RECHECK_DAYS) {
      warnings.push(`${at}: notice announced ${nAge} days ago — check whether the change passed, moved or was dropped`);
    }
  }

  // A commune name that does not resolve to a real municipality can never be matched, so a
  // typo (the German-speaking names carry umlauts) would silently disable the rule.
  for (const c of b.communes ?? []) {
    if (!resolveCommune(c)) errors.push(`${at}: commune "${c}" does not resolve to a Belgian municipality`);
  }
  for (const c of b.excluded_communes ?? []) {
    const resolved = resolveCommune(c);
    if (!resolved) errors.push(`${at}: excluded commune "${c}" does not resolve to a Belgian municipality`);
    else if (resolved.region !== b.region[0] && !b.region.includes("Federal")) {
      warnings.push(`${at}: excluded commune "${c}" is in ${resolved.region}, benefit is ${b.region.join("/")}`);
    }
    if ((b.communes ?? []).some((x) => resolveCommune(x)?.nis === resolved?.nis)) {
      errors.push(`${at}: "${c}" is both included and excluded`);
    }
  }
  if (b.excluded_communes && b.communes?.length > 0) {
    warnings.push(`${at}: excluded_communes has no effect when communes is non-empty`);
  }

  // All four languages stay in sync.
  for (const L of LANGS) {
    const c = b.content?.[L];
    if (!c) { errors.push(`${at}: missing language "${L}"`); continue; }
    for (const f of ["title", "desc", "deadline", "amount"]) {
      if (!c[f]?.trim()) errors.push(`${at}.${L}: empty "${f}"`);
    }
    if (!c.steps?.length) errors.push(`${at}.${L}: no steps`);
    for (const r of c.requirements ?? []) {
      if (!REQ_TYPES.has(r.type)) errors.push(`${at}.${L}: bad requirement type "${r.type}"`);
    }
  }
  const shape = (L) => JSON.stringify([
    b.content?.[L]?.steps?.length,
    (b.content?.[L]?.requirements ?? []).map((r) => r.type),
  ]);
  if (new Set(LANGS.map(shape)).size > 1) {
    errors.push(`${at}: step count or requirement types differ between languages`);
  }
}

const ids = benefits.map((b) => b.id);
if (new Set(ids).size !== ids.length) errors.push("duplicate ids");

// The matcher is imported, not re-implemented, so this check cannot drift from the app.
const matches = (b, region, commune, situations = []) =>
  matchesBenefit(b, { region, commune, situations });

const reachable = new Set();
const empties = new Map(); // "region + situation" -> communes with no results
for (const [region, communes] of Object.entries(communesByRegion)) {
  for (const cm of communes) {
    const commune = cm.nis;
    const hits = benefits.filter((b) => matches(b, region, commune));
    if (hits.length === 0) errors.push(`no benefits at all for ${region}/${communeName(cm, "en")}`);
    hits.forEach((b) => reachable.add(b.id));
    for (const s of SITUATIONS) {
      if (benefits.filter((b) => matches(b, region, commune, [s])).length === 0) {
        const key = `${region} + ${s}`;
        if (!empties.has(key)) empties.set(key, []);
        empties.get(key).push(communeName(cm, "en"));
      }
    }
  }
}
const unreachable = benefits.filter((b) => !reachable.has(b.id)).map((b) => b.id);
if (unreachable.length) errors.push(`unreachable benefits: ${unreachable.join(", ")}`);

// Empty situation results are content gaps, not code faults — report, don't fail.
// Say which communes, so a gap affecting part of a region is not read as affecting all of it.
for (const [key, communes] of empties) {
  const total = communesByRegion[key.split(" + ")[0]].length;
  const where =
    communes.length === total
      ? `all ${total} communes`
      : communes.length > 6
        ? `${communes.length} communes: ${communes.slice(0, 6).join(", ")}…`
        : communes.join(", ");
  warnings.push(`no results: ${key} (${where})`);
}

console.log(`${benefits.length} benefits — ${benefits.filter((b) => b.status === "verified").length} verified, ${benefits.filter((b) => b.status === "community").length} community`);
for (const w of warnings) console.log(`  warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  ERROR ${e}`);
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`ok — no errors${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);
