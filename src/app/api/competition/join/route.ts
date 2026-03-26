import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { artistId } = await request.json();

    if (!artistId) {
      return NextResponse.json({ error: 'Missing artistId' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check founding window status
    const { data: window } = await supabase
      .from('founding_window')
      .select('*')
      .eq('id', 1)
      .single();

    const isFounder = (window?.artists_joined || 0) < (window?.artist_limit || 50);

    // Register artist
    const { data, error } = await supabase.rpc('register_competition_artist', {
      p_artist_id: artistId,
      p_is_founder: isFounder,
    });

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Could not register - artist may already be registered or founding window is closed' }, { status: 400 });
    }

    // Get updated window status
    const { data: updatedWindow } = await supabase
      .from('founding_window')
      .select('*')
      .eq('id', 1)
      .single();

    return NextResponse.json({
      success: true,
      isFoundingArtist: isFounder,
      foundingWindow: {
        artistsJoined: updatedWindow?.artists_joined || 0,
        artistLimit: updatedWindow?.artist_limit || 50,
        spotsLeft: (updatedWindow?.artist_limit || 50) - (updatedWindow?.artists_joined || 0),
      },
    });
  } catch (error) {
    console.error('Join competition error:', error);
    return NextResponse.json({ error: 'Failed to join competition' }, { status: 500 });
  }
}
