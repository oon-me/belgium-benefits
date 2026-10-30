import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X, ChevronRight } from "lucide-react";
import { c, displayFont, monoFont } from "../theme.js";
import { useT, getContent, LANGS } from "../i18n.js";
import { useBenefits, allKeys } from "../lib/data.js";
import { communeName, resolveCommune } from "../data/communes.js";
import { searchBenefits } from "../lib/search.js";
import { matchesPlace, statusRule } from "../lib/match.js";
import { loadPrefs } from "../lib/prefs.js";
import { usePageMeta } from "../lib/meta.js";
import { benefitPath } from "../lib/slug.js";

// For someone who just wants to look a benefit up, without the questions. Results appear as you
// type, every language is searched at once, and the arrow keys and Enter work as in a search box.
export default function Search() {
  const { lang } = useParams();
  const t = useT(lang);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get("q") ?? "");
  const query = useDeferredValue(text);
  const [active, setActive] = useState(0);
  const [onlyMine, setOnlyMine] = useState(false);
  const [prefs, setPrefs] = useState({});
  const input = useRef(null);
  const list = useRef(null);

  useEffect(() => {
    setPrefs(loadPrefs());
    input.current?.focus();
  }, []);

  usePageMeta({
    lang,
    title: t("searchTitle"),
    description: t("searchHelp"),
    path: `/${lang}/search`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/search`])),
  });

  // The box stays usable while the data loads; results simply appear once it is there.
  const { benefits: loaded, failed } = useBenefits(allKeys);
  const hasPlace = Boolean(prefs.region && prefs.commune);
  const place = hasPlace ? communeName(prefs.commune, lang) : "";
  const { results, partial } = useMemo(() => {
    if (!query.trim() || !loaded) return { results: [], partial: false };
    const pool = onlyMine && hasPlace ? loaded.filter((b) => matchesPlace(b, prefs.region, prefs.commune)) : loaded;
    return searchBenefits(pool, query);
  }, [query, onlyMine, hasPlace, prefs.region, prefs.commune, loaded]);

  // Keep the address in step with the box, so a search can be shared or reopened with Back.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (query.trim()) next.set("q", query);
    else next.delete("q");
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    setActive(0);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      navigate(benefitPath(lang, results[active]));
    } else if (e.key === "Escape") {
      setText("");
    }
  };

  const where = (b) => {
    const names = (b.communes ?? []).map((cm) => communeName(resolveCommune(cm) ?? cm, lang)).filter(Boolean);
    if (names.length) return names.join(", ");
    if (b.region.includes("Federal")) return t("searchAllBelgium");
    return b.region.map((r) => t("regionNames")[r] ?? r).join(", ");
  };

  const suggestions = (
    <div className="flex flex-wrap gap-2">
      {t("searchSuggestions").map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            setText(s);
            input.current?.focus();
          }}
          className="rounded-full px-3 py-1.5 text-xs font-medium border"
          style={{ borderColor: c.line, background: "white", color: c.ink }}
        >
          {s}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl mb-4" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {t("searchTitle")}
          </h1>
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "white" }}>
            <SearchIcon size={20} color={c.inkSoft} aria-hidden="true" className="shrink-0" />
            <input
              ref={input}
              // type="text" (not "search"): browsers add their own clear button to search fields,
              // which would sit next to ours.
              type="text"
              inputMode="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("searchInput")}
              aria-label={t("searchTitle")}
              aria-controls="search-results"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              className="bg-transparent outline-none text-base flex-1 min-w-0"
              style={{ color: c.ink }}
            />
            {text && (
              <button type="button" onClick={() => { setText(""); input.current?.focus(); }} aria-label={t("searchClear")} className="shrink-0 rounded-full p-1">
                <X size={18} color={c.inkSoft} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
            <p className="text-xs" style={{ color: "#B7C4CE" }}>
              {t("searchHelp")}
            </p>
            {hasPlace && (
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "#D7DEE3" }}>
                <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
                {t("searchOnlyMine").replace("{place}", place)}
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-5">
        {!query.trim() && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.inkSoft }}>
              {t("searchTry")}
            </p>
            {suggestions}
          </>
        )}

        {query.trim() && !loaded && (
          <p className="text-sm mb-3" role="status" style={{ color: c.inkSoft }}>
            {t(failed ? "loadError" : "loading")}
          </p>
        )}

        {query.trim() && loaded && results.length === 0 && (
          <>
            <p className="text-sm mb-3" style={{ color: c.ink }}>
              {t("searchNone").replace("{q}", query.trim())}
            </p>
            {suggestions}
          </>
        )}

        {results.length > 0 && (
          <>
            <p className="text-xs mb-3" role="status" style={{ color: c.inkSoft }}>
              {partial ? t("searchClosest") : `${results.length} ${t(results.length === 1 ? "resultOne" : "resultMany")}`}
            </p>
            <ul id="search-results" ref={list} className="flex flex-col gap-2.5">
              {results.map((b, i) => {
                const bc = getContent(b, lang);
                const closed = statusRule(b, prefs.status)?.verdict === "no";
                return (
                  <li key={b.id} data-index={i}>
                    <Link
                      to={benefitPath(lang, b)}
                      onMouseEnter={() => setActive(i)}
                      className="flex items-start gap-3 rounded-xl p-4 border"
                      style={{
                        background: "white",
                        borderColor: i === active ? c.post : c.line,
                        boxShadow: i === active ? `0 0 0 1px ${c.post}` : "none",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold mb-0.5" style={{ color: c.ink, fontFamily: displayFont }}>
                          {bc.title}
                        </p>
                        <p className="text-xs mb-1.5" style={{ color: c.inkSoft }}>
                          {b.institution} · {where(b)}
                          {b.health_funds && <> · {t("searchMembers")}</>}
                        </p>
                        <p className="text-xs line-clamp-2" style={{ color: c.inkSoft }}>
                          {bc.desc}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          <span className="text-xs font-bold" style={{ color: c.goldText, fontFamily: monoFont }}>
                            {bc.amount}
                          </span>
                          {closed && (
                            <span className="text-[12px] font-semibold rounded px-1.5 py-0.5" style={{ background: c.clayBg, color: c.clay }}>
                              {t("notOpenHeading")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} color={c.inkSoft} className="shrink-0 mt-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
