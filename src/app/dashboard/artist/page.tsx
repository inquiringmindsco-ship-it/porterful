'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { Music, Package, DollarSign, Users, TrendingUp, Upload, Settings, ChevronRight, Headphones, Mic2, Radio } from 'lucide-react'

// Demo data
const DEMO_ARTIST = {
  name: 'O D Porter',
  slug: 'od-porter',
  bio: 'New Orleans artist blending hip-hop, R&B, and soul.',
  genre: 'Hip-Hop / R&B',
  location: 'New Orleans, LA',
  verified: true,
  stats: {
    monthly_goal: 2500,
    current_earnings: 1847,
    supporters: 312,
    total_earnings: 8947,
    songs: 21,
    merch_sales: 142,
  },
  tracks: [
    { id: '1', title: 'Late Night', plays: 125000, duration: '3:42', album: 'Ambiguous' },
    { id: '2', title: 'Movement', plays: 89000, duration: '4:15', album: 'Ambiguous' },
    { id: '3', title: 'Vibes', plays: 67000, duration: '3:58', album: 'Ambiguous' },
    { id: '4', title: 'Ambiguous', plays: 45000, duration: '5:01', album: 'Ambiguous' },
  ],
}

export default function ArtistDashboardPage() {
  const { user, supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(DEMO_ARTIST)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (supabase && user) {
      loadArtistData()
    } else {
      setLoading(false)
    }
  }, [supabase, user])

  async function loadArtistData() {
    try {
      const { data: artistData } = await supabase
        .from('artists')
        .select('*, profiles(*)')
        .eq('id', user!.id)
        .single()

      if (artistData) {
        setArtist(prev => ({
          ...prev,
          ...artistData,
          stats: {
            ...prev.stats,
            ...artistData
          }
        }))
      }
    } catch (error) {
      console.error('Failed to load artist data:', error)
    } finally {
      setLoading(false)
    }
  }

  const goalProgress = (artist.stats.current_earnings / artist.stats.monthly_goal) * 100

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
              Sign In <ChevronRight className="inline ml-1" size={16} />
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
              <h1 className="text-3xl font-bold">{artist.name}</h1>
              <p className="text-[var(--pf-text-secondary)]">{artist.genre} • {artist.location}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="pf-btn bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2">
              <Radio size={18} />
              Go Live
            </button>
            <button className="pf-btn pf-btn-primary flex items-center gap-2">
              <Upload size={18} />
              Upload
            </button>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="pf-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">Monthly Goal</h2>
              <p className="text-sm text-[var(--pf-text-secondary)]">{artist.stats.supporters} supporters this month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--pf-orange)]">${artist.stats.current_earnings.toLocaleString()}</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">of ${artist.stats.monthly_goal.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-4 bg-[var(--pf-border)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-600 rounded-full transition-all"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-[var(--pf-text-muted)] mt-2">
            <span>{Math.round(goalProgress)}% funded</span>
            <span>${(artist.stats.monthly_goal - artist.stats.current_earnings).toLocaleString()} to go</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Total Earnings</span>
              <DollarSign size={20} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold">${artist.stats.total_earnings.toLocaleString()}</p>
            <p className="text-sm text-green-400 mt-1">+23% this month</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Merch Sales</span>
              <Package size={20} className="text-[var(--pf-orange)]" />
            </div>
            <p className="text-3xl font-bold">{artist.stats.merch_sales}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Orders this month</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Song Plays</span>
              <Headphones size={20} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{(artist.tracks.reduce((sum, t) => sum + t.plays, 0) / 1000).toFixed(0)}K</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">{artist.stats.songs} tracks</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Superfans</span>
              <Users size={20} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{artist.stats.supporters}</p>
            <p className="text-sm text-blue-400 mt-1">+12 this week</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--pf-border)]">
          {['overview', 'music', 'merch', 'earnings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 capitalize font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]'
                  : 'text-[var(--pf-text-secondary)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top Tracks */}
            <div className="lg:col-span-2">
              <div className="pf-card">
                <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
                  <h2 className="font-semibold">Top Tracks</h2>
                  <Link href="/dashboard/artist/music" className="text-sm text-[var(--pf-orange)] hover:underline">
                    Manage Music
                  </Link>
                </div>
                <div className="divide-y divide-[var(--pf-border)]">
                  {artist.tracks.map((track, i) => (
                    <div key={track.id} className="flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.album}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(track.plays / 1000).toFixed(0)}K plays</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.duration}</p>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="space-y-6">
              <div className="pf-card p-6">
                <h2 className="font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/dashboard/add-product" className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                    <span className="flex items-center gap-2">
                      <Package size={18} />
                      Add Merch
                    </span>
                    <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                  </Link>
                  <Link href="/dashboard/upload" className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                    <span className="flex items-center gap-2">
                      <Music size={18} />
                      Upload Music
                    </span>
                    <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                  </Link>
                  <Link href="/settings" className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                    <span className="flex items-center gap-2">
                      <Settings size={18} />
                      Artist Settings
                    </span>
                    <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                  </Link>
                </div>
              </div>

              {/* Superfan Activity */}
              <div className="pf-card p-6">
                <h2 className="font-semibold mb-4">Recent Supporters</h2>
                <div className="space-y-3">
                  {['Alex M.', 'Jordan K.', 'Sam T.'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-[var(--pf-text-muted)]">Superfan</p>
                        </div>
                      </div>
                      <span className="text-sm text-green-400">+${(Math.random() * 10 + 5).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'music' && (
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Your Music</h2>
              <button className="pf-btn pf-btn-primary text-sm">
                <Upload size={16} className="mr-2" /> Upload Track
              </button>
            </div>
            <p className="text-[var(--pf-text-secondary)]">
              Music management coming soon. Upload tracks, manage albums, and see detailed play analytics.
            </p>
          </div>
        )}

        {activeTab === 'merch' && (
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Your Merch</h2>
              <Link href="/dashboard/add-product" className="pf-btn pf-btn-primary text-sm">
                <Package size={16} className="mr-2" /> Add Product
              </Link>
            </div>
            <p className="text-[var(--pf-text-secondary)]">
              Manage your merchandise inventory, track sales, and analyze performance.
            </p>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="pf-card p-6">
            <h2 className="font-semibold mb-6">Earnings Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[var(--pf-surface)] rounded-lg">
                <div>
                  <p className="font-medium">Merch Sales (80%)</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">142 orders this month</p>
                </div>
                <span className="text-xl font-bold text-[var(--pf-orange)]">$1,495.60</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[var(--pf-surface)] rounded-lg">
                <div>
                  <p className="font-medium">Marketplace Share (20%)</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">From business referrals</p>
                </div>
                <span className="text-xl font-bold text-purple-400">$298.40</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[var(--pf-surface)] rounded-lg">
                <div>
                  <p className="font-medium">Proud to Pay (varies)</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Music supporter tips</p>
                </div>
                <span className="text-xl font-bold text-green-400">$53.00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}