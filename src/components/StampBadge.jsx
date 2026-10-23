import { Check, Clock } from "lucide-react";
import { c, bodyFont } from "../theme.js";

export default function StampBadge({ status, t }) {
  const verified = status === "verified";
  return (
    <div
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[13px] font-semibold tracking-wide uppercase shrink-0"
      style={{
        borderColor: verified ? c.green : c.gold,
        color: verified ? c.green : c.gold,
        background: verified ? c.greenBg : "#F6EDDB",
        fontFamily: bodyFont,
      }}
    >
      {verified ? <Check size={11} /> : <Clock size={11} />}
      {verified ? t("verified") : t("community")}
    </div>
  );
}
