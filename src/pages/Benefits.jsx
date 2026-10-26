import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { MapPin, Search, ChevronRight } from "lucide-react";
import { c, displayFont } from "../theme.js";
import { useT, getContent, LANGS } from "../i18n.js";
import { categories, situations, healthFunds } from "../constants.js";
import benefits from "../data/benefits.json";
import { localTips } from "../data/local-tips.js";
import { communeName, resolveCommune } from "../data/communes.js";
import { filterBenefits } from "../lib/match.js";
import { scoreBenefit } from "../lib/search.js";
import { usePrefs } from "../lib/prefs.js";
import BenefitCard from "../components/BenefitCard.jsx";
import { usePageMeta } from "../lib/meta.js";
import { benefitPath } from "../lib/slug.js";

export default function Benefits() {
  const { lang } = useParams();
  const t = useT(lang);
  const [prefs, setPrefs] = usePrefs();
  const [params, setParams] = useSearchParams();


  // The URL wins over stored preferences, so a shared link shows the sender's results.
  const region = params.get("region") || prefs.region;
  const commune = params.get("commune") || prefs.commune;
  const category = params.get("category") || null;
  const query = params.get("q") || "";
  const fund = params.get("fund") || prefs.fund || null;
  const status = params.get("status") || prefs.status || null;
  const statusNote = status ? t("statusNotes")[status] : null;
  const picked = params.has("situations")
    ? params.get("situations").split(",").filter(Boolean)
    : prefs.situations || [];

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) next.delete(key);
    else next.set(key, Array.isArray(value) ? value.join(",") : value);
    // Keep location in the URL so the page stays shareable once anything is filtered.
    next.set("region", region);
    next.set("commune", commune);
    setParams(next, { replace: true });
  };

  const communeLabel = communeName(commune, lang);
  const matched = filterBenefits(benefits, { region, commune, category, situations: picked, query, fund, status });
  // With a search word, the best matches come first.
  const items = query ? [...matched].sort((x, y) => scoreBenefit(y, query).score - scoreBenefit(x, query).score) : matched;
  // What would match without the status rule: those benefits are named, not silently dropped,
  // so the person knows why they are missing and can read the official reason.
  const closedByStatus = status
    ? filterBenefits(benefits, { region, commune, category, situations: picked, query, fund }).filter((b) => !matched.includes(b))
    : [];
  // Would any fund's own extras show up here if the person told us their fund?
  const fundExtrasHidden =
    !fund &&
    healthFunds.some((f) => filterBenefits(benefits, { region, commune, category, situations: picked, query, fund: f.id, status }).length > items.length);
  const chooseFund = (value) => {
    setPrefs({ fund: value || null });
    setParam("fund", value || null);
  };
  const situationLabels = situations.filter((s) => picked.includes(s.id)).map((s) => t("situations")[s.id]);
  const tipNis = resolveCommune(commune)?.nis;
  const tips = localTips.filter((tip) => resolveCommune(tip.commune)?.nis === tipNis && tip.situations.some((s) => picked.includes(s)));

  usePageMeta({
    lang,
    title: t("yourBenefits"),
    description: `${items.length} ${t("yourBenefits").toLowerCase()} — ${communeLabel}, ${region}.`,
    path: `/${lang}/benefits`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/benefits`])),
  });

  // Placed after every hook so the hook order stays identical on each render.
  if (!region || !commune) return <Navigate to={`/${lang}/start/location`} replace />;

  return (
    <>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-6xl px-5 md:px-6 py-6 md:py-8">
          <Link to={`/${lang}/start/location`} className="inline-flex items-center gap-1.5 text-xs mb-3" style={{ color: c.gold }}>
            <MapPin size={13} />
            {communeLabel}, {region} <ChevronRight size={12} />
          </Link>
          <h1 className="text-2xl md:text-3xl mb-4" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {t("yourBenefits")}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 flex-1 max-w-md" style={{ background: "#2A3A47" }}>
              <Search size={15} color="#8AA0AE" />
              <input
                value={query}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="bg-transparent outline-none text-sm flex-1 min-w-0"
                style={{ color: c.paper }}
              />
            </div>
            {situationLabels.length > 0 && (
              <button
                onClick={() => {
                  setPrefs({ situations: [] });
                  setParam("situations", []);
                }}
                className="self-start flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "rgba(184,134,59,0.18)", color: c.gold }}
              >
                {t("matchedTo")} {situationLabels.join(", ")}
                <span className="ml-1 font-bold">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 md:px-6">
        <div className="flex gap-2 py-4 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setParam("category", active ? null : cat.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap"
                style={{
                  borderColor: active ? c.post : c.line,
                  background: active ? c.post : "white",
                  color: active ? "white" : c.inkSoft,
                }}
              >
                <Icon size={12} /> {t("categories")[cat.id]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-xs" style={{ color: c.inkSoft }}>
            {items.length} {t(items.length === 1 ? "resultOne" : "resultMany")}
          </p>
          <label className="flex items-center gap-2 text-xs min-w-0" style={{ color: c.inkSoft }}>
            {t("fundLabel")}
            <select
              value={fund ?? ""}
              onChange={(e) => chooseFund(e.target.value)}
              className="rounded-md border px-2 py-1 text-xs bg-white min-w-0 max-w-[13rem]"
              style={{ borderColor: c.line, color: c.ink }}
            >
              <option value="">{t("fundNone")}</option>
              {healthFunds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.short ?? t("fundOther")}
                </option>
              ))}
            </select>
          </label>
        </div>

        {statusNote && (
          <div className="rounded-xl p-3.5 mb-4 border" style={{ borderColor: c.line, background: c.paperDim }}>
            <p className="text-[13px] uppercase tracking-wide mb-1 font-semibold" style={{ color: c.inkSoft }}>
              {t("statusLabel")}: {t("statuses")[status]}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: c.ink }}>
              {statusNote}
            </p>
          </div>
        )}

        {fundExtrasHidden && (
          <div className="rounded-xl p-3.5 mb-4 border" style={{ borderColor: c.gold, background: "#F6EDDB" }}>
            <p className="text-xs" style={{ color: c.ink }}>
              🎁 {t("fundCallout")}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((b) => (
            <BenefitCard key={b.id} benefit={b} lang={lang} t={t} to={benefitPath(lang, b)} status={status} />
          ))}
        </div>
        {closedByStatus.length > 0 && (
          <div className="mt-6 text-xs" style={{ color: c.inkSoft }}>
            <p className="mb-1.5">{t("hiddenByStatus")}</p>
            <ul className="list-disc pl-4 space-y-1">
              {closedByStatus.map((b) => (
                <li key={b.id}>
                  <Link to={benefitPath(lang, b)} className="underline" style={{ color: c.post }}>
                    {getContent(b, lang).title}
                  </Link>
                  {" — "}
                  {b.eligibility.statuses[status].text[lang] ?? b.eligibility.statuses[status].text.en}
                </li>
              ))}
            </ul>
          </div>
        )}
        {items.length === 0 && (
          <p className="text-sm text-center py-14" style={{ color: c.inkSoft }}>
            {t("noMatches")}
          </p>
        )}

        {tips.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: c.inkSoft }}>
              💡 {t("localTipsHeader")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {tips.map((tip) => {
                const tc = getContent(tip, lang);
                return (
                  <div key={tip.id} className="rounded-xl p-4 border-2 border-dashed" style={{ borderColor: c.gold, background: "#FBF6EA" }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold" style={{ color: c.ink, fontFamily: displayFont }}>
                        {tc.title}
                      </p>
                      <span className="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0" style={{ background: c.gold, color: "white" }}>
                        {t("communityTip")}
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: c.inkSoft }}>
                      {tc.desc}
                    </p>
                    <p className="text-[13px]" style={{ color: c.inkSoft }}>
                      📍 {tc.address} · {t("notOfficial")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
