import { c } from "../theme.js";

// Shown only when a page's benefit data is still on its way after an in-app navigation (a first
// visit waits for the data in main.jsx), or when it could not be fetched at all.
export default function Loading({ t, failed }) {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-20 text-center text-sm" role="status" style={{ color: c.inkSoft }}>
      {failed ? t("loadError") : t("loading")}
    </div>
  );
}
