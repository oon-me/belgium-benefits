import { useCallback, useState } from "react";

const KEY = "bb.prefs.v1";

// localStorage can throw (private mode, blocked site data), and it is only a convenience here —
// region and commune also travel in the URL, so a failed read must never break the page.
export function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore — the URL still carries what matters */
  }
}

export function usePrefs() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const update = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);
  return [prefs, update];
}
