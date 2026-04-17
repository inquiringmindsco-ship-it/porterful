'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { TRACKS, ALBUMS } from '@/lib/data'
import { PRODUCTS } from '@/lib/products'
import Link from 'next/link'

const Icon = {
  Music: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  Package: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27,6.96 12,12.01 20.73,6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Star: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  ChevronUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18,15 12,9 6,15" /></svg>,
  ChevronDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9" /></svg>,
}

export default function ArtistDashboardPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'products'>('albums')
  const [albums, setAlbums] = useState(Object.values(ALBUMS))
  const [featured, setFeatured] = useState<string[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    async function checkAccess() {
      if (!user) return
      try {
        const { data: serverUser, error: profileError } = await supabase!
          .from('profiles')
          .select('id, role')
          .eq('id', user!.id)
          .single()

        if (profileError || !serverUser) {
          router.push('/login')
          return
        }

        if (serverUser.role !== 'artist') {
          router.push('/dashboard')
          return
        }

        setProfile(serverUser)
      } catch {
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAccess()
  }, [user, supabase, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  const tracksByAlbum = TRACKS.reduce((acc, track) => {
    const album = track.album || 'Singles'
    if (!acc[album]) acc[album] = []
    acc[album].push(track)
    return acc
  }, {} as Record<string, typeof TRACKS>)

  const moveAlbumUp = (index: number) => {
    if (index === 0) return
    const newAlbums = [...albums]
    ;[newAlbums[index - 1], newAlbums[index]] = [newAlbums[index], newAlbums[index - 1]]
    setAlbums(newAlbums)
  }

  const moveAlbumDown = (index: number) => {
    if (index >= albums.length - 1) return
    const newAlbums = [...albums]
    ;[newAlbums[index], newAlbums[index + 1]] = [newAlbums[index + 1], newAlbums[index]]
    setAlbums(newAlbums)
  }

  const toggleFeatured = (albumId: string) => {
    setFeatured(prev => prev.includes(albumId) ? prev.filter(id => id !== albumId) : [...prev, albumId])
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Catalog</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">Music, albums, and products</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/dashboard/upload" className="pf-btn pf-btn-primary flex items-center gap-2">
              <Icon.Upload /> Upload
            </Link>
            <Link href="/dashboard/dashboard/artist/edit" className="pf-btn pf-btn-secondary flex items-center gap-2">
              <Icon.Edit /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <div className="text-purple-400"><Icon.Music /></div>
              <div>
                <p className="text-2xl font-bold">{TRACKS.length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Tracks</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <div className="text-orange-400"><Icon.Package /></div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(ALBUMS).length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Albums</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <div className="text-yellow-400"><Icon.Star /></div>
              <div>
                <p className="text-2xl font-bold">{PRODUCTS.length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Products</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-400"><Icon.Eye /></div>
              <div>
                <p className="text-2xl font-bold">{TRACKS.reduce((sum, t) => sum + (t.plays || 0), 0) / 1000}K</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Plays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--pf-border)] mb-6">
          <div className="flex gap-8">
            {(['albums', 'tracks', 'products'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={'pb-4 font-semibold capitalize ' + (activeTab === tab ? 'text-orange-500 border-b-2 border-orange-500' : 'text-[var(--pf-text-muted)] hover:text-white')}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Albums Tab */}
        {activeTab === 'albums' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Album Order</h2>
              <p className="text-sm text-[var(--pf-text-muted)]">Drag to reorder how albums appear on your profile</p>
            </div>
            {albums.map((album, index) => (
              <div key={album.id} className={'pf-card p-4 ' + (featured.includes(album.id) ? 'ring-2 ring-orange-500' : '')}>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveAlbumUp(index)} disabled={index === 0} className="p-1 hover:bg-[var(--pf-surface)] rounded disabled:opacity-30">
                      <Icon.ChevronUp />
                    </button>
                    <button onClick={() => moveAlbumDown(index)} disabled={index === albums.length - 1} className="p-1 hover:bg-[var(--pf-surface)] rounded disabled:opacity-30">
                      <Icon.ChevronDown />
                    </button>
                  </div>

                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500/30 to-purple-600/30 flex items-center justify-center shrink-0" data-testid="album-thumbnail">
                    {album.image ? <Image src={album.image} alt={album.name} fill sizes="64px" className="object-cover" data-contained="true" /> : <Icon.Music />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{album.name}</h3>
                      {featured.includes(album.id) && <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded">Featured</span>}
                    </div>
                    <p className="text-sm text-[var(--pf-text-muted)]">{album.year} • {album.tracks} tracks</p>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{tracksByAlbum[album.name]?.length || 0} songs uploaded</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFeatured(album.id)} className={'pf-btn ' + (featured.includes(album.id) ? 'bg-orange-500 text-white' : 'pf-btn-secondary')} title={featured.includes(album.id) ? 'Remove from featured' : 'Feature this album'}>
                      <span className={featured.includes(album.id) ? 'text-white' : ''}><Icon.Star /></span>
                    </button>
                    <button className="pf-btn pf-btn-secondary"><Icon.Edit /></button>
                    <button className="pf-btn pf-btn-secondary"><Icon.Eye /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Tracks</h2>
              <div className="flex gap-2">
                <input type="text" placeholder="Search tracks..." className="pf-input w-48" />
              </div>
            </div>
            {Object.entries(tracksByAlbum).map(([album, tracks]) => (
              <div key={album} className="pf-card">
                <div className="p-4 border-b border-[var(--pf-border)]">
                  <h3 className="font-bold">{album}</h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">{tracks.length} tracks</p>
                </div>
                <div className="divide-y divide-[var(--pf-border)]">
                  {tracks.slice(0, 5).map(track => (
                    <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-[var(--pf-surface-hover)]">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-[var(--pf-surface)] shrink-0" data-testid="track-thumbnail">
                        <Image src={track.image} alt={track.title} fill sizes="40px" className="object-cover" data-contained="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.plays?.toLocaleString() || '0'} plays</p>
                      </div>
                      <span className="text-sm font-medium">${track.price}</span>
                      <button className="p-2 hover:bg-[var(--pf-surface)] rounded text-red-400">
                        <Icon.Trash />
                      </button>
                    </div>
                  ))}
                  {tracks.length > 5 && (
                    <button className="w-full p-3 text-center text-orange-500 hover:bg-[var(--pf-surface-hover)]">
                      View all {tracks.length} tracks
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Products</h2>
              <Link href="/dashboard/dashboard/add-product" className="pf-btn pf-btn-primary flex items-center gap-2">
                <Icon.Plus /> Add Product
              </Link>
            </div>
            {PRODUCTS.map(product => (
              <div key={product.id} className="pf-card p-4 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--pf-surface)] shrink-0" data-testid="product-thumbnail">
                  <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" data-contained="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">{product.category} • ${product.price}</p>
                  <p className="text-sm text-green-400">${product.artistCut} to artist</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={'px-2 py-1 rounded text-xs ' + (product.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                    {product.inStock ? 'Live' : 'Draft'}
                  </span>
                  <button className="pf-btn pf-btn-secondary flex items-center gap-1">
                    <Icon.Edit />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
