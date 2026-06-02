# MEASUREMENT FOUNDATION - IMPLEMENTATION PLAN
## Porterful - Prepared 2026-06-02

---

## Executive Summary

**Objective:** Build a trustworthy, privacy-safe measurement layer that answers:
- How many plays are happening?
- How many downloads are happening?
- What does the visitor -> play -> email capture -> purchase -> download funnel look like?
- Which tracks and artists are actually converting?
- Where is traction showing up by city and state?

**Status:** Sprint 1B is complete. Revenue is verified. Measurement Foundation can start now.

**Guardrails:**
- Server-side events only
- No IP logging
- No exact addresses
- No precise geolocation
- No new payout or merch work
- Keep the canonical money report in `/api/dashboard/revenue` separate from measurement

---

## Current Starting Point

The repo already has the important revenue and access rails in place:
- Canonical founder revenue report: `/api/dashboard/revenue`
- Canonical access ledger: `music_purchases`
- Audio player state: `src/lib/audio-context.tsx`
- Download delivery and access recovery: `src/app/api/music/download-proxy/route.ts` and `src/app/api/music/recover/route.ts`
- Email-based access recovery: `src/app/api/music/email-access/route.ts`
- Founder dashboard consumer: `src/app/(app)/dashboard/founder/page.tsx`

These are the safest integration points for measurement. Do not build a second money source of truth.

---

## 1. PLAY TRACKING ARCHITECTURE

### Goal
Track every meaningful play event server-side without exposing analytics keys in the browser.

### Event Shape
`POST /api/analytics/play`

```json
{
  "session_id": "uuid",
  "track_id": "uuid",
  "artist_id": "uuid",
  "user_id": "uuid | null",
  "source": "player | preview | embed",
  "completed": true,
  "duration_seconds": 0,
  "city": "St. Louis | null",
  "state": "MO | null"
}
```

### Table Schema
```sql
CREATE TABLE plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  source text CHECK (source IN ('player', 'preview', 'embed')),
  duration_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  city text,
  state text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_plays_session ON plays(session_id, created_at);
CREATE INDEX idx_plays_track ON plays(track_id, created_at);
CREATE INDEX idx_plays_artist ON plays(artist_id, created_at);
CREATE INDEX idx_plays_location ON plays(city, state);
```

### Hook Points
- `src/lib/audio-context.tsx`
- Public preview players on music pages

### Privacy Notes
- City/state only
- No IP address storage
- No device fingerprinting
- If location is unknown, keep it null

---

## 2. DOWNLOAD TRACKING ARCHITECTURE

### Goal
Track every successful download, and associate it with a purchase when possible.

### Event Shape
`POST /api/analytics/download`

```json
{
  "session_id": "uuid",
  "track_id": "uuid",
  "artist_id": "uuid",
  "purchase_id": "uuid | null",
  "user_id": "uuid | null",
  "source": "purchase | recovery | free | promo",
  "city": "St. Louis | null",
  "state": "MO | null"
}
```

### Table Schema
```sql
CREATE TABLE downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  purchase_id uuid REFERENCES music_purchases(id) ON DELETE SET NULL,
  source text DEFAULT 'purchase',
  city text,
  state text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_downloads_session ON downloads(session_id, created_at);
CREATE INDEX idx_downloads_track ON downloads(track_id, created_at);
CREATE INDEX idx_downloads_purchase ON downloads(purchase_id);
CREATE INDEX idx_downloads_location ON downloads(city, state);
```

### Hook Points
- `src/app/api/music/download-proxy/route.ts`
- `src/app/api/music/download/route.ts` if it is used for direct signed-url delivery

### Important
- A successful download is the tracking event.
- `music_purchases.download_count` and `music_purchases.last_downloaded_at` can still be maintained as convenience columns, but `downloads` is the event truth.

---

## 3. EMAIL CAPTURE EVENTS

### Goal
Measure the email-capture step in the funnel without storing raw email in measurement tables.

### Event Shape
`POST /api/analytics/email-capture`

```json
{
  "session_id": "uuid",
  "email_hash": "sha256",
  "user_id": "uuid | null",
  "source": "email_access | checkout | signup",
  "city": "St. Louis | null",
  "state": "MO | null"
}
```

### Table Schema
```sql
CREATE TABLE email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  email_hash text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  source text NOT NULL,
  city text,
  state text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_email_captures_session ON email_captures(session_id, created_at);
CREATE INDEX idx_email_captures_hash ON email_captures(email_hash);
CREATE INDEX idx_email_captures_location ON email_captures(city, state);
```

### Hook Points
- `src/app/api/music/email-access/route.ts`
- `src/app/(app)/api/checkout/route.ts` if checkout captures email before Stripe

### Important
- Do not store raw email in measurement tables.
- Raw email remains in the revenue and access rails where it is already required.

---

## 4. CONVERSION FUNNEL ARCHITECTURE

### Goal
Track the full path:

Visitor -> Play -> Email Capture -> Purchase -> Download

### Funnel Inputs
- Visitor / session seed: session cookie or local UUID
- Play events: `plays`
- Email capture events: `email_captures`
- Purchase events: canonical money report from `/api/dashboard/revenue`
- Download events: `downloads`

### Funnel Calculations
| Funnel Step | Source |
|---|---|
| Visitor | unique `session_id` values that hit measurement surfaces |
| Play | `plays` rows |
| Email Capture | `email_captures` rows |
| Purchase | canonical revenue report / `orders` + `music_purchases` reconciliation |
| Download | `downloads` rows |

### Implementation Notes
- Use the same `session_id` across play, email capture, and download events.
- Use canonical revenue reconciliation for purchases. Do not reimplement money math in the funnel layer.
- Store conversion percentages in the dashboard API response, not in client state.

---

## 5. FOUNDER ANALYTICS

### Goal
Give Od one trustworthy view of business and listener activity.

### Dashboard Metrics
| Metric | Source | Notes |
|---|---|---|
| Total Plays | `plays` | Server-side count |
| Total Downloads | `downloads` | Server-side count |
| Total Purchases | canonical revenue report | Use the reconciled transaction count |
| Revenue | canonical revenue report | Keep money math in one place |
| Top Tracks | `plays` + `downloads` + revenue join | Sort by meaningful conversion or revenue |
| Top Artists | `plays` + `downloads` + revenue join | Aggregate by artist |
| Conversion Rates | funnel tables + revenue report | Visitor -> Play -> Email -> Purchase -> Download |

### API Shape
`GET /api/dashboard/analytics?period=today|week|month|all`

Suggested response:
```json
{
  "totals": {
    "plays": 0,
    "downloads": 0,
    "purchases": 0,
    "revenue_cents": 0
  },
  "conversion": {
    "visitor_to_play": 0,
    "play_to_email": 0,
    "email_to_purchase": 0,
    "purchase_to_download": 0
  },
  "top_tracks": [],
  "top_artists": [],
  "top_cities": [],
  "top_states": []
}
```

### Dashboard Integration
- Add cards to `src/app/(app)/dashboard/founder/page.tsx`
- Keep the existing `/api/dashboard/revenue` fetch for money
- Add a second fetch for measurement analytics

---

## 6. CITY / STATE TRACTION

### Goal
Show traction by city and state without storing or displaying precise location.

### Allowed Sources
- Checkout billing/shipping city and state when available
- Voluntary city/state from email capture if collected
- Existing user profile location only if it is already city/state level

### Not Allowed
- IP geolocation
- Lat/long
- Street address display
- Exact coordinates

### Implementation
1. Normalize city/state in a shared helper
2. Store city/state on play, download, and email-capture rows when available
3. Attach city/state to purchase records in the webhook when Stripe provides it
4. Show top cities and states in the founder dashboard

### Reporting
- Top Cities
- Top States
- Plays by Location
- Purchases by Location

Unknown values should stay null or roll up into an "Unknown" bucket.

---

## 7. RECOMMENDED BUILD SEQUENCE

### Phase 1 - Schema First
1. Create migration for `plays`, `downloads`, and `email_captures`
2. Add indexes for `session_id`, `track_id`, `artist_id`, `city`, and `state`
3. Add any helper columns needed for location normalization

### Phase 2 - Session + Event Helpers
1. Add a small session helper in `src/lib/`
2. Generate a stable anonymous `session_id`
3. Add a location normalization helper for city/state only

### Phase 3 - Play Tracking
1. Add `POST /api/analytics/play`
2. Instrument `src/lib/audio-context.tsx`
3. Emit play events for preview and full-track playback

### Phase 4 - Download Tracking
1. Add `POST /api/analytics/download`
2. Instrument `src/app/api/music/download-proxy/route.ts`
3. Update `music_purchases.download_count` and `last_downloaded_at` from the same event

### Phase 5 - Email Capture
1. Add `POST /api/analytics/email-capture`
2. Instrument `src/app/api/music/email-access/route.ts`
3. Capture email funnel completion without storing raw email in analytics tables

### Phase 6 - Analytics API
1. Add `GET /api/dashboard/analytics`
2. Reuse the canonical revenue reconciliation helper from `/api/dashboard/revenue`
3. Aggregate plays, downloads, conversions, and location buckets

### Phase 7 - Founder Dashboard
1. Add metric cards for plays, downloads, purchases, revenue, top tracks, top artists
2. Add funnel percentages
3. Add city/state traction panels

### Phase 8 - Verification and Backfill
1. Verify new plays are recorded server-side
2. Verify downloads are recorded only on successful file delivery
3. Verify email capture writes a measurement event
4. Verify founder dashboard numbers update correctly
5. Backfill safe historical aggregates only after the live path is stable

---

## ACCEPTANCE CRITERIA

### Play Tracking
- [ ] Every eligible play writes one `plays` event
- [ ] Track ID and artist ID are present
- [ ] City/state are null or city/state only
- [ ] No IP or precise location is stored

### Download Tracking
- [ ] Every successful download writes one `downloads` event
- [ ] Purchases are linked when possible
- [ ] `music_purchases.download_count` stays in sync

### Funnel Tracking
- [ ] Visitor -> Play -> Email Capture -> Purchase -> Download is measurable
- [ ] Conversion percentages are returned by the dashboard API
- [ ] The funnel uses the same `session_id` across events

### Founder Analytics
- [ ] Total Plays is visible
- [ ] Total Downloads is visible
- [ ] Total Purchases and Revenue still match the canonical money report
- [ ] Top Tracks and Top Artists are sorted from event data
- [ ] City/state reporting stays privacy-safe

---

## RISKS AND MITIGATIONS

| Risk | Mitigation |
|---|---|
| Privacy concerns | No IP, no exact addresses, no device fingerprinting |
| Double counting | Single event endpoint per action, idempotent writes where needed |
| Revenue drift | Keep money math in `/api/dashboard/revenue` only |
| Schema drift | Migration-first, no manual production edits |
| Dashboard confusion | Separate money metrics from measurement metrics in the UI |

---

## NO MERCH YET

Do not start merch builder work yet.

Measurement Foundation is the next phase because it tells us what is happening in the product before we add another surface.

