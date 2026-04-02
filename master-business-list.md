# Porter Business Master List
*Last Updated: April 2, 2026*

---

## CATEGORY 1: LIVE COMMERCE / REVENUE

---

### 1. Porterful
**porterful.com | porterful-app | Next.js + Supabase + Stripe**

| Field | Detail |
|-------|--------|
| **Type** | Music + Merch Commerce Platform |
| **Core Offer** | Artists sell music tracks + print-on-demand merch; fans earn 3% referral commission |
| **Target** | Independent musicians; O D Porter's ~1000 existing fans |
| **Stage** | Active (live, ready for first sale) |
| **Revenue Model** | Platform fee 10% + Stripe transaction cuts; Seller 67%, Artist Fund 20%, Superfan 3%, Platform 10% |
| **Existing Assets** | porterful.com (DNS live), GitHub repo, 100 playable tracks, Printful integration, Stripe Live mode |
| **Traffic Sources** | Od's existing ~1000 fans, Discord server |
| **Missing** | Real artist photos/brand curation, book integration ("There It Is, Here It Go"), curated merch |
| **Path to Revenue** | Od uploads real merch + book → fans buy → first sale |

---

### 2. CreditKlimb
**creditklimb.com | ~/Documents/CreditRepair | Next.js + Vercel**

| Field | Detail |
|-------|--------|
| **Type** | Lead Gen / SaaS (credit repair info site) |
| **Core Offer** | Free credit education + dispute letter generator + lead capture for attorneys |
| **Target** | People with bad credit looking for修复 solutions |
| **Stage** | Active (24 pages live) |
| **Revenue Model** | Lead gen — sell leads to credit repair attorneys; `/api/leads` endpoint |
| **Existing Assets** | creditklimb.com (DNS live), 24 pages, dispute letter API |
| **Traffic Sources** | None yet |
| **Missing** | `/api/leads` and `/api/contact` broken on Vercel (writes to local filesystem — needs Supabase) |
| **Path to Revenue** | Fix leads API → connect to attorney buyers → charge per lead |

---

### 3. G-Body Finder
**gbodyfinder.com | ~/Documents/gbody-finder | Next.js**

| Field | Detail |
|-------|--------|
| **Type** | Niche eCommerce / Parts Marketplace |
| **Core Offer** | G-Body car parts search, market tracker, build calculator |
| **Target** | G-Body (1978-1988 GM A-body) car enthusiasts |
| **Stage** | Active (DNS propagated, live) |
| **Revenue Model** | Affiliate links + parts marketplace cut |
| **Existing Assets** | gbodyfinder.com (live), model pages, market tracker, build calculator, parts search |
| **Traffic Sources** | None yet |
| **Missing** | Traffic, affiliate partnerships, product listings |
| **Path to Revenue** | SEO + content → affiliate commissions on parts sales |

---

## CATEGORY 2: BUILT / MVP (NEEDS TRAFFIC OR CONFIG)

---

### 4. HungerSwipes
**localhost:3002 | ~/Documents/hunger-swipes | Next.js 14 + Supabase + Stripe Connect**

| Field | Detail |
|-------|--------|
| **Type** | Two-sided Marketplace App (Swipe + Commission) |
| **Core Offer** | Tinder for food photos — swipe right to order; photographers earn 5-20% commission on every order their photo drives |
| **Target** | Foodies (Eaters), Food Photographers (Creators), Restaurants |
| **Stage** | MVP built (landing, swipe, matches, creator dashboard, upload, auth, leaderboard all working) |
| **Revenue Model** | Commission on orders (photographer sets 5-20%, platform takes cut); restaurant pays per result only |
| **Existing Assets** | Full Next.js app, Supabase schema, Stripe Connect ready, HungerScore™ ranking system |
| **Traffic Sources** | None |
| **Missing** | Supabase project + env vars for real auth/DB; traffic |
| **Path to Revenue** | Deploy → seed restaurants + photographers → take % of orders |

---

### 5. IHD™ (Inmate Help Desk)
**localhost:3001 | ~/Documents/IHD/ihd-app | Next.js**

| Field | Detail |
|-------|--------|
| **Type** | Service / Document Assistance |
| **Core Offer** | Document prep assistance for incarcerated individuals + families |
| **Target** | Incarcerated individuals and their families |
| **Stage** | MVP built locally |
| **Revenue Model** | Flat fee tiers — Standard $49/7d, Priority $99/3d, Urgent $199/24h |
| **Existing Assets** | Working MVP, pricing tiers, local build |
| **Traffic Sources** | None |
| **Missing** | Traffic, legal-compliant acquisition, payment processing, automation |
| **Path to Revenue** | Facebook/Instagram ads targeting families → Stripe checkout → deliver docs |

---

### 6. TeachYoung
**localhost:3000 (teachyoung.org exists) | ~/Documents/teachyoung | Next.js**

| Field | Detail |
|-------|--------|
| **Type** | Educational Platform (Homeschool) |
| **Core Offer** | Age-appropriate lessons (Math, Reading, Science, Art, Music) for Honor (8) and Noble (9) |
| **Target** | Od + Kelcee's kids; could expand to homeschool families |
| **Stage** | Built and running locally |
| **Revenue Model** | Free for now (family use); potential subscription for other homeschool families |
| **Existing Assets** | Two separate student dashboards, parent dashboard, quiz system, ARCHTEXT™ branding |
| **Traffic Sources** | teachyoung.org (existing landing page) |
| **Missing** | Online presence (not deployed), student accounts, progress tracking |
| **Path to Revenue** | Deploy → open to other homeschool families (~$10-20/mo) |

---

### 7. Family Legacy OS
**~/Documents/family-legacy | Next.js + Supabase**

| Field | Detail |
|-------|--------|
| **Type** | Permissioned Family Lineage Platform |
| **Core Offer** | Private multi-generational lineage system with relationship engine, document vault, family wall |
| **Target** | Families wanting private lineage preservation (Porter/Crews/deGraffenreed/etc.) |
| **Stage** | Core engine built + UI layer complete; relationship engine locked and tested |
| **Revenue Model** | Freemium (free for basic, $5-10/mo for extended features); B2B licensing to genealogical societies |
| **Existing Assets** | Full schema, relationship engine (11/12 tests passing), 31-person seeded family tree, UI components |
| **Traffic Sources** | None |
| **Missing** | Deployment, auth, real family data entry, monetization layer |
| **Path to Revenue** | Deploy for Porter family → expand via referral; B2B licensing to other families/genealogists |

---

## CATEGORY 3: PHYSICAL PRODUCTS

---

### 8. HeirCraft
**~/Documents/toyto (rebranded from TOYTO) | Next.js + Supabase + Stripe**

| Field | Detail |
|-------|--------|
| **Type** | Physical Product + Digital Ownership Platform |
| **Core Offer** | Physical toys with embedded QR codes → digital owner dashboard + referral earnings + P2P marketplace |
| **Target** | Parents, gift-buyers, collectors; B2B (toy companies) |
| **Stage** | Landing/shop/dashboard/marketplace/sell/legal all built; needs auth + DB + product |
| **Revenue Model** | Unit sales ($47 Founder Dragon); P2P marketplace (Seller 65%, Referrer 10%, HeirCraft 25%); B2B licensing |
| **Existing Assets** | Landing page, shop, dashboard, marketplace, legal docs (Terms/Privacy/Refunds), 3D model (heritage-01-dragon.scad), QR auth (works on iPhone) |
| **Traffic Sources** | None |
| **Missing** | Real product printing, Supabase DB, Stripe, auth, first 100 units |
| **Path to Revenue** | Print 100 Founder Dragons → sell direct → P2P marketplace takes off organically |

---

### 9. Honor Earth™
**~/Documents/inventions/trash-bag-maker | Arduino + 3D Printed**

| Field | Detail |
|-------|--------|
| **Type** | Physical Invention / Hardware |
| **Core Offer** | Trash can that converts grocery bags into continuous trash liner (no proprietary bags needed) |
| **Target** | Every household; eco-conscious consumers |
| **Stage** | Prototype (hardware mostly printed, firmware written, wiring guide done) |
| **Revenue Model** | One-time product sale ($100-150 est.); potential licensing to big-box |
| **Existing Assets** | 8/9 parts 3D-printed, Arduino firmware, wiring guide, assembly renders, bearings + teflon on hand |
| **Traffic Sources** | None |
| **Missing** | MAIN_HOUSING print, heat seal unit (needs PETG filament), full assembly, productization, sales channel |
| **Path to Revenue** | Complete prototype → Kickstarter/Indiegogo → manufacture → Amazon + direct |

---

## CATEGORY 4: GAMING

---

### 10. Creature Kingdom
**~/Documents/RobloxProjects/pet-simulator-docs | Roblox Studio**

| Field | Detail |
|-------|--------|
| **Type** | Roblox Game (Pet Simulator style) |
| **Core Offer** | Click-to-earn coins → buy eggs → hatch mythical creatures → ride vehicles → unlock worlds |
| **Target** | Kids (Od's children Honor 8 + Noble 9); Roblox's 200M+ user base |
| **Stage** | Game design done; Roblox Studio installed; not yet built |
| **Revenue Model** | Robux gamepasses (2x Coins 99R, Auto-collect 149R, VIP 199R, Extra Slots 249R, Instant Coins, Void Egg 99R) |
| **Existing Assets** | Full game design doc, 60+ original creature designs (no copyrighted IP), monetization plan, roadmap |
| **Traffic Sources** | None (internal family project) |
| **Missing** | All game development — baseplate, coin system, egg shop, pet system, vehicles, world unlocks |
| **Path to Revenue** | Build → launch → gamepass sales → Robux converted to real $ |

---

## CATEGORY 5: SERVICES / INFRASTRUCTURE

---

### 11. Porterful Pilots Discord Bot
**Sentinel#3982 in Porterful Pilots server**

| Field | Detail |
|-------|--------|
| **Type** | Community / Support Bot |
| **Core Offer** | Message relay between Discord and OpenClaw; tech support for Porterful users |
| **Target** | Porterful artists + superfans |
| **Stage** | Running via PM2, auto-restart, 0 errors |
| **Revenue Model** | None (support tool) |
| **Existing Assets** | Bot token, inbox/outbox JSON relay, context loaded (Porterful/IHD/CreditKlimb) |
| **Traffic Sources** | Porterful Pilots Discord server |
| **Missing** | Integration with OpenClaw agent brain (currently just relay, not intelligent) |
| **Path to Revenue** | Indirect — better support → happier artists → more platform growth |

---

## ═══════════════════════════════════════
## INFRASTRUCTURE SHARING MAP
## ═══════════════════════════════════════

**Same Stack (Next.js + Supabase + Stripe):**
- Porterful, HungerSwipes, HeirCraft, Family Legacy OS
- All 4 share: Supabase project, Stripe Connect, auth pattern

**Same Audience Overlap:**
- Porterful artists → HungerSwipes creators (photographers are visual artists)
- Porterful fans → HeirCraft buyers (creative, St. Louis, supporter demographic)
- Porterful superfans → Family Legacy OS early adopters (Porter family)

**Same Funnel:**
- HeirCraft + Porterful → same launch email template
- HungerSwipes + CreditKlimb → swipe/match UX pattern could be templated

**Discord Bot:**
- Handles support for Porterful, CreditKlimb, IHD — single bot, 3 brands

---

## ═══════════════════════════════════════
## TOP 3 — FASTEST PATH TO REVENUE
## ═══════════════════════════════════════

### 🥇 #1: CreditKlimb
- **Why:** Live site, no dev needed, broken API is a 1-2hr fix (move leads to Supabase)
- **Action:** Fix `/api/leads` → `/api/contact` → connect Stripe → sell leads to attorneys
- **Revenue could start:** Within days of fixing

### 🥈 #2: Porterful
- **Why:** Live with Stripe in prod mode. Od's ~1000 fans are right there. Book + real merch = immediate sales
- **Action:** Curate 5-10 real merch items + add book "There It Is, Here It Go" → send email to fans → done
- **Revenue could start:** Within 24hrs of Od uploading merch

### 🥉 #3: HungerSwipes
- **Why:** Strong differentiation ("One Photo. Paid Forever."), works on mobile, two-sided network effects
- **Action:** Seed 5-10 local restaurants + 10 photographers → deploy Supabase → launch
- **Revenue could start:** 1-2 weeks with focused outreach

---

## ═══════════════════════════════════════
## QUICK-LOOK SUMMARY TABLE
## ═══════════════════════════════════════

| # | Business | Type | Stage | Revenue Model | Traffic | Priority |
|---|----------|------|-------|---------------|---------|----------|
| 1 | Porterful | Platform | 🟢 Live | Platform fees | Existing fans | **Do now** |
| 2 | CreditKlimb | Lead gen | 🟢 Live | Per lead | None | **Do now** |
| 3 | G-Body Finder | Affiliate | 🟢 Live | Affiliate | None | Hold |
| 4 | HungerSwipes | Marketplace | 🟡 MVP | Commission % | None | **Soon** |
| 5 | IHD™ | Service | 🟡 MVP | Flat fee | None | Queue |
| 6 | TeachYoung | EdTech | 🟡 Built | Future sub | None | Personal |
| 7 | Family Legacy | SaaS | 🟡 Built | Freemium | None | Queue |
| 8 | HeirCraft | Physical+Digital | 🟡 Built | Unit + P2P | None | Queue |
| 9 | Honor Earth | Hardware | 🟠 Prototype | Product sale | None | Long-term |
| 10 | Creature Kingdom | Gaming | 🔴 Design | Robux | None | Kids project |

---
*This doc lives at ~/Documents/porterful/master-business-list.md — update as ventures change.*
