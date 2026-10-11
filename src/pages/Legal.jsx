import { useParams } from "react-router-dom";
import { c, displayFont } from "../theme.js";
import { useT, LANGS } from "../i18n.js";
import { usePageMeta } from "../lib/meta.js";
import { PUBLISHER_NAME, CONTACT_EMAIL, isPublisherConfigured } from "../config.js";

const LAST_UPDATED = "18 Sep 2026";

function Section({ heading, children }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg mb-2" style={{ color: c.ink, fontFamily: displayFont, fontWeight: 700 }}>
        {heading}
      </h2>
      <div className="text-sm leading-relaxed" style={{ color: c.inkSoft }}>
        {children}
      </div>
    </section>
  );
}

export default function Legal() {
  const { lang } = useParams();
  const t = useT(lang);
  usePageMeta({
    lang,
    title: t("legalTitle"),
    description: t("legalNotOfficialBody"),
    path: `/${lang}/legal`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/legal`])),
  });

  const publisher = t("legalPublisherBody")
    .replace("{name}", PUBLISHER_NAME)
    .replace("{email}", CONTACT_EMAIL);

  return (
    <>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {t("legalTitle")}
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-5 md:px-6 py-7">
        {/* The most important sentence on the site for anyone who arrived from a search engine
            and assumes this is a government page. */}
        <p
          className="rounded-xl p-4 mb-7 text-sm font-semibold border-2"
          style={{ borderColor: c.clay, background: c.clayBg, color: c.ink }}
        >
          {t("legalNotOfficialHeading")}
        </p>

        <Section heading={t("legalPublisherHeading")}>
          {isPublisherConfigured ? (
            <p>
              {publisher.split(CONTACT_EMAIL)[0]}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: c.post, fontWeight: 600 }}>
                {CONTACT_EMAIL}
              </a>
              {publisher.split(CONTACT_EMAIL)[1]}
            </p>
          ) : (
            <p style={{ color: c.clay, fontWeight: 600 }}>{t("legalPublisherMissing")}</p>
          )}
        </Section>

        <Section heading={t("legalNotOfficialHeading")}>
          <p>{t("legalNotOfficialBody")}</p>
        </Section>
        <Section heading={t("legalAdviceHeading")}>
          <p>{t("legalAdviceBody")}</p>
        </Section>
        <Section heading={t("legalAccuracyHeading")}>
          <p>{t("legalAccuracyBody")}</p>
        </Section>
        <Section heading={t("legalLiabilityHeading")}>
          <p>{t("legalLiabilityBody")}</p>
        </Section>
        <Section heading={t("legalPrivacyHeading")}>
          <p>{t("legalPrivacyBody")}</p>
        </Section>

        <p className="text-xs" style={{ color: c.inkSoft }}>
          {t("legalLastUpdated")}: {LAST_UPDATED}
        </p>
      </div>
    </>
  );
}
