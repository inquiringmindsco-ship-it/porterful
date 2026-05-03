# Porterful Artist Profile / Auth / UI Audit
Date: 2026-05-03

Scope: read-only audit and fix plan. No code changes were made for this report.

## Executive Summary
The biggest correctness issue is artist profile drift: the edit form writes data into live tables, but public pages still merge in static fallback artist data and use different field names on different routes. That is why bio/social changes can appear to revert, and why the same profile can look different depending on which artist route is visited.

The upload flow is real, not a placeholder. Porterful has a working `/api/upload` route backed by Supabase storage, but the current UI still needs runtime verification because the route is doing both audio and image uploads through the same bucket path.

The homepage CTA is stale for logged-in users. The header is already auth-aware, so this is isolated to the homepage hero.

The purchase playback issue is also real, but it is not caused by the root `AudioProvider` unmounting. The break comes from direct buy buttons that redirect to Stripe without saving a playback snapshot first.

The active Signal shirt surface already uses real `/signal/*.png` assets. The remaining apparel issue is the placeholder fallback merch cards and mock products that can still surface elsewhere.

## Priority Order
1. Artist profile sync and public rendering consistency
2. Upload flow verification for artist images and banners
3. Playback continuity on purchase redirects
4. Homepage logged-in CTA
5. Settings contrast cleanup
6. Social icon and TikTok mapping
7. Music/search ordering centralization
8. Product catalog placeholder cleanup

## 1. Artist Profile Sync
Status: confirmed.

Files involved: [src/app/(app)/dashboard/artist/edit/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/edit/page.tsx), [src/app/(app)/dashboard/dashboard/artist/edit/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/dashboard/artist/edit/page.tsx), [src/app/(app)/api/artists/[id]/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/artists/[id]/route.ts), [src/lib/artist-db.ts](/Users/sentinel/Documents/porterful/src/lib/artist-db.ts), [src/app/(app)/artist/[slug]/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/artist/[slug]/page.tsx), [src/app/(app)/artist/artist/[id]/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/artist/artist/[id]/page.tsx), [src/components/artist/ArtistHero.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistHero.tsx), [src/components/artist/ArtistTabs.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistTabs.tsx), [src/lib/artists.ts](/Users/sentinel/Documents/porterful/src/lib/artists.ts).

Root cause hypothesis: the edit form is correctly collecting editable fields, but public rendering still mixes DB data with static fallbacks. In [src/lib/artist-db.ts](/Users/sentinel/Documents/porterful/src/lib/artist-db.ts#L68-L86), DB values override static values only after the static artist object has already been merged in. In [src/app/(app)/artist/[slug]/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/artist/[slug]/page.tsx#L71-L74), the public page explicitly falls back to static bio content when the DB bio is shorter, which can make a saved bio appear to revert. In [src/app/(app)/artist/artist/[id]/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/artist/artist/[id]/page.tsx#L76-L98), TikTok is sourced only from static artist data in the DB-profile branch, and website uses `website` instead of the live `website_url` shape that the patch route writes. The static catalog in [src/lib/artists.ts](/Users/sentinel/Documents/porterful/src/lib/artists.ts#L41-L158) still holds hardcoded artist bios, socials, and identity data for O D Porter, Gune, and ATM Trap, so those values remain a fallback source on public surfaces.

Smallest safe fix: define one shared public artist view model and make both public artist routes use the same DB-first field mapping. Keep static artist data only as seed/default content, not as a competing live override. Make `website_url` and TikTok resolve consistently across both routes, and stop using bio-length heuristics as a public fallback.

Why this matters: this is the root issue behind the “bio reverts after save” and “social links do not match public profile” reports.

## 2. Upload Flow
Status: implemented, but needs runtime verification.

Files involved: [src/app/api/upload/route.ts](/Users/sentinel/Documents/porterful/src/app/api/upload/route.ts), [src/app/(app)/dashboard/dashboard/upload/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/dashboard/upload/page.tsx), [src/app/(app)/dashboard/dashboard/artist/edit/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/dashboard/artist/edit/page.tsx), [src/app/(app)/dashboard/artist/edit/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/edit/page.tsx).

Root cause hypothesis: the upload UI is not a placeholder. The edit page calls `/api/upload`, and the upload route validates file type/size, then uploads through Supabase storage with service-role credentials. The route accepts both `audio` and `artist-images`, but everything is written to the `music` bucket. That means the most likely failure mode is storage policy/public URL configuration, not missing application code.

Smallest safe fix: keep the UI, then verify the live bucket/policy path for artist images and banners. If runtime testing shows the bucket cannot serve image uploads reliably, hide or mark the control as coming soon instead of leaving a broken upload affordance.

Why this matters: this is a live artist workflow, so a storage mismatch would block profile artwork updates even though the form looks functional.

## 3. Playback Continuity on Purchase
Status: likely, with one confirmed gap.

Files involved: [src/lib/audio-context.tsx](/Users/sentinel/Documents/porterful/src/lib/audio-context.tsx), [src/app/providers.tsx](/Users/sentinel/Documents/porterful/src/app/providers.tsx), [src/components/artist/FeaturedTrackCard.tsx](/Users/sentinel/Documents/porterful/src/components/artist/FeaturedTrackCard.tsx), [src/components/artist/ArtistTrackList.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistTrackList.tsx), [src/app/(app)/checkout/checkout/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/checkout/checkout/page.tsx), [src/lib/playback-persistence.ts](/Users/sentinel/Documents/porterful/src/lib/playback-persistence.ts), [src/lib/use-playback-resume.ts](/Users/sentinel/Documents/porterful/src/lib/use-playback-resume.ts), [src/app/(app)/checkout/checkout/success/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/checkout/checkout/success/page.tsx).

Root cause hypothesis: the root audio provider is mounted in [src/app/providers.tsx](/Users/sentinel/Documents/porterful/src/app/providers.tsx#L193-L207), so normal in-app route changes should not destroy playback. The cut-off risk comes from the direct buy handlers in [src/components/artist/FeaturedTrackCard.tsx](/Users/sentinel/Documents/porterful/src/components/artist/FeaturedTrackCard.tsx#L35-L67) and [src/components/artist/ArtistTrackList.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistTrackList.tsx#L43-L75), which send the browser straight to Stripe with `window.location.href = data.url` without first saving playback state. The dedicated checkout page does save a snapshot before redirecting in [src/app/(app)/checkout/checkout/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/checkout/checkout/page.tsx#L123-L151), so only some purchase paths are protected.

Smallest safe fix: call `savePlaybackSnapshot` before every Stripe redirect, or route all purchase intents through the checkout page that already snapshots playback. Do not change Stripe logic itself in this audit.

Why this matters: users can still lose audio context exactly when they are trying to buy, which is the worst moment to interrupt listening.

## 4. Homepage Logged-In CTA
Status: confirmed.

Files involved: [src/app/page.tsx](/Users/sentinel/Documents/porterful/src/app/page.tsx), [src/components/Navbar.tsx](/Users/sentinel/Documents/porterful/src/components/Navbar.tsx), [src/app/(app)/dashboard/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/page.tsx).

Root cause hypothesis: the homepage hero hardcodes `Create your account` in [src/app/page.tsx](/Users/sentinel/Documents/porterful/src/app/page.tsx#L87-L92) and never checks auth state. The account/header area is already behaving correctly in [src/components/Navbar.tsx](/Users/sentinel/Documents/porterful/src/components/Navbar.tsx#L78-L85) because it branches on `showUser` versus `showGuest`, so the bug is isolated to the homepage CTA.

Smallest safe fix: render a signed-in CTA such as `Go to Dashboard`, `My Dashboard`, or `Continue Listening` when a user session exists, while keeping `Create your account` for logged-out visitors.

Why this matters: logged-in users should not be asked to sign up again.

## 5. Settings Contrast
Status: confirmed.

Files involved: [src/app/(app)/settings/settings/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/settings/settings/page.tsx).

Root cause hypothesis: the page shell still uses `text-white` on a layout that contains light surface cards. In the notifications tab and adjacent sections, helper text and labels are mixed between white, gray, and token-based colors on `bg-[var(--pf-surface)]` cards. That is enough to make text unreadable on the notifications panel and adjacent settings cards.

Smallest safe fix: move the page and card text to the Porterful text tokens (`--pf-text`, `--pf-text-secondary`, `--pf-text-muted`) and keep only the accent actions in orange. The layout can stay exactly as-is.

Why this matters: this is a basic readability bug, not a redesign issue.

## 6. Social Icon and TikTok Mapping
Status: likely.

Files involved: [src/app/(app)/artist/artist/[id]/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/artist/artist/[id]/page.tsx), [src/components/artist/ArtistHero.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistHero.tsx), [src/components/artist/ArtistTabs.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistTabs.tsx), [src/lib/artist-db.ts](/Users/sentinel/Documents/porterful/src/lib/artist-db.ts).

Root cause hypothesis: Porterful currently renders social links through two separate public artist implementations. [src/components/artist/ArtistHero.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistHero.tsx#L80-L86) has one icon map, while [src/app/(app)/artist/artist/[id]/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/artist/artist/[id]/page.tsx#L368-L385) has a separate inline SVG set. In the DB-profile branch, TikTok is still sourced from `staticArtist?.social?.tiktok` rather than the live artist data, which is why the TikTok button can look wrong or incomplete. Website handling is also inconsistent because the id route reads `website` instead of the live `website_url` shape used elsewhere.

Smallest safe fix: unify the social link normalization and icon rendering into one shared helper, then make both public artist surfaces use the same DB-first social source for Instagram, X/Twitter, YouTube, TikTok, and website.

Why this matters: the buttons should feel like one coherent artist profile, not two different implementations.

## 7. Music and Search Ordering
Status: confirmed on Browse Artists, likely inconsistent elsewhere.

Files involved: [src/app/music/page.tsx](/Users/sentinel/Documents/porterful/src/app/music/page.tsx), [src/lib/artists.ts](/Users/sentinel/Documents/porterful/src/lib/artists.ts), [src/app/(app)/api/search/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/search/route.ts).

Root cause hypothesis: the main music page already has an explicit roster order map that puts ATM Trap first, Gune second, and O D Porter last. However, the legacy track fallback in [src/app/music/page.tsx](/Users/sentinel/Documents/porterful/src/app/music/page.tsx#L38-L43) still sorts O D Porter first, and the static artist catalog in [src/lib/artists.ts](/Users/sentinel/Documents/porterful/src/lib/artists.ts#L41-L158) hardcodes the artist list order. The search endpoint in [src/app/(app)/api/search/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/search/route.ts#L7-L16) still only exposes a static O D Porter artist record, so any search or discovery surface that depends on that code path will not share the curated roster order.

Smallest safe fix: move the curated order into one shared helper and reuse it in music, search, and any legacy fallback sorts. Do not keep per-file hardcoded order maps.

Why this matters: curated order should be intentional, not a side effect of whichever fallback happened to run.

## 8. Shirt and Product Catalog
Status: mixed.

Files involved: [src/components/signal/SignalShirtViewer.tsx](/Users/sentinel/Documents/porterful/src/components/signal/SignalShirtViewer.tsx), [src/lib/products.ts](/Users/sentinel/Documents/porterful/src/lib/products.ts), [src/components/artist/ArtistProducts.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistProducts.tsx).

Root cause hypothesis: the active Signal shirt experience is already using the real flat asset set in [src/components/signal/SignalShirtViewer.tsx](/Users/sentinel/Documents/porterful/src/components/signal/SignalShirtViewer.tsx#L42-L97), so the cheesy 3D mockup is not the current implementation there. The remaining issue is fallback merchandising: [src/components/artist/ArtistProducts.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistProducts.tsx#L62-L87) still shows Unsplash placeholder products, and [src/lib/products.ts](/Users/sentinel/Documents/porterful/src/lib/products.ts#L47-L101) still marks the Signal shirt and Gune shirt as `mock`.

Smallest safe fix: keep the real shirt assets visible on approved product surfaces, hide or clearly label placeholder fallback merch on public surfaces, and do not delete assets unless a future cleanup is explicitly approved.

Why this matters: public product pages should not feel like prototype content.

## Runtime Checks Still Needed
The next round should verify three things in browser or against production-like data: artist image/banner uploads via `/api/upload`, direct purchase buttons preserving playback state across Stripe redirects, and public artist pages reflecting saved bio/social changes without falling back to static data.

## Future Inspiration Only
The Pretext dynamic layout and editorial engine ideas look useful later for lyric-video and editorial bio storytelling, but they are not part of this patch and should stay out of scope for now.
