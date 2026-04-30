import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-utils';
import { createServerClient } from '@/lib/supabase';
import { TRACKS } from '@/lib/data';
import { dedupeQueueTracks, sortTracksByAlbumOrder } from '@/lib/track-dedupe';

// POST /api/tracks — Upload a new track
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { supabase, user } = auth;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, audio_url, cover_url, album, price } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!audio_url?.trim()) return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });

    // Verify user is an artist
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'artist') {
      return NextResponse.json({ error: 'Only artists can upload tracks' }, { status: 403 });
    }

    // Check 3-track limit
    const { count } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .eq('is_active', true);

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'Maximum 3 active tracks allowed. Remove an existing track to add a new one.' }, { status: 400 });
    }

    // Insert track
    const { data, error } = await supabase
      .from('tracks')
      .insert({
        artist_id: profile.id,
        title: title.trim(),
        artist: user.email?.split('@')[0] || 'Unknown Artist',
        audio_url: audio_url.trim(),
        cover_url: cover_url?.trim() || null,
        album: album?.trim() || null,
        proud_to_pay_min: price ? parseFloat(price) : 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[tracks] Insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, track: data });
  } catch (err: any) {
    if (err.message?.includes('Unauthorized') || err.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[tracks] Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to save track' }, { status: 500 });
  }
}

// GET /api/tracks — List tracks (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artist_id');

  const supabase = createServerClient();

  let query = supabase
    .from('tracks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (artistId) {
    query = query.eq('artist_id', artistId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Merge local static tracks (Gune, ATM Trap, O D Porter catalog)
  const localTracks = TRACKS.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    audio_url: t.audio_url,
    cover_url: (t as any).image || (t as any).cover_url || null,
    price: t.price || 1,
    plays: t.plays || 0,
    duration: t.duration,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  }));

  // Merge database tracks with local tracks (local takes priority for duplicates)
  const merged = [...data || []];
  localTracks.forEach(local => {
    if (!merged.find(db => db.id === local.id || db.title === local.title)) {
      merged.push(local);
    }
  });

  const canonicalTracks = dedupeQueueTracks(sortTracksByAlbumOrder(merged as any));

  return NextResponse.json({ tracks: canonicalTracks });
}
// Cache bust: 1777083644
// Deploy trigger: Fri Apr 24 21:47:41 CDT 2026
