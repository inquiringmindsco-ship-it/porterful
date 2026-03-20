'use client';

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music, Package, DollarSign, Users, TrendingUp, Upload, Settings, ChevronRight, Headphones, Mic2, Radio, Plus } from 'lucide-react'

export default function ArtistDashboardPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState<{
    name: string
    slug: string
    bio: string
    genre: string
    location: string
    verified: boolean
    stats: {
      monthly_goal: number
      current_earnings: number
      supporters: number
      total_earnings: number
      songs: number
      merch_sales: number
    }
  } | null>(null)

  useEffect(() => {
    if (supabase && user) {
      loadArtistData()
    } else {
      setLoading(false)
    }
  }, [supabase, user])

  async function loadArtistData() {
    try {
      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (profile?.role !== 'artist') {
        // Not an artist, redirect to main dashboard
        router.push('/dashboard')
        return
      }

      setArtist({
        name: profile.full_name || profile.username || 'Artist',
        slug: profile.username || 'artist',
        bio: 'Independent artist on Porterful.',
        genre: 'Music',
        location: 'New Orleans, LA',
        verified: false,
        stats: {
          monthly_goal: 2500,
          current_earnings: 0,
          supporters: 0,
          total_earnings: 0,
          songs: 0,
          merch_sales: 0,
        }
      })
    } catch (error) {
      console.error('Failed to load artist data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="pf-card p-12 text-center">
            <Mic2 size={48} className="mx-auto mb-4 text-purple-400" />
            <h1 className="text-2xl font-bold mb-4">Artist Dashboard</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Sign in to manage your music, merch, and earnings.
            </p>
            <Link href="/login" className="pf-btn pf-btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="pf-card p-12 text-center">
            <Mic2 size={48} className="mx-auto mb-4 text-purple-400" />
            <h1 className="text-2xl font-bold mb-4">Become an Artist</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Your account is set up. Start uploading your music!
            </p>
            <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">
              <Upload className="inline mr-2" size={18} />
              Upload Your First Track
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-2xl">
              🎤
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {artist.name}</h1>
              <p className="text-[var(--pf-text-secondary)]">Artist Dashboard</p>
            </div>
          </div>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">
            <Plus className="inline mr-2" size={18} />
            Upload New Track
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/upload" className="pf-card p-6 hover:border-[var(--pf-orange)]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Music className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Upload Music</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Add your tracks</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/add-product" className="pf-card p-6 hover:border-[var(--pf-orange)]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Package className="text-[var(--pf-orange)]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Add Merch</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Sell products</p>
              </div>
            </div>
          </Link>

          <Link href="/settings" className="pf-card p-6 hover:border-[var(--pf-orange)]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Settings className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Settings</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Profile & payouts</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Total Earnings</span>
              <DollarSign size={20} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold">${artist.stats.total_earnings.toLocaleString()}</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Tracks</span>
              <Music size={20} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{artist.stats.songs}</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Supporters</span>
              <Users size={20} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{artist.stats.supporters}</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Merch Sales</span>
              <Package size={20} className="text-[var(--pf-orange)]" />
            </div>
            <p className="text-3xl font-bold">{artist.stats.merch_sales}</p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="pf-card p-8">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Upload your first track</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Add your music and set your price. Fans can pay what they want.
                </p>
              </div>
              <Link href="/dashboard/upload" className="pf-btn pf-btn-primary text-sm ml-auto">
                Upload
              </Link>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
                <span className="text-[var(--pf-orange)] font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Set up your profile</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Add your bio, genre, and location so fans can find you.
                </p>
              </div>
              <Link href="/settings" className="pf-btn pf-btn-secondary text-sm ml-auto">
                Settings
              </Link>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-green-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Share your referral code</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Get a unique code and earn when fans shop using it.
                </p>
              </div>
              <Link href="/settings" className="pf-btn pf-btn-secondary text-sm ml-auto">
                Get Code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}