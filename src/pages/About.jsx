import { useParams } from "react-router-dom";
import { c, displayFont } from "../theme.js";
import { LANGS } from "../i18n.js";
import { about } from "../content/about.js";
import { usePageMeta } from "../lib/meta.js";
import { PUBLISHER_NAME, CONTACT_EMAIL } from "../config.js";

// {email} becomes a mailto link; {name} is plain text. Unconfigured builds fall back to the
// generic wording rather than printing an empty name.
function fill(text) {
  const parts = text.replace("{name}", PUBLISHER_NAME || "Belgium Benefits").split("{email}");
  if (parts.length === 1) return text.replace("{name}", PUBLISHER_NAME || "Belgium Benefits");
  return (
    <>
      {parts[0]}
      <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: c.post, fontWeight: 600 }}>
        {CONTACT_EMAIL}
      </a>
      {parts[1]}
    </>
  );
}

export default function About() {
  const { lang } = useParams();
  const a = about[lang] ?? about.en;
  usePageMeta({
    lang,
    title: a.title,
    description: a.intro,
    path: `/${lang}/about`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/about`])),
  });

  return (
    <>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-8 md:py-12">
          <h1 className="text-2xl md:text-4xl mb-3" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {a.title}
          </h1>
          <p className="text-sm md:text-base max-w-prose" style={{ color: "#B7C4CE" }}>
            {a.intro}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-7">
        {a.sections.map((s) => (
          <section key={s.heading} className="mb-8">
            <h2 className="text-lg md:text-xl mb-3" style={{ color: c.ink, fontFamily: displayFont, fontWeight: 700 }}>
              {s.heading}
            </h2>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed max-w-prose" style={{ color: c.inkSoft }}>
              {s.body.map((p, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.gold }} />
                  <span>{fill(p)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
