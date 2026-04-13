# Porterful Site Improvements — April 13, 2026

## Task: Batch 1 — Rob Soule fix + social buttons

Reviewed all three requested changes. Everything was already in place:

1. **Rob Soule artist data** (`src/lib/artists.ts`): Genre already set to `'Hip-Hop / R&B / Blues'`. Bio already reads: "Rob Soule is a St. Louis hip-hop and R&B artist who blends the blues into a soulful sound you won't find anywhere else." — no changes needed.

2. **Social media buttons** (`src/app/(app)/artist/[slug]/page.tsx`): Already implemented in the hero section with a social links bar showing Instagram, Twitter/X, YouTube, and TikTok with styled pill buttons and icons. All link to the correct URLs based on the artist's `social` fields.

3. **Featured Singles before Albums**: Already in the correct order — Featured Singles section renders at line ~107, Albums section renders at line ~123. No reordering needed.

**Action taken:** Saved this note. No code changes or deployments made.
