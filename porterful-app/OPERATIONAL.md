# Porterful — Operational Reference

> Last updated: April 5, 2026
> For Od: return here to get up to speed instantly.

---

## Artists On Platform (5)

| Artist | Slug | Genre | Tracks | Status |
|--------|------|-------|--------|--------|
| O D Porter | `od-porter` | Hip-Hop, R&B, Soul | 80+ | Founder |
| Gune | `gune` | Hip-Hop, R&B | 3 | Live |
| Nikee Turbo | `nikee-turbo` | Hip-Hop | 3 | Live |
| ATM Trap | `atm-trap` | Hip-Hop | 4 | Live |
| Rob Soule | `rob-soule` | Hip-Hop / R&B / Blues | 3 | Live |

All artists are verified. STL-based. Path format: `/artist-images/{slug}/avatar.jpg`

---

## Key Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/artist/[slug]` | Individual artist page (bio, tracks, products, support card) |
| `/music` | Music browse / all tracks |
| `/apply` | Artist application form |
| `/checkout/success` | Post-purchase confirmation |
| `/dashboard` | Artist dashboard (earnings, supporters) |
| `/superfan` | Superfan program / referral tracking |
| `/about` | About Porterful |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/artist-application` | POST | Submit artist application (auto-approve logic) |
| `/api/artist-application` | GET | List all applications (admin) |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/orders` | — | Order management |
| `/api/wallet` | — | Artist earnings / wallet |
| `/api/products` | — | Product catalog |
| `/api/collaborations` | — | Artist collaborations |
| `/api/competition/*` | — | Competition system |
| `/api/dropship/*` | — | Printful/Zendrop fulfillment |
| `/api/webhooks/stripe` | — | Stripe webhook handler |

---

## Auto-Approve System

Applications auto-approve immediately if ALL conditions are met:
- ✅ Stage name
- ✅ Genre
- ✅ Bio (50+ characters)
- ✅ Email
- ✅ Phone
- ✅ At least 1 music link (Spotify OR Apple Music OR SoundCloud OR YouTube)

**If any missing → status becomes `pending_review`** (flagged for manual review)

See: `src/app/(app)/api/artist-application/route.ts` → `shouldAutoApprove()`

---

## Revenue Split (Checkout)

Applied at checkout via Stripe metadata:

| Recipient | % |
|-----------|---|
| Artist fund | 20% |
| Superfan share (referral rewards) | 3% |
| Platform fee | 10% |
| Seller earnings | 67% |

---

## Adding a New Artist (Quick Ref)

1. **Prep assets** → save to `public/artist-images/{slug}/avatar.jpg`
2. **Add to** `src/lib/artists.ts` → `ARTISTS` array
3. **Add tracks** to `src/lib/data.ts` → `TRACKS` array
4. **Deploy** → `vercel --prod --yes`

Path rules:
- Avatar: `/artist-images/{slug}/avatar.jpg` (never `/images/`)
- Audio: `/artist-images/{slug}/audio/{filename}.mp3`

See `ARTIST-SUBMIT-SYSTEM.md` and `ARTIST-ONBOARDING.md` in root.

---

## Deploy Status

⚠️ **Vercel rate limited** — too many deploys today (~100+). Site needs redeploy when limit resets (~24 hours from Apr 5). All code changes are saved locally.

---

## Known Issues / TODOs

- [ ] **Checkout color** — change from orange (Od wants options, discussion pending)
- [ ] **Light/dark mode** — Porterful gets Instagram-style system detection (Overstood stays as-is)
- [ ] **Superfan dashboard backend** — not yet connected to frontend
- [ ] **Artist submit automation script** — queued (reduce manual steps)
- [ ] **Vercel redeploy** — blocked on rate limit reset

---

## File Map

| File | Location |
|------|----------|
| Artist data | `src/lib/artists.ts` |
| Track data | `src/lib/data.ts` |
| Product data | `src/lib/products.ts` |
| Artist page | `src/app/(app)/artist/[slug]/page.tsx` |
| Apply form | `src/app/(app)/apply/` |
| Submit system | `ARTIST-SUBMIT-SYSTEM.md` |
| Onboarding guide | `ARTIST-ONBOARDING.md` |
| CDN audio | Supabase `tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/audio` |
