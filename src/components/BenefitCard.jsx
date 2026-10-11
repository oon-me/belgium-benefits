import { Link } from "react-router-dom";
import { c, displayFont, monoFont } from "../theme.js";
import { getContent } from "../i18n.js";
import StampBadge from "./StampBadge.jsx";

// A real <Link>, so the card is middle-clickable, openable in a new tab and shareable.
export default function BenefitCard({ benefit, lang, t, to }) {
  const bc = getContent(benefit, lang);
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
      <p className="text-xs mb-3 flex-1" style={{ color: c.inkSoft }}>
        {bc.desc}
      </p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-bold" style={{ color: c.gold, fontFamily: monoFont }}>
          {bc.amount}
        </span>
        <span className="text-[11px]" style={{ color: c.inkSoft }}>
          {benefit.institution}
        </span>
      </div>
    </Link>
  );
}
