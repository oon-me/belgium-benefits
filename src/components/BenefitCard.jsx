import { Link } from "react-router-dom";
import { c, displayFont, monoFont } from "../theme.js";
import { getContent } from "../i18n.js";
import { statusRule } from "../lib/match.js";
import StampBadge from "./StampBadge.jsx";

// A real <Link>, so the card is middle-clickable, openable in a new tab and shareable.
// The legal conditions sit on the card itself: a result is only a match if the person can
// actually receive it, so what decides that must be visible before anyone clicks.
export default function BenefitCard({ benefit, lang, t, to, status = null }) {
  const bc = getContent(benefit, lang);
  const conditions = benefit.eligibility?.conditions?.[lang] ?? benefit.eligibility?.conditions?.en ?? [];
  const rule = statusRule(benefit, status);
  return (
    <Link
      to={to}
      className="flex flex-col text-left rounded-xl p-4 border h-full transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2"
      style={{ background: "white", borderColor: c.line, outlineColor: c.post }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold" style={{ color: c.ink, fontFamily: displayFont }}>
          {bc.title}
        </p>
        <StampBadge status={benefit.status} t={t} />
      </div>
      <p className="text-xs mb-3" style={{ color: c.inkSoft }}>
        {bc.desc}
      </p>
      {conditions.length > 0 && (
        <div className="mb-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide mb-1" style={{ color: c.ink }}>
            {t("whoCanGet")}
          </p>
          <ul className="text-[13px] leading-snug list-disc pl-4 space-y-0.5" style={{ color: c.ink }}>
            {conditions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      {rule && (
        <p className="text-[13px] leading-snug mb-3 rounded-md px-2.5 py-2" style={{ background: c.clayBg, color: c.ink }}>
          <span className="font-semibold" style={{ color: c.clay }}>{t("yourStatusRule")}:</span>{" "}
          {rule.text[lang] ?? rule.text.en}
        </p>
      )}
      {/* Pushes the notice and amount to the bottom so cards in a row line up. */}
      <div className="flex-1" />
      {benefit.notice && (
        <p className="text-[13px] leading-snug mb-3 line-clamp-2" style={{ color: c.inkSoft }}>
          <span className="font-semibold" style={{ color: c.ink }}>ⓘ {t("noticeLabel")}:</span>{" "}
          {benefit.notice.text[lang] ?? benefit.notice.text.en}
        </p>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-bold" style={{ color: c.goldText, fontFamily: monoFont, fontVariantNumeric: "tabular-nums" }}>
          {bc.amount}
        </span>
        <span className="text-xs" style={{ color: c.inkSoft }}>
          {benefit.institution}
        </span>
      </div>
    </Link>
  );
}
