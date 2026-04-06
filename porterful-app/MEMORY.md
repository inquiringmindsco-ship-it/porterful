
---

## Apr 5, 2026 — Porterful Expansion Day

### Decisions Made
1. **Centralized Artist Signup**: One apply form → auto-approve if complete, pending_review if missing info
2. **Auto-Approve Threshold**: Needs: stage name + genre + bio (50+ chars) + email + phone + at least 1 music link (Spotify/Apple/SoundCloud/YouTube)
3. **Checkout Color**: TBD — Od wants to change from orange, discussion pending
4. **Light/Dark Mode**: Porterful gets Instagram-style (system preference detection). Overstood stays as-is for now.
5. **Execution Process**: From here, tell Od what I'm about to do, wait for approval, THEN execute

### Files Changed
- `src/app/(app)/api/artist-application/route.ts` — Added auto-approve threshold logic
- `src/app/(app)/apply/form/page.tsx` — Added dynamic success messages (approved vs pending_review)
- `src/app/(app)/apply/page.tsx` — Updated flow description + added auto-approve threshold box
- `ARTIST-SUBMIT-SYSTEM.md` — New file: checklist for adding artists when Od says "Add @artistname"
- `ARTIST-ONBOARDING.md` — New file: uniform template for artist folder structure + data

### Artist Audit (Apr 5)
- ATM Trap: Fixed broken paths (avatar.jpg, audio files) — was using wrong CDN + nested /images/ path
- All artists now use consistent path format: `/artist-images/{slug}/avatar.jpg`
- Audio paths: `/artist-images/{slug}/audio/{filename}.mp3`
- Artist template standardized across all 5 artists

### Vercel Rate Limited
- Deployed too many times today (100+ deploys)
- Code changes saved locally
- Site needs redeploy when limit resets (~24 hours)

### Next Up (Queue)
1. Checkout color change (discuss options with Od first)
2. Porterful light/dark mode (Instagram-style)
3. Artist submit automation script
4. Superfan dashboard backend

---

## Apr 5, 2026 — Memory Agent Update

### OPERATIONAL.md Created
- New clean ops doc at `porterful-app/OPERATIONAL.md`
- Covers: artists, pages, API endpoints, auto-approve logic, add-artist checklist, TODOs

### Deploy Status
⚠️ Vercel rate limited — too many deploys today (~100+). Code changes are local. Needs redeploy when limit resets (~24h).

### Today's Changes Summary (Apr 5)
- Auto-approve system wired into `/api/artist-application`
- Artist apply form: dynamic success messages (approved vs pending_review)
- ATM Trap path fix: was using wrong CDN + nested `/images/` path → now consistent
- New docs: `ARTIST-SUBMIT-SYSTEM.md`, `ARTIST-ONBOARDING.md`

### What's Queued for Next Session
1. Checkout color change (Od wants options discussed first)
2. Porterful light/dark mode (Instagram-style, system preference detection)
3. Artist submit automation script
4. Superfan dashboard backend connection
