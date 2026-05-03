---
date: 2026-05-03
status: patch prep — no code written yet
source_audit: docs/CODEX_PORTERFUL_ARTIST_PROFILE_AUTH_UI_AUDIT_2026-05-03.md
---

# Porterful Small UX Patch Prep

Maps the Codex audit (2026-05-03) against the four priority candidates in OD's directive and the hard rules. No code changes yet — implementation is paused pending OD approval.

## Bucket A — Safe to implement immediately

These are confirmed by Codex, isolated to UI files, and respect every hard rule.

### A1. Homepage logged-in CTA (Directive #1, Codex §4)
- **Why safe:** Codex confirms the bug is hardcoded in the hero only — `src/app/page.tsx` L87–92. The `Navbar` (L78–85) is already auth-aware, so we are not touching auth architecture.
- **Files to edit:**
  - `src/app/(app)/page.tsx` *(verify path; Codex referenced `src/app/page.tsx`)* — add a session check and branch the CTA. Authenticated → "Go to Dashboard" linking to `/dashboard`. Unauthenticated → keep "Create your account."
- **Approach:** read the same session source the Navbar uses; do not introduce a new auth pattern.
- **Risk:** very low. Cosmetic copy + href branch.
- **Rollback:** revert the single file.

### A2. Settings contrast cleanup (Directive #2, Codex §5)
- **Why safe:** confirmed readability bug — `text-white` on `bg-[var(--pf-surface)]` cards. Token-based fix only; layout untouched.
- **Files to edit:**
  - `src/app/(app)/settings/settings/page.tsx` — swap `text-white` / ad-hoc grays on light cards to `--pf-text`, `--pf-text-secondary`, `--pf-text-muted`. Keep accent orange for actions.
- **Risk:** low. Visual-only.
- **Rollback:** revert the single file.

### A3. TikTok / social icon unification (Directive #3, Codex §6)
- **Why safe:** Codex confirms it is two parallel implementations with one icon map (`ArtistHero.tsx` L80–86) and one inline SVG set (`artist/artist/[id]/page.tsx` L368–385), plus a `website` vs `website_url` field-name mismatch on the id route. This is a mapping/styling problem, exactly the scope OD allowed.
- **Files to edit:**
  - `src/components/artist/ArtistHero.tsx` — keep its icon map; export it (or extract to a small shared helper).
  - `src/app/(app)/artist/artist/[id]/page.tsx` — replace inline SVG set with the shared helper; switch `website` → `website_url`; source TikTok from live artist data, not `staticArtist?.social?.tiktok`.
  - **New (small, optional):** `src/lib/artist-social.ts` — single helper exporting the icon map and a `normalizeSocials(input)` function used by both surfaces. Only create this file if a clean cross-import from `ArtistHero.tsx` is awkward; otherwise, export from `ArtistHero.tsx`.
- **Risk:** low–moderate. Touches two artist render paths. Visual-only — no data-shape change.
- **Rollback:** revert the two route/component files (plus the helper if added).

### A4. Artist profile sync — DB-first public render (Directive #4, Codex §1)
- **Why safe:** Codex pinpoints exact save/load mismatch — no schema change needed. The edit form already writes correctly; the public renderers merge static fallbacks back over DB values and use inconsistent field names.
- **Concrete defects called out by Codex:**
  - `src/lib/artist-db.ts` L68–86 — DB values applied after static merge, so static can shadow live data.
  - `src/app/(app)/artist/[slug]/page.tsx` L71–74 — bio-length heuristic falls back to static bio when DB bio is shorter (this is the "bio reverts after save" bug).
  - `src/app/(app)/artist/artist/[id]/page.tsx` L76–98 — TikTok sourced from static only in the DB-profile branch; `website` instead of `website_url`.
  - `src/lib/artists.ts` L41–158 — static catalog still holds hardcoded bios/socials/identity for O D Porter, Gune, ATM Trap.
- **Files to edit:**
  - `src/lib/artist-db.ts` — invert the merge so DB is authoritative; static is seed/default only when DB field is null/empty (not "shorter").
  - `src/app/(app)/artist/[slug]/page.tsx` — drop the bio-length fallback; render whatever the DB returned, fall back to static only when DB bio is empty/null.
  - `src/app/(app)/artist/artist/[id]/page.tsx` — read TikTok and other socials from live data; rename `website` → `website_url` to match the patch route's write shape.
  - `src/lib/artists.ts` — **leave as seed data; do not delete.** Codex notes static must remain as default-only.
- **Approach:** define one shared public artist view-model type used by both routes (small new file `src/lib/artist-view-model.ts` or inline if compact). DB → fallback-to-seed mapping happens in one place.
- **Hard rule check:** no schema change, no migration, no auth touch, no Stripe touch.
- **Risk:** moderate. Public artist surface is high-visibility. Mitigation: visually compare each of the three artist pages (O D Porter, Gune, ATM Trap) before/after on staging.
- **Rollback:** revert the listed files; no DB state to undo.

## Bucket B — Needs runtime / storage verification before any patch

### B1. Upload flow for artist images & banners (Codex §2)
- **Status:** code path is real (`src/app/api/upload/route.ts` is wired and the edit page calls it). Most likely failure is Supabase storage **policy / public URL config** on the `music` bucket, which is also being used for `artist-images`.
- **Why I am not patching now:** OD's hard rule — "Do not change image upload unless Codex proves it is already implemented but wired incorrectly." Codex says implemented but unverified at runtime. We need a live test before deciding whether to (a) leave alone, (b) split buckets, or (c) hide the control.
- **Verification steps OD or I should run:**
  1. Log into `/dashboard/artist/edit`, attempt an avatar + banner upload.
  2. Inspect network: 200 from `/api/upload`? Public URL returned?
  3. Hit the returned URL in an incognito tab — does it serve the image?
  4. Check Supabase dashboard → Storage → `music` bucket policies for image MIME types and public read.
- **Decision gate:** results determine whether this becomes Bucket A or stays out of scope.

### B2. Playback continuity on direct buy (Codex §3)
- **Status:** confirmed gap — `FeaturedTrackCard.tsx` and `ArtistTrackList.tsx` send `window.location.href = data.url` to Stripe without calling `savePlaybackSnapshot` first.
- **Why I am not patching now:** OD's hard rule — "Do not touch Stripe/checkout backend." Codex's fix only adds a `savePlaybackSnapshot()` call before the redirect (no Stripe logic change), but this was **not** in OD's four priority candidates, so I'm parking it pending explicit go-ahead.
- **If approved later, scope is small:** two component files; no backend touch.

## Bucket C — Out of scope for this patch (per hard rules)

| Codex § | Item | Why excluded |
|---|---|---|
| §3 | Playback snapshot before Stripe redirect | Not in OD's 4 priorities; near checkout boundary |
| §7 | Music/search ordering centralization | OD: skip unless "simple curated ordering change." Codex calls for shared helper + refactor across `music/page.tsx`, `artists.ts`, `api/search/route.ts`. Not simple. |
| §8 | Product catalog placeholder cleanup | Not in priority list; risks touching apparel surfaces (Printful boundary) |
| — | Pretext editorial engine | Hard rule: do not add Pretext |
| — | Payout copy, Stripe backend, rights gate, DB migrations | Hard rules |

## Build / lint commands to run after each Bucket A fix

From `~/Documents/porterful`:

```bash
npm run lint
npm run check-layouts
npm run build   # runs check-layout-guards then next build
```

If touching artist render paths (A3, A4), additionally:
```bash
npm run dev
# Visit each in a logged-in session:
#   /              (homepage CTA — A1)
#   /settings/settings (contrast — A2)
#   /artist/<slug>          (slug route — A3, A4)
#   /artist/artist/<id>     (id route — A3, A4)
```

## Suggested implementation order (smallest blast radius first)

1. **A1 homepage CTA** — single file, cosmetic.
2. **A2 settings contrast** — single file, visual-only.
3. **A3 social/TikTok unification** — two files + small helper; visual + field-name fix.
4. **A4 artist profile DB-first render** — last, because it's the highest-impact and benefits from A3 already landed (shared social helper).

Each fix is its own commit so any single one can be reverted cleanly.

## Risks summary

- **Highest risk:** A4. Public artist pages are revenue-adjacent. Mitigate with side-by-side staging review of all three artists before merge.
- **Medium risk:** A3. Two render paths must produce identical social-link UI; test both routes for each artist.
- **Low risk:** A1, A2.
- **Cross-cutting risk:** A3 and A4 both touch `src/app/(app)/artist/artist/[id]/page.tsx`. Land them in the order above to avoid rebase friction.

## Rollback plan

Each fix is file-scoped and revertible via `git revert` on its single commit. No DB, no storage, no env, no migrations are touched in Bucket A. Bucket B items are gated on verification and explicit approval, so nothing here changes runtime state in production-shared systems.

## Open questions for OD before I start coding

1. **Approve Bucket A in full**, or pick a subset? (Recommend all four; smallest first.)
2. **Bucket B1 (upload):** want me to run the runtime verification checklist next, or are you handling that?
3. **Bucket B2 (playback snapshot before Stripe):** add to this patch since the change is component-only and does not touch Stripe logic, or keep parked?
4. The homepage path — is it `src/app/page.tsx` (Codex's reference) or `src/app/(app)/page.tsx`? I will confirm before editing.

Awaiting go/no-go.
