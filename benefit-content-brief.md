# Belgium Benefits App — Content Research Brief

## Goal
Research and compile 15–20 real, verified Belgian benefits that must be actively
requested (or are easy to miss), matching the schema below. Prioritize accuracy
over quantity — every field must trace back to an official source.

## Data schema (per benefit)
```
id: number
category: one of [housing, family, health, employment, other]
situations: array from [pregnancy, job-loss, buying-home, renting, health-issue]
  (add new situation tags if a strong pattern emerges — flag any additions)
region: Flanders | Wallonia | Brussels | Federal | German-speaking Community
communes: [] (leave empty unless the benefit is commune-specific, not region-wide)
institution: the responsible body (e.g. "Kind & Gezin", "FAMIWAL", "Actiris")
verified: today's date (DD Mon YYYY) — the date you confirmed this against the
  official source
status: "verified" (only use this if checked directly against an official .be
  government page — otherwise mark "community" and flag for review)
source_url: the official page you verified this against

content: { en, nl, fr, de } — EACH language needs:
  title: string
  desc: 1–2 plain-language sentences
  deadline: the timing rule in plain language (this is the single most
    important field — get it exactly right)
  amount: string (approximate amount or what it covers)
  requirements: array of { type: "phone"|"card"|"id"|"doc", label: string }
    — type "phone" = itsme app needed, "card" = eID + card reader needed,
    "id" = plain ID sufficient, "doc" = a specific document needed.
    Only include what's actually required — omit the field entirely if none.
  steps: array of plain-language steps to request it, in order
```

## Priority list to research first (spread across categories/regions)
1. Geboortepremie / Prime de Naissance / Geburtsprämie — verify separately for
   Flanders (Kind & Gezin / Groeipakket), Wallonia (FAMIWAL), Brussels
   (Iriscare), and the German-speaking Community (DKF) — these are 4 distinct
   systems, not one.
2. Gewaarborgd Wonen (Flemish Housing Fund income-loss mortgage guarantee) —
   note: verify whether this is the specific Flemish government scheme or
   private lender insurance; these are different things and easy to conflate.
3. Huurpremie / rental subsidy — separately for Flanders, Wallonia, Brussels
4. Energiepremie / energy renovation grants (regional, via Fluvius/ORES/Sibelga
   or regional housing bodies)
5. Studietoelage / school allowance (per Community: Flemish, French, German)
6. OCMW leefloon / integration income — eligibility + request process
7. Zorgbudget voor ouderen / disability support budget
8. Werkloosheidsuitkering — first-time unemployment benefit request steps
9. Startbaanovereenkomst / youth first-job premium
10. Mobility budget / employer commuting allowance rules
11. Mutualiteit supplementary reimbursements (pick 1–2 common, concrete examples)
12. Premie voor personen met een handicap (disability allowance)

Add more once these are solid — breadth matters less than every entry being
accurate and complete.

## Sourcing rules
- Only use official .be government domains, or a benefit's own official portal,
  as the primary source.
- Record the exact source URL per entry.
- If a rule seems to have changed recently or you're unsure, mark status as
  "community" rather than "verified" — false confidence is worse than an
  honest gap.
- Requirements around itsme/eID: check each portal's actual login method
  before assuming — don't copy the birth grant's requirements onto unrelated
  benefits.

## Output
One structured file (JSON preferred) with one object per benefit, following
the schema above — ready to drop into the app's `benefits` array during the
Claude Code build phase.
