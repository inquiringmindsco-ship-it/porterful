---
date: 2026-05-03
status: implemented + Codex-review revisions (uncommitted) — awaiting OD review
source_audit: docs/CODEX_PORTERFUL_ARTIST_PROFILE_AUTH_UI_AUDIT_2026-05-03.md
patch_prep: docs/CLAUDE_PORTERFUL_SMALL_UX_PATCH_PREP_2026-05-03.md
codex_review: docs/CODEX_REVIEW_CLAUDE_BUCKET_A_UX_PATCH_2026-05-03.md
---

# Porterful — Bucket A UX Patch Implementation

All four Bucket A fixes from the patch prep landed in the working tree. Lint, layout-guards, and `next build` all pass. No DB, Stripe, payout, rights gate, image upload, music ordering, or apparel catalog logic was touched.

## Files changed

| File | Fix(es) |
|---|---|
| `src/app/page.tsx` | A1 |
| `src/app/(app)/settings/settings/page.tsx` | A2 |
| `src/lib/artist-social.tsx` *(new)* | A3 (shared icon + URL helper) |
| `src/components/artist/ArtistHero.tsx` | A3 |
| `src/app/(app)/artist/artist/[id]/page.tsx` | A3 + A4 |

The slug route (`src/app/(app)/artist/[slug]/page.tsx`) was **not** modified — it already renders DB-first via `mergeArtistData` in `src/lib/artist-db.ts`, which uses `dbValue || staticValue` (DB-first). It now also picks up the unified social rendering automatically because `ArtistHero` imports the shared helper.

## What each fix changed

### A1 — Homepage logged-in CTA
- Imported `useSupabase` from `@/app/providers` (same source the Navbar uses).
- Mirrored the Navbar's `mounted && !loading` readiness pattern with `authReady`, `showUser`, `showGuest` flags.
- Hero CTA now branches:
  - Guest → `Create your account` linking to `/login` (unchanged copy).
  - Authenticated → `Go to Dashboard` linking to `/dashboard/artist` (matches Navbar's `dashboardHref`/`dashboardLabel`).
  - Pre-ready → small skeleton placeholder, prevents flash of wrong CTA.
- "Start Listening" remains the primary CTA in both states.
- No auth architecture change — only consumes existing context.

### A2 — Settings contrast cleanup
Replaced ad-hoc Tailwind colors that hardcoded a dark-theme assumption with Porterful tokens, so the page reads correctly in dark, light, and warm/sepia themes:
- Outer container `text-white` → `text-[var(--pf-text)]` (loading state and main wrapper).
- All `border-gray-700` on inputs → `border-[var(--pf-border)]` (replaced repo-wide via `replace_all` in this single file).
- All non-button `text-gray-500` (helper text, "no payouts yet", "no referral code", notification descriptions, file-size hint, disabled email input) → `text-[var(--pf-text-muted)]`.
- "Copy Link" button on `bg-[var(--pf-surface)]` was `text-white` (illegible on light surfaces) → now `text-[var(--pf-text)]` with a `border-[var(--pf-border)]` so it's visible on both light and dark themes.
- Intentionally **kept** `text-white` on the four `bg-[var(--pf-orange)]` action buttons (Upload Photo, Save Changes, Copy code, Play All) and on the `bg-[#635bff]` Stripe `S` badge — white-on-color contrast is correct in any theme.
- Layout, spacing, structure, and the toggle switch styling are unchanged.

### A3 — TikTok / social icon unification
- New `src/lib/artist-social.tsx` exports:
  - `InstagramIcon`, `TwitterIcon`, `YouTubeIcon`, `TikTokIcon` SVG components (single source of truth for the icon paths).
  - `SOCIAL_ICONS` map keyed by platform.
  - `normalizeSocialUrl(platform, value)` that handles `null`, full `http(s)` URLs, `@handle` strings, and bare handles uniformly across platforms.
  - `normalizeArtistSocials(input)` for batch normalization.
- `ArtistHero.tsx` now imports the icon set, types, and `normalizeSocialUrl` from the helper instead of defining its own. The hero pill styling is unchanged. Filtered `socialEntries` now also requires the platform key to exist in `SOCIAL_ICONS` so legacy keys (e.g. `website`) can't render a phantom button.
- `artist/artist/[id]/page.tsx` no longer ships an inline TikTok SVG or inline Twitter SVG. Both render via `<TikTokIcon />` / `<TwitterIcon />` from the shared helper. The colored pink/blue tint on those icons was replaced with `text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]`, matching the YouTube/Instagram surfaces on this page and the hero treatment. The unused `Twitter` import from `lucide-react` was removed.
- The `id` route now also uses `normalizeSocialUrl` for both DB-sourced and static-fallback social handles, so `https://`-prefixed handles, raw `@handles`, and bare hostnames all resolve to the same canonical URL on both surfaces.

### A4 — Artist profile DB-first render
Targeted at the `artist/artist/[id]/page.tsx` `loadArtistData` block (the location of Codex's confirmed bio-revert bug). The slug page was already DB-first via `mergeArtistData` and needed no edit.

- Removed the bio-length heuristic. Was: `useBio = dbBio.length < fullBio.length ? (fullBio || dbBio) : dbBio` (this is what made saved bios appear to revert when shorter than the static seed). Now: `bio: dbBio || staticArtist?.bio || ''` — DB value wins whenever it's non-empty; static is a seed fallback only.
- Removed the parallel location-length heuristic. Now: `location: dbLocation || staticArtist?.location || ''`.
- Website now reads `data.profile.website_url || data.profile.website` so it picks up the live `artists.website_url` shape that the PATCH route writes (with a tolerant fallback to a legacy `website` field if any older rows have it).
- TikTok now reads `data.profile.tiktok_url` first, then falls back to `staticArtist?.social?.tiktok`. The `tiktok_url` column already exists on the `artists` table (written by the application/onboard flows), so this needs no schema change. Note: the artist edit form does not yet expose a TikTok input, so saved-from-edit-form TikTok updates are still out of band; the page will display whatever DB or static currently holds.
- Static catalog (`src/lib/artists.ts`) was **not** modified. Per Codex and the patch prep, it remains as seed/default content only.
- `mergeArtistData` (`src/lib/artist-db.ts`) was **not** modified — it already uses `dbValue || staticValue` (DB-first), so the slug route is correct as-is.

## Verification results

Run from `~/Documents/porterful`:

| Command | Result |
|---|---|
| `npm run lint` | ✅ pass — only pre-existing warnings (none from this patch). |
| `npm run check-layouts` | ✅ pass — `Layout guard passed — no document roots in route group layouts`. |
| `npm run build` | ✅ `✓ Compiled successfully`. All routes generated. |

Pre-existing warnings surfaced by lint/build (unchanged by this patch):
- `<img>`-vs-`<Image />` warnings in `checkout/checkout/page.tsx`, `settings/settings/page.tsx:326` (the avatar preview — this code path was not modified here), `checkout/page.tsx`, `ArtistProducts.tsx`.
- `react-hooks/exhaustive-deps` in `payout`, `settings/settings`, `album-order`, `tracks/[id]/edit`.
- One Next.js dynamic-server info on `/api/likeness/verify`.

None of these were introduced by Bucket A.

### Browser-level verification not yet performed
I did not run `npm run dev` and exercise the UI. The four routes that should be visually checked before merge:
- `/` — logged-out shows "Create your account"; logged-in shows "Go to Dashboard" → `/dashboard/artist`.
- `/settings/settings` — toggle through dark / light / sepia themes; verify all four tabs (Profile, Referrals, Payouts, Notifications) have readable text on cards.
- `/artist/<slug>` — hero socials render via the shared icons; bio/socials reflect DB.
- `/artist/artist/<id>` — inline name-row socials render via the shared icons; bio/socials/website reflect DB; saving an edit and reloading the public page should now persist.

## Remaining parked items

These were **not** implemented in Bucket A and remain awaiting OD's go-ahead:

1. **Image upload runtime verification** (Codex §2). Code path is wired (`/api/upload` → Supabase storage on the `music` bucket). Likely failure mode is storage policy / public URL config for image MIME types, not application code. Needs a live upload test from `/dashboard/artist/edit` against production-like storage before any code change is justified.
2. **Playback snapshot before Stripe redirect** (Codex §3). Confirmed gap in `FeaturedTrackCard.tsx` and `ArtistTrackList.tsx` — direct buy buttons skip `savePlaybackSnapshot()`. Patch would be component-only (no Stripe change), but it was not in OD's four priority candidates and stays parked.
3. **Music / search ordering centralization** (Codex §7). Not a simple curated change — requires a shared helper consumed by `music/page.tsx`, `lib/artists.ts`, and `api/search/route.ts`. Excluded by hard rule.
4. **Product catalog placeholder cleanup** (Codex §8). Apparel surfaces — excluded by hard rule.
5. **Pretext editorial engine** — explicitly excluded; reserved as future inspiration.

## Hard-rule compliance statement

This patch did **not**:
- touch Stripe / checkout backend
- touch checkout UI flow
- touch payout copy or payout architecture
- touch the rights gate
- touch DB migrations or introduce new schema
- touch image upload code (`/api/upload` or related routes)
- change music or search ordering
- touch the apparel / product catalog
- add Pretext

Auth architecture was not altered — A1 only consumes the existing `useSupabase` context the Navbar already uses. The `tiktok_url` column read in A4 uses a column that already exists in the `artists` table (written by the application/onboard flows), so no schema or migration change was required.

## Risks and rollback

- **A4 carries the highest residual risk** because the `artist/artist/[id]/page.tsx` route is the public-facing artist profile and the change drops a fallback that previously masked a partial DB bio with a static one. If a row exists in DB with a one-character bio, the UI will now show that one character rather than the static seed. That's the correct DB-first behavior per Codex's audit and OD's directive, but worth noting before staging review.
- **A3 visually changes the `id` route's TikTok and Twitter icons** from colored (pink/blue) to neutral text-secondary, matching the rest of the surface. If OD wants the colored brand tints back, that is a one-line className change per icon.
- **Rollback is per-file**: each fix is contained to the file list above. No DB writes occurred. `git checkout -- <files>` (or revert each commit if committed individually) restores prior state.

## Suggested commit split

If OD wants atomic commits before merge, the natural splits are:

1. `feat(home): show "Go to Dashboard" CTA when logged in` — `src/app/page.tsx`.
2. `fix(settings): use Porterful text/border tokens for theme-safe contrast` — `src/app/(app)/settings/settings/page.tsx`.
3. `refactor(artist): unify social icon + URL handling via shared helper` — new `src/lib/artist-social.tsx`, `src/components/artist/ArtistHero.tsx`, `src/app/(app)/artist/artist/[id]/page.tsx` (icon swap portion only).
4. `fix(artist): DB-first bio/location/website/tiktok on /artist/artist/[id]` — `src/app/(app)/artist/artist/[id]/page.tsx` (the `loadArtistData` rewrite).

Edits 3 and 4 happen to overlap on the `id` route file; if OD prefers, they can ship as one commit ("artist profile: shared social helper + DB-first render").

Awaiting OD review.

---

## Codex Review Revisions (2026-05-03, post-review)

After Codex's WARNING-level review (`docs/CODEX_REVIEW_CLAUDE_BUCKET_A_UX_PATCH_2026-05-03.md`), OD authorized a targeted second pass to address Codex's two acknowledged concerns and the partial-icon-unification note. **Option 1 was selected: do not revert or reset `src/app/page.tsx`** — see "page.tsx investigation" below.

### Files changed in this pass

| File | What changed |
|---|---|
| `src/lib/artist-social.tsx` | (none — no edits this pass) |
| `src/lib/artist-db.ts` | Added DB-first `tiktok_url` mapping in both branches of `mergeArtistData` |
| `src/app/(app)/artist/artist/[id]/page.tsx` | Replaced remaining Lucide `Instagram` and `Youtube` social-row icons with shared `InstagramIcon` / `YouTubeIcon`; dropped colored brand tints to match the unified neutral treatment used by Twitter/TikTok and the hero |

### page.tsx investigation — what was reverted (nothing)

Codex's review attributed the homepage `HOME_FEATURED_TRACKS` reshape to my A1 patch and recommended reverting it. Investigation showed otherwise:

- `git log --oneline -- src/app/page.tsx` — most recent committed touch is `622c0833 Feature ATM Trap on homepage` (OD, 2026-05-03 02:46), which was a one-line slug swap (`gune` → `atm-trap`) on the existing `featuredArtist` constant. The `HOME_FEATURED_TRACKS` array did not exist in any committed state.
- `git diff origin/main -- src/app/page.tsx` — diff hunks show two distinct changes in the working tree: (a) the `featuredArtist`-style block was replaced by a curated `HOME_FEATURED_TRACKS` array and the first card was reshaped (wider span, larger image, "Featured track" label, larger title); (b) the auth CTA branching this patch added.
- The `HOME_FEATURED_TRACKS` block was already present the very first time I read this file at the start of A1 — it predates the auth CTA work.

**Conclusion: the featured-track reshape is pre-existing uncommitted work in OD's tree, not part of Claude's Bucket A patch.** Per OD's directive (Option 1), `src/app/page.tsx` was **not** reset or reverted — doing so would have destructively overwritten OD's in-progress reshape. Only the auth CTA behavior remains attributed to Bucket A in this file.

### What was fixed in this pass

#### Slug-route TikTok DB mapping (Codex §A4 WARNING)
- `src/lib/artist-db.ts:81` — added `...(dbArtist.tiktok_url && { tiktok: dbArtist.tiktok_url })` to the social merge in `mergeArtistData`. DB value now overrides static seed when present.
- `src/lib/artist-db.ts:58` — added `tiktok: dbArtist.tiktok_url` to the no-static-fallback branch so DB-only artists also expose TikTok.
- `ArtistData.social.tiktok` is already typed in `src/lib/artists.ts`. `ArtistTabs` already supports the `tiktok` field. No schema change.
- Net effect: `/artist/<slug>` now renders DB `tiktok_url` through `ArtistHero`'s social row consistently with `/artist/artist/<id>`.

#### Public artist icon unification (Codex §A3 WARNING)
- `src/app/(app)/artist/artist/[id]/page.tsx` — replaced the Lucide `Instagram` and `Youtube` social-row icons with shared `InstagramIcon` and `YouTubeIcon` from `src/lib/artist-social.tsx`. All four platform icons (Instagram, Twitter/X, YouTube, TikTok) on this surface now come from the shared helper, matching `ArtistHero`'s source.
- Brand-color tints (`text-pink-400`, `text-red-500`) on the social-row icons were dropped in favor of `text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]` to match Twitter/TikTok and the hero's neutral treatment.
- Lucide `Youtube` is **still** used in this file for non-social-link contexts: the "Music Videos" tab section heading, the empty-state large icon, and the "YouTube Channel" deep-link button. Those remain Lucide because they're decorative section icons, not platform link affordances. Lucide `Instagram` is fully removed from this file's imports.
- No layout, route, or data-fetching change.

### Verification results (post-revisions)

Run from `~/Documents/porterful`:

| Command | Result |
|---|---|
| `npm run lint` | ✅ pass — pre-existing warnings only (unchanged from earlier run). |
| `npm run check-layouts` | ✅ `Layout guard passed — no document roots in route group layouts`. |
| `npm run build` | ✅ `✓ Compiled successfully` — 166 routes generated. |

### Explicit scope statement

This revision pass:
- did **not** touch Stripe, checkout backend, payout copy or logic, the rights gate, DB migrations, image upload, music ordering, or the apparel/product catalog;
- did **not** add Pretext;
- did **not** change `src/app/page.tsx` — the featured-track reshape there is pre-existing OD work and was preserved verbatim;
- did **not** change `src/lib/artists.ts` (static catalog stays seed-only);
- did **not** change auth architecture;
- did **not** introduce a schema change (TikTok now reads through an existing `artists.tiktok_url` column already populated by application/onboard write paths).

The only newly attributable changes in this revision pass are the four-line `tiktok_url` merge addition in `artist-db.ts` and the icon-source swap in `artist/artist/[id]/page.tsx`.

Awaiting OD merge call.

