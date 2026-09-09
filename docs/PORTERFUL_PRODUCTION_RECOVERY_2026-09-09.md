# Porterful production recovery — 2026-09-09

## Safety boundary

- Production has not been changed during this recovery.
- Current production deployment: `dpl_FFW9HCgF87PkqEDct7hvKDtj6cTV`
- Recovered production baseline: `f3b56727752060214b4023673f05795ba12c920d`
- Immutable baseline tag: `production-baseline-2026-09-08`
- Canonical recovery branch: `codex/porterful-production-recovery`
- Canonical Vercel project: `prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa`
- Canonical Vercel team: `team_SgVobhtThOM1FwJ86K9cYrRg`

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
- `ca97288` — featured catalog rebuilt from real store data with consistent visual states
- `245ff79` — repeatable route, auth, API, metadata, security, and sitemap release gate
- `b112f4a` — Sentinel's divergent visual branch reconciled as reference-only
- `485cbce` — mobile hydration checks enforced in CI
- `7f4941a` — Rob Soule profile, product metadata, and `/api/health` defects fixed
- `5abe6b3` — product-detail text contrast fixed and added to mobile regression checks
- `d6d529d` — mobile product-gallery containment fixed and added to regression checks

## Final review candidate

The exact preview URL and Vercel deployment ID are issued from the clean final
commit after this recovery record is committed. They must be paired with that
commit in the owner handoff and Sentinel's independent verification report; an
older preview must never be substituted merely because it has a similar URL.

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
- `npm run verify:release` checks public routes, redirects, authentication boundaries,
  APIs, canonical metadata, security headers, support routing, catalog trust copy, and
  every sitemap route against an exact `TEST_URL`.
- The release gate currently contains 43 checks and passes against the candidate.
- The product-detail mobile check asserts readable heading contrast and proves the
  gallery does not overlap the details panel on both iPhone 12 and Pixel 5 profiles.
- GitHub Actions run `34366420389` passed lint, type checking, security checks,
  the production build, and mobile hydration for commit `d6d529d`.
- Sentinel's earlier failure was against commit `485cbce`, before the Rob Soule,
  product metadata, health endpoint, contrast, and gallery fixes. A fresh Sentinel
  result is required against the exact final candidate before owner approval.

## Sentinel visual branch reconciliation

The separate `sentinel/porterful-visual-recovery` worktree is preserved and was
inspected read-only. Its merge base predates the recovered production lineage and
its tree removes substantial production functionality and assets. It must not be
merged, rebased onto, or deployed wholesale. Individual ideas from that branch may
only be reimplemented and tested independently on the canonical recovery branch.

## Release procedure

Run `npm run deploy:production` only from a clean
`codex/porterful-production-recovery` checkout. The preflight verifies the Vercel
project/team, GitHub remote, immutable baseline ancestry, branch, clean tree, and
requires `PORTERFUL_PRODUCTION_APPROVED=YES`. Approval is a release signal, not a
substitute for Jonathan's review.
