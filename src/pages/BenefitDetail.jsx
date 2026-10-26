import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock, ExternalLink, Smartphone, CreditCard, FileText } from "lucide-react";
import { c, displayFont, monoFont } from "../theme.js";
import { useT, getContent, LANGS } from "../i18n.js";
import benefits from "../data/benefits.json";
import StampBadge from "../components/StampBadge.jsx";
import { usePageMeta } from "../lib/meta.js";
import { isStale, monthsSince } from "../lib/freshness.js";
import { benefitPath, parseBenefitParam } from "../lib/slug.js";
import { loadPrefs } from "../lib/prefs.js";
import { pickLang, fundSide, fundRequestUrl, fundRequestLinks } from "../lib/request.js";
import { healthFunds, statuses } from "../constants.js";
import { statusRule } from "../lib/match.js";

export default function BenefitDetail() {
  const { lang, idSlug } = useParams();
  const t = useT(lang);
  const { id } = parseBenefitParam(idSlug);
  const benefit = benefits.find((b) => String(b.id) === id);
  const bc = benefit ? getContent(benefit, lang) : null;
  const canonical = benefit ? benefitPath(lang, benefit) : null;
  // Read after mounting: the prerendered HTML has no preferences, and the first client render
  // must match it.
  const [status, setStatus] = useState(null);
  useEffect(() => setStatus(loadPrefs().status || null), []);

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
            <p className="text-[13px] uppercase tracking-wide mb-1" style={{ color: c.goldText }}>
              {t("youCouldReceive")}
            </p>
            <p className="text-xl md:text-2xl font-bold" style={{ color: c.goldText, fontFamily: monoFont, fontVariantNumeric: "tabular-nums" }}>
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

        {/* A change that has been announced but is not law yet: kept small and separate from the
            amounts above, which always describe the rules in force today. */}
        {benefit.notice && (
          <aside className="mb-5 text-xs leading-relaxed max-w-prose" style={{ color: c.inkSoft }}>
            <span className="font-semibold" style={{ color: c.ink }}>
              ⓘ {t("noticeLabel")}:
            </span>{" "}
            {benefit.notice.text[lang] ?? benefit.notice.text.en}{" "}
            <a href={benefit.notice.source_url} target="_blank" rel="noopener noreferrer" className="underline whitespace-nowrap">
              ({t("noticeMeta").replace("{date}", benefit.notice.date)})
            </a>
          </aside>
        )}

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
            <p className="text-[13px] uppercase tracking-wide mb-1 font-semibold" style={{ color: c.goldText }}>
              {t("entryNote")}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: c.ink }}>
              {benefit.note}
            </p>
          </div>
        )}

        <p className="text-sm md:text-base mb-6 max-w-prose" style={{ color: c.ink }}>
          {bc.desc}
        </p>

        {benefit.eligibility && (() => {
          const el = benefit.eligibility;
          const pick = (m) => m[lang] ?? m.en;
          const mine = statusRule(benefit, status);
          const rules = statuses.filter((st) => el.statuses?.[st.id]);
          return (
            <section className="rounded-xl p-4 mb-6 border-2" style={{ borderColor: c.post, background: "white" }}>
              {mine?.verdict === "no" && (
                <div className="rounded-lg p-3 mb-3" style={{ background: c.clayBg, border: `1px solid ${c.clay}` }}>
                  <p className="text-xs font-bold mb-0.5" style={{ color: c.clay }}>
                    {t("notOpenHeading")}: {t("statuses")[status]}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: c.ink }}>
                    {pick(mine.text)}
                  </p>
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.post }}>
                ✅ {t("whoCanGet")}
              </p>
              <ul className="text-xs md:text-sm list-disc pl-5 space-y-1 mb-3" style={{ color: c.ink }}>
                {pick(el.conditions).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {rules.length > 0 && (
                <>
                  <p className="text-[13px] font-semibold mb-1.5" style={{ color: c.ink }}>
                    {t("statusRulesHeading")}
                  </p>
                  <ul className="text-xs space-y-1.5 mb-3" style={{ color: c.ink }}>
                    {rules.map((st) => (
                      <li key={st.id} className={st.id === status ? "font-semibold" : ""}>
                        {st.emoji} {t("statuses")[st.id]}: {pick(el.statuses[st.id].text)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="text-[13px]" style={{ color: c.inkSoft }}>
                {t("conditionsChecked").replace("{date}", el.checked)}:{" "}
                {[].concat(el.source_url).map((u, i) => (
                  <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="underline mr-2" style={{ color: c.post }}>
                    {new URL(u).hostname.replace(/^www\./, "")}
                    {[].concat(el.source_url).length > 1 ? ` (${i + 1})` : ""}
                  </a>
                ))}
              </p>
            </section>
          );
        })()}

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
                <p className="text-xs font-semibold mb-1" style={{ color: c.post }}>
                  {t("newToItsme")}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>
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
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 mt-0.5" style={{ background: c.post, color: "white" }}>
                {i + 1}
              </div>
              <p className="text-xs md:text-sm pt-0.5" style={{ color: c.ink }}>
                {s}
              </p>
            </li>
          ))}
        </ol>

        {/* Two doors, as on a government results page: "Request now" goes straight to the form,
            portal or payer where you apply; "All information" is the official page explaining
            the conditions. Entries without a verified request page show only the second. */}
        {(() => {
          const prefs = loadPrefs();
          const fund = prefs.fund || null;
          const fundUrl = fund ? fundRequestUrl(benefit, fund, lang, prefs.region) : null;
          const requestUrl = fundUrl || pickLang(benefit.request_url, lang);
          const otherFunds = fundUrl ? [] : fundRequestLinks(benefit, lang, prefs.region);
          // "CM / MC" names both sides of the union; show only the one this link goes to.
          const fundShort = (id) => {
            const names = (healthFunds.find((f) => f.id === id)?.short ?? id).split(" / ");
            return names[fundSide(lang, prefs.region) === "fr" ? names.length - 1 : 0];
          };
          return (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                {requestUrl && (
                  <a
                    href={requestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm"
                    style={{ background: c.post, color: "white" }}
                  >
                    {t("requestNow")}
                    {fundUrl && <span className="font-normal opacity-80">· {fundShort(fund)}</span>}
                    <ExternalLink size={14} />
                  </a>
                )}
                <a
                  href={pickLang(benefit.source_url, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm border-2"
                  style={requestUrl ? { borderColor: c.post, color: c.post } : { background: c.post, borderColor: c.post, color: "white" }}
                >
                  {t("allInfo")} <ExternalLink size={14} />
                </a>
              </div>
              {otherFunds.length > 0 && (
                <p className="text-xs mb-3 flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: c.inkSoft }}>
                  {t("requestViaFund")}
                  {otherFunds.map((l) => (
                    <a key={l.fund} href={l.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: c.post }}>
                      {fundShort(l.fund)}
                    </a>
                  ))}
                </p>
              )}
            </>
          );
        })()}
        <p className="text-[13px]" style={{ color: c.inkSoft }}>
          {t("lastVerified")} {benefit.verified}
        </p>
      </div>
    </article>
  );
}
