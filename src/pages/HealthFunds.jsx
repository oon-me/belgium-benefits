import { Link, useParams } from "react-router-dom";
import { c, displayFont, monoFont } from "../theme.js";
import { useT, getContent, LANGS } from "../i18n.js";
import { healthFunds } from "../constants.js";
import benefits from "../data/benefits.json";
import { usePageMeta } from "../lib/meta.js";
import { benefitPath } from "../lib/slug.js";

// Side-by-side view of what each health fund gives at a birth. Built from the same verified
// entries the results page shows, so the two can never disagree.
const fundBirthEntries = benefits.filter((b) => b.health_funds && b.situations.includes("pregnancy"));

// Dutch-speaking funds operate in Flanders and Brussels, French-speaking ones in Wallonia and
// Brussels, so the region an entry names besides Brussels decides its column.
const sections = [
  { key: "compareNl", region: "Flanders" },
  { key: "compareFr", region: "Wallonia" },
];

export default function HealthFunds() {
  const { lang } = useParams();
  const t = useT(lang);

  usePageMeta({
    lang,
    title: t("compareTitle"),
    description: t("compareSub"),
    path: `/${lang}/health-funds`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/health-funds`])),
  });

  return (
    <article>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-4xl px-5 md:px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-4xl mb-3" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {t("compareTitle")}
          </h1>
          <p className="text-sm max-w-prose" style={{ color: "#B7C4CE" }}>
            {t("compareSub")}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 md:px-6 py-6 md:py-8 space-y-8">
        {sections.map((s) => {
          const rows = healthFunds
            .map((f) => ({ fund: f, entry: fundBirthEntries.find((b) => b.health_funds.includes(f.id) && b.region.includes(s.region)) }))
            .filter((r) => r.entry);
          return (
            <section key={s.key}>
              <h2 className="text-lg mb-3" style={{ color: c.ink, fontFamily: displayFont, fontWeight: 700 }}>
                {t(s.key)}
              </h2>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: c.line, background: "white" }}>
                {rows.map(({ fund, entry }) => {
                  const bc = getContent(entry, lang);
                  return (
                    <Link
                      key={fund.id}
                      to={benefitPath(lang, entry)}
                      className="grid sm:grid-cols-[11rem_1fr] gap-x-4 gap-y-1 px-4 py-3.5 border-b last:border-b-0 hover:bg-[#FBF6EA]"
                      style={{ borderColor: c.line }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: c.ink }}>
                          {entry.institution}
                        </p>
                        <p className="text-[10px]" style={{ color: c.inkSoft }}>
                          {fund.short}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: c.gold, fontFamily: monoFont }}>
                          {bc.amount}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: c.inkSoft }}>
                          {bc.title} →
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="text-[11px] leading-relaxed max-w-prose" style={{ color: c.inkSoft }}>
          {t("compareNote")}
        </p>
      </div>
    </article>
  );
}
