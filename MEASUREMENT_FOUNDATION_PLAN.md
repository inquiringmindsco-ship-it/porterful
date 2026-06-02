# MEASUREMENT FOUNDATION — IMPLEMENTATION PLAN
## Porterful — Prepared 2026-05-31

---

## Executive Summary

**Objective:** Build a trustworthy, auditable measurement layer that answers:
- How much revenue did we actually earn?
- Which products are performing?
- Where do buyers come from?
- How do we report traction to partners and investors?

**Status:** Webhook fix deployed. Ready to instrument once Sprint 1B passes final purchase test.

---

## 1. PLAY TRACKING ARCHITECTURE

### Goal
Track every audio play (start, duration, completion) without exposing analytics keys client-side.

### Design
```
User clicks play → POST /api/analytics/play
Body: { track_id, user_id?, session_id, source: "player" | "preview" | "embed" }
Server writes to: plays (table)
```

### Table Schema
```sql
CREATE TABLE plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text, -- anonymous session fingerprint
  source text CHECK (source IN ('player', 'preview', 'embed', 'download_preview')),
  duration_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_plays_track ON plays(track_id, created_at);
CREATE INDEX idx_plays_user ON plays(user_id, created_at);
```

### Privacy
- No IP logging
- No device fingerprinting
- Session ID = random UUID, not tied to identity
- Aggregate only in reporting

---

## 2. DOWNLOAD TRACKING ARCHITECTURE

### Goal
Track every successful download for conversion and delivery verification.

### Design
```
User clicks download → POST /api/analytics/download
Body: { track_id, purchase_id?, session_id }
Server writes to: downloads (table)
```

### Table Schema
```sql
CREATE TABLE downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  purchase_id uuid REFERENCES music_purchases(id) ON DELETE SET NULL,
  session_id text,
  source text DEFAULT 'purchase', -- 'purchase' | 'free' | 'promo'
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_downloads_track ON downloads(track_id, created_at);
CREATE INDEX idx_downloads_purchase ON downloads(purchase_id);
```

### Integration
- Download API (`/api/music/download`) writes to `downloads` after successful auth
- Recovery flow also logs here
- Enables "purchased but never downloaded" recovery campaigns

---

## 3. CONVERSION FUNNEL ARCHITECTURE

### Goal
Track the full buyer journey from visit → play → checkout → purchase → download.

### Funnel Stages
| Stage | Event | Table |
|-------|-------|-------|
| Visit | page_view | (Plausible/Fathom) |
| Preview Play | play with source='preview' | plays |
| Full Play | play with source='player', completed=true | plays |
| Add to Cart | cart_add | (future) |
| Checkout Start | checkout_initiated | stripe_checkout_sessions |
| Purchase | order_completed | orders |
| Download | download | downloads |

### Conversion Rate Calculation
```sql
-- Visit → Purchase (external analytics + orders)
-- Play → Purchase (plays + orders, joined by session_id or user_id)
-- Preview → Full Play (plays grouped by session)
```

### Implementation Order
1. Deploy plays table + API
2. Deploy downloads table + API
3. Add session_id propagation (cookie/localStorage)
4. Build funnel dashboard query

---

## 4. FOUNDER DASHBOARD METRICS

### Goal
Give Od a single-pane view of real business metrics.

### Metrics to Display
| Metric | Source | Calculation |
|--------|--------|-------------|
| Total Revenue | orders.amount | SUM(amount) / 100 |
| Revenue This Month | orders | SUM where created_at >= month_start |
| Revenue Today | orders | SUM where created_at >= today |
| Total Orders | orders | COUNT(*) |
| Total Buyers | orders | COUNT(DISTINCT buyer_email) |
| Avg Order Value | orders | AVG(amount) / 100 |
| Top Track | orders JOIN tracks | GROUP BY track, SUM(amount) |
| Top City | orders (from Stripe metadata) | GROUP BY city |
| Top State | orders (from Stripe metadata) | GROUP BY state |
| Conversion Rate | plays + orders | plays with completed=true → orders |
| Recovery Rate | recovery_requests | COUNT resolved / COUNT total |

### Dashboard API
```
GET /api/admin/metrics?period=today|week|month|all
Returns: { revenue, orders, buyers, avg_order, top_tracks[], top_cities[] }
```

### Table: metrics_cache (optional, for performance)
```sql
CREATE TABLE metrics_cache (
  id serial PRIMARY KEY,
  metric_name text UNIQUE,
  metric_value numeric,
  computed_at timestamptz DEFAULT now()
);
-- Refresh via cron or webhook trigger
```

---

## 5. CITY/STATE TRACTION REPORTING

### Goal
Show geographic traction for HQ-1 proposal, partner conversations, and investor updates.

### Data Source
- Stripe checkout sessions include `customer_details.address` (if collected)
- Orders table: `shipping_address` JSONB (future)
- IP geolocation is NOT used (privacy violation)

### Implementation
1. Add optional `city` and `state` fields to `orders` table
2. Stripe webhook extracts city/state from billing details when available
3. Dashboard shows: Total buyers by state, Top cities by revenue

### Report Format
```
Traction Report — June 2026
- Total Revenue: $X.XX
- Unique Buyers: N
- States Reached: N (MO, IL, CA...)
- Top City: St. Louis, MO ($X.XX)
- Conversion Rate: X.X%
```

---

## IMPLEMENTATION SEQUENCE

### Phase A: Tables (Day 1 — after Sprint 1B PASS)
1. Create `plays` table
2. Create `downloads` table
3. Create `metrics_cache` table (optional)
4. Deploy migration

### Phase B: APIs (Day 1–2)
1. `POST /api/analytics/play` — track plays
2. `POST /api/analytics/download` — track downloads
3. `GET /api/admin/metrics` — founder dashboard data
4. Integrate download tracking into existing download API

### Phase C: Frontend (Day 2–3)
1. Add play event to audio player
2. Pass session_id in requests
3. Add dashboard chart component (recharts or chart.js)

### Phase D: Backfill (Day 3)
1. Count existing plays from access logs (if any)
2. Mark existing downloads in bulk
3. Set baseline metrics_cache

---

## ACCEPTANCE CRITERIA

### Play Tracking
- [ ] Every play POSTs to /api/analytics/play
- [ ] Plays table has entries within 24h of deployment
- [ ] No PII logged

### Download Tracking
- [ ] Every download POSTs to /api/analytics/download
- [ ] Purchases linked to downloads
- [ ] "Never downloaded" list is queryable

### Conversion Funnel
- [ ] Visit → Play → Purchase flow is traceable
- [ ] Funnel dashboard shows stage counts
- [ ] Conversion rate updates daily

### Founder Dashboard
- [ ] Revenue matches Stripe dashboard
- [ ] Buyer count matches unique emails
- [ ] Top tracks sort correctly
- [ ] City/state data is truthful (no IP geolocation)

---

## RISKS AND MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Privacy concerns | No IP, no fingerprint, aggregate only |
| Performance hit | Async POSTs, batch if needed |
| Data accuracy | Reconcile with Stripe daily |
| Schema drift | Migration-first, no manual changes |

---

## NO-CODING TONIGHT

This plan is ready for implementation tomorrow after:
1. Sprint 1B final $1 purchase test PASS
2. Backfill of 5 historical sessions
3. Code review of measurement API security

**Do not implement until Od says "do it."**
