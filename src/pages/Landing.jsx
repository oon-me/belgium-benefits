import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { c, displayFont } from "../theme.js";
import { useT, translations, langOptions, LANGS } from "../i18n.js";
import { loadPrefs } from "../lib/prefs.js";
import { usePageMeta } from "../lib/meta.js";
import { communeName } from "../data/communes.js";

export default function Landing() {
  const { lang } = useParams();
  const t = useT(lang);
  usePageMeta({
    lang,
    title: t("homeTitle"),
    home: true,
    description: t("sub0"),
    path: `/${lang}`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}`])),
    xDefault: "/",
  });
  const prefs = loadPrefs();
  const hasPrefs = prefs.region && prefs.commune;

  return (
    <section style={{ background: c.ink }} className="min-h-[calc(100vh-3.5rem)] flex items-center">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 whitespace-pre-line"
            style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}
          >
            {t("headline0")}
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-prose" style={{ color: "#B7C4CE" }}>
            {t("sub0")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/${lang}/start/location`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm"
              style={{ background: c.gold, color: c.ink }}
            >
              {t("getStarted")} <ChevronRight size={16} />
            </Link>
            <Link
              to={`/${lang}/all`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm border"
              style={{ borderColor: "#3A4A57", color: "#D7DEE3" }}
            >
              {t("allCta")}
            </Link>
            {hasPrefs && (
              <Link
                to={`/${lang}/benefits`}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm border"
                style={{ borderColor: "#3A4A57", color: "#D7DEE3" }}
              >
                {t("yourBenefits")} · {communeName(prefs.commune, lang)}
              </Link>
            )}
          </div>
        </div>

        <div className="md:justify-self-end">
          <div className="flex flex-wrap gap-2 max-w-sm">
            {langOptions.map((l) => (
              <Link
                key={l.id}
                to={`/${l.id}`}
                replace
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold border"
                style={{
                  borderColor: lang === l.id ? c.gold : "#3A4A57",
                  background: lang === l.id ? "rgba(184,134,59,0.18)" : "transparent",
                  color: lang === l.id ? c.gold : "#B7C4CE",
                }}
              >
                <span>{l.flag}</span> {translations[l.id].langLabel}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
