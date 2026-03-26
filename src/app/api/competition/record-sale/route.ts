import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { artistId, saleAmount } = await request.json();

    if (!artistId || !saleAmount) {
      return NextResponse.json({ error: 'Missing artistId or saleAmount' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if artist is registered in competition
    const { data: existing } = await supabase
      .from('competition_participants')
      .select('*')
      .eq('artist_id', artistId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Artist not registered in competition' }, { status: 400 });
    }

    // Update earnings (this will also check for milestone wins)
    const { data: earningsResult } = await supabase
      .rpc('update_artist_competition_earnings', {
        p_artist_id: artistId,
        p_sale_amount: saleAmount,
      });

    // Add to prize pool (10% of sale)
    await supabase.rpc('add_to_prize_pool', { amount: saleAmount });

    // Check for milestone win
    const { data: milestoneResult } = await supabase
      .rpc('check_milestone', {
        p_artist_id: artistId,
        p_new_earnings: (existing.total_earnings || 0) + saleAmount,
      });

    // Get updated stats
    const { data: updated } = await supabase
      .from('competition_participants')
      .select('*')
      .eq('artist_id', artistId)
      .single();

    const { data: pool } = await supabase
      .from('prize_pool')
      .select('balance')
      .eq('id', 1)
      .single();

    return NextResponse.json({
      success: true,
      milestoneWon: milestoneResult?.[0]?.milestone_won || false,
      milestone: milestoneResult?.[0] ? {
        threshold: milestoneResult[0].threshold,
        bonus: milestoneResult[0].bonus,
        tier: milestoneResult[0].tier,
      } : null,
      participant: {
        totalEarnings: updated?.total_earnings,
        currentTier: updated?.current_tier,
        tierChanged: earningsResult?.[0]?.tier_changed || false,
        newTier: earningsResult?.[0]?.new_tier,
      },
      prizePoolBalance: pool?.balance || 0,
    });
  } catch (error) {
    console.error('Record sale error:', error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}
