import { LANGS, translations } from "../i18n.js";
import { resolveCommune } from "../data/communes.js";

// Free-text search over benefits. People type the way they speak, in any of the four languages,
// with typos and half-finished words, so a literal substring match finds too little. Rules:
// - case and accents never matter ("chomage" finds "chômage");
// - every word of the query must match somewhere (each word narrows the results);
// - a word matches a whole word, the start of a word (results while typing), a part of a Dutch
//   or German compound ("premie" finds "huurpremie"), or a word one or two typos away;
// - every language of an entry is searched, plus everyday synonyms ("child benefit" finds the
//   Groeipakket, "OCMW" finds the leefloon);
// - matches in the title count most, then the institution and place, then the description.

export const normalize = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const words = (s) => normalize(s).split(" ").filter(Boolean);

// Little words that say nothing about a benefit, in the four languages.
const STOP = new Set(
  ("the a an for of to in and or my i with on at is how can get what me " +
    "de het een voor van en of in op met mijn ik te bij hoe wat " +
    "le la les un une des du pour et ou en au aux mon ma mes je d l est " +
    "der die das ein eine fur und oder im mit mein ich zu von wie was").split(" ")
);

// Everyday words people search for, mapped to the words entries actually use. One line per
// idea; any word on a line finds the others.
const SYNONYMS = [
  "kinderbijslag groeipakket gezinsbijslag allocations familiales kindergeld childbenefit",
  "geboorte geboren naissance geburt birth baby bebe startbedrag kraamgeld geboortepremie geburtspramie",
  "zwanger zwangerschap verwacht verwachten pregnant pregnancy expecting grossesse enceinte attendez schwanger schwangerschaft erwarten",
  "adoptie adoption adopteren adopter adoptieren",
  "huur huren huurder rent rental renting loyer locataire louer miete mieten mieter",
  "werkloos werkloosheid unemployment unemployed jobless chomage chomeur arbeitslos arbeitslosigkeit",
  "studie student studeren studietoelage study studies scholarship etudes etudiant bourse studienbeihilfe studium",
  "leefloon ocmw cpas oshz integration integratie welfare bijstand assistance eingliederungseinkommen",
  "handicap disability disabled beperking behinderung invalide",
  "mantelzorg mantelzorger carer caregiver aidant pflege pflegende",
  "zorg care soins thuiszorg",
  "renovatie renoveren verbouwen verbouwing renovation renover renovierung renovieren",
  "isolatie isolation insulation dammung warmtepomp pompe heatpump warmepumpe",
  "kopen koop buy buying achat acheter kaufen kauf",
  "lening loan pret darlehen hypotheek mortgage hypothecaire",
  "moederschap moederschapsrust maternity maternite mutterschaft bevallingsverlof",
  "luiers luier nappies nappy diapers diaper langes lange windeln windel",
  "vuilzakken huisvuilzakken vuilniszakken restafval waste bags sacs poubelle mullsacke",
  "incontinentie incontinence inkontinenz stoma dialyse dialysis",
  "vrijetijd vrije tijd leisure loisirs freizeit uitpas sport",
  "ziekenfonds mutualiteit mutualite mutuelle krankenkasse insurance",
  "palliatief palliative palliatif palliativ",
  "vaccin vaccinatie vaccination vaccins impfung impfungen checkup consultatie consultation",
  "opleiding opleidingsverlof training formation bildungsurlaub conge education",
  "bedrijfswagen company car voiture societe firmenwagen mobiliteitsbudget mobility",
  "bril brillen glasses lunettes brille lenzen lenses lentilles",
  "ketel boiler chaudiere heizkessel verwarming heating chauffage heizung",
];
const SYN = new Map();
for (const line of SYNONYMS) {
  const ws = words(line);
  for (const w of ws) SYN.set(w, [...new Set([...(SYN.get(w) ?? []), ...ws.filter((x) => x !== w)])]);
}

// Optimal string alignment distance, giving up once it passes `max`.
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2 = new Array(b.length + 1);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j];
    prev = cur;
  }
  return prev[b.length];
}

// Short words get no typo allowance: "rent" must not find "reno…".
const typoBudget = (q) => (q.length >= 9 ? 2 : q.length >= 5 ? 1 : 0);

// How well one query word matches one word of the entry, 0 to 1.
function wordMatchRaw(q, w) {
  if (w === q) return 1;
  if (q.length === 1) return 0;
  if (w.startsWith(q)) return 0.85;
  if (q.length >= 4 && w.includes(q)) return 0.7;
  const max = typoBudget(q);
  if (max === 0) return 0;
  if (distance(q, w, max) <= max) return 0.6;
  // A typo in a half-typed or longer word: compare with the start of the entry's word, allowing
  // for a missing or extra letter ("werkloshied" → "werkloosheidsuitkering").
  for (const n of [q.length, q.length + 1, q.length - 1]) {
    if (w.length > n && n >= 5 && distance(q, w.slice(0, n), max) <= max) return 0.5;
  }
  return 0;
}

// The same word pairs come up for every entry and every keystroke, so remember them.
const memo = new Map();
function wordMatch(q, w) {
  const key = q + "|" + w;
  let v = memo.get(key);
  if (v === undefined) {
    if (memo.size > 300000) memo.clear();
    v = wordMatchRaw(q, w);
    memo.set(key, v);
  }
  return v;
}

const WEIGHTS = { title: 3, institution: 2.5, place: 2, tags: 2, desc: 1, conditions: 0.6, amount: 0.4 };
const REGION_NAMES = {
  Flanders: "Flanders Vlaanderen Flandre Flandern",
  Wallonia: "Wallonia Wallonie Wallonien",
  Brussels: "Brussels Brussel Bruxelles Brüssel",
  Federal: "Belgium België Belgique Belgien federal federaal fédéral",
};

// Unique words per field for one entry, built once.
const cache = new WeakMap();
function fieldsOf(b) {
  if (cache.has(b)) return cache.get(b);
  const all = (pick) => LANGS.map((l) => pick(b.content[l] ?? b.content.en, l)).join(" ");
  const communes = (b.communes ?? []).map((c) => {
    const cm = resolveCommune(c);
    return cm ? [cm.nl, cm.fr, cm.de].join(" ") : c;
  });
  const tags = LANGS.map((l) => {
    const t = translations[l];
    return [t.categories?.[b.category], ...b.situations.map((s) => t.situations?.[s])].join(" ");
  }).join(" ");
  const raw = {
    title: all((c) => c.title),
    institution: b.institution,
    place: [...b.region.map((r) => REGION_NAMES[r] ?? r), ...communes].join(" "),
    tags,
    desc: all((c) => c.desc),
    conditions: LANGS.map((l) => [
      ...(b.eligibility?.conditions?.[l] ?? []),
      ...Object.values(b.eligibility?.statuses ?? {}).map((r) => r.text?.[l] ?? ""),
    ].join(" ")).join(" "),
    amount: all((c) => c.amount),
  };
  const f = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, [...new Set(words(v))]]));
  f.titleText = LANGS.map((l) => normalize((b.content[l] ?? b.content.en).title));
  cache.set(b, f);
  return f;
}

// The words a query word stands for: itself, its synonyms, and while typing, the synonyms of any
// word it is the start of ("kinderbij…" → groeipakket, kindergeld…).
const altsCache = new Map();
function altsOf(q) {
  if (altsCache.has(q)) return altsCache.get(q);
  const alts = new Map([[q, 1]]);
  for (const s of SYN.get(q) ?? []) alts.set(s, Math.max(alts.get(s) ?? 0, 0.9));
  if (q.length >= 4 && !SYN.has(q)) {
    for (const [k, list] of SYN) {
      if (!k.startsWith(q)) continue;
      for (const s of [k, ...list]) if (!alts.has(s)) alts.set(s, 0.8);
    }
  }
  const out = [...alts];
  altsCache.set(q, out);
  return out;
}

// Quality of a query word against one word of an entry, synonyms included, remembered.
const pairMemo = new Map();
function quality(q, w) {
  const key = q + "|" + w;
  let v = pairMemo.get(key);
  if (v === undefined) {
    if (pairMemo.size > 400000) pairMemo.clear();
    v = 0;
    for (const [a, factor] of altsOf(q)) {
      const m = wordMatch(a, w) * factor;
      if (m > v) v = m;
      if (v === 1) break;
    }
    pairMemo.set(key, v);
  }
  return v;
}

// Best score of one query word in an entry.
function wordScore(f, q) {
  let best = 0;
  for (const [field, weight] of Object.entries(WEIGHTS)) {
    if (weight <= best) continue;
    for (const w of f[field]) {
      const m = quality(q, w) * weight;
      if (m > best) best = m;
    }
  }
  return best;
}

export function queryWords(query) {
  const ws = words(query);
  const meaningful = ws.filter((w) => !STOP.has(w));
  return meaningful.length ? meaningful : ws;
}

// { score, matched, total } for one entry. matched === total means every word was found.
export function scoreBenefit(b, query) {
  const qs = queryWords(query);
  if (!qs.length) return { score: 0, matched: 0, total: 0 };
  const f = fieldsOf(b);
  let score = 0;
  let matched = 0;
  for (const q of qs) {
    const s = wordScore(f, q);
    if (s > 0) matched++;
    score += s;
  }
  // The whole phrase in a title, in any language, is the strongest signal.
  const phrase = normalize(query);
  if (phrase.length >= 3 && f.titleText.some((t) => t.includes(phrase))) score += 4;
  return { score, matched, total: qs.length };
}

export const matchesQuery = (b, query) => {
  const r = scoreBenefit(b, query);
  return r.total === 0 || r.matched === r.total;
};

// Ranked results. When no entry has every word, the closest ones come back with partial: true.
export function searchBenefits(benefits, query) {
  const scored = benefits
    .map((b) => ({ b, ...scoreBenefit(b, query) }))
    .filter((r) => r.matched > 0);
  const full = scored.filter((r) => r.matched === r.total).sort((x, y) => y.score - x.score);
  // Weak matches (a word found only in a long description) are dropped when much better ones
  // exist, so the list is what was asked for, not everything that mentions it.
  const cut = full.length ? full[0].score * 0.25 : 0;
  if (full.length) return { results: full.filter((r) => r.score >= cut).map((r) => r.b), partial: false };
  const near = scored.sort((x, y) => y.matched - x.matched || y.score - x.score).slice(0, 10);
  return { results: near.map((r) => r.b), partial: near.length > 0 };
}
