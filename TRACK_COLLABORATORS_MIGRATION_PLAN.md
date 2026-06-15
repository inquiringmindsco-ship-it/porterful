# track_collaborators — Migration Plan (Option B)

**Mission:** M-20260615-1 — Porterful Upload-Day Stabilization + Media Pass
**Date:** 2026-06-15 05:30 CDT
**Author:** Sentinel
**Status:** PLAN ONLY — no implementation, no migration applied, no schema change to the `tracks` table yet
**Awaiting:** Od "do it" keyword to execute

---

## Decision

Use **Option B**: a `track_collaborators` junction table.

Rationale: flexible, future-proof, supports role attribution (primary/featured/producer/writer/collaborator), composes cleanly with RLS, doesn't reshape the `tracks` table itself.

---

## Schema

```sql
-- Migration: 0XX_track_collaborators.sql
-- Date: 2026-06-15 (planned, not yet applied)
-- Author: Sentinel (via Od approval)

-- ============================================================================
-- 1. ENUM for collaboration role
-- ============================================================================

create type collaborator_role as enum (
  'primary',
  'featured',
  'producer',
  'writer',
  'collaborator'
);

-- ============================================================================
-- 2. Junction table
-- ============================================================================

create table track_collaborators (
  id            uuid primary key default gen_random_uuid(),
  track_id      uuid not null references tracks(id) on delete cascade,
  artist_id     uuid not null references artists(id) on delete cascade,
  role          collaborator_role not null default 'collaborator',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),

  -- Prevent duplicate (track, artist, role) triples
  constraint track_collaborators_unique
    unique (track_id, artist_id, role),

  -- Order must be non-negative
  constraint track_collaborators_order_nonneg
    check (display_order >= 0)
);

-- ============================================================================
-- 3. Indexes
-- ============================================================================

-- Fast lookup: "who are this track's collaborators in display order?"
create index track_collaborators_track_id_idx
  on track_collaborators (track_id, display_order asc);

-- Fast lookup: "what tracks does this artist appear on (and in what role)?"
create index track_collaborators_artist_id_idx
  on track_collaborators (artist_id, role);

-- ============================================================================
-- 4. Row Level Security
-- ============================================================================

alter table track_collaborators enable row level security;

-- Anyone can read collaborator credits (public-facing credits info)
create policy "collaborator credits are public-readable"
  on track_collaborators
  for select
  using (true);

-- Only the track's primary artist (or admin/founder) can insert/update/delete
create policy "primary artist and admins can manage collaborators"
  on track_collaborators
  for all
  using (
    -- Track owner (the artist_id on the tracks row matches the requester)
    exists (
      select 1 from tracks t
      where t.id = track_collaborators.track_id
        and t.artist_id = auth.uid()
    )
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('founder', 'admin')
    )
  )
  with check (
    -- Same check for inserts/updates
    exists (
      select 1 from tracks t
      where t.id = track_collaborators.track_id
        and t.artist_id = auth.uid()
    )
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('founder', 'admin')
    )
  );

-- ============================================================================
-- 5. Seed: backfill "primary" for all existing tracks
-- ============================================================================

-- Every existing track already has a single primary artist via tracks.artist_id.
-- Mirror that into the new junction so the API can return a consistent shape.
insert into track_collaborators (track_id, artist_id, role, display_order)
select id, artist_id, 'primary'::collaborator_role, 0
from tracks
on conflict (track_id, artist_id, role) do nothing;
```

---

## TypeScript Surface

### DB row type

```ts
// src/lib/track-collaborators.ts
export type CollaboratorRole =
  | 'primary'
  | 'featured'
  | 'producer'
  | 'writer'
  | 'collaborator'

export interface TrackCollaborator {
  id: string
  track_id: string
  artist_id: string
  role: CollaboratorRole
  display_order: number
  created_at: string
}

// What the UI needs (joined shape)
export interface TrackCollaboratorExpanded extends TrackCollaborator {
  artist: {
    id: string
    slug: string
    name: string
    avatar_url: string | null
  }
}
```

### Server helper (matches `CollaboratorStack` expectations)

```ts
// src/lib/track-collaborators.ts
export async function getTrackCollaborators(
  supabase: SupabaseClient,
  trackId: string
): Promise<TrackCollaboratorExpanded[]> {
  const { data, error } = await supabase
    .from('track_collaborators')
    .select(`
      id,
      track_id,
      artist_id,
      role,
      display_order,
      created_at,
      artist:artists!inner (
        id,
        slug,
        name,
        avatar_url
      )
    `)
    .eq('track_id', trackId)
    .order('display_order', { ascending: true })
    .order('role', { ascending: true })  -- stable order: primary < featured < others

  if (error) throw error
  return (data ?? []) as unknown as TrackCollaboratorExpanded[]
}
```

### Adapter to `ArtistCredit` (the type `CollaboratorStack` already expects)

```ts
import type { ArtistCredit } from '@/lib/artist-credits'

export function collaboratorToArtistCredit(
  c: TrackCollaboratorExpanded
): ArtistCredit {
  return {
    id: c.artist.id,
    name: c.artist.name,
    image: c.artist.avatar_url ?? undefined,
    role: c.role,
    href: `/artist/${c.artist.slug}`,
  }
}
```

---

## API Surface (read path)

The existing `/api/tracks` (or a new `/api/tracks/[id]/collaborators`) needs to surface collaborators in the shape `CollaboratorStack` expects.

```ts
// src/app/api/tracks/[id]/collaborators/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(...)  // anon client, RLS will allow public read
  const rows = await getTrackCollaborators(supabase, params.id)
  return NextResponse.json({
    collaborators: rows.map(collaboratorToArtistCredit)
  })
}
```

---

## UI Wiring (no code change to `CollaboratorStack` needed)

The component already exists at `src/components/artist/CollaboratorStack.tsx` and accepts `ArtistCredit[]`. New usage sites need to fetch the data:

1. **Music rows** (`/music`) — fetch collaborators per track on render
2. **Artist page tracks** (`/artist/[slug]`) — same
3. **Featured track cards** (homepage / dashboard) — same
4. **Player/now playing** — same
5. **Album track lists** — same

For performance: add collaborators to the track fetch on the server side and include them in the track payload, so we don't make N+1 calls.

---

## Migration Runbook (when Od approves "do it")

```bash
# 1. Write the migration
$EDITOR supabase/migrations/0XX_track_collaborators.sql
# paste schema above

# 2. Apply locally (if running supabase locally)
supabase db push

# 3. Apply to production
supabase db push --db-url "$SUPABASE_DB_URL"  # requires prod URL
# OR via the Supabase dashboard SQL editor (safer, has UI confirmation)

# 4. Verify counts
psql ... -c "select count(*) from track_collaborators"  # should be ~115 (matches tracks count)
psql ... -c "select role, count(*) from track_collaborators group by role"  # should be 115 of 'primary', 0 of others

# 5. Add TS types (src/lib/track-collaborators.ts as above)

# 6. Add API route (src/app/api/tracks/[id]/collaborators/route.ts as above)

# 7. Wire CollaboratorStack into the 5 usage sites

# 8. Sentinel QA before deploy

# 9. Deploy with Od "deploy" keyword
```

---

## Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Backfill double-counts if a track's `artist_id` was already in the new table | `ON CONFLICT (track_id, artist_id, role) DO NOTHING` |
| RLS policy allows public read of all collaborators (privacy concern) | Intentional — credits are public. If a track has hidden collaborators, they should be `visibility = 'hidden'` in `artist_videos` style, or filtered at the API layer, not at RLS. |
| Service-role bypass (same pattern as `/api/artist-videos`) | Use a per-user client for `track_collaborators` writes. Hardcode anon client for reads. |
| Migration timeout on large `tracks` table | `insert ... select from tracks` is a single statement; with the unique constraint it should be fast even at 10K rows. If timeout, batch by `created_at`. |
| Existing `CollaboratorStack` assumes `ArtistCredit` shape with `id, name, image, role, href` | Adapter function above ensures compat. |

---

## Out of Scope (for this mission)

- Adding UI to add/remove collaborators from the artist dashboard (this is a follow-up mission)
- Notifying existing artists about the new feature
- Founder override UI for slot limits
- Migrations beyond 0XX (no version bump needed; 0XX is next number in the existing sequence)

---

## Open Questions for Od

1. **Migration number** — what's the next number in the supabase migrations folder? (Currently 007, so 008? Or 0XX placeholder?)
2. **Apply method** — `supabase db push` requires a DB URL with DDL privileges. Do you want me to apply via the Supabase dashboard SQL editor instead?
3. **Wiring scope** — should I wire `CollaboratorStack` into all 5 usage sites in this mission, or just the artist page tracks first?

---

*End of migration plan. Awaiting Od "do it" keyword to execute.*
