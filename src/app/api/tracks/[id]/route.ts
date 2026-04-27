import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';

// PATCH /api/tracks/[id] — Update a track
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedClient();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { supabase, user } = auth;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Create admin client to bypass RLS for update (ownership already verified)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Get user's profile to check artist role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'artist') {
      return NextResponse.json({ error: 'Only artists can edit tracks' }, { status: 403 });
    }

    // Verify track exists and belongs to this artist
    const { data: existingTrack } = await supabase
      .from('tracks')
      .select('id, artist_id')
      .eq('id', id)
      .single();

    if (!existingTrack) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (existingTrack.artist_id !== profile.id) {
      return NextResponse.json({ error: 'You can only edit your own tracks' }, { status: 403 });
    }

    // Parse update body
    const body = await request.json();
    const updates: Record<string, any> = {};

    // Validate and set allowed fields
    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null;
    }

    if (body.proud_to_pay_min !== undefined || body.price !== undefined) {
      const price = body.proud_to_pay_min ?? body.price;
      updates.proud_to_pay_min = typeof price === 'number' ? Math.max(0, price) : 1;
    }

    if (body.album !== undefined) {
      updates.album = body.album?.trim() || null;
    }

    if (body.cover_url !== undefined) {
      updates.cover_url = body.cover_url?.trim() || null;
    }

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
    }

    // Require at least one field to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update track using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('tracks')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[tracks:patch] Update error:', error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Track not found after update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, track: data[0] });
  } catch (err: any) {
    console.error('[tracks:patch] Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update track' }, { status: 500 });
  }
}

// DELETE /api/tracks/[id] — Soft delete a track (set is_active = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedClient();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { supabase, user } = auth;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's profile to check artist role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'artist') {
      return NextResponse.json({ error: 'Only artists can delete tracks' }, { status: 403 });
    }

    // Verify track exists and belongs to this artist
    const { data: existingTrack } = await supabase
      .from('tracks')
      .select('id, artist_id')
      .eq('id', id)
      .single();

    if (!existingTrack) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (existingTrack.artist_id !== profile.id) {
      return NextResponse.json({ error: 'You can only delete your own tracks' }, { status: 403 });
    }

    // Soft delete: set is_active = false
    const { data, error } = await supabase
      .from('tracks')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[tracks:delete] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, track: data, message: 'Track archived' });
  } catch (err: any) {
    console.error('[tracks:delete] Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete track' }, { status: 500 });
  }
}

// GET /api/tracks/[id] — Get single track details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedClient();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { supabase, user } = auth;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: track, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Verify ownership (only artist can view their own track details)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'artist' && track.artist_id !== profile.id)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (track.artist_id !== profile.id) {
      return NextResponse.json({ error: 'You can only view your own tracks' }, { status: 403 });
    }

    return NextResponse.json({ success: true, track });
  } catch (err: any) {
    console.error('[tracks:get] Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch track' }, { status: 500 });
  }
}
