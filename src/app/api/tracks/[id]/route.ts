import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedClient } from '@/lib/auth-utils'
import { getArtistAccessContext, trackBelongsToArtist } from '@/lib/artist-identity'

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

async function requireTrackOwnership(trackId: string, userId: string) {
  const supabaseAdmin = createSupabaseAdmin()
  const context = await getArtistAccessContext(supabaseAdmin, userId)

  const { data: track, error } = await supabaseAdmin
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return { supabaseAdmin, context, track }
}

function buildTrackUpdates(body: Record<string, any>) {
  const updates: Record<string, any> = {}

  if (body.title !== undefined) {
    const title = String(body.title || '').trim()
    if (!title) {
      return { error: 'Title is required' as const }
    }
    updates.title = title
  }

  if (body.description !== undefined) {
    updates.description = String(body.description || '').trim() || null
  }

  if (body.proud_to_pay_min !== undefined || body.price !== undefined) {
    const price = body.proud_to_pay_min ?? body.price
    const numericPrice = Number(price)
    updates.proud_to_pay_min = Number.isFinite(numericPrice) ? Math.max(0, numericPrice) : 1
  }

  if (body.album !== undefined) {
    updates.album = String(body.album || '').trim() || null
  }

  if (body.cover_url !== undefined) {
    updates.cover_url = String(body.cover_url || '').trim() || null
  }

  if (body.is_active !== undefined) {
    updates.is_active = Boolean(body.is_active)
  }

  if (body.featured !== undefined) {
    updates.featured = Boolean(body.featured)
  }

  if (body.track_number !== undefined) {
    if (body.track_number === null || body.track_number === '') {
      updates.track_number = null
    } else {
      const trackNumber = Number.parseInt(String(body.track_number), 10)
      updates.track_number = Number.isNaN(trackNumber) ? null : trackNumber
    }
  }

  if (body.playback_mode !== undefined) {
    if (!['full', 'preview', 'locked'].includes(body.playback_mode)) {
      return { error: 'Invalid playback mode' as const }
    }
    updates.playback_mode = body.playback_mode
  }

  if (body.preview_duration_seconds !== undefined) {
    const previewDuration = Number.parseInt(String(body.preview_duration_seconds), 10)
    if (Number.isNaN(previewDuration)) {
      return { error: 'Invalid preview duration' as const }
    }
    updates.preview_duration_seconds = Math.max(5, Math.min(300, previewDuration))
  }

  if (body.unlock_required !== undefined) {
    updates.unlock_required = Boolean(body.unlock_required)
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No valid fields to update' as const }
  }

  updates.updated_at = new Date().toISOString()
  return { updates }
}

// PATCH /api/tracks/[id] — Update a track
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user } = auth
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { supabaseAdmin, context, track } = await requireTrackOwnership(id, user.id)

    if (!context.isArtist) {
      return NextResponse.json({ error: 'Only artists can edit tracks' }, { status: 403 })
    }

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    if (!trackBelongsToArtist(track.artist_id, context)) {
      return NextResponse.json({ error: 'You can only edit your own tracks' }, { status: 403 })
    }

    const body = await request.json()
    const result = buildTrackUpdates(body)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('tracks')
      .update(result.updates)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[tracks:patch] Update error:', error.message, error.details)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Track not found after update' }, { status: 404 })
    }

    return NextResponse.json({ success: true, track: data })
  } catch (err: any) {
    console.error('[tracks:patch] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update track' }, { status: 500 })
  }
}

// DELETE /api/tracks/[id] — Soft delete a track (set is_active = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user } = auth
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { supabaseAdmin, context, track } = await requireTrackOwnership(id, user.id)

    if (!context.isArtist) {
      return NextResponse.json({ error: 'Only artists can delete tracks' }, { status: 403 })
    }

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    if (!trackBelongsToArtist(track.artist_id, context)) {
      return NextResponse.json({ error: 'You can only delete your own tracks' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('tracks')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[tracks:delete] Delete error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Track not found after delete' }, { status: 404 })
    }

    return NextResponse.json({ success: true, track: data, message: 'Track archived' })
  } catch (err: any) {
    console.error('[tracks:delete] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete track' }, { status: 500 })
  }
}

// GET /api/tracks/[id] — Get single track details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user } = auth
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { context, track, supabaseAdmin } = await requireTrackOwnership(id, user.id)

    if (!context.isArtist) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    if (!trackBelongsToArtist(track.artist_id, context)) {
      return NextResponse.json({ error: 'You can only view your own tracks' }, { status: 403 })
    }

    return NextResponse.json({ success: true, track })
  } catch (err: any) {
    console.error('[tracks:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch track' }, { status: 500 })
  }
}
