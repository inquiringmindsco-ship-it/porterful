'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
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
  const [activeTab, setActiveTab] = useState<'tracks' | 'products'>('tracks')
  const [dbTracks, setDbTracks] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [featured, setFeatured] = useState<string[]>([])

  const getProductTitle = (product: any) => product.title || product.name || 'Untitled product'
  const getProductImage = (product: any) => {
    if (product.image_url) return product.image_url
    const metadataImages = product.metadata?.images
    return Array.isArray(metadataImages) && metadataImages.length > 0 ? metadataImages[0] : null
  }
  const getProductPrice = (product: any) => product.price ?? product.base_price ?? 0

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
        await Promise.all([loadTracks(), loadProducts()])
      } catch {
        router.push('/login')
        return
      }

      setLoading(false)
    }

    async function loadTracks() {
      const { data } = await supabase!
        .from('tracks')
        .select('*')
        .eq('artist_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setDbTracks(data || [])
    }

    async function loadProducts() {
      const { data } = await supabase!
        .from('products')
        .select('*')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false })
      setDbProducts(data || [])
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

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Catalog</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">Music and products</p>
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

        {/* Quick Stats — from REAL DB */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <div className="text-purple-400"><Icon.Music /></div>
              <div>
                <p className="text-2xl font-bold">{dbTracks.length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Tracks</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <div className="text-orange-400"><Icon.Package /></div>
              <div>
                <p className="text-2xl font-bold">{dbProducts.length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Products</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="text-yellow-400"><Icon.Star /></div>
              <div>
                <p className="text-2xl font-bold">{dbProducts.filter((p: any) => p.status === 'live').length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Live Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--pf-border)] mb-6">
          <div className="flex gap-8">
            {(['tracks', 'products'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={'pb-4 font-semibold capitalize ' + (activeTab === tab ? 'text-orange-500 border-b-2 border-orange-500' : 'text-[var(--pf-text-muted)] hover:text-white')}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tracks Tab — REAL DB DATA */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Tracks</h2>
              <Link href="/dashboard/dashboard/upload" className="pf-btn pf-btn-primary flex items-center gap-2">
                <Icon.Plus /> Upload Track
              </Link>
            </div>
            {dbTracks.length === 0 ? (
              <div className="pf-card p-12 text-center">
                <Icon.Music />
                <p className="text-lg font-medium mt-4">No tracks yet</p>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">Upload your first track to get started</p>
                <Link href="/dashboard/dashboard/upload" className="pf-btn pf-btn-primary">
                  Upload Track
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dbTracks.map((track) => (
                  <div key={track.id} className="pf-card p-4 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--pf-surface)] shrink-0">
                      {track.cover_url ? (
                        <Image src={track.cover_url} alt={track.title} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--pf-text-muted)]">
                          <Icon.Music />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-[var(--pf-text-muted)]">
                        {track.price === 0 ? 'Free' : `$${track.price}`}
                        {track.description && ` • ${track.description.slice(0, 50)}${track.description.length > 50 ? '...' : ''}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={'px-2 py-1 rounded text-xs ' + (track.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                        {track.is_active ? 'Live' : 'Draft'}
                      </span>
                      <button className="pf-btn pf-btn-secondary"><Icon.Eye /></button>
                      <button className="p-2 hover:bg-[var(--pf-surface)] rounded text-red-400">
                        <Icon.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab — REAL DB DATA */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Products</h2>
              <Link href="/dashboard/dashboard/artist/add-product" className="pf-btn pf-btn-primary flex items-center gap-2">
                <Icon.Plus /> Add Product
              </Link>
            </div>
            {dbProducts.length === 0 ? (
              <div className="pf-card p-12 text-center">
                <Icon.Package />
                <p className="text-lg font-medium mt-4">No products yet</p>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">Add your first product to start selling</p>
                <Link href="/dashboard/dashboard/artist/add-product" className="pf-btn pf-btn-primary">
                  Add Product
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dbProducts.map((product: any) => (
                  <div key={product.id} className="pf-card p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--pf-surface)] shrink-0">
                      {getProductImage(product) ? (
                        <Image src={getProductImage(product)} alt={getProductTitle(product)} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--pf-text-muted)]">
                          <Icon.Package />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{getProductTitle(product)}</h3>
                      <p className="text-sm text-[var(--pf-text-muted)]">
                        {product.category} • ${getProductPrice(product).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={'px-2 py-1 rounded text-xs ' + (product.status === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}>
                        {product.status === 'live' ? 'Live' : 'Draft'}
                      </span>
                      <button className="pf-btn pf-btn-secondary"><Icon.Edit /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
