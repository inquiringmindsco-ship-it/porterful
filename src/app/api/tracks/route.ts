import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-utils';
import { createServerClient } from '@/lib/supabase';
import { attachTrackCollaborators, loadTrackCollaboratorMap } from '@/lib/track-collaborators'

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
    const { title, audio_url, cover_url, album, price, duration, duration_seconds, storage_paths } = body;

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

    // Insert track through the authenticated server client so the user
    // session is validated and the write respects the expected server context.
    // In this app the authenticated SSR client is already privileged enough for
    // the upload path once auth has passed.
    const serviceSupabase = supabase;
    supabaseClient = serviceSupabase;

    // Get artist name for proper display
    const { data: artistInfo } = await supabase
      .from('artists')
      .select('name')
      .eq('id', user.id)
      .single();

    const artistName = artistInfo?.name || user.email?.split('@')[0] || 'Unknown Artist';

    const durationInput = duration_seconds ?? duration
    const parsedDuration = durationInput === undefined || durationInput === null || durationInput === ''
      ? null
      : Number(durationInput)
    const canonicalDuration = parsedDuration !== null && Number.isFinite(parsedDuration)
      ? Math.max(0, Math.round(parsedDuration))
      : null

    const { data, error } = await serviceSupabase
      .from('tracks')
      .insert({
        artist_id: profile.id,
        title: title.trim(),
        artist: artistName,
        audio_url: audio_url.trim(),
        cover_url: cover_url?.trim() || null,
        album: album?.trim() || null,
        duration: canonicalDuration,
        proud_to_pay_min: (() => {
          const numericPrice = Number(price)
          return Number.isFinite(numericPrice) ? Math.max(0, numericPrice) : 0.50
        })(),
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
  const artistName = searchParams.get('artist');
  const countOnly = searchParams.get('count_only') === 'true';

  const supabase = createServerClient();

  if (countOnly && artistName) {
    // A3-2 FIX: Count DB/public-truth tracks only.
    // Static tracks are not merged into public count.
    const { data, error, count } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('artist', artistName)
      .eq('is_active', true)
      // A3-2 FIX: Explicit status gating
      .or('status.is.null,status.eq.live,status.eq.published')
      .order('track_number', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // A3-2 FIX: head=true returns no rows; count is in the `count` property
    return NextResponse.json({ count: count || 0 });
  }

  let query = supabase
    .from('tracks')
    .select('*')
    .eq('is_active', true)
    // A3-2 FIX: Explicit status gating — live, published, or null (legacy compat)
    .or('status.is.null,status.eq.live,status.eq.published')
    .order('track_number', { ascending: true, nullsFirst: false });

  if (artistId) {
    query = query.eq('artist_id', artistId);
  }

  // A3-2 FIX: Also filter by artist= query param (was ignored before)
  if (artistName) {
    query = query.eq('artist', artistName);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // A3-2 FIX: Stop merging ungated static TRACKS into public API responses.
  // Public API must return DB/public-truth tracks only.
  // Static tracks are kept as fallback only when DB returns zero results.
  const tracks = (data || []).length > 0 ? data : []
  if (tracks.length === 0) {
    return NextResponse.json({ tracks })
  }

  const collaboratorMap = await loadTrackCollaboratorMap(
    supabase,
    tracks.map((track: any) => track.id).filter(Boolean),
  ).catch(() => new Map())

  return NextResponse.json({ tracks: attachTrackCollaborators(tracks, collaboratorMap) })
}
// Cache bust: 1777083644
// Deploy trigger: Fri Apr 24 21:47:41 CDT 2026
// Cache bust: 1779438684
// Deploy trigger: Fri May 22 03:31:24 CDT 2026
// Added: count_only support for artist track counts
// Deploy timestamp: Fri May 22 03:33:02 CDT 2026
// Deploy trigger: 1779479973
