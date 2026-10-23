// Where the "Request now" button goes. `source_url` explains a benefit; `request_url` is the page
// where you actually apply (a form, a portal, the payer's own page). Either field may be a plain
// URL or a per-language map ({ nl, fr, de, en }), because some forms exist only per language.
//
// `request_by_fund` covers benefits paid through the health fund (maternity pay, birth leave):
// each union has a Dutch-speaking and a French-speaking side with different sites, so it maps
// fund → { nl, fr }. Funds without a verified page are simply absent and fall back to request_url.

export function pickLang(value, lang) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? value.nl ?? value.fr ?? value.de ?? null;
}

// Which side of a union serves this person: their page language when it is nl or fr, otherwise
// their region. Brussels has both; German speakers in East Belgium are served by the French side.
export function fundSide(lang, region) {
  if (lang === "nl" || lang === "fr") return lang;
  if (region === "Flanders") return "nl";
  if (region === "Brussels" && lang === "en") return "nl";
  return "fr";
}

export function fundRequestUrl(benefit, fund, lang, region) {
  const byFund = benefit.request_by_fund?.[fund];
  if (!byFund) return null;
  const side = fundSide(lang, region);
  // No cross-side fallback: sending a French speaker to the Dutch-language site is no help.
  return byFund[side] ?? null;
}

// Every fund that has its own request page for this benefit, for the person who has not said
// which fund they are with.
export function fundRequestLinks(benefit, lang, region) {
  return Object.keys(benefit.request_by_fund ?? {})
    .map((fund) => ({ fund, url: fundRequestUrl(benefit, fund, lang, region) }))
    .filter((l) => l.url);
}
