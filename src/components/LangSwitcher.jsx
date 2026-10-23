import { useLocation, useNavigate, useParams } from "react-router-dom";
import { langOptions } from "../i18n.js";
import { c } from "../theme.js";

// Switching language rewrites the current URL rather than flipping hidden state, so every
// language of every page has its own address.
export default function LangSwitcher({ compact = false }) {
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const go = (next) => {
    const rest = location.pathname.replace(/^\/[a-z]{2}/, "");
    navigate(`/${next}${rest}${location.search}`, { replace: true });
  };

  if (compact) {
    return (
      <select
        value={lang}
        onChange={(e) => go(e.target.value)}
        aria-label="Language"
        className="rounded-md px-2 py-1.5 text-xs font-semibold border bg-transparent"
        style={{ color: c.paper, borderColor: "#3A4A57" }}
      >
        {langOptions.map((o) => (
          <option key={o.id} value={o.id} style={{ color: c.ink }}>
            {o.short}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex gap-1">
      {langOptions.map((o) => (
        <button
          key={o.id}
          onClick={() => go(o.id)}
          aria-current={lang === o.id}
          className="rounded-md px-2 py-1 text-xs font-semibold border"
          style={{
            borderColor: lang === o.id ? c.gold : "#3A4A57",
            background: lang === o.id ? "rgba(184,134,59,0.15)" : "transparent",
            color: lang === o.id ? c.gold : "#B7C4CE",
          }}
        >
          {o.short}
        </button>
      ))}
    </div>
  );
}
