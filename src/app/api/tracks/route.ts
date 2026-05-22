import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-utils';
import { createServerClient } from '@/lib/supabase';
import { TRACKS } from '@/lib/data';
import { mergeCanonicalTracks } from '@/lib/track-dedupe';

// POST /api/tracks — Upload a new track
export async function POST(request: NextRequest) {
  let uploadedAudioPath: string | null = null;
  let uploadedCoverPath: string | null = null;
  let supabaseClient: any = null;

  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { supabase, user } = auth;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    supabaseClient = supabase;

    const body = await request.json();
    const { title, audio_url, cover_url, album, price, duration, storage_paths } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!audio_url?.trim()) return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });

    // Track uploaded paths for orphan cleanup
    uploadedAudioPath = storage_paths?.audio || null;
    uploadedCoverPath = storage_paths?.cover || null;

    // Check track limit (unlimited for admin/founder/porterful artists, tiered for others)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    const { data: artist } = await supabase
      .from('artists')
      .select('artist_tier')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'artist' && profile.role !== 'admin' && profile.role !== 'founder')) {
      return NextResponse.json({ error: 'Only artists can upload tracks' }, { status: 403 });
    }

    const tier = artist?.artist_tier || 'basic_artist';

    const isUnlimitedUploader = 
      profile.role === 'admin' ||
      profile.role === 'founder' ||
      tier === 'porterful_artist' ||
      tier === 'exclusive_porterful_artist';

    const maxActiveTracks = isUnlimitedUploader 
      ? null 
      : (tier === 'verified_artist' || tier === 'likeness_verified_artist') 
        ? 25 
        : 3;

    if (maxActiveTracks !== null) {
      const { count } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', profile.id)
        .eq('is_active', true);

      if ((count || 0) >= maxActiveTracks) {
        return NextResponse.json({ 
          error: `Maximum ${maxActiveTracks} active tracks allowed for ${tier.replace('_', ' ')} accounts. Upgrade to Porterful Artist for unlimited uploads.`,
          max_active_tracks: maxActiveTracks,
          can_upload: false,
          tier
        }, { status: 400 });
      }
    }

    // Insert track using service role (RLS bypass) after auth verification
    // This prevents RLS mismatches while ensuring only authenticated users insert
    const serviceSupabase = createServerClient();
    supabaseClient = serviceSupabase;

    // Get artist name for proper display
    const { data: artistInfo } = await supabase
      .from('artists')
      .select('name')
      .eq('id', user.id)
      .single();

    const artistName = artistInfo?.name || user.email?.split('@')[0] || 'Unknown Artist';

    const { data, error } = await serviceSupabase
      .from('tracks')
      .insert({
        artist_id: profile.id,
        title: title.trim(),
        artist: artistName,
        audio_url: audio_url.trim(),
        cover_url: cover_url?.trim() || null,
        album: album?.trim() || null,
        duration: duration ? parseInt(duration, 10) : null,
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
    // Orphan cleanup: delete uploaded files if metadata save failed
    if (uploadedAudioPath && supabaseClient) {
      try {
        await supabaseClient.storage.from('music').remove([uploadedAudioPath])
        console.log('[tracks] Orphan cleanup: removed audio', uploadedAudioPath)
      } catch (cleanupErr) {
        console.error('[tracks] Failed to clean up audio orphan:', cleanupErr)
      }
    }
    if (uploadedCoverPath && supabaseClient) {
      try {
        await supabaseClient.storage.from('music').remove([uploadedCoverPath])
        console.log('[tracks] Orphan cleanup: removed cover', uploadedCoverPath)
      } catch (cleanupErr) {
        console.error('[tracks] Failed to clean up cover orphan:', cleanupErr)
      }
    }

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
    .order('track_number', { ascending: true, nullsFirst: false });

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
    track_number: (t as any).track_number,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  }));

  // Canonical merge: static/CDN tracks first, then DB rows.
  // This keeps the public route aligned with the music page and player queue.
  const canonicalTracks = mergeCanonicalTracks(data || [], localTracks, { includeInactive: false });

  return NextResponse.json({ tracks: canonicalTracks });
}
// Cache bust: 1777083644
// Deploy trigger: Fri Apr 24 21:47:41 CDT 2026
