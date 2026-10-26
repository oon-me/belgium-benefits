import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Benefits from "./pages/Benefits.jsx";
import BenefitDetail from "./pages/BenefitDetail.jsx";
import Submit from "./pages/Submit.jsx";
import Legal from "./pages/Legal.jsx";
import HealthFunds from "./pages/HealthFunds.jsx";
import AllBenefits from "./pages/AllBenefits.jsx";
import About from "./pages/About.jsx";
import Search from "./pages/Search.jsx";
import { LANGS } from "./i18n.js";
import { loadPrefs } from "./lib/prefs.js";

// Language lives in the path, so every page has one address per language for search engines
// and for anyone sharing a link.
function defaultLang() {
  const stored = loadPrefs().lang;
  if (LANGS.includes(stored)) return stored;
  // navigator does not exist during prerender.
  if (typeof navigator === "undefined") return "en";
  const preferred = (navigator.languages || [navigator.language || "en"])
    .map((l) => l.slice(0, 2).toLowerCase())
    .find((l) => LANGS.includes(l));
  return preferred || "en";
}

// `<Navigate to=".">` inside a splat route resolves back onto the splat, so an unknown path
// rendered an empty <main> under the header. Redirect to the language home explicitly.
function RedirectToLangHome() {
  const { lang } = useParams();
  return <Navigate to={`/${lang}`} replace />;
}

// An unknown language code should not silently render English at a URL that claims otherwise.
function RequireLang({ children }) {
  const { lang } = useParams();
  if (!LANGS.includes(lang)) return <Navigate to={`/${defaultLang()}`} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLang()}`} replace />} />
      <Route
        path="/:lang"
        element={
          <RequireLang>
            <Layout />
          </RequireLang>
        }
      >
        <Route index element={<Landing />} />
        <Route path="start" element={<Navigate to="location" replace />} />
        <Route path="start/:step" element={<Onboarding />} />
        <Route path="benefits" element={<Benefits />} />
        <Route path="benefit/:idSlug" element={<BenefitDetail />} />
        <Route path="submit" element={<Submit />} />
        <Route path="legal" element={<Legal />} />
        <Route path="health-funds" element={<HealthFunds />} />
        <Route path="all" element={<AllBenefits />} />
        <Route path="about" element={<About />} />
        <Route path="search" element={<Search />} />
        <Route path="*" element={<RedirectToLangHome />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
