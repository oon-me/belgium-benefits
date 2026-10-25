import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { c } from "../theme.js";

// Browsers don't say whether a "forward" page exists, so we track it: React Router stores the
// position in history.state.idx; a new page (PUSH) drops everything ahead of it, going back
// (POP) keeps it. The furthest position is kept per tab so a reload doesn't forget it.
const KEY = "bb-history-max";
const readMax = () => { try { return Number(sessionStorage.getItem(KEY)) || 0; } catch { return 0; } };
const saveMax = (n) => { try { sessionStorage.setItem(KEY, String(n)); } catch { /* storage blocked */ } };

export default function HistoryArrows({ t }) {
  const navigate = useNavigate();
  const location = useLocation();
  const type = useNavigationType();
  // Both start disabled so the prerendered HTML matches the first render in the browser.
  const [can, setCan] = useState({ back: false, forward: false });

  useEffect(() => {
    const idx = window.history.state?.idx;
    if (typeof idx !== "number") {
      setCan({ back: window.history.length > 1, forward: false });
      return;
    }
    const max = type === "POP" ? Math.max(readMax(), idx) : idx;
    saveMax(max);
    setCan({ back: idx > 0, forward: idx < max });
  }, [location.key, type]);

  const btn = (enabled) => ({
    color: enabled ? c.post : c.inkSoft,
    opacity: enabled ? 1 : 0.4,
    cursor: enabled ? "pointer" : "default",
  });

  return (
    <nav className="mx-auto w-full max-w-6xl px-4 md:px-6 pt-3 flex items-center justify-between" aria-label={`${t("back")} / ${t("forward")}`}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={!can.back}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium"
        style={btn(can.back)}
      >
        <ArrowLeft size={18} aria-hidden="true" /> {t("back")}
      </button>
      <button
        type="button"
        onClick={() => navigate(1)}
        disabled={!can.forward}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium"
        style={btn(can.forward)}
      >
        {t("forward")} <ArrowRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
