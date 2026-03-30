import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Get founding window status
    const { data: window } = await supabase
      .from('founding_window')
      .select('*')
      .eq('id', 1)
      .single();

    // Get prize pool balance
    const { data: pool } = await supabase
      .from('prize_pool')
      .select('*')
      .eq('id', 1)
      .single();

    // Get top 10 competition participants
    const { data: leaders } = await supabase
      .from('competition_participants')
      .select(`
        *,
        profiles:artist_id (
          id,
          name,
          avatar_url
        )
      `)
      .order('total_earnings', { ascending: false })
      .limit(10);

    // Get recent wins
    const { data: recentWins } = await supabase
      .from('competition_wins')
      .select(`
        *,
        profiles:artist_id (
          name
        )
      `)
      .order('claimed_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      competitionLive: window?.competition_launched || false,
      foundingWindow: {
        artistsJoined: window?.artists_joined || 0,
        artistLimit: window?.artist_limit || 50,
        spotsLeft: (window?.artist_limit || 50) - (window?.artists_joined || 0),
        closesAt: window?.window_close,
      },
      prizePool: {
        balance: pool?.balance || 0,
        totalEarned: pool?.total_earned || 0,
        totalPaidOut: pool?.total_paid_out || 0,
      },
      leaders: leaders?.map((l, i) => ({
        rank: i + 1,
        artistId: l.artist_id,
        name: l.profiles?.name || 'Unknown',
        avatar: l.profiles?.avatar_url,
        earnings: l.total_earnings,
        tier: l.current_tier,
        isFounder: l.is_founding_artist,
      })) || [],
      recentWins: recentWins?.map(w => ({
        artistName: w.profiles?.name || 'Unknown',
        milestone: w.milestone_amount,
        bonus: w.bonus_amount,
        tier: w.tier,
        claimedAt: w.claimed_at,
      })) || [],
    });
  } catch (error) {
    console.error('Competition API error:', error);
    return NextResponse.json({ error: 'Failed to fetch competition data' }, { status: 500 });
  }
}
