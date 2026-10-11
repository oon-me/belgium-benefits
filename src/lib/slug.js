// Slugs are cosmetic: the id in front is what resolves a benefit, so a stale or
// translated slug in someone's link still lands on the right page (and is redirected to the
// canonical one). That keeps links people already shared working when a title is reworded.

// German transliterates umlauts rather than dropping the diaeresis, so Geburtsprämie becomes
// "geburtspraemie", not "geburtspramie".
const GERMAN = { "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss" };

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (ch) => GERMAN[ch])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip remaining diacritics: é -> e
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function benefitPath(lang, benefit, content) {
  const title = content?.title || benefit.content[lang]?.title || benefit.content.en.title;
  const slug = slugify(title);
  return `/${lang}/benefit/${benefit.id}${slug ? `-${slug}` : ""}`;
}

// Accepts "12", "12-studiebeurs", or a slug from another language.
export function parseBenefitParam(param = "") {
  const match = /^(\d+)(?:-(.*))?$/.exec(param);
  if (!match) return { id: null, slug: null };
  return { id: match[1], slug: match[2] || null };
}
