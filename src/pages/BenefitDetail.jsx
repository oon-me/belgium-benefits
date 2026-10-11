import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock, ExternalLink, Smartphone, CreditCard, FileText } from "lucide-react";
import { c, displayFont, monoFont } from "../theme.js";
import { useT, getContent, LANGS } from "../i18n.js";
import benefits from "../data/benefits.json";
import StampBadge from "../components/StampBadge.jsx";
import { usePageMeta } from "../lib/meta.js";
import { isStale, monthsSince } from "../lib/freshness.js";
import { benefitPath, parseBenefitParam } from "../lib/slug.js";

export default function BenefitDetail() {
  const { lang, idSlug } = useParams();
  const t = useT(lang);
  const { id } = parseBenefitParam(idSlug);
  const benefit = benefits.find((b) => String(b.id) === id);
  const bc = benefit ? getContent(benefit, lang) : null;
  const canonical = benefit ? benefitPath(lang, benefit) : null;

  usePageMeta({
    lang,
    title: bc?.title,
    description: bc?.desc,
    path: canonical,
    // Each language slugs its own title, so alternates have to be computed per language.
    alternates: benefit ? Object.fromEntries(LANGS.map((l) => [l, benefitPath(l, benefit)])) : undefined,
  });

  // A bare id or a slug from another language still resolves; send it to the canonical URL so
  // search engines see one address per benefit per language instead of several.
  if (benefit && canonical !== `/${lang}/benefit/${idSlug}`) {
    return <Navigate to={canonical} replace />;
  }

  if (!benefit) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20 text-center">
        <h1 className="text-2xl mb-3" style={{ color: c.ink, fontFamily: displayFont, fontWeight: 700 }}>
          {t("notFoundTitle")}
        </h1>
        <p className="text-sm mb-6" style={{ color: c.inkSoft }}>
          {t("notFoundBody")}
        </p>
        <Link
          to={`/${lang}/benefits`}
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-sm"
          style={{ background: c.post, color: "white" }}
        >
          {t("navBrowse")}
        </Link>
      </div>
    );
  }

  return (
    <article>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-6 md:py-8">
          <Link to={`/${lang}/benefits`} className="inline-flex items-center gap-1 text-xs mb-4" style={{ color: c.gold }}>
            <ChevronLeft size={14} /> {t("navBrowse")}
          </Link>
          <StampBadge status={benefit.status} t={t} />
          <h1 className="text-2xl md:text-4xl mt-3 mb-2" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {bc.title}
          </h1>
          <p className="text-xs md:text-sm" style={{ color: "#8AA0AE" }}>
            {benefit.institution} · {benefit.region.join(", ")}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-6 md:py-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4 text-center sm:text-left" style={{ background: "#F6EDDB" }}>
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: c.gold }}>
              {t("youCouldReceive")}
            </p>
            <p className="text-xl md:text-2xl font-bold" style={{ color: c.gold, fontFamily: monoFont }}>
              {bc.amount}
            </p>
          </div>

          <div className="rounded-xl p-4 border-2 border-dashed flex items-start gap-3" style={{ borderColor: c.clay, background: c.clayBg }}>
            <Clock size={16} color={c.clay} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: c.clay }}>
                {t("deadline")}
              </p>
              <p className="text-xs" style={{ color: c.ink }}>
                {bc.deadline}
              </p>
            </div>
          </div>
        </div>

        {isStale(benefit.verified) && (
          <div className="rounded-xl p-4 mb-5 border-2" style={{ borderColor: c.clay, background: c.clayBg }}>
            <p className="text-xs font-bold mb-1" style={{ color: c.clay }}>
              {t("staleHeading")}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: c.ink }}>
              {t("staleBody").replace("{months}", monthsSince(benefit.verified))}
            </p>
          </div>
        )}

        {benefit.note && (
          <div className="rounded-xl p-3.5 mb-5 border" style={{ borderColor: c.gold, background: "#F6EDDB" }}>
            <p className="text-[10px] uppercase tracking-wide mb-1 font-semibold" style={{ color: c.gold }}>
              {t("entryNote")}
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: c.ink }}>
              {benefit.note}
            </p>
          </div>
        )}

        <p className="text-sm md:text-base mb-6 max-w-prose" style={{ color: c.ink }}>
          {bc.desc}
        </p>

        {bc.requirements && bc.requirements.length > 0 && (
          <div className="rounded-xl p-4 mb-6" style={{ background: c.paperDim, border: `1px solid ${c.line}` }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: c.inkSoft }}>
              🎒 {t("whatYoullNeed")}
            </p>
            <div className="flex flex-col gap-2">
              {bc.requirements.map((r, i) => {
                const Icon = r.type === "phone" ? Smartphone : r.type === "card" ? CreditCard : r.type === "id" ? CreditCard : FileText;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon size={15} color={c.post} className="mt-0.5 shrink-0" />
                    <p className="text-xs" style={{ color: c.ink }}>
                      {r.label}
                    </p>
                  </div>
                );
              })}
            </div>
            {bc.requirements.some((r) => r.type === "phone") && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: c.line }}>
                <p className="text-[11px] font-semibold mb-1" style={{ color: c.post }}>
                  {t("newToItsme")}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: c.inkSoft }}>
                  {t("itsmeTip")}
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: c.inkSoft }}>
          {t("howToRequest")}
        </p>
        <ol className="flex flex-col gap-2.5 mb-8">
          {bc.steps.map((s, i) => (
            <li key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: c.post, color: "white" }}>
                {i + 1}
              </div>
              <p className="text-xs md:text-sm pt-0.5" style={{ color: c.ink }}>
                {s}
              </p>
            </li>
          ))}
        </ol>

        <a
          href={benefit.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm mb-3"
          style={{ background: c.post, color: "white" }}
        >
          {t("openOfficial")} <ExternalLink size={14} />
        </a>
        <p className="text-[10px]" style={{ color: c.inkSoft }}>
          {t("lastVerified")} {benefit.verified}
        </p>
      </div>
    </article>
  );
}
