// Belgian benefit amounts are indexed and move several times a year, so "verified" is always
// "checked on that date", never "correct now". After a while that distinction has to become
// visible to the reader rather than living in a footnote.
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

export const STALE_AFTER_DAYS = 90;

export function parseVerified(verified) {
  const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(verified || "");
  if (!m || !(m[2] in MONTHS)) return null;
  return new Date(Date.UTC(Number(m[3]), MONTHS[m[2]], Number(m[1])));
}

export function ageInDays(verified, now = new Date()) {
  const d = parseVerified(verified);
  if (!d) return null;
  return Math.floor((now - d) / 86400000);
}

export function isStale(verified, now = new Date()) {
  const age = ageInDays(verified, now);
  return age !== null && age >= STALE_AFTER_DAYS;
}

export function monthsSince(verified, now = new Date()) {
  const age = ageInDays(verified, now);
  return age === null ? null : Math.max(1, Math.round(age / 30));
}
