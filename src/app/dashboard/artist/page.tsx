'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Music, Package, DollarSign, Users, Upload, Settings, ChevronRight, Headphones, Mic2, Star } from 'lucide-react';
import { TRACKS } from '@/lib/data';

export default function ArtistDashboardPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    name: string
    email: string
    role: string
  } | null>(null)

  useEffect(() => {
    if (supabase && user) {
      loadProfile()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user])

  async function loadProfile() {
    try {
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (data?.role !== 'artist') {
        router.push('/dashboard')
        return
      }

      setProfile({
        name: data.full_name || data.username || 'Artist',
        email: data.email || user!.email || '',
        role: data.role
      })
    } catch (error) {
      console.error('Error loading profile:', error)
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

  const demoStats = {
    totalEarnings: 0,
    tracks: 0,
    supporters: 0,
    merchSales: 0
  }

  const demoTracks = TRACKS.slice(0, 3)

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
              <h1 className="text-2xl font-bold">Welcome, {profile?.name || 'Artist'}</h1>
              <p className="text-[var(--pf-text-secondary)]">Your artist dashboard</p>
            </div>
          </div>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">
            <Upload className="inline mr-2" size={18} />
            Upload Music
          </Link>
        </div>

        {/* Big Upload CTA */}
        <div className="pf-card p-8 mb-8 text-center bg-gradient-to-r from-purple-500/10 to-[var(--pf-orange)]/10 border border-purple-500/30">
          <Music size={48} className="mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-2">Upload Your First Track</h2>
          <p className="text-[var(--pf-text-secondary)] mb-6 max-w-md mx-auto">
            Start earning from your music. Set your price, upload your tracks, and let fans support you directly. Keep 80% of every sale.
          </p>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            <Upload size={20} />
            Upload Music
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Total Earnings</span>
              <DollarSign className="text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold">${demoStats.totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Lifetime earnings</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Tracks</span>
              <Music className="text-purple-400" size={20} />
            </div>
            <p className="text-3xl font-bold">{demoStats.tracks}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Uploaded tracks</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Supporters</span>
              <Users className="text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold">{demoStats.supporters}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Total supporters</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Merch Sales</span>
              <Package className="text-[var(--pf-orange)]" size={20} />
            </div>
            <p className="text-3xl font-bold">{demoStats.merchSales}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Total orders</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/dashboard/upload" className="pf-card p-6 hover:border-purple-500/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <Music className="text-purple-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Upload Music</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Add tracks, set prices, earn 80%</p>
              </div>
              <ChevronRight className="text-[var(--pf-text-muted)]" size={20} />
            </div>
          </Link>

          <Link href="/dashboard/add-product" className="pf-card p-6 hover:border-[var(--pf-orange)]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
                <Package className="text-[var(--pf-orange)]" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Add Merch</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Sell products, reach fans</p>
              </div>
              <ChevronRight className="text-[var(--pf-text-muted)]" size={20} />
            </div>
          </Link>
        </div>

        {/* Your Tracks Preview */}
        <div className="pf-card">
          <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
            <h2 className="font-semibold">Your Tracks</h2>
            <Link href="/dashboard/upload" className="text-sm text-[var(--pf-orange)] hover:underline">
              Upload more
            </Link>
          </div>
          <div className="p-8 text-center text-[var(--pf-text-muted)]">
            <Headphones size={32} className="mx-auto mb-2 opacity-50" />
            <p>No tracks uploaded yet</p>
            <p className="text-sm mt-1">Upload your first track to get started</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 pf-card">
          <div className="p-4 border-b border-[var(--pf-border)]">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="p-8 text-center text-[var(--pf-text-muted)]">
            <Star size={32} className="mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">Activity will appear here when you have sales or supporters</p>
          </div>
        </div>
      </div>
    </div>
  )
}