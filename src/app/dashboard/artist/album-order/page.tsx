'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/create-browser-client'
import { ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react'

interface AlbumOrder {
  id?: string
  album_name: string
  sort_order: number
}

export default function AlbumOrderPage() {
  const [albums, setAlbums] = useState<AlbumOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    loadAlbumOrder()
  }, [])

  async function loadAlbumOrder() {
    setLoading(true)
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Get artist ID
    const { data: artist } = await supabase
      .from('artists')
      .select('id, name')
      .eq('id', user.id)
      .single()

    if (!artist) {
      setMessage('Artist profile not found')
      setLoading(false)
      return
    }

    // Get saved album order
    const { data: savedOrder } = await supabase
      .from('artist_album_order')
      .select('*')
      .eq('artist_id', artist.id)
      .order('sort_order')

    // Get distinct albums from tracks
    const { data: trackAlbums } = await supabase
      .from('tracks')
      .select('album')
      .eq('artist_id', artist.id)
      .eq('is_active', true)
      .not('album', 'is', null)

    // Build unique album list
    const uniqueAlbums = Array.from(new Set(trackAlbums?.map(t => t.album).filter(Boolean) || []))
    
    // Merge saved order with track albums
    const merged: AlbumOrder[] = []
    
    // First add saved ordered albums
    savedOrder?.forEach(saved => {
      if (uniqueAlbums.includes(saved.album_name)) {
        merged.push({
          id: saved.id,
          album_name: saved.album_name,
          sort_order: saved.sort_order
        })
      }
    })
    
    // Then add new albums not in saved order
    let nextSort = merged.length
    uniqueAlbums.forEach(album => {
      if (!merged.find(m => m.album_name === album)) {
        merged.push({
          album_name: album,
          sort_order: nextSort++
        })
      }
    })

    // Sort by sort_order
    merged.sort((a, b) => a.sort_order - b.sort_order)
    
    setAlbums(merged)
    setLoading(false)
  }

  function moveUp(index: number) {
    if (index === 0) return
    const newAlbums = [...albums]
    const temp = newAlbums[index]
    newAlbums[index] = newAlbums[index - 1]
    newAlbums[index - 1] = temp
    // Recalculate sort_order
    newAlbums.forEach((album, i) => album.sort_order = i)
    setAlbums(newAlbums)
  }

  function moveDown(index: number) {
    if (index === albums.length - 1) return
    const newAlbums = [...albums]
    const temp = newAlbums[index]
    newAlbums[index] = newAlbums[index + 1]
    newAlbums[index + 1] = temp
    // Recalculate sort_order
    newAlbums.forEach((album, i) => album.sort_order = i)
    setAlbums(newAlbums)
  }

  async function saveOrder() {
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Not logged in')
      setSaving(false)
      return
    }

    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!artist) {
      setMessage('Artist not found')
      setSaving(false)
      return
    }

    // Delete existing order
    await supabase
      .from('artist_album_order')
      .delete()
      .eq('artist_id', artist.id)

    // Insert new order
    const { error } = await supabase
      .from('artist_album_order')
      .insert(
        albums.map(a => ({
          artist_id: artist.id,
          album_name: a.album_name,
          sort_order: a.sort_order
        }))
      )

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage('Order saved successfully!')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--pf-orange)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24">
      <div className="pf-container max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Album Order</h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">
          Arrange how your albums appear on your public artist page.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {message}
          </div>
        )}

        <div className="space-y-2 mb-8">
          {albums.map((album, index) => (
            <div
              key={album.album_name}
              className="flex items-center gap-4 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]"
            >
              <span className="text-[var(--pf-text-muted)] w-8 text-center font-mono">
                {index + 1}
              </span>
              
              <span className="flex-1 font-medium">{album.album_name}</span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-2 rounded-lg bg-[var(--pf-bg-secondary)] hover:bg-[var(--pf-orange)]/20 disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === albums.length - 1}
                  className="p-2 rounded-lg bg-[var(--pf-bg-secondary)] hover:bg-[var(--pf-orange)]/20 disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveOrder}
          disabled={saving}
          className="pf-btn pf-btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Order
            </>
          )}
        </button>
      </div>
    </div>
  )
}
