import { Link, useParams } from "react-router-dom";
import { c, displayFont, monoFont } from "../theme.js";
import { useT, getContent, LANGS } from "../i18n.js";
import { categories } from "../constants.js";
import benefits from "../data/benefits.json";
import StampBadge from "../components/StampBadge.jsx";
import { usePageMeta } from "../lib/meta.js";
import { benefitPath } from "../lib/slug.js";

// Every benefit as a plain, prerendered list of links. The personalised results page only exists
// after the onboarding questions, which a search engine never answers, so without this page most
// benefit pages would be reachable through the sitemap alone.
export default function AllBenefits() {
  const { lang } = useParams();
  const t = useT(lang);

  usePageMeta({
    lang,
    title: t("allTitle"),
    description: t("allSub"),
    path: `/${lang}/all`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/all`])),
  });

  return (
    <article>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-5xl px-5 md:px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-4xl mb-3" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {t("allTitle")}
          </h1>
          <p className="text-sm max-w-prose" style={{ color: "#B7C4CE" }}>
            {t("allSub")}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-5 md:px-6 py-6 md:py-8 space-y-8">
        {categories.map((cat) => {
          const items = benefits.filter((b) => b.category === cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id}>
              <h2 className="text-lg mb-3" style={{ color: c.ink, fontFamily: displayFont, fontWeight: 700 }}>
                {cat.emoji} {t("categories")[cat.id]}
              </h2>
              <ul className="rounded-xl border overflow-hidden" style={{ borderColor: c.line, background: "white" }}>
                {items.map((b) => {
                  const bc = getContent(b, lang);
                  return (
                    <li key={b.id} className="border-b last:border-b-0" style={{ borderColor: c.line }}>
                      <Link to={benefitPath(lang, b)} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-[#FBF6EA]">
                        <span className="min-w-0">
                          <span className="text-sm font-semibold" style={{ color: c.ink }}>
                            {bc.title}
                          </span>
                          <span className="block text-[11px]" style={{ color: c.inkSoft }}>
                            {b.institution} · {b.region.join(", ")}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 w-full sm:w-auto sm:max-w-xs justify-between sm:justify-end">
                          {/* The full amount lives on the benefit's own page; two lines are enough to scan. */}
                          <span className="text-xs font-bold line-clamp-2 sm:text-right" style={{ color: c.gold, fontFamily: monoFont }}>
                            {bc.amount}
                          </span>
                          <StampBadge status={b.status} t={t} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </article>
  );
}
