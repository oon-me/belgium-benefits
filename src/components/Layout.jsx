import { NavLink, Outlet, useParams } from "react-router-dom";
import { Home, PlusCircle } from "lucide-react";
import { c, bodyFont, displayFont } from "../theme.js";
import { useT } from "../i18n.js";
import LangSwitcher from "./LangSwitcher.jsx";
import Footer from "./Footer.jsx";

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: c.paper, fontFamily: bodyFont }}>
      <header className="sticky top-0 z-20" style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <NavLink to={`/${lang}`} className="text-base md:text-lg font-bold shrink-0" style={{ color: c.paper, fontFamily: displayFont }}>
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

          <div className="hidden md:block">
            <LangSwitcher />
          </div>
          <div className="md:hidden">
            <LangSwitcher compact />
          </div>
        </div>
      </header>

      {/* pb-20 on mobile keeps the tab bar from covering the last card */}
      <main className="flex-1">
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
                  <span className="text-[10px] font-medium">{it.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
