# Belgium Benefits App — Build Brief

Paste this into Claude Code at the start of the build. It is the handoff from the
content-research phase.

## What this is

A mobile app that shows people in Belgium which benefits they must **actively request**
(and therefore commonly miss). The user picks their region and commune, optionally picks
what's going on in their life right now, and sees matching benefits with a plain-language
deadline, amount, and step-by-step instructions — in EN / NL / FR / DE.

## Files

- `benefits-app-prototype.jsx` — working single-file React prototype (~1245 lines). All UI
  chrome, onboarding flow, 4-language interface strings, design tokens, screens. Its
  `benefits` array holds 4–5 **sample** entries that must be replaced.
- `belgium-benefits.json` — **20 real, researched benefits**, all four languages complete.
  This replaces the sample `benefits` array.

## Status of the data

Every entry was checked against an official Belgian government source on **18 Sep 2026**.

- **16 entries are `verified`** — deadline, amount and requirements read off an official
  `.be` page on the date in the `verified` field.
- **4 entries are `community`** — 9 and 11 have figures that sit behind collapsed
  accordions that couldn't be confirmed; 18 (mobility budget) and 19 (mutualiteit
  reimbursement) are **permanently** community, because they're arranged by an employer
  or a private health fund and no single government page can verify them.

Each `community` entry carries a `note` field saying exactly what is unconfirmed. The
prototype already renders a verified/community stamp — keep that distinction visible.

**Belgian benefit amounts are indexed and move several times a year.** Between July and
September 2026, four amounts in this dataset changed. Treat `verified` as "checked on that
date", never "correct forever", and plan a re-check pass before any public launch.

## Data schema

```
id: number
category: "housing" | "family" | "health" | "employment" | "other"
situations: array of "pregnancy" | "job-loss" | "buying-home" | "renting" | "health-issue" | "school"
region: ARRAY of "Flanders" | "Wallonia" | "Brussels" | "Federal"
communes: array of strings — empty means region-wide
institution: string
verified: "DD Mon YYYY" — date last checked against the official source
status: "verified" | "community"
source_url: string
note: string — only on community entries; explains what is unconfirmed
content: { en, nl, fr, de } — each with:
    title, desc, deadline, amount: string
    requirements: array of { type: "phone"|"card"|"id"|"doc", label } — omitted if none
    steps: array of strings
```

`type` meanings: `phone` = itsme app needed, `card` = eID + card reader, `id` = plain ID
sufficient, `doc` = a specific document needed.

### Two deliberate deviations from the original content brief

**1. `region` is an array, not a single string.** Some benefits genuinely span regions and a
single value cannot express it. The French Community study grant (id 12) covers Wallonia
*and* French-speaking Brussels; the Flemish study grant (id 11) covers Flanders *and*
Dutch-language education in Brussels. Filed under one region, those students would never be
matched to their own grant.

**2. `"German-speaking Community"` is no longer a region value.** The nine German-speaking
municipalities are legally inside the Walloon Region, and the onboarding screen only offers
Flanders / Wallonia / Brussels — so a resident of Eupen has no button to press. Entries 4
and 13 are now `region: ["Wallonia"]` with those nine municipalities listed in `communes`:
Eupen, Kelmis, Lontzen, Raeren, Amel, Büllingen, Burg-Reuland, Bütgenbach, Sankt Vith.

`"Federal"` in the region array means "available anywhere in Belgium".

## Code changes required

The prototype predates the schema above. Four changes:

1. **Region is now an array.** `benefit.region` is printed directly to screen (~line 1058)
   and will render as `Flanders,Brussels`. Join it for display.

2. **Region filtering does not exist yet.** The current filter (~line 665) only handles
   category, search text and situations. Region and commune are collected during onboarding
   and displayed, but filter nothing. Add:
   ```js
   if (userRegion && !b.region.includes("Federal") && !b.region.includes(userRegion)) return false;
   if (b.communes.length > 0 && !b.communes.includes(userCommune)) return false;
   ```

3. **Add the `school` situation.** Four benefits use it (ids 11, 12, 13, 17) and it has no
   chip yet. Add to the `situations` array (~line 250) with a `GraduationCap` icon imported
   from `lucide-react`, plus a label in all four blocks of `translations[lang].situations`.
   Suggested labels — EN "Studying or in training", NL "Studeren of in opleiding",
   FR "Études ou formation", DE "Studium oder Ausbildung".

4. **Add the nine German-speaking municipalities** to `communesByRegion.Wallonia` (~line 582),
   or entries 4 and 13 can never be matched. The existing commune lists are short samples and
   will need expanding for real use.

### Known gap, not a bug

Entry 18 (mobility budget) deliberately has an empty `situations` array. It's the only
"negotiating your job package" item, and one entry doesn't justify a new onboarding chip.
It is still reachable via the Employment category and browse-all. Once there are 2–3 more
like it (meal vouchers, commuting allowance, eco-cheques), add a `new-job` situation.

## Suggested build order

1. Scaffold: Vite + React + Tailwind. Install `lucide-react`.
2. Drop the prototype in as the main component, confirm it renders unchanged.
3. Move `benefits` out to an imported `benefits.json`; replace with the 20 real entries.
4. Apply the four code changes above.
5. Test the matcher: pick each region and each situation, confirm sensible results and no
   empty states where there shouldn't be. Specifically check that a Wallonia + Eupen user
   sees entries 4 and 13, and that a Brussels user sees entry 12.
6. Then: real commune lists, search, the Ask and Submit screens.

## Conventions to preserve

- **Never invent or estimate a figure.** Every amount traces to `source_url`. If a number
  can't be confirmed, the entry is `community` and the `note` says why.
- **All four languages stay in sync.** A change to a `deadline` in one language must be made
  in all four.
- `deadline` is the single most important field — it's the reason the app exists.
- Keep the verified/community stamp visible. Users should be able to tell what's
  government-confirmed and what isn't.
