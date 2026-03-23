import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/collaborations - Get collaborations for a track
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const trackId = searchParams.get('track_id')
  const userId = searchParams.get('user_id')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    if (trackId) {
      // Get collaborations for specific track
      const { data, error } = await supabase
        .from('collaborations')
        .select('*')
        .eq('track_id', trackId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ collaboration: data || null })
    }

    if (userId) {
      // Get all collaborations for user
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          tracks (id, title, artist, image)
        `)
        .or(`user_id.eq.${userId}, collaborators.cs.{"user_id":"${userId}"}`)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ collaborations: data })
    }

    return NextResponse.json({ error: 'Missing track_id or user_id' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/collaborations - Create or update collaboration
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { track_id, collaborators, user_id } = body

  if (!track_id || !collaborators || !user_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate total split doesn't exceed 100%
  const totalSplit = collaborators.reduce((sum: number, c: any) => sum + c.split, 0)
  if (totalSplit > 100) {
    return NextResponse.json({ error: 'Total split cannot exceed 100%' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if collaboration exists
    const { data: existing } = await supabase
      .from('collaborations')
      .select('id')
      .eq('track_id', track_id)
      .single()

    if (existing) {
      // Update existing collaboration
      const { data, error } = await supabase
        .from('collaborations')
        .update({
          collaborators,
          total_split: totalSplit,
          updated_at: new Date().toISOString()
        })
        .eq('track_id', track_id)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ collaboration: data[0] })
    }

    // Create new collaboration
    const { data, error } = await supabase
      .from('collaborations')
      .insert({
        track_id,
        user_id,
        collaborators,
        total_split: totalSplit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ collaboration: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/collaborations - Remove collaborator
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const collaborationId = searchParams.get('id')
  const collaboratorId = searchParams.get('collaborator_id')

  if (!collaborationId) {
    return NextResponse.json({ error: 'Missing collaboration id' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    if (collaboratorId) {
      // Remove specific collaborator
      const { data: collab } = await supabase
        .from('collaborations')
        .select('collaborators')
        .eq('id', collaborationId)
        .single()

      if (!collab) {
        return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
      }

      const updatedCollaborators = collab.collaborators.filter((c: any) => c.id !== collaboratorId)

      const { error } = await supabase
        .from('collaborations')
        .update({ collaborators: updatedCollaborators })
        .eq('id', collaborationId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Delete entire collaboration
    const { error } = await supabase
      .from('collaborations')
      .delete()
      .eq('id', collaborationId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}