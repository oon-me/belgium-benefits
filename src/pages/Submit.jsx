import { useParams } from "react-router-dom";
import { c, displayFont } from "../theme.js";
import { useT, LANGS } from "../i18n.js";
import { usePageMeta } from "../lib/meta.js";

export default function Submit() {
  const { lang } = useParams();
  const t = useT(lang);
  const fields = t("fields");
  usePageMeta({
    lang,
    title: t("submitHeadline"),
    description: t("submitSub"),
    path: `/${lang}/submit`,
    alternates: Object.fromEntries(LANGS.map((l) => [l, `/${l}/submit`])),
  });

  return (
    <>
      <div style={{ background: c.ink }}>
        <div className="mx-auto w-full max-w-2xl px-5 md:px-6 py-6 md:py-8">
          <h1 className="text-xl md:text-3xl" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
            {t("submitHeadline")}
          </h1>
          <p className="text-[11px] md:text-sm mt-1" style={{ color: "#8AA0AE" }}>
            {t("submitSub")}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-5 md:px-6 py-6 flex flex-col gap-4">
        {/* The button used to call preventDefault() and nothing else — it looked like it
            worked and silently discarded what people typed. Until there is somewhere to send
            this, the form says so and the fields are disabled. */}
        <p className="rounded-xl p-3.5 text-xs leading-relaxed border" style={{ borderColor: c.gold, background: "#F6EDDB", color: c.ink }}>
          {t("submitClosed")}
        </p>
        {[
          { label: fields.title, placeholder: "e.g. Energiepremie", type: "text" },
          { label: fields.institution, placeholder: "e.g. Fluvius", type: "text" },
          { label: fields.amount, placeholder: "e.g. €150", type: "text" },
          { label: fields.deadlineLabel, placeholder: "e.g. within 3 months of invoice", type: "text" },
          { label: fields.link, placeholder: "https://...", type: "url" },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs font-semibold" style={{ color: c.ink }} htmlFor={field.label}>
              {field.label}
            </label>
            <input
              id={field.label}
              type={field.type}
              placeholder={field.placeholder}
              disabled
              className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-xs md:text-sm border outline-none disabled:opacity-60"
              style={{ borderColor: c.line, background: c.paperDim }}
            />
          </div>
        ))}
        <button
          type="button"
          disabled
          className="w-full sm:w-auto sm:self-start rounded-lg px-8 py-3.5 font-semibold text-sm mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: c.gold, color: c.ink }}
        >
          {t("submitBtn")}
        </button>
      </div>
    </>
  );
}
