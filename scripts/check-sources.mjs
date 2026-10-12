// Fetches every benefit's official source page and checks whether the euro figures we publish
// still appear on it. Run with: npm run check:sources
//
// A page hash would flag every cookie-banner tweak; matching the amounts we actually claim is
// the signal that matters. Belgian benefit amounts are indexed several times a year, so an
// amount that has silently vanished from its own source page is the thing to catch.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import benefits from "../src/data/benefits.json" with { type: "json" };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(root, "data", "source-baseline.json");
const LANGS = ["en", "nl", "fr", "de"];
const TIMEOUT_MS = 25000;
const DELAY_MS = 1200; // be polite to government servers

const only = process.argv.includes("--id")
  ? String(process.argv[process.argv.indexOf("--id") + 1])
  : null;

/**
 * Parses a number written in either convention: "1,310.75" (en) or "1.310,75" (be/nl/fr/de).
 * Decides by the last separator — 1-2 trailing digits means it is a decimal point, 3 means
 * it was a thousands separator.
 */
function parseAmount(raw) {
  const cleaned = raw.replace(/\s/g, "");
  const lastSep = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
  if (lastSep === -1) return Number(cleaned);
  const tail = cleaned.slice(lastSep + 1);
  if (/^\d{1,2}$/.test(tail)) {
    return Number(cleaned.slice(0, lastSep).replace(/[.,]/g, "") + "." + tail);
  }
  return Number(cleaned.replace(/[.,]/g, ""));
}

// Only numbers actually attached to a currency marker — this skips things like "(1–4)".
const NUM = "\\d{1,3}(?:[.,\\s]\\d{3})*(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?";
function extractAmounts(text) {
  const found = new Set();
  const patterns = [
    new RegExp(`€\\s*(${NUM})`, "g"),
    new RegExp(`(${NUM})\\s*€`, "g"),
    new RegExp(`(${NUM})\\s*(?:EUR|euro)`, "gi"),
  ];
  // "entre 90 et 6 000 euros": the currency sign belongs to both ends of the range.
  const range = new RegExp(`(${NUM})\\s*(?:et|en|and|und|à|tot|bis|-|–)\\s*(?:${NUM})\\s*(?:€|EUR|euro)`, "gi");
  for (const m of text.matchAll(range)) {
    const value = parseAmount(m[1]);
    if (Number.isFinite(value) && value >= 10) found.add(Math.round(value * 100) / 100);
  }
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const value = parseAmount(m[1]);
      // Below 10 is nearly always a percentage, a count or a footnote marker.
      if (Number.isFinite(value) && value >= 10) found.add(Math.round(value * 100) / 100);
    }
  }
  return found;
}

// Amount tables often put "EUR" in the column header and bare numbers in the cells. A figure with
// cents ("141,63") appearing bare is still strong evidence; a round one ("20") is not, so only
// figures with cents get this second chance.
function appearsBare(value, text) {
  if (Number.isInteger(value)) return false;
  const [int, cents] = value.toFixed(2).split(".");
  const grouped = (sep) => int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const forms = [`${int},${cents}`, `${int}.${cents}`, `${grouped(".")},${cents}`, `${grouped(",")}.${cents}`, `${grouped(" ")},${cents}`];
  return forms.some((f) => new RegExp(`(?<![\\d.,])${f.replace(/\./g, "\\.")}(?![\\d])`).test(text));
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&euro;/g, "€")
    .replace(/&#8364;/g, "€")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "BelgiumBenefits-SourceCheck/1.0 (+data accuracy monitoring)",
        "Accept-Language": "nl,fr,de,en",
      },
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { text: htmlToText(await res.text()) };
  } catch (err) {
    return { error: err.name === "AbortError" ? "timeout" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

let baseline = {};
try {
  baseline = JSON.parse(await readFile(BASELINE, "utf8"));
} catch {
  /* first run */
}

const targets = benefits.filter((b) => !only || String(b.id) === only);
const results = [];

for (const b of targets) {
  const claimed = new Set();
  for (const lang of LANGS) {
    for (const v of extractAmounts(b.content[lang].amount)) claimed.add(v);
  }

  // The page we link visitors to explains how to apply; some institutions publish the figures on a
  // separate amounts page, so an entry can name that page for this check instead.
  // It may list several pages when a fund family publishes figures per regional fund.
  const urls = [].concat(b.amount_source_url || b.source_url);
  const fetched = [];
  for (const url of urls) {
    fetched.push(await fetchText(url));
    if (urls.length > 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }
  const failed = fetched.find((f) => f.error);
  const error = failed?.error;
  const text = fetched.map((f) => f.text ?? "").join(" ");
  await new Promise((r) => setTimeout(r, DELAY_MS));

  if (error) {
    results.push({ id: b.id, status: "FETCH-FAILED", detail: error, claimed: [...claimed] });
    continue;
  }
  // A page that renders its content with JavaScript comes back nearly empty.
  if (text.length < 600) {
    results.push({ id: b.id, status: "NO-CONTENT", detail: `${text.length} chars`, claimed: [...claimed] });
    continue;
  }

  const onPage = extractAmounts(text);
  const missing = [...claimed].filter((v) => !onPage.has(v) && !appearsBare(v, text));
  const prev = baseline[b.id];

  results.push({
    id: b.id,
    status: claimed.size === 0 ? "NO-AMOUNTS" : missing.length === 0 ? "OK" : missing.length === claimed.size ? "ALL-MISSING" : "PARTIAL",
    claimed: [...claimed],
    missing,
    textLength: text.length,
    changedSinceBaseline: prev ? prev.textLength !== text.length : null,
  });
}

const next = { ...baseline };
for (const r of results) {
  if (r.status === "FETCH-FAILED" || r.status === "NO-CONTENT") continue;
  next[r.id] = { checkedAt: new Date().toISOString(), textLength: r.textLength, claimed: r.claimed };
}
await writeFile(BASELINE, JSON.stringify(next, null, 2) + "\n", "utf8");

const byStatus = (s) => results.filter((r) => r.status === s);
const label = { OK: "ok", PARTIAL: "REVIEW", "ALL-MISSING": "REVIEW", "NO-AMOUNTS": "no amounts", "NO-CONTENT": "unreadable", "FETCH-FAILED": "unreachable" };

console.log(`\nchecked ${results.length} sources\n`);
for (const r of results) {
  const b = benefits.find((x) => x.id === r.id);
  const line = `  [${label[r.status].padEnd(10)}] ${String(r.id).padStart(2)} ${b.institution.slice(0, 42)}`;
  if (r.status === "OK") console.log(line);
  else if (r.status === "FETCH-FAILED" || r.status === "NO-CONTENT") console.log(`${line} — ${r.detail}`);
  else if (r.status === "NO-AMOUNTS") console.log(`${line} — no euro figure published`);
  else console.log(`${line} — not found on page: ${r.missing.map((v) => "€" + v).join(", ")}`);
}

const needsReview = [...byStatus("PARTIAL"), ...byStatus("ALL-MISSING")];
console.log(
  `\n${byStatus("OK").length} ok · ${needsReview.length} to review · ` +
    `${byStatus("NO-CONTENT").length + byStatus("FETCH-FAILED").length} unreachable · ${byStatus("NO-AMOUNTS").length} without figures`
);
console.log("\nThis flags what to look at by hand. It never edits benefits.json.");
