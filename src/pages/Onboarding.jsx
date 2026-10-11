import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronRight, Search } from "lucide-react";
import { c, bodyFont, displayFont } from "../theme.js";
import { useT, LANGS } from "../i18n.js";
import { situations } from "../constants.js";
import { regions, sortedCommunes, communeName, resolveCommune } from "../data/communes.js";
import { usePrefs } from "../lib/prefs.js";
import { usePageMeta } from "../lib/meta.js";

// Each step is its own URL, so browser Back walks the questions instead of leaving the site.
//
// The "income" step was removed: nothing consumed the answer, yet the copy told people it
// would "order what we show first". That was untrue, and it collected a sensitive attribute
// for no purpose. Re-add it here (and in constants.js) once ranking actually uses it — the
// four-language strings for it are still in i18n.js.
const STEPS = ["location", "situation"];

export default function Onboarding() {
  const { lang, step } = useParams();
  const t = useT(lang);
  const navigate = useNavigate();
  const [prefs, setPrefs] = usePrefs();
  const [communeQuery, setCommuneQuery] = useState("");

  const index = STEPS.indexOf(step);
  const safeStep = index === -1 ? "location" : step;

  const { region = null, commune = null, situations: picked = [] } = prefs;
  const selected = resolveCommune(commune);

  // 285 municipalities in Flanders alone, so the picker filters rather than listing buttons.
  const matches = useMemo(() => {
    if (!region) return [];
    const all = sortedCommunes(region, lang);
    const q = communeQuery.trim().toLowerCase();
    if (!q) return all;
    // Match on any official language name, so searching "Anvers" finds Antwerpen.
    return all.filter((cm) => ["nl", "fr", "de"].some((l) => cm[l].toLowerCase().includes(q)));
  }, [region, lang, communeQuery]);
  const stepLabel = t("step").replace("{n}", Math.max(index, 0) + 2).replace("{total}", "3");
  const headline = { location: t("headlineRegion"), situation: t("headlineSituation") }[safeStep];
  const sub = { location: t("subRegion"), situation: t("subSituation") }[safeStep];
  usePageMeta({
    lang,
    title: headline.replace(/\n/g, " "),
    description: sub,
    path: `/${lang}/start/${safeStep}`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/start/${safeStep}`])),
  });

  // After every hook, and as a <Navigate> rather than calling navigate() during render.
  if (index === -1) return <Navigate to={`/${lang}/start/location`} replace />;

  const next = () => navigate(`/${lang}/start/${STEPS[index + 1]}`);
  const finish = () => navigate(`/${lang}/benefits`);
  const toggleSituation = (id) =>
    setPrefs({ situations: picked.includes(id) ? picked.filter((s) => s !== id) : [...picked, id] });

  return (
    <section style={{ background: c.ink }} className="min-h-[calc(100vh-3.5rem)] flex">
      <div className="mx-auto w-full max-w-xl px-5 md:px-6 py-10 md:py-16 flex flex-col justify-center">
        <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: c.gold, fontFamily: bodyFont }}>
          {stepLabel}
        </p>
        <h1
          className="text-2xl sm:text-3xl leading-tight mb-3 whitespace-pre-line"
          style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}
        >
          {headline}
        </h1>
        <p className="text-sm mb-8" style={{ color: "#B7C4CE" }}>
          {sub}
        </p>

        {step === "location" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8AA0AE" }}>
                {t("regionLabel")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setPrefs({ region: r, commune: null }); setCommuneQuery(""); }}
                    className="rounded-lg py-2.5 text-xs font-semibold border"
                    style={{
                      borderColor: region === r ? c.gold : "#3A4A57",
                      background: region === r ? "rgba(184,134,59,0.15)" : "transparent",
                      color: region === r ? c.gold : "#B7C4CE",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {region && (
              <div>
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8AA0AE" }}>
                  {t("communeLabel")}
                  {selected && <span style={{ color: c.gold }}> · {communeName(selected, lang)}</span>}
                </p>

                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-2" style={{ background: "#2A3A47" }}>
                  <Search size={15} color="#8AA0AE" />
                  <input
                    value={communeQuery}
                    onChange={(e) => setCommuneQuery(e.target.value)}
                    placeholder={t("communeSearch")}
                    className="bg-transparent outline-none text-sm flex-1 min-w-0"
                    style={{ color: c.paper }}
                  />
                </div>

                <div className="max-h-56 overflow-y-auto rounded-lg border" style={{ borderColor: "#3A4A57" }}>
                  {matches.map((cm) => {
                    const active = selected?.nis === cm.nis;
                    return (
                      <button
                        key={cm.nis}
                        onClick={() => setPrefs({ commune: cm.nis })}
                        className="w-full text-left px-3 py-2 text-xs font-semibold border-b last:border-b-0"
                        style={{
                          borderColor: "#31414E",
                          background: active ? "rgba(184,134,59,0.18)" : "transparent",
                          color: active ? c.gold : "#B7C4CE",
                        }}
                      >
                        {communeName(cm, lang)}
                      </button>
                    );
                  })}
                  {matches.length === 0 && (
                    <p className="px-3 py-4 text-xs" style={{ color: "#8AA0AE" }}>
                      {t("communeNone")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              disabled={!region || !commune}
              onClick={next}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm disabled:opacity-30"
              style={{ background: c.gold, color: c.ink }}
            >
              {t("continueBtn")} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === "situation" && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-2.5">
              {situations.map((s) => {
                const active = picked.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSituation(s.id)}
                    className="flex items-center gap-3 rounded-2xl py-3.5 px-4 text-xs font-semibold border-2 text-left"
                    style={{
                      borderColor: active ? c.gold : "#3A4A57",
                      background: active ? "rgba(184,134,59,0.18)" : "transparent",
                      color: active ? c.gold : "#D7DEE3",
                    }}
                  >
                    <span className="text-2xl leading-none">{s.emoji}</span>
                    {t("situations")[s.id]}
                    {active && <Check size={18} className="ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={finish}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm"
              style={{ background: c.gold, color: c.ink }}
            >
              {picked.length > 0 ? t("seeMatches") : t("showEverything")} <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
