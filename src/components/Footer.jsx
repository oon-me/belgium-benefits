import { Link, useParams } from "react-router-dom";
import { c } from "../theme.js";
import { useT } from "../i18n.js";
import { about } from "../content/about.js";

// The "not official" line rides on every page, not just the legal one — people arrive from
// search engines directly onto a benefit page and need to know whose site they are reading.
export default function Footer() {
  const { lang } = useParams();
  const t = useT(lang);
  return (
    <footer className="border-t mt-10" style={{ borderColor: c.line, background: c.paperDim }}>
      <div className="mx-auto w-full max-w-6xl px-5 md:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-xs" style={{ color: c.inkSoft }}>
          {t("footerNotOfficial")}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link to={`/${lang}/about`} className="text-xs font-semibold" style={{ color: c.post }}>
            {(about[lang] ?? about.en).title}
          </Link>
          <Link to={`/${lang}/all`} className="text-xs font-semibold" style={{ color: c.post }}>
            {t("allTitle")}
          </Link>
          <Link to={`/${lang}/health-funds`} className="text-xs font-semibold" style={{ color: c.post }}>
            {t("compareFunds")}
          </Link>
          <Link to={`/${lang}/legal`} className="text-xs font-semibold" style={{ color: c.post }}>
            {t("footerLegal")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
