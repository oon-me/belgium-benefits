import { useEffect } from "react";
import { LANGS } from "../i18n.js";

// Set VITE_SITE_URL at build time so canonical and og:url are absolute — relative URLs are
// ignored by most link unfurlers.
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || "").replace(/\/$/, "");

/**
 * Pure description of a page's head. Used twice: applied to the live DOM by usePageMeta, and
 * rendered into static HTML by scripts/prerender.mjs. One function, so the crawler's view and
 * the browser's view cannot drift apart.
 */
// The language homes. English lives at the bare domain: Google merged /en into / (same page), so
// / is the English home's one address, and /en points to it as canonical.
export const homePath = (lang) => (lang === "en" ? "/" : `/${lang}`);
export const homeAlternates = () => Object.fromEntries(LANGS.map((l) => [l, homePath(l)]));

export function buildMeta({ lang, title, description, path, alternates, xDefault, home = false, origin = "" }) {
  // Home pages lead with the name, so a search for "Belgium Benefits" matches the start of the title.
  const fullTitle = !title ? "Belgium Benefits" : home ? `Belgium Benefits · ${title}` : `${title} · Belgium Benefits`;
  const map = alternates || Object.fromEntries(LANGS.map((l) => [l, `/${l}`]));
  return {
    lang,
    title: fullTitle,
    description: description || "",
    url: origin + (path || ""),
    alternates: Object.fromEntries(Object.entries(map).map(([k, v]) => [k, origin + v])),
    xDefault: origin + (xDefault || map.en || "/en"),
  };
}

function upsert(selector, tag, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function meta(key, name, value) {
  if (!value) return;
  upsert(`meta[${key}="${name}"]`, "meta", { [key]: name, content: value });
}

export function usePageMeta(options) {
  const { lang, title, description, path } = options;
  const alternatesKey = JSON.stringify(options.alternates || null);

  useEffect(() => {
    const origin = SITE_URL || window.location.origin;
    const m = buildMeta({ ...options, origin, path: path || window.location.pathname });

    document.documentElement.lang = m.lang;
    document.title = m.title;

    meta("name", "description", m.description);
    meta("property", "og:title", m.title);
    meta("property", "og:description", m.description);
    meta("property", "og:url", m.url);
    meta("property", "og:type", "website");
    meta("property", "og:locale", m.lang);
    meta("name", "twitter:card", "summary");

    upsert('link[rel="canonical"]', "link", { rel: "canonical", href: m.url });

    // Slugs differ per language, so alternates change per page — clear the stale ones first.
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    for (const [code, href] of Object.entries(m.alternates)) {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", code);
      link.setAttribute("href", href);
      document.head.appendChild(link);
    }
    const xd = document.createElement("link");
    xd.setAttribute("rel", "alternate");
    xd.setAttribute("hreflang", "x-default");
    xd.setAttribute("href", m.xDefault);
    document.head.appendChild(xd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, title, description, path, alternatesKey]);
}
