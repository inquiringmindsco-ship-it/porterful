# Porterful + Likeness — UX & Trust Polish Audit

**Status:** Read-only audit. No code edits, no asset edits, no DB changes.
**Date:** 2026-05-01
**Owner:** O D Porter
**Scope reviewed:**

- `~/Documents/porterful/` (local repo — Next.js app under `src/app/`)
- `~/Documents/voice-catcher/` (Likeness deployed code — Next.js app under `app/src/app/`)

**Lenses applied:**

- `~/Documents/porterful/PORTERFUL_LIKENESS_UX_POLISH_CHECKLIST.md`
- `~/Documents/New project/PORTERFUL_LIKENESS_COMPLIANCE_TRUST_CHECKLIST.md`

**Codex mirror note:** After this lands, ask Codex to mirror this file to `~/Documents/New project/ARCHTEXT/PORTERFUL_LIKENESS_UX_TRUST_POLISH_AUDIT.md` so master planning copies stay in sync.

---

## Executive read

Both products are **closer to premium than half-built**, but each has a small number of high-leverage trust-killers that show up on user-facing surfaces. Likeness has the cleaner public copy. Porterful has the cleaner brand grid but more half-finished feature surfaces.

Priority order — fix in this sequence to unblock launch:

1. Porterful settings showing hard-coded `$0` earnings with a `TODO` comment in code.
2. Likeness Likelihood quiz with two `TODO` comments admitting Stripe payment verification is not wired.
3. Porterful homepage `80%` revenue-share claim — verify it's backed by a real payout policy doc, or soften the wording.
4. Porterful's wide spread of half-shipped routes (`food`, `cart`, `wallet`, `superfan`, `challenge`, `competition`, `services`, `submit`, `radio`, etc.) — hide or label `Coming soon` so the public surface area matches what actually works.
5. Likeness apparel hero shirt visual — confirm the rendered mockup files are not the cheesy 3D Printful preview style.

Everything else is polish.

---

## 1. Porterful — top UX / trust issues

### 1A. Trust-killers (block launch)

**`src/app/(app)/settings/settings/page.tsx:82`** — Settings page hard-codes `totalEarnings: 0` with a `// TODO: join with referral_earnings` comment. If this number is rendered to a referrer who actually has earnings, it reads as either "we owe you nothing" or "the system is broken." Either is a trust break.

> **Action:** Hide the earnings field entirely behind a feature flag until the join is real. If the field renders, label it `Not connected yet` instead of `$0`.

**Homepage hero claim — `src/app/page.tsx:64`:**

> *"80% of every purchase goes straight to the people making the music."*

This is a strong, specific monetary claim shown to the public. It needs to be backed by:

- A real, current payout split policy doc.
- Stripe / payout config that actually executes 80%.
- A linkable explainer ("How payouts work") so a journalist or artist can verify.

If any of those is missing, this line is a launch blocker per Codex's checklist (`No fake payout claims appear in UI`). If they exist, link to them from this line.

> **Action:** Verify `80%` against actual payout config. If verified, link the claim. If not verified, soften to *"Most of every purchase goes directly to the artist — see how payouts work →"* until it's wired.

### 1B. Hidden / over-exposed features

The Porterful repo contains **40+ public-ish routes**, many of which feel half-built or speculative:

- `(app)/food`
- `(app)/cart`
- `(app)/wallet`
- `(app)/superfan`
- `(app)/challenge`
- `(app)/competition`
- `(app)/digital`
- `(app)/services`
- `(app)/submit`
- `(app)/radio`
- `(app)/trending`
- `(app)/coming-soon`
- `(app)/maintenance`
- `systems/worlds`
- `teachyoung-inquiry`
- `ecosystem`
- `land`

**The problem:** This dilutes the message. Porterful's headline is "Music, merch, and support" — but nav exposure to `food`, `wallet`, `competition`, `world`-systems makes it look like a meta-platform that hasn't decided what it is.

> **Action:** For launch, decide which routes are public, which are auth-only, and which are hidden. Cut everything else from public nav. The public surface should be: **music · artists · merch · support · login**. Everything else lives behind login or behind a `/labs` namespace.

### 1C. Confusing / weak CTAs

- Homepage hero has two equal-weight CTAs: `Start Listening` (primary) and `Join Free` (secondary). Hierarchy is correct, but **`Join Free`** is generic. Stronger: `Create your account` or `Claim your username`.
- Multiple `Learn more` style links across `ecosystem` / `systems` pages. Replace with verb-led CTAs that match what the next page actually does.

### 1D. Placeholder copy / TODOs in user paths

- `(app)/settings/settings/page.tsx:82` — `// TODO: join with referral_earnings` (see 1A).
- `(app)/demo/page.tsx:312` — `Product catalog · Coming soon` (this is fine, honest, ship it).
- General: the `(app)/demo` route is publicly reachable and self-labels as a demo. Make sure it's not linked from the marketing surface.

### 1E. Policy pages

Porterful has `(app)/privacy` and `(app)/terms` (with nested duplicates `privacy/privacy` and `terms/terms` — clean those up). **Missing:** `/refund` and `/dmca`. Codex's checklist treats both as launch blockers for any monetized surface.

> **Action:** Add `/refund` and `/dmca` (or `/copyright`) routes. They can be short — but they must exist.

### 1F. Disclaimer density

`src/app/tap/page.tsx:75` has a single dense run-on disclaimer:

> *"Documentation and registration only. No ownership enforcement, legal protection, or identity insurance is claimed here."*

Content is correct. Format is hostile to reading. Break into three short lines. Quiet typography. Bottom of card, not header.

---

## 2. Likeness — top UX / trust issues

### 2A. Trust-killers (block launch)

**`app/src/app/likelihood/page.tsx:5` and `:197`** — Two `TODO` comments openly admitting Stripe payment verification is **not wired**:

> `// TODO: Wire Stripe payment verification before any production unlock copy becomes active.`
> `// Current: Available to registered users only; payment enforcement remains pending server-side.`
> `// TODO: Add payment verification here when Stripe is wired`

If any production copy on `/likelihood` says "unlock," "premium," "purchase," or "pay" while these TODOs are live, the page is shipping a payment claim with no payment enforcement behind it. Per Codex's checklist this is a hard launch blocker (`No fake Stripe claims appear in UI, docs, email, or admin copy`).

> **Action:** Either (a) wire Stripe before the page is publicly linked, or (b) gate the entire `/likelihood` route behind a `comingSoon` flag and remove all unlock/payment language until it's real.

### 2B. Public copy that's actually good (preserve)

Worth calling out — Likeness's public language is already on the right track:

- Homepage hero: *"Your likeness is already being used. This puts it on record."*
- *"Time-stamped. Referenced. Yours."*
- *"Proof of presence"* / *"What's connected to you — clear and verifiable."*
- `legal/page.tsx:28` — *"records are not legal ownership documents, insurance policies, or court orders…"* (exactly the language Codex's checklist recommends).
- `recover/page.tsx:69` — *"Recovery is not guaranteed."*
- `involved/page.tsx:154` — *"This is not employment and there are no guaranteed outcomes."*

This is the tone to keep. Don't let other surfaces drift away from it.

### 2C. Hidden / over-exposed features

Likeness has 24+ routes including `ambassador`, `founding`, `founders`, `rep`, `vault`, `signal`, `premium`, `platforms`, `access`, `involved`, `report`, `nav-demo`, `recover`. Same risk as Porterful: too many doors on the public surface.

> **Action:** Decide which 5–7 routes are the public product (`/`, `/register`, `/verify`, `/apparel`, `/legal`, `/login`) and which are partner / authenticated / link-only. Hide the rest from the marketing surface.

### 2D. Policy pages

Voice-catcher has a single `/legal` page covering legal language. **Missing or unverified:** dedicated `/privacy`, `/terms`, `/refund`, `/dmca` routes. The single `/legal` page may roll all of these in — but check that all four areas are addressed and each is linkable from the footer.

> **Action:** Confirm `/legal` covers terms, privacy, refund, and DMCA contact. If not, add the missing sections before launch.

### 2E. Apparel checkout honesty

`apparel/page.tsx` has clean copy: *"Your Likeness™ record, built into the shirt. Wear your signal. Let them tap in."* The `Tap-In Ready` badge is honest and matches the product capability.

Verify before launch:

- `Tap-In Ready` only appears when the product genuinely ships with NFC. The check on `product.tap_capable` should be authoritative — not a default-true.
- The shirt page does not promise legal protection, identity insurance, or surveillance/tracking — it doesn't, in current copy. Keep it that way.

---

## 3. Likeness shirt visual recommendation

OD's directive: **no cheesy 3D shirt as the main public product image.**

### Current state

`apparel/page.tsx` renders the hero shirt via `getLocalMockups()` — local mockup files served from public assets. The component itself is fine. The risk lives in the **source images** themselves: if those files are Printful's default 3D-rendered preview PNGs, they'll read as e-commerce template, not premium artist merch.

### Visual direction (priority order — match the approved spec)

1. **Regular shirt mockup** — single, photographic mockup. One color, one angle, one frame. No floating, no 360 spin, no color-swap grid on the public hero.
2. **Flat-lay** — shirt on a textured surface (concrete, oak, linen). Top-down. Soft directional light. Editorial feel.
3. **Clean product photo** — actual shirt, neutral backdrop, slight shadow. No model. Lets the artwork breathe.
4. **Realistic wearable look** — shirt cropped to chest/shoulders on a real person. Face optional. The shirt is the subject.
5. **Premium minimal lifestyle (later)** — shirt in context (hanger, bed, chair). One frame. No coffee-cup-and-succulent clichés.

### Hero rules

- One shirt. One frame. One light source.
- Looks photographed, not generated.
- Artwork legible at thumbnail size.
- No watermark, no price tag, no "Buy now" burned into the image.
- Works on black, on white, and at 9:16 crop without losing the subject.

### Where 3D is acceptable

Internal preview tooling and authenticated "preview your design" moments only. **Never the public hero. Never the OG share card. Never the press image.**

### Action

Audit the actual files at `voice-catcher/app/public/` (and wherever `getLocalMockups` reads from) and replace any 3D-rendered Printful preview PNGs with photographic mockups for at least the hero slug `likeness-nfc-tap-shirt`. Other slugs can follow.

---

## 4. Fastest polish wins

Ranked by impact-per-minute:

1. **Hide / `Coming soon`-label every half-built Porterful route.** One commit, biggest perceived-quality jump. Surface area should match working surface.
2. **Pull `totalEarnings: 0` from Settings UI** until the real join lands. Five-line change.
3. **Gate `/likelihood` behind a flag** until Stripe is wired. Or remove unlock language. One file.
4. **Replace one Likeness shirt hero image** with a photographic mockup. Single asset swap.
5. **Add `/refund` and `/dmca` stubs** on Porterful, and verify Likeness `/legal` covers all four. Pure copy work, half a day.
6. **Soften or link the `80%` claim** on Porterful homepage. One line.
7. **Break the dense `tap` disclaimer into three short lines.** One file.
8. **Strengthen homepage secondary CTA** from `Join Free` to a verb-led action like `Create your account`. One line.
9. **Audit nav for duplicate logos / mixed-era marks** across Porterful and Likeness footers. Visual sweep, no code.
10. **Remove `(app)/demo` and `nav-demo` from any public link surface.**

---

## 5. What Claude should rewrite / polish first (copy work)

Order — Claude can do all of these without touching app logic:

1. **Porterful homepage hero subhead** — verify `80%` claim, link or soften. (`src/app/page.tsx:64`)
2. **Porterful settings earnings label** — replace `$0` with `Not connected yet`. (Settings UI)
3. **Likeness `/likelihood` page copy** — strip "unlock / pay / premium" language until Stripe is real. Replace with `Coming soon` framing.
4. **Porterful `tap` disclaimer** — reformat to three short lines. (`src/app/tap/page.tsx:75`)
5. **Porterful homepage CTAs** — `Join Free` → `Create your account` or `Claim your username`.
6. **Footer policy links** — add `Refund` and `DMCA` to Porterful footer; verify Likeness footer surfaces all four policy types.
7. **Empty / loading / error states** across both products — sweep for `Success!`, `Error`, `Loading…` and replace with brand-voice strings.
8. **`Coming soon` labels** — write a short style for what Coming-soon panels say (one line of body copy each, not just a label).

---

## 6. What Claw should fix first (code / infra work)

Order — these need actual app changes, not copy:

1. **Wire `referral_earnings` join** in `(app)/settings/settings/page.tsx`, or hide the field. Stop rendering `0` to the user.
2. **Wire Stripe payment verification** for `/likelihood`, OR feature-flag the route off until payment is real. Two TODOs in the file.
3. **Confirm `80%` payout split is real in Stripe / payout pipeline.** If real, link the policy page from the homepage line. If not real, surface this to OD before launch.
4. **Cull / namespace Porterful's half-shipped routes.** Move non-launch routes under `/labs/` or behind a `NEXT_PUBLIC_FEATURES` gate. Kill links from public nav.
5. **Clean nested `privacy/privacy` and `terms/terms` folders** in Porterful. Pick one path and redirect the other.
6. **Add `/refund` and `/dmca`** routes (Porterful) and any missing sections (Likeness `/legal`).
7. **Audit Likeness apparel mockup files** and swap out any 3D Printful previews for photographic mockups for the flagship `likeness-nfc-tap-shirt`.
8. **Sweep the codebase for `TODO` / `FIXME` / `placeholder` in user-rendered files** and triage each: ship, hide, or fix.

---

## Final readiness rule

Per Codex:

> *If Claw flags a trust claim that the backend cannot prove, the copy loses.*
> *If the system is not live, say "Not connected yet" or "Coming soon."*
> *If the status is ambiguous, block launch until the status is honest.*

Apply this rule to every flagged item above. Anything that fails goes behind a flag, not into the launch.
