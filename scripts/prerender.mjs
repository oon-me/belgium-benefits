// Writes a real HTML file per public route, with the head filled in and the page content
// already rendered. Crawlers and link unfurlers (WhatsApp, Slack, LinkedIn) never run JS, so
// without this step they would only ever see an empty <div id="root">.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { loadEnv } from "vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import benefits from "../src/data/benefits.json" with { type: "json" };
import { LANGS, translations, getContent } from "../src/i18n.js";
import { buildMeta } from "../src/lib/meta.js";
import { benefitPath } from "../src/lib/slug.js";
import { render } from "../dist-ssr/entry-server.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Vite loads .env into import.meta.env for the bundles, but not into process.env for this
// script. Reading it the same way Vite does keeps the prerendered <head> consistent with what
// the client bundle was built with — otherwise canonical/hreflang silently vanish when the
// values live in .env rather than the shell.
const env = { ...loadEnv("production", root, "VITE_"), ...process.env };
const ORIGIN = (env.VITE_SITE_URL || "").replace(/\/$/, "");
const template = await readFile(join(root, "dist", "index.html"), "utf8");

const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function head(m) {
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${esc(m.lang)}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ];
  // Absolute URLs need a real origin; emitting a relative canonical is worse than none.
  if (ORIGIN) {
    tags.push(`<meta property="og:url" content="${esc(m.url)}" />`);
    tags.push(`<link rel="canonical" href="${esc(m.url)}" />`);
    for (const [code, href] of Object.entries(m.alternates)) {
      tags.push(`<link rel="alternate" hreflang="${code}" href="${esc(href)}" />`);
    }
    tags.push(`<link rel="alternate" hreflang="x-default" href="${esc(m.xDefault)}" />`);
    // Tells Google the site's name, so a search for it shows "Belgium Benefits" rather than the
    // bare domain. Google reads it from the home page; it is repeated on each language's home.
    if (m.home) {
      const site = { "@context": "https://schema.org", "@type": "WebSite", name: "Belgium Benefits", alternateName: ["BelgiumBenefits", "belgiumbenefits.be"], url: `${ORIGIN}/` };
      tags.push(`<script type="application/ld+json">${JSON.stringify(site).replace(/</g, "\\u003c")}</script>`);
    }
  }
  return tags.join("\n    ");
}

function page(url, meta) {
  const html = render(url);
  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
    // Drop the template's static head tags; this route supplies its own.
    .replace(/<title>[\s\S]*?<\/title>/, "")
    // [\s\S]*? rather than [^>]* so this still works if the tag wraps across lines —
    // a leftover generic description would outrank the per-page one for crawlers.
    .replace(/<meta\s+name="description"[\s\S]*?>/, "")
    .replace(/<meta\s+property="og:title"[\s\S]*?>/, "")
    .replace(/<meta\s+property="og:description"[\s\S]*?>/, "")
    .replace(/<meta\s+property="og:type"[\s\S]*?>/, "")
    .replace("</head>", `  ${head(meta)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

const homeMeta = (lang, path) => ({
  ...buildMeta({
    lang,
    title: translations[lang].homeTitle,
    home: true,
    description: translations[lang].sub0,
    path,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}`])),
    xDefault: "/",
    origin: ORIGIN,
  }),
  home: true,
});

// The bare domain is what a search for the site's name lands on, so it must be a real page, not
// the empty SPA shell. It carries the English home page (the browser then moves visitors to their
// own language) and is the x-default of the four language homes.
const routes = [{ url: "/", source: "/en", file: "index.html", meta: homeMeta("en", "/") }];
for (const lang of LANGS) {
  const t = (k) => translations[lang][k] ?? translations.en[k];
  routes.push({ url: `/${lang}`, meta: homeMeta(lang, `/${lang}`) });
  routes.push({
    url: `/${lang}/legal`,
    meta: buildMeta({
      lang,
      title: t("legalTitle"),
      description: t("legalNotOfficialBody"),
      path: `/${lang}/legal`,
      alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/legal`])),
      origin: ORIGIN,
    }),
  });
  routes.push({
    url: `/${lang}/submit`,
    meta: buildMeta({
      lang,
      title: t("submitHeadline"),
      description: t("submitSub"),
      path: `/${lang}/submit`,
      alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/submit`])),
      origin: ORIGIN,
    }),
  });
  routes.push({
    url: `/${lang}/all`,
    meta: buildMeta({
      lang,
      title: t("allTitle"),
      description: t("allSub"),
      path: `/${lang}/all`,
      alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/all`])),
      origin: ORIGIN,
    }),
  });
  routes.push({
    url: `/${lang}/health-funds`,
    meta: buildMeta({
      lang,
      title: t("compareTitle"),
      description: t("compareSub"),
      path: `/${lang}/health-funds`,
      alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/health-funds`])),
      origin: ORIGIN,
    }),
  });
  for (const b of benefits) {
    const bc = getContent(b, lang);
    const path = benefitPath(lang, b);
    routes.push({
      url: path,
      meta: buildMeta({
        lang,
        title: bc.title,
        description: bc.desc,
        path,
        alternates: Object.fromEntries(LANGS.map((l) => [l, benefitPath(l, b)])),
        origin: ORIGIN,
      }),
    });
  }
}

let written = 0;
for (const route of routes) {
  // `/nl/legal` is written as `nl/legal.html`, not `nl/legal/index.html`. Cloudflare Pages serves
  // a matching .html file directly, but answers a folder's index.html with a 308 to `/nl/legal/` —
  // which would make every canonical, hreflang and sitemap URL point at a redirect.
  const out = join(root, "dist", route.file || `${route.url}.html`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page(route.source || route.url, route.meta), "utf8");
  written++;
}

// index.html is now the real home page, so the interactive routes (see public/_redirects) get
// the untouched shell under its own name.
await writeFile(join(root, "dist", "spa.html"), template, "utf8");

// sitemap.xml only makes sense with a real origin.
if (ORIGIN) {
  const urls = routes
    .map((r) => `  <url><loc>${esc(ORIGIN + r.url)}</loc></url>`)
    .join("\n");
  await writeFile(
    join(root, "dist", "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    "utf8"
  );
  await writeFile(join(root, "dist", "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`, "utf8");
}

// A published site needs an identifiable publisher; say so loudly at build time rather than
// shipping a legal page that admits it is unconfigured.
if (!env.VITE_PUBLISHER_NAME || !env.VITE_CONTACT_EMAIL) {
  console.warn(
    "WARNING: VITE_PUBLISHER_NAME / VITE_CONTACT_EMAIL are not set — the legal page will say publisher details are missing. Set both before publishing."
  );
}

console.log(`prerendered ${written} pages${ORIGIN ? " + sitemap.xml + robots.txt" : " (no VITE_SITE_URL — canonical, hreflang and sitemap skipped)"}`);
