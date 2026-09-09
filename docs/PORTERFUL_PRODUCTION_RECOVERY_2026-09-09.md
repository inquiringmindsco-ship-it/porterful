# Porterful production recovery — 2026-09-09

## Safety boundary

- Production has not been changed during this recovery.
- Current production deployment: `dpl_FFW9HCgF87PkqEDct7hvKDtj6cTV`
- Recovered production baseline: `f3b56727752060214b4023673f05795ba12c920d`
- Immutable baseline tag: `production-baseline-2026-09-08`
- Canonical recovery branch: `codex/porterful-production-recovery`
- Canonical Vercel project: `prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa`
- Canonical Vercel team: `team_bfFfWfQ7d9kIPGK7X6GdmaOP`

Production promotion is intentionally blocked until Jonathan reviews the final
preview and gives explicit approval.

## Why the site appeared to revert

The local checkout and production deployment did not share a dependable,
documented release lineage. Vercel was not connected to Git, so manual deploys
from different local checkouts could replace production with whichever version
was in that checkout. The recovered live source is now preserved by commit,
branch, tag, and an isolated worktree.

## Recovery commits

- `542d6f6` — deployment lineage and production approval safeguards
- `5afc12e` — canonical public routes, metadata, security headers, and wallet gate
- `06d12e1` — public support links routed through the working contact form
- `004fd06` — broken catalog art paths fixed and unsupported trending metrics removed

## Final review preview

- Deployment: `dpl_6pCuptUPqH797Lp21HHtT6j6pseL`
- URL: `https://porterful-5lsodlx8j-inquiringmindsco-ship-its-projects.vercel.app`

## Verified behavior

- Mobile hydration sequence passes in iPhone 12 and Pixel 5 profiles.
- Public artist directory loads six approved public artists with no console errors.
- Database schema health reports 23/23 checks passing.
- Every local product image returned by the public catalog API resolves with HTTP 200.
- The corrected Roxannity album artwork resolves with HTTP 200.
- Canonical privacy, terms, and FAQ routes render directly; legacy duplicate paths redirect.
- Private dashboard and wallet surfaces redirect anonymous visitors to login; wallet API rejects anonymous access.
- Sitemap contains only canonical public pages, and every preview sitemap URL returns HTTP 200.
- Public pages no longer advertise domain email addresses that have no MX delivery path.
- Trending no longer claims fabricated sales growth, review counts, or “real sales data.”

## Release procedure

Run `npm run deploy:production` only from a clean
`codex/porterful-production-recovery` checkout. The preflight verifies the Vercel
project/team, GitHub remote, immutable baseline ancestry, branch, clean tree, and
requires `PORTERFUL_PRODUCTION_APPROVED=YES`. Approval is a release signal, not a
substitute for Jonathan's review.
