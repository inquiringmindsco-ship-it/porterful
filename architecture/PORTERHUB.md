# Porter Unified System Architecture
## "PorterHub" — One infrastructure, multiple revenue streams
*April 2, 2026*

---

## THE PROBLEM

10 businesses. 10 separate deploys. 10 auth systems. 10 Stripe accounts. No shared data. No cross-pollination.

The average founder loses 60% of momentum switching between projects. Right now you're burning that overhead across every venture.

---

## THE SOLUTION: PorterHub

A unified operating system for all Od's businesses. One auth. One database. One referral network. One dashboard.

```
                    ┌─────────────────────────────────┐
                    │         PORTERHUB CORE          │
                    │                                 │
                    │  ┌─────────┐  ┌──────────────┐  │
                    │  │Porter ID│  │ Referral     │  │
                    │  │(Auth)   │  │ Network       │  │
                    │  └─────────┘  └──────────────┘  │
                    │                                 │
                    │  ┌─────────┐  ┌──────────────┐  │
                    │  │ Stripe  │  │ Email/        │  │
                    │  │ Connect │  │ Notification  │  │
                    │  └─────────┘  └──────────────┘  │
                    │                                 │
                    │  ┌─────────┐  ┌──────────────┐  │
                    │  │ Lead    │  │ Analytics    │  │
                    │  │ Engine  │  │ Dashboard     │  │
                    │  └─────────┘  └──────────────┘  │
                    └──────────┬──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │         THE BUSINESSES (scoped by routing) │
        ├──────────┬───────────┼───────────┬─────────┤
        ▼          ▼           ▼           ▼         ▼
   Porterful   CreditKlimb  HungerSwipes  HeirCraft  FamilyOS
   (music+     (leads)      (swipe+       (physical  (lineage)
    merch)                  commission)    goods)
```

---

## PORTERHUB CORE — 5 SHARED SYSTEMS

---

### SYSTEM 1: Porter ID (Unified Auth)

**What it is:** Single login across all businesses. One email. One password. One account that exists in every app.

**What you get:**
- Login once → access Porterful, CreditKlimb, HungerSwipes, HeirCraft, FamilyOS
- Profile data shared: name, email, avatar, bio
- Role-based: `artist`, `creator`, `fan`, `admin`, `builder`
- Permissions cascade by role

**Supabase Auth — shared across all apps:**
```sql
-- All businesses share ONE profiles table
profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  role text, -- 'artist' | 'creator' | 'fan' | 'admin' | 'builder'
  created_at timestamptz,
  -- Porter-specific fields
  porter_slug text,     -- artist username (Porterful)
  hungerhandle text,    -- HungerSwipes username
  heir_handle text,     -- HeirCraft handle
  -- Tracking
  referred_by uuid references profiles,
  referral_code text unique
)
```

**One Supabase project. All apps connect to it.**

---

### SYSTEM 2: Referral Network (Cross-Business Commissions)

**What it is:** One referral link works across ALL Porter businesses. Earn anywhere someone lands.

**The mechanic:**
- Fan refers someone to Porterful → earns 3% on music/merch
- Same fan refers someone to HungerSwipes → earns 5-20% on food orders
- Same fan refers someone to HeirCraft → earns 10% on P2P sales
- Same fan refers someone to CreditKlimb → earns $5 per lead submitted

**One link. Every business. Cumulative earnings.**

```
 referral.porterful.com/?ref=ODSFAN123
        ↓
 ┌─────────────────────────────────────────┐
 │          REFERRAL ROUTER                │
 │  User clicks → stored in cookie        │
 │  referred_by tracked on signup          │
 │  Forever (no expiry)                   │
 └──────────┬──────────────────┬───────────┘
            ▼                  ▼
     Porterful fits      HungerSwipes
     when they buy       when they order
     music/merch         food
            │                  │
            ▼                  ▼
     3% commission       5-20% commission
     paid from           paid from
     platform fee        platform fee
```

**Commission structure across all businesses:**

| Business | Referral Rate | Paid From | Frequency |
|----------|--------------|-----------|-----------|
| Porterful (music) | 3% | Platform fee (10%) | Per sale |
| Porterful (merch) | 3% | Platform fee (10%) | Per sale |
| HungerSwipes | 5-20% (creator-set) | Order commission | Per order |
| HeirCraft (unit) | 10% | Platform margin ($14 of $47) | Per sale |
| HeirCraft (P2P) | 10% | P2P transaction fee | Per resale |
| CreditKlimb | $5/lead | Lead sale revenue | Per lead |
| Family Legacy OS | $1/mo | Subscription | Monthly |

**This is Porterful's superfan layer — generalized.**

---

### SYSTEM 3: Stripe Connect (Unified Payments)

**One Stripe account. All money flows through it.**

```
┌──────────────────────────────────────────────────────┐
│                   STRIPE DASHBOARD                   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Porterful    │  │ HungerSwipes │  │ HeirCraft │  │
│  │ - Artists    │  │ - Creators   │  │ - P2P     │  │
│  │ - Superfans  │  │ - Restaurants│  │ - Buyers  │  │
│  │ - Platform % │  │ - Platform % │  │ - Platform%│ │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ CreditKlimb  │  │ IHD™          │  │ TeachYoung│  │
│  │ - Leads $    │  │ - Flat fees   │  │ - Future  │  │
│  │ - Connects   │  │ - Priority    │  │   subs    │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────┘
```

**What Stripe Connect handles:**
- **Porterful:** Artist payouts (67%), Superfan commissions (3%), Platform (10%)
- **HungerSwipes:** Creator commissions, restaurant payouts, platform cut
- **HeirCraft:** Unit sales, P2P marketplace (seller 65%, referrer 10%, platform 25%)
- **CreditKlimb:** Lead sales (future)
- **IHD:** Flat fee processing
- **Subscriptions (future):** TeachYoung, Family Legacy OS

**One Stripe webhook. One dashboard. One payout schedule.**

---

### SYSTEM 4: Lead Engine (Unified Capture + Routing)

**What it is:** Every business captures leads the same way. Leads live in one place. Can be sold or routed to any business.**

```
LEAD CAPTURE POINTS (shared across all businesses):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Porterful     → Fan email list (for album drops, merch drops)
  HungerSwipes  → Restaurant signups, creator signups
  CreditKlimb   → Credit lead form (name, email, score range, state)
  IHD™          → Inmate/family intake form
  HeirCraft     → Pre-order waitlist, email list
  G-Body Finder → Car enthusiast list
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  All leads → Shared Supabase leads table
  
  ┌─────────────────────────────────────────┐
  │            LEAD ROUTING ENGINE          │
  │                                         │
  │  CreditKlimb leads → sold to attorneys   │
  │  IHD leads → processed by Od/staff      │
  │  Porterful emails → Od's artist list    │
  │  HeirCraft waitlist → launch buyers     │
  │  Cross-sell: HungerSwipes → Porterful   │
  │  Cross-sell: CreditKlimb → IHD          │
  └─────────────────────────────────────────┘
```

**Shared lead schema:**
```sql
leads (
  id uuid,
  email text,
  phone text,
  source_business text,  -- 'porterful' | 'hungerswipes' | 'creditklimb' | 'ihd' | 'heircraft'
  lead_type text,       -- 'fan' | 'creator' | 'restaurant' | 'credit' | 'inmate' | 'buyer'
  referred_by uuid references profiles,
  status text,          -- 'new' | 'contacted' | 'converted' | 'sold'
  sale_price decimal,  -- if sold to attorney
  created_at timestamptz
)
```

---

### SYSTEM 5: PorterHub Dashboard (Unified Analytics + Management)

**One login. All businesses. Real numbers.**

```
┌─────────────────────────────────────────────────────────────┐
│                    PORTERHUB DASHBOARD                      │
│                    od.porterhub.local                       │
│                                                              │
│  TODAY   │  Revenue Today  │  Leads  │  New Users  │  Refs  │
│  ════════╪═════════════════╪═════════╪════════════╪════════│
│   $127   │     $89        │   14    │     8      │   23   │
│          │                │         │            │        │
│  THIS WEEK  │  By Business    │  Top Referrers  │  Pending │
│  ════════════╪═════════════════╪════════════════╪═════════│
│   $1,847   │ Porterful: $94   │ Od: 47 refs    │ Payouts: │
│            │ CreditKlimb: $0 │ Kelcee: 12     │ $340     │
│            │ HungerSwipes:$0 │ Fan23: 8       │          │
│            │ HeirCraft: $0   │                │          │
│            │ IHD: $0         │                │          │
└─────────────────────────────────────────────────────────────┘
```

**What Od sees in one view:**
- Revenue per business (today, week, month, all-time)
- Leads captured per business
- Top referrers across all ventures
- Pending payouts
- Email list size
- Traffic sources

**No switching between apps. No checking Stripe dashboards separately.**

---

## BUSINESS GROUPINGS — WHAT SHARES WHAT

---

### GROUP A: The Commerce Cluster
**Porterful + HungerSwipes + HeirCraft**

| Shared | What they share |
|--------|----------------|
| Auth | Porter ID |
| Database | Supabase |
| Payments | Stripe Connect |
| Referral system | Porter Network (3-20% commissions) |
| Creator accounts | Same `creator` role → upload, earn, track |
| Payout system | Same Stripe Connect payout flow |
| Social proof | Reviews, ratings, HungerScore™ / artist rank |

**How they connect:**
```
Porterful artist (O D Porter)
        ↓ has 1000 fans
        ↓ refer them to HungerSwipes
HungerSwipes creator (photographer)
        ↓ earns commission on food orders
        ↓ refer earners to HeirCraft
HeirCraft buyer (gift purchaser)
        ↓ buys Founder Dragon
        ↓ refers friends (10% P2P commission forever)
```

**One fanbase. Three revenue streams.**

---

### GROUP B: The Lead Gen Cluster
**CreditKlimb + IHD™ + G-Body Finder**

| Shared | What they share |
|--------|----------------|
| Auth | Porter ID |
| Database | Supabase |
| Lead capture | Same lead schema |
| Lead routing | Cross-sell engine |
| Notification | Discord bot alerts when leads come in |
| Future monetization | Lead sales, flat fees |

**How they connect:**
```
CreditKlimb visitor (bad credit)
        ↓ cross-sell
IHD™ visitor (has incarcerated family member)
        ↓ both are underserved financially
G-Body Finder visitor (car enthusiast, likely blue collar income)
        ↓ cross-sell
CreditKlimb visitor
```

**One audience segment. Three lead capture points. Sell leads separately or bundle.**

---

### GROUP C: The Personal / Long-Game Cluster
**TeachYoung + Family Legacy OS**

| Shared | What they share |
|--------|----------------|
| Auth | Porter ID |
| Database | Supabase |
| Target | Family-centered, personal use |
| Revenue | Future subscription (freemium model) |
| Onboarding | Same family account structure |

**These don't need traffic — they're for Od's family + could be opened later.**

---

### GROUP D: Standalone (No shared infrastructure yet)
**Honor Earth™ + Creature Kingdom**

| Business | Why standalone |
|----------|---------------|
| Honor Earth™ | Hardware — needs separate supply chain, manufacturing, shipping |
| Creature Kingdom | Roblox — built IN Roblox Studio, not Next.js |

**Future connection:** Honor Earth™ buyers → HeirCraft waitlist (same eco-conscious buyer). Creature Kingdom → Porterful music (soundtrack drops in game).

---

## TRAFFIC ENGINE — ONE REFERRAL LAYER FOR ALL BUSINESSES

---

**The insight:** Od already has ~1000 fans. That fanbase is the seed traffic for every business.

```
                        ~1000 FANS
                          (Od's)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Porterful            HungerSwipes          CreditKlimb
   (music/merch)        (food photos)          (credit leads)
        │                   │                   │
        ▼                   ▼                   ▼
   3% commission     5-20% commission      $5/lead
   per sale          per order              per lead
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                   SAME REFERRAL LINK
                   yoursite.com/ref/ODFAN123
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         Email Opt    Superfan       Lead Capture
         (all send    Dashboard      (see all biz
          to one      - see all      leads in one
          list)       commissions)   place)
```

**One referral link. Every business. Cumulative earnings. One dashboard to track.**

---

## MONETIZATION SYSTEM — HOW MONEY FLOWS

---

```
┌─────────────────────────────────────────────────────────────┐
│                    MONEY FLOW DIAGRAM                       │
│                                                             │
│  CUSTOMER                           PORTERHUB               │
│     │                                  │                    │
│     │ buys Porterful merch             │                   │
│     ├──────────────────────────────────▶│                   │
│     │                                  │ pays artist 67%    │
│     │                                  │ pays superfan 3%    │
│     │                                  │ platform keeps 10%  │
│     │◀─────────────────────────────────│                   │
│     │         Stripe payout            │                   │
│                                                             │
│     │ orders food on HungerSwipes      │                   │
│     ├──────────────────────────────────▶│                   │
│     │                                  │ pays creator 80-95% │
│     │                                  │ platform 5-20%      │
│     │◀─────────────────────────────────│                   │
│     │         Stripe payout            │                   │
│                                                             │
│     │ buys HeirCraft Founder Dragon    │                   │
│     ├──────────────────────────────────▶│                   │
│     │                                  │ pays Od (product)  │
│     │                                  │ platform keeps $14  │
│     │                                  │ referrer gets $4.70 │
│     │◀─────────────────────────────────│                   │
│     │         Stripe payout            │                   │
│                                                             │
│     │ submits lead on CreditKlimb      │                   │
│     ├──────────────────────────────────▶│                   │
│     │                                  │ sells lead to      │
│     │                                  │ attorney $10-50    │
│     │◀─────────────────────────────────│                   │
│     │         Lead sold               │                   │
│                                                             │
│  ALL BUSINESSES → One Stripe account → One payout schedule  │
└─────────────────────────────────────────────────────────────┘
```

**Revenue streams activated by business:**

| Business | Revenue Stream | Status | Share % |
|----------|---------------|--------|---------|
| Porterful | Music sales | LIVE | 10% |
| Porterful | Merch sales | LIVE | 10% |
| Porterful | Superfan referrals | LIVE | 3% to fan |
| CreditKlimb | Lead sales | BROKEN (API) | $5-50/lead |
| CreditKlimb | Affiliate | Not started | TBD |
| HungerSwipes | Order commission | MVP | 5-20% |
| HungerSwipes | Restaurant listing | Future | Monthly fee |
| HeirCraft | Unit sales | Not started | ~$14/unit |
| HeirCraft | P2P marketplace | Not started | 25% |
| HeirCraft | B2B licensing | Future | $/unit licensed |
| IHD™ | Flat fees ($49-199) | MVP | 100% |
| G-Body Finder | Affiliate | Not started | 5-15% |
| Family Legacy | Subscriptions | Not started | $5-10/mo |
| TeachYoung | Subscriptions | Future | $10-20/mo |

---

## AUTOMATION FLOWS

---

### FLOW 1: New Fan Activation
```
Someone visits porterful.com → signs up (Porter ID)
        ↓
Referred by existing fan (Porter Network tracks it)
        ↓
Email welcome sequence (Porterful launch emails)
        ↓
After first purchase → invited to Superfan program
        ↓
Gets unique referral link → shares → earns 3%
        ↓
Cross-sell: "Want to earn more? Join HungerSwipes as a creator"
        ↓
Earn commission on food photos → refer HeirCraft buyers → earn 10%
```

### FLOW 2: Lead → Customer
```
Visitor lands on CreditKlimb → fills lead form
        ↓
Lead captured in shared Supabase table
        ↓
Discord bot notifies Od: "New credit lead — [state], [score range]"
        ↓
Lead sold to attorney partner ($10-50)
        ↓
Cross-sell email: "Have you seen HungerSwipes?" / "Do you have a family member who needs IHD?"
```

### FLOW 3: HeirCraft Launch Sequence
```
Waitlist signups captured via Porter ID
        ↓
Pre-launch: Email with Founder Dragon reveal + referral link
        ↓
Day 1: First 100 available → buyers use referral links
        ↓
Referrers earn 10% on every sale their link drives — forever
        ↓
Post-sellout: P2P marketplace opens
        ↓
Referrers earn 10% on every P2P resale — forever
```

### FLOW 4: HungerSwipes Creator → Porterful Artist
```
Food photographer joins HungerSwipes
        ↓
Uploads food photos → earns commission on orders
        ↓
Shows up on HungerSwipes leaderboard (HungerScore™)
        ↓
Cross-sell: "Are you an artist too? Upload your music to Porterful"
        ↓
Same Porter ID → already has account → just add tracks
        ↓
Now earning on food photos AND music sales
```

---

## SHARED INFRASTRUCTURE MATRIX

---

| Component | Porterful | CreditKlimb | HungerSwipes | HeirCraft | FamilyOS | IHD | G-Body | TeachYoung |
|-----------|-----------|-------------|--------------|-----------|----------|-----|--------|-----------|
| **Porter ID (Auth)** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Shared DB (Supabase)** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Stripe Connect** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Referral Network** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Lead Engine** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Email List** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Discord Bot** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analytics Dashboard** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PorterHub Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Legend: ✅ = shared | ❌ = standalone (for now)**

---

## PHASED BUILD PLAN

---

### Phase 1: Hook up the shared layer (Week 1-2)
- [ ] One Supabase project for Porterful, HungerSwipes, HeirCraft, CreditKlimb, FamilyOS
- [ ] Add `referred_by` + `referral_code` to all signups
- [ ] Build PorterHub dashboard (simple — revenue + leads per biz)
- [ ] Share email list across all businesses
- [ ] Fix CreditKlimb leads API → connect to Supabase

### Phase 2: Unified referral system (Week 2-3)
- [ ] `referrals` table tracks cross-business referrals
- [ ] One link format: `porter.id/ref/[code]`
- [ ] Commission calculator — see earnings from all biz in one place
- [ ] Discord bot → reports all commission events
- [ ] Stripe webhook → updates all earnings in real-time

### Phase 3: Cross-sell engine (Week 3-4)
- [ ] Lead routing rules (CreditKlimb → IHD, HungerSwipes → Porterful)
- [ ] Email sequences per business
- [ ] Superfan activation for HungerSwipes creators
- [ ] G-Body Finder → affiliate links to parts retailers

### Phase 4: Scale (Ongoing)
- [ ] Add IHD, G-Body Finder, TeachYoung to Porter ID
- [ ] HeirCraft physical product launch
- [ ] Family Legacy OS public launch
- [ ] Honor Earth™ manufacturing run

---

## WHAT THIS UNLOCKS

**Right now:**
- 10 businesses, 10 separate systems, no shared data
- Od switching context constantly, losing momentum

**With PorterHub:**
- One login across all businesses
- One referral link works everywhere
- One dashboard shows all revenue
- Fan in Porterful → automatically a lead for CreditKlimb, IHD, HeirCraft
- Creator on HungerSwipes → also a potential Porterful artist
- Same Stripe account → same payout day
- Same Supabase → same auth, same data, same growth

**The moat:** Nobody in this space has a unified creator-to-commerce platform that spans music, food photography, physical products, credit leads, AND family lineage. That's a real business category of one.

---
*PorterHub Architecture — ~/Documents/porterful/architecture/PORTERHUB.md*
