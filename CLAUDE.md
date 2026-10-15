# Belgium Benefits — working rules

Live site: https://belgiumbenefits.be (Cloudflare Pages, deploys on every push to `main`).
Publishers: Onyeka Okwuosa & Julie Vermassen (private individuals). Contact: info@belgiumbenefits.be.
The README is the full manual; read the relevant section before changing hosting, DNS or data rules.

## Data — accuracy is the product
- Every figure comes from an **official page** (government or the health fund's own site), never
  from aggregators, blogs or comparison sites. Record the URL in `source_url`
  (or `amount_source_url` when figures live on a separate page) and today's date in `verified`.
- Can't confirm it on an official page → don't publish it. Announced-but-not-law changes go in a
  `notice`, never into the amounts.
- All four languages (en, nl, fr, de) stay in sync: same steps count, same requirement types.
  The `institution` field is not translated, so use official names, not English sentences.
- German-speaking Community communes have their own family, housing and study rules: Walloon
  entries in those areas need `excluded_communes`.
- Never edit verified data silently; say what changed and why in the commit.

## Before every commit
- `npm run check` must pass (a pre-commit hook enforces it).
- `npm run build` must succeed for code changes; test previewable changes in the browser.
- Use a branch, push it, check `https://<branch>.belgium-benefits.pages.dev`, then fast-forward `main`.

## Never
- `npm audit fix --force` (breaks Tailwind 3; see README "Known issues").
- Third-party scripts, fonts, analytics, ad or tracking cookies, Cloudflare Web Analytics,
  Bot Fight Mode or email obfuscation — the privacy page promises none.
- Paid listings, affiliate links or anything that makes a fund comparison non-neutral.
- Commit `.env` changes on the user's behalf; it is theirs to commit.

## Environment
- Node 24 via nvm (`source ~/.nvm/nvm.sh`); `gh` and `claude` are in `~/.local/bin`.
- `security.txt` expires 2027-10-01 — renew yearly.
- Weekly GitHub Action `data-check.yml` opens a `data-check` issue when figures need re-verifying.
- After handing the user a step, verify it happened yourself and say so if it didn't.
