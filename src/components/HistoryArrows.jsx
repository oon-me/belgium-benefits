import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigationType, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { c } from "../theme.js";
import { loadPrefs, PREFS_EVENT } from "../lib/prefs.js";

// The main path through the site, first page to last: home, the four questions, the results.
// On these pages the arrows step along this path, so the home page has only "Forward" and the
// results page only "Back". Past the location question you need a commune, as with "Next".
const FLOW = ["", "start/location", "start/status", "start/situation", "start/fund", "benefits"];

// Other pages (a benefit, About, Legal…) follow the visitor's own history. Browsers don't say
// whether a "forward" page exists, so we track it: React Router stores the position in
// history.state.idx; a new page (PUSH) drops everything ahead of it, going back (POP) keeps it.
// The furthest position is kept per tab so a reload doesn't forget it.
const KEY = "bb-history-max";
const readMax = () => { try { return Number(sessionStorage.getItem(KEY)) || 0; } catch { return 0; } };
const saveMax = (n) => { try { sessionStorage.setItem(KEY, String(n)); } catch { /* storage blocked */ } };
// The first page of a visit counts as a new page unless it was a reload or the browser's own
// back/forward, which keep what lies ahead.
let firstLoad = true;
const keepsForward = () => ["reload", "back_forward"].includes(performance.getEntriesByType?.("navigation")[0]?.type);

export default function HistoryArrows({ t }) {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const type = useNavigationType();
  const [hist, setHist] = useState({ back: false, forward: false });
  const [hasCommune, setHasCommune] = useState(false);

  useEffect(() => {
    const idx = window.history.state?.idx;
    if (typeof idx !== "number") {
      setHist({ back: window.history.length > 1, forward: false });
    } else {
      const pop = firstLoad ? keepsForward() : type === "POP";
      firstLoad = false;
      const max = pop ? Math.max(readMax(), idx) : idx;
      saveMax(max);
      setHist({ back: idx > 0, forward: idx < max });
    }
  }, [location.key, type]);

  useEffect(() => {
    const sync = () => { const p = loadPrefs(); setHasCommune(Boolean(p.region && p.commune)); };
    sync();
    window.addEventListener(PREFS_EVENT, sync);
    return () => window.removeEventListener(PREFS_EVENT, sync);
  }, []);

  const rest = location.pathname.replace(new RegExp(`^/${lang}/?`), "").replace(/\/$/, "");
  const i = FLOW.indexOf(rest);
  const go = (p) => () => navigate(`/${lang}${p ? `/${p}` : ""}`);
  let back = null;
  let forward = null;
  if (i !== -1) {
    if (i > 0) back = { onClick: go(FLOW[i - 1]) };
    if (i < FLOW.length - 1) forward = { onClick: go(FLOW[i + 1]), disabled: i >= 1 && !hasCommune };
  } else {
    // Arrived straight on this page (from a search engine, say): "Back" leads home.
    back = { onClick: hist.back ? () => navigate(-1) : go("") };
    if (hist.forward) forward = { onClick: () => navigate(1) };
  }

  const cls = "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium disabled:opacity-40";
  return (
    <nav className="mx-auto w-full max-w-6xl px-4 md:px-6 pt-3 flex items-center justify-between" aria-label={`${t("back")} / ${t("forward")}`}>
      {back ? (
        <button type="button" onClick={back.onClick} className={cls} style={{ color: c.post }}>
          <ArrowLeft size={18} aria-hidden="true" /> {t("back")}
        </button>
      ) : <span />}
      {forward && (
        <button type="button" onClick={forward.onClick} disabled={forward.disabled} className={cls} style={{ color: c.post }}>
          {t("forward")} <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
