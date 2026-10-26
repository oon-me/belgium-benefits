import { useEffect } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { Home, PlusCircle, Search } from "lucide-react";
import { c, bodyFont, displayFont } from "../theme.js";
import { useT } from "../i18n.js";
import LangSwitcher from "./LangSwitcher.jsx";
import Footer from "./Footer.jsx";
import HistoryArrows from "./HistoryArrows.jsx";

// Nav lives in one place and renders twice: a top bar from md up, a tab bar below it.
function navItems(lang, t) {
  return [
    { to: `/${lang}/benefits`, icon: Home, label: t("navBrowse") },
    { to: `/${lang}/submit`, icon: PlusCircle, label: t("navSubmit") },
  ];
}

export default function Layout() {
  const { lang } = useParams();
  const t = useT(lang);
  const items = navItems(lang, t);
  const navigate = useNavigate();

  // "/" or Ctrl/Cmd+K opens search from anywhere, unless you are already typing somewhere.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        navigate(`/${lang}/search`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lang, navigate]);

  const searchButton = (
    <NavLink
      to={`/${lang}/search`}
      aria-label={t("searchNav")}
      title={`${t("searchNav")} (/)`}
      className="inline-flex items-center justify-center gap-1.5 rounded-md p-2 md:px-3 md:py-1.5 text-sm font-medium"
      style={({ isActive }) => ({ color: isActive ? c.gold : "#B7C4CE", background: isActive ? "rgba(184,134,59,0.12)" : "transparent" })}
    >
      <Search size={18} aria-hidden="true" />
      <span className="hidden md:inline">{t("searchNav")}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: c.paper, fontFamily: bodyFont }}>
      <header className="sticky top-0 z-20" style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <NavLink to={`/${lang}`} className="flex items-center gap-2 text-base md:text-lg font-bold shrink-0" style={{ color: c.paper, fontFamily: displayFont }}>
            {/* The "bb" mark chosen in Oct 2026 (brand/logos/2-monogram.svg). On the dark header
                its own dark tile would vanish, so it gets a thin light outline. */}
            <img src="/favicon.svg" alt="" width="28" height="28" className="rounded-md" style={{ boxShadow: "0 0 0 1px #3A4A57" }} />
            Belgium Benefits
          </NavLink>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className="rounded-md px-3 py-1.5 text-sm font-medium"
                style={({ isActive }) => ({
                  color: isActive ? c.gold : "#B7C4CE",
                  background: isActive ? "rgba(184,134,59,0.12)" : "transparent",
                })}
              >
                {it.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            {searchButton}
            <div className="hidden md:block">
              <LangSwitcher />
            </div>
            <div className="md:hidden">
              <LangSwitcher compact />
            </div>
          </div>
        </div>
      </header>

      {/* pb-20 on mobile keeps the tab bar from covering the last card */}
      <main className="flex-1">
        <HistoryArrows t={t} />
        <Outlet />
      </main>

      {/* pb-20 on mobile keeps the fixed tab bar from covering the footer */}
      <div className="pb-20 md:pb-0">
        <Footer />
      </div>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 flex border-t"
        style={{ borderColor: c.line, background: "white" }}
        aria-label="Main"
      >
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className="flex-1 flex flex-col items-center gap-1 py-2.5"
              style={({ isActive }) => ({ color: isActive ? c.post : c.inkSoft })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? c.post : c.inkSoft} />
                  <span className="text-[13px] font-medium">{it.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
