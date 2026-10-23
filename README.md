# Belgium Benefits App

Mobile app showing which Belgian benefits you must **actively request**. Region + commune +
life situation in, matched benefits out, in EN / NL / FR / DE.

## Running it

```bash
npm run dev
```

Node 24.21.0 (LTS) is installed via nvm at `~/.nvm`, with `node`/`npm`/`npx` symlinked into
`~/.local/bin` so they resolve on PATH without sourcing nvm. `~/.zshrc` was created to load nvm
(there was no shell profile on this machine before).

`npm run build` produces `dist/`. Verified working: 1565 modules, ~278 kB JS / 9.3 kB CSS.

**Note:** the Claude desktop preview launcher (`.claude/launch.json`) hangs on this machine —
it starts `npm run dev` but the wrapper never lets Vite bind the port. Running `npm run dev`
in a terminal works fine and starts in ~2s. The launch config is left in place in case the
launcher is fixed.

## Where it runs

| | Service | What it does |
|---|---|---|
| **Code** | GitHub — [oon-me/belgium-benefits](https://github.com/oon-me/belgium-benefits) (public) | Source of truth. Every push to `main` deploys. |
| **Hosting** | Cloudflare Pages — project `belgium-benefits` | Builds with `npm run build`, serves `dist/`. Free plan, no card on the account. |
| **DNS** | Cloudflare — zone `belgiumbenefits.be` (free) | Nameservers `braelyn.ns.cloudflare.com`, `brian.ns.cloudflare.com`. |
| **Domain** | OVHcloud — `belgiumbenefits.be` | Registration only: renews ~Oct each year at €7.89 + VAT. Holder: Onyeka Okwuosa. |
| **Mail** | OVHcloud Zimbra Starter — `info@belgiumbenefits.be` | Free while the domain stays at OVH. Webmail: <https://webmail.mail.ovh.net/> (not Gmail — it is not a Google account). |

Live at **<https://belgiumbenefits.be>** (also <https://belgium-benefits.pages.dev>).
`www.belgiumbenefits.be` and plain `http://` both redirect there permanently, keeping the path and
query string.

**Publishing a change:** edit → `git add` → `git commit` → `git push`. Cloudflare picks the push
up within seconds and deploys in about a minute. Nothing else to do.

**The Cloudflare GitHub app** can see only this one repository ("Only select repositories"), by
design. Change that in GitHub → Settings → Applications → Cloudflare Workers and Pages.

### DNS records that must exist in Cloudflare

The mailbox depends on these. They are what OVH's Zimbra setup wrote into OVH's own zone, read back
from `ns111.ovh.net` and copied into Cloudflare. **Setting up Zimbra changed the MX records** from
OVH's defaults, so if Zimbra is ever reconfigured, re-read OVH's zone and compare.

| Type | Name | Value | Proxy |
|---|---|---|---|
| MX | `@` | `mx0.mail.ovh.net` (priority 1) | DNS only |
| MX | `@` | `mx1.mail.ovh.net` (priority 5) | DNS only |
| MX | `@` | `mx2.mail.ovh.net` (priority 50) | DNS only |
| MX | `@` | `mx3.mail.ovh.net` (priority 100) | DNS only |
| TXT | `@` | `v=spf1 include:mx.ovh.com ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine` | — |
| CNAME | `ovhmo-selector-1._domainkey` | `ovhmo-selector-1._domainkey.4992886.az.dkim.mail.ovh.net` | **DNS only** |
| CNAME | `ovhmo-selector-2._domainkey` | `ovhmo-selector-2._domainkey.4992887.az.dkim.mail.ovh.net` | **DNS only** |
| SRV | `_autodiscover._tcp` | `0 0 443 zimbra1.mail.ovh.net` | — |

The two DKIM records must never be proxied, or signatures fail and mail lands in spam. Verified
2026-10-12 on a real message in Gmail: **SPF pass, DKIM pass** (`ovhmo-selector-1`), Inbox.

Site records: `@` CNAME `belgium-benefits.pages.dev` (created by Pages when the custom domain was
attached — don't edit by hand) and `www` CNAME `belgiumbenefits.be`, **proxied**, which exists only
so the redirect rule below can act on it. `1|www…` / `3|welcome` TXT records are leftover OVH
markers and harmless. The `google-site-verification=…` TXT proves ownership to Google Search
Console — removing it un-verifies the property.

**Rules → Redirect Rules → "Redirect from WWW to root"**: `https://www.*` → `https://${1}`, 301,
*Preserve query string* **on** (shared results links carry the visitor's commune in the query).
**SSL/TLS → Edge Certificates → Always Use HTTPS: on** (without it, `http://www…` returned a 522).

### Privacy settings that must stay this way

The privacy page promises no tracking, analytics or advertising cookies, and nothing shared.
These settings keep that true — check them if anything in Cloudflare is changed:

- **Security → Settings → Bot fight mode: off** (it sets challenge cookies).
- **Security → Settings → Browser integrity check: off** (can block real visitors).
- **Never enable Cloudflare Web Analytics** — it injects a tracking beacon.
- **Security → Settings → Email Address Obfuscation: off.** It rewrites `info@` in the prerendered
  HTML into a `/cdn-cgi/` link plus an injected decoder script, which breaks the address for
  readers without JavaScript and protects nothing — the address is in the JS bundle anyway.
- **No third-party resources.** The Inter font is bundled (`@fontsource/inter`) rather than loaded
  from Google Fonts, which would hand every visitor's IP address to Google. Keep it that way:
  `curl -s https://belgiumbenefits.be/en | grep -oE '(href|src)="https?://[^"]+"'` should list
  only links to official `.be` sources.

### Security settings

Checked and set 2026-10-12. Each line says where it lives and how to confirm it still holds.

| Setting | Where | Check |
|---|---|---|
| CSP, anti-framing, nosniff, referrer and permissions policy | `public/_headers` | `curl -sI https://belgiumbenefits.be/en` |
| `noindex` on the `*.pages.dev` copies | `public/_headers` | `curl -sI https://belgium-benefits.pages.dev/en \| grep -i robots` |
| `security.txt` — **`Expires` must be pushed forward every year** (now 2027-10-01) | `public/.well-known/security.txt` | open `/.well-known/security.txt` |
| HSTS, 6 months, include subdomains, **no preload** | SSL/TLS → Edge Certificates | `curl -sI https://belgiumbenefits.be \| grep -i strict-transport` |
| Certificates for `belgiumbenefits.be` and `www` renew automatically (Cloudflare); the weekly data check opens an issue if either has fewer than 21 days left | SSL/TLS → Edge Certificates | `echo \| openssl s_client -connect belgiumbenefits.be:443 2>/dev/null \| openssl x509 -noout -enddate` |
| Minimum TLS 1.2 | SSL/TLS → Edge Certificates | `curl -sI --tlsv1.1 --tls-max 1.1 https://belgiumbenefits.be` fails |
| CAA: only Let's Encrypt, Google Trust Services, SSL.com (+ Cloudflare's own) may issue certificates; reports to `info@` | DNS → Records (CAA) | `dig CAA belgiumbenefits.be` |
| DNSSEC — Cloudflare signs, DS record (key tag 2371, alg 13) at OVH | DNS → Settings; OVH → DS records | `dig +dnssec belgiumbenefits.be @1.1.1.1` shows the `ad` flag |
| AI training crawlers forbidden in `robots.txt` and blocked by name; search engines allowed | Security → Settings → Configure AI bot policies: Search **Allow**, Agent **Allow**, Training **Disallow** (never **Block** — see below), Bot Preference Sync on | `curl -s -A CCBot/2.0 -o /dev/null -w '%{http_code}' https://belgiumbenefits.be/en` → 403 |
| Dependabot alerts + security updates, secret scanning + push protection | GitHub → repo Settings → Code security | — |
| `main` cannot be force-pushed or deleted (admins included) | GitHub → repo Settings → Branches | — |

**Training must stay on Disallow, not Block.** In October 2026 the Block setting's managed rule
("Block AI training crawlers - BOBA-199") also blocked the real Googlebot (AS15169), so Google got
403 on every page it tried and indexed none of them. Disallow lists the training crawlers in
`robots.txt` and still blocks them by name at the edge (rule BOBA-161), but leaves Googlebot alone. If pages
drop out of Google, look first at Security → Analytics → Events for blocks from `66.249.*`.

HSTS is deliberately not on the preload list: preloading is near-permanent, and the site may one
day be wound down.

**DNSSEC warning:** if the nameservers ever move away from Cloudflare, **delete the DS record at OVH
first** and wait a day. A DS record pointing at keys the new DNS host doesn't have makes the domain —
site and mail — unreachable for every validating resolver.

**Two-factor authentication** guards the three accounts that can take the site down: GitHub
(authenticator app), Cloudflare, and OVH (which controls the domain itself). Keep it on all three.

### Domain renewal

The domain renews automatically at OVH. If the payment card changes, update it there — a lapsed
`.be` goes offline and, after a 40-day quarantine, can be bought by anyone — and an expired benefits
domain is an attractive target for someone impersonating the site. To wind the project down,
replace the site with a notice pointing to official sources and keep the domain one more year
before cancelling. The holder email must stay a Gmail address, never
`info@belgiumbenefits.be`: transfer codes and registry notices go to the holder, and an address on
the domain itself is unreachable exactly when the domain is broken.

## Layout

```
src/main.jsx              BrowserRouter
src/App.jsx               routes only
src/theme.js              design tokens
src/i18n.js               UI strings, useT, getContent
src/constants.js          categories, situations, income tiers
src/lib/match.js          the matcher — imported by the app AND by the data check
src/lib/meta.js           buildMeta() + usePageMeta — shared with the prerenderer
src/lib/prefs.js          localStorage preferences
src/lib/slug.js           slugify, benefitPath, parseBenefitParam
src/entry-server.jsx      SSR entry, used only at build time
src/components/           Layout (responsive shell), BenefitCard, StampBadge, LangSwitcher
src/pages/                Landing, Onboarding, Benefits, BenefitDetail, Submit
src/data/benefits.json    the 20 researched benefits (living copy — edit this one)
src/data/communes.js      commune lookup/localisation, shared by the app and the data check
src/data/communes.json    all 565 Belgian municipalities (Statbel REFNIS, 1 Jan 2025)
src/data/local-tips.js    community tips (empty — see the file)
scripts/check-data.mjs    schema + matcher validation (npm run check)
scripts/prerender.mjs     writes 92 static pages + sitemap.xml + robots.txt

belgium-benefits.json       frozen snapshot of the original handoff — do not edit or re-copy
                            over src/data/benefits.json; the two differ by excluded_communes
benefits-app-prototype.jsx  original phone-mockup prototype, kept unmodified
PROJECT-BRIEF.md / benefit-content-brief.md  handoff docs
```

## Routes

Language is the first path segment, so every page has one address per language.

```
/                      redirect to the visitor's language
/:lang                 landing
/:lang/start/:step     onboarding — location | situation | income
/:lang/benefits        results (?region= &commune= &situations= &category= &q=)
/:lang/benefit/:idSlug one benefit — the shareable page, e.g.
                       /nl/benefit/12-allocation-d-etudes-studiebeurs-franse-gemeenschap
/:lang/submit          submit a benefit
```

An unknown language code redirects rather than quietly rendering English at a URL that
claims otherwise. `/:lang/benefits` redirects to onboarding when no region is known.

**Slugs are cosmetic; the leading id is what resolves.** `/nl/benefit/12` and
`/nl/benefit/12-anything-at-all` both find benefit 12 and then redirect to the canonical
slug. That means links people already shared keep working when a title is reworded or
retranslated, and search engines still see one address per benefit per language. Slugs are
generated per language from that language's title, and German transliterates umlauts
(`Geburtsprämie` → `geburtspraemie`, not `geburtspramie`). All 80 benefit paths are unique;
`npm run check` would catch a collision.

Region and commune are stored in `localStorage` *and* mirrored into the query string. The URL
wins, so a link someone shares shows the sender's results rather than the recipient's.

**Deployment note:** prerendering writes a real file for every benefit, landing, ask and
submit page, so those are served directly. The interactive routes (`/:lang/benefits`,
`/:lang/start/*`) are not prerendered, so the host still needs an SPA rewrite — serve
`spa.html` (the empty shell) for exactly those routes — see `public/_redirects`, and never make
that rule a catch-all: Cloudflare applies it before static files. `index.html` is the
prerendered home page for the bare domain. `vite dev` and `vite preview` fall back to
`index.html`, which also works.

## Meta tags and prerendering

`npm run build` runs three steps: the client build, an SSR build of `src/entry-server.jsx`,
then `scripts/prerender.mjs`, which writes a real HTML file per public route — 92 of them
(4 languages x [landing + ask + submit + 20 benefits]) — plus `sitemap.xml` and `robots.txt`.

This is not decoration. **Link unfurlers — WhatsApp, Slack, LinkedIn, Facebook — never run
JavaScript**, so against a plain SPA they would only ever see an empty `<div id="root">` and
show a blank preview. Prerendering also means each page carries its real content in the HTML,
so it works with JavaScript disabled or still loading.

`src/lib/meta.js` exports one pure `buildMeta()` used both by the `usePageMeta` hook at
runtime and by the prerender script, so the crawler's view and the browser's view cannot
drift. Each page gets its own `<title>`, description, `og:` tags, canonical URL, and
`hreflang` alternates pointing at the other three languages' slugs.

```bash
VITE_SITE_URL="https://your-domain.be" npm run build
```

**`VITE_SITE_URL` is required for the SEO parts.** Canonical, `og:url`, `hreflang` and the
sitemap all need an absolute origin — a relative canonical is ignored, and emitting one would
be worse than emitting none, so without the variable those tags are skipped and the build
says so. Title, description and `og:title`/`og:description` are still written.

## Communes

All **565 Belgian municipalities** as of 1 Jan 2025, from Statbel's official REFNIS dataset
(<https://statbel.fgov.be/en/open-data/code-refnis-0>) — 285 Flemish, 261 Walloon, 19 Brussels.
The count reflects the Flemish mergers of 2019 and 2025. The earlier five-per-region lists were
the prototype's placeholders. **Do not hand-edit `communes.json`; regenerate it from Statbel.**

Names are localised, which is a correctness issue rather than a nicety: Kelmis is *La Calamine*
in French and Amel is *Amblève*, so a French speaker would never have found their own commune
in a German-only list. Statbel publishes nl/fr/de; English uses the local official name rather
than inventing exonyms for a handful of cities and not the rest.

**Matching is by NIS code, never by name.** `benefits.json` names communes in whichever
language its source used, and `resolveCommune()` accepts a NIS code or a name in any of the
three languages, so "Kelmis", "La Calamine" and `63040` all resolve to the same municipality.
`npm run check` fails if any commune named in the data does not resolve — which is what stops
an umlaut typo from silently disabling the entry 7 exclusion.

Stored preferences and the `?commune=` parameter hold the NIS code; the picker filters across
all three language names, so typing "Anvers" finds Antwerpen.

## Responsive behaviour

Mobile-first, breaking at Tailwind's `md` (768px).

- **Mobile:** single column, fixed bottom tab bar, compact `<select>` language switcher.
- **Desktop:** sticky top bar with nav and language buttons, no tab bar, results in a
  2-column (`sm`) / 3-column (`xl`) grid inside a `max-w-6xl` container; benefit and form
  pages use a narrower `max-w-3xl` / `max-w-2xl` measure so text stays readable.

## Changes applied to the prototype

1. `benefit.region` is an array — joined with `", "` for display.
2. Region + commune filtering added (`Federal` matches every region; an empty `communes`
   list means region-wide).
3. `school` situation added, with a `GraduationCap` chip and labels in all four languages.
4. The nine German-speaking municipalities added to `communesByRegion.Wallonia`.

Two gaps closed beyond the brief:

5. `note` is now rendered on the detail screen. It was being dropped, which meant the
   `community` stamp appeared with no explanation of what was unconfirmed — and four
   *verified* entries carry material caveats too (id 16's partial annulment, id 7's
   possibly-stale indexation).
6. "Open official request page" is now a real link to `source_url`. It was a dead button.
7. `excluded_communes` added — see below.

## Rebuilt as a responsive website

The prototype was a **phone mockup**: a fixed 380x780 box with a simulated bezel, centred on a
backdrop. That is a design-presentation artifact, not a layout — on desktop it was a small
phone picture in an empty page, and the app's own nav fell below the fold on a short window.

It also had two navigation defects. Screens were tracked in an in-memory `history` array and
the URL never changed, so **the browser's Back and Forward buttons did not work** (Back left
the site entirely) and nothing was linkable, bookmarkable or indexable. Both are fixed: the
bezel is gone, the app fills the viewport, and React Router owns navigation.

One change from what was originally proposed: desktop shows a **grid of cards leading to full
benefit pages**, not a two-pane list/detail split. A two-pane view keeps one URL for every
benefit, which works against the reason for choosing the web — those per-benefit URLs are the
thing worth having.

## Schema addition: `excluded_communes`

Optional array of commune names, present only on entry 7. A benefit can be region-wide
(`communes: []`) and still not apply everywhere in that region:

```js
if (commune && b.excluded_communes?.includes(commune)) return false;
```

`Allocation d'Attente Logement` is `region: ["Wallonia"], communes: []`, but its own verified
text says in all four languages that the scheme excludes the German-speaking Community. Adding
the nine German-speaking municipalities to the commune list (change 4) made them selectable for
the first time and exposed this: an Eupen resident was being matched to a benefit they cannot
claim. Nothing was invented — the exclusion was already stated in the entry; it just had no
machine-readable form. The `verified` date was deliberately left unchanged, since the entry was
not re-checked against its source.

Consequence, and it is the correct one: **Wallonia + "Renting" now returns nothing in the nine
German-speaking communes**, because entry 7 was the region's only renting benefit. An empty
result is the honest answer there. `npm run check` reported this as a warning until entry 42
(ÖWOB public rental housing) closed the gap on 12 Oct 2026. The Community's own rent allowance
(Mietbeihilfe) stopped taking new applications on 1 Jan 2025, so it is deliberately not listed.

## Data validation

```bash
npm run check
```

`scripts/check-data.mjs` validates the schema, four-language sync (step counts and requirement
types must match across `en`/`nl`/`fr`/`de`), and runs the matcher over every
region × commune × situation combination. It fails on structural errors and warns on content
gaps. It imports the commune lists from `src/data/communes.js` — the same module the UI uses —
so a mistyped commune name cannot silently disable a rule. That matters for the German-speaking
names, where `Büllingen` / `Bütgenbach` are easy to get wrong.

Current state (12 Oct 2026): no errors, no warnings.

## Removed before launch

Four things shipped as convincing placeholders. Each was removed or disabled rather than left
looking functional:

- **The Ask screen.** A hardcoded conversation under the header "Answers only from our verified
  benefit database" — there was no database behind it. It stated "Geboortepremie (€1,247)" where
  the verified data says **Startbedrag, €1,310.75**: a wrong figure under an outdated scheme
  name, which is exactly what the project's first convention forbids. Route, page and nav item
  are gone; the four-language strings remain in `i18n.js` for when it is real.
- **The Submit form.** Its button called `preventDefault()` and nothing else, silently
  discarding whatever was typed. Fields and button are now disabled behind a notice saying
  submissions are not open yet.
- **The two local tips.** Real organisations, but carrying `"Sample address, Ghent"` /
  `"Voorbeeldadres"`, which would have rendered to users as real listings. `localTips` is empty;
  the rendering path still works for verified entries.
- **The income step.** Nothing read the answer, yet the copy promised it would "order what we
  show first". Untrue, and it collected a sensitive attribute for no purpose. Onboarding is now
  three steps. Restoring it means re-adding the step and `incomeTiers`; the strings are still
  in `i18n.js`.

Also fixed: an unknown path under a language (`/en/ask`, `/en/typo`) rendered a **blank page**
under the header, because `<Navigate to=".">` inside a splat route resolves back onto the
splat. Unknown paths now redirect to that language's home.

## Keeping the data true

Accuracy is the product; everything else is packaging. Two commands support it:

```bash
npm run check           # schema, four-language sync, matcher, staleness
npm run check:sources   # fetches every source_url and re-checks the published figures
```

`check-sources.mjs` fetches each benefit's official page and tests whether the euro figures we
publish still appear on it. It matches on amounts rather than hashing the page, because a page
hash flags every cookie-banner tweak while missing the thing that matters. It normalises both
number conventions (`1,310.75` and `1.310,75`), ignores values under €10 (footnote markers,
coefficients), and writes a baseline to `data/source-baseline.json` for change detection.

**It never edits `benefits.json`.** It tells you what to look at by hand.

Two refinements keep false alarms out: an entry may name an `amount_source_url` when the
institution publishes its figures on a separate amounts page (RIZIV does), and a figure with cents
counts as found even without a euro sign next to it, because amount tables put "EUR" in the column
header. Ranges such as "entre 90 et 6 000 euros" count for both ends.

### Announced changes: `notice`

Optional object on an entry, for a change that has been announced but is not law yet — for
example the Flemish plan (30 Sep 2026) to pay the startbedrag only for a first child:

```json
"notice": { "date": "30 Sep 2026", "source_url": "https://…", "text": { "en": "…", "nl": "…", "fr": "…", "de": "…" } }
```

It shows in small print as "Ter info / For information / Pour info / Zur Info" on the card and
the detail page, with its date and source. The amounts above it always describe the rules in
force today. `npm run check` warns once a notice is **30 days** old: by then the change may have
passed (update the entry, drop the notice), moved, or been dropped.

### Health-fund extras: `health_funds`

Optional array on an entry (`cm`, `solidaris`, `independent`, `liberal`, `neutral` — see
`healthFunds` in `src/constants.js`). Such an entry is a fund's own extra, not a government
benefit, so the matcher shows it only to someone who picked that fund — in the optional fourth
onboarding step or the selector on the results page (`?fund=` keeps it shareable). Each union has
a Dutch-speaking and a French-speaking side with different offers, so an entry pairs the fund with
a region. `/:lang/health-funds` lists every fund's birth gift side by side, built from the same
entries.

Where a union's regional funds pay different amounts (LM, ML), the entry names each variant
instead of picking one, and `amount_source_url` lists every regional page.

**Check by hand each quarter** — these sites block automated reading, so the weekly check reports
them as unreachable rather than verifying them: CM (`cm.be`), MC (`mc.be`), Solidaris Vlaanderen
(content behind JavaScript tabs) and the German-speaking Community's `ostbelgienfamilie.be`.
Not covered yet: the German-speaking Community's own health funds, Solidaris Brabant, and LM/ML
regional funds other than those named.

### Request links: `request_url` and `request_by_fund`

Each detail page has two buttons. **All information** opens `source_url`, the official page that
explains the conditions. **Request now** opens `request_url`, the page where you actually apply:
a form, a portal or the payer's own page. Either field may be one URL or a per-language map
(`{ "nl": …, "fr": … }`), because some forms exist only per language. With no `request_url`,
only All information shows. Never point it at an aggregator.

`request_by_fund` is for benefits paid through the health fund (maternity pay, birth leave):
`{ "cm": { "nl": "<CM page>", "fr": "<MC page>" }, … }`. Someone who chose a fund goes straight
to that fund's page; someone who didn't sees a row of fund links under the buttons, and
`request_url` (RIZIV's list of all funds) stays as the fallback. A Dutch-speaking side is never
offered to a French speaker or the other way round (`src/lib/request.js`). Not yet found (Oct 2026):
Solidaris Vlaanderen, VNZ and ML pages for these three entries.

### Cadence and owner

| | |
|---|---|
| **Owner** | *(unassigned — a single named person)* |
| **Weekly, automatic** | GitHub Actions (`.github/workflows/data-check.yml`) runs both checks every Monday and opens or updates an issue labelled `data-check` when a figure has vanished from its source, an entry is past its re-check date, or a notice needs follow-up. GitHub emails the owner. It closes the issue when all is clear. |
| **Monthly** | skim Belgian news for announced changes (budget rounds in September/October, new coalition agreements) and add a `notice` where one affects an entry |
| **Quarterly** | full manual re-verification of all entries; update `verified` dates |
| **Each release** | `npm run check` must pass with no errors |

Entries older than **90 days** (`STALE_AFTER_DAYS`) show a visible warning on their page telling
the reader to confirm on the official source, and `npm run check` warns about them. This is
deliberate: silently serving a figure nobody has looked at in a year is the failure mode that
would do real damage.

## Known issues

**Tailwind 3 pulls in two build-time advisories (Oct 2026).** `braces` (high) and
`postcss-selector-parser` (moderate), both denial-of-service on malicious *build input*, reached
through Tailwind 3's file-matching and selector parsing. Neither ships to visitors — the deployed
site is static HTML/CSS/JS — and the only input to the build is this repository's own source, so
there is no practical exposure. The only fix is migrating to Tailwind 4, which is a breaking
change (config moves into CSS). Do it as its own piece of work, not as a hotfix, and **never** run
`npm audit fix --force`: it would silently jump to Tailwind 4 and break the build. The
non-breaking `source-map-js` advisory was fixed with plain `npm audit fix`.

**Entry 7 is shown to people explicitly excluded from it.** `Allocation d'Attente Logement`
is `region: ["Wallonia"], communes: []` (region-wide), but its own verified text says in all
four languages that the scheme excludes the German-speaking Community. Now that the nine
German-speaking municipalities are selectable, an Eupen resident is matched to a benefit they
cannot claim. The schema has no way to express exclusion. Suggested fix — an additive,
optional field, absent on every other entry:

```js
if (commune && b.excluded_communes?.includes(commune)) return false;
```

with `"excluded_communes": ["Eupen","Kelmis","Lontzen","Raeren","Amel","Büllingen","Burg-Reuland","Bütgenbach","Sankt Vith"]` on entry 7. Not applied — it edits verified
research data, which is a content call.

**Closed 12 Oct 2026:** Brussels + "Buying a home" (entry 41, the registration-duties
abattement) and German-speaking Community + "Renting" (entry 42, ÖWOB public rental housing).
To watch: specialist sites report that Brussels plans to raise the abattement ceiling from
€600,000 to €800,000 in 2029. No official text was found, so there is no `notice` yet — add one
once the Brussels government or be.brussels publishes it.

**`note` is English-only.** The schema has one `note` string, so the caveat text shows in
English in the NL / FR / DE interfaces. Needs translating to hold the four-language convention.

**Amounts need re-checking before launch.** Belgian benefit amounts are indexed and move
several times a year. `verified` means "checked on that date", not "correct now". Entries 18
and 19 were last checked 21 Jul 2026; the rest 17–18 Sep 2026.

## Conventions

- Never invent or estimate a figure. Every amount traces to `source_url`. If a number can't be
  confirmed the entry is `community` and `note` says why.
- All four languages stay in sync — a change to one `deadline` is a change to four.
- `deadline` is the most important field; it is the reason the app exists.
- Keep the verified/community stamp visible.

## Tooling
`CLAUDE.md` holds the working rules for AI-assisted sessions. A pre-commit hook in `.githooks/`
runs `npm run check` whenever `src/` or `scripts/` change; it is enabled per clone with
`git config core.hooksPath .githooks`.
