'use client';

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, Music, Package, DollarSign, Users } from 'lucide-react'

export default function ArtistDashboardPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabase && user) {
      checkRole()
    } else {
      setLoading(false)
    }
  }, [supabase, user])

  async function checkRole() {
    try {
      const { data: profile } = await supabase!
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      // If not artist, redirect to main dashboard
      if (profile?.role !== 'artist') {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking role:', error)
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
            <Music size={48} className="mx-auto mb-4 text-purple-400" />
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

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Porterful</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Your artist dashboard. Upload music, sell merch, earn money.
          </p>
        </div>

        {/* Big Upload Button */}
        <div className="pf-card p-8 mb-8 text-center bg-gradient-to-r from-purple-500/10 to-[var(--pf-orange)]/10">
          <Music size={48} className="mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-2">Upload Your First Track</h2>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            Start earning from your music. Set your price, upload your tracks, and let fans support you directly.
          </p>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            <Upload size={20} />
            Upload Music
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-6">
            <DollarSign className="text-green-400 mb-2" size={24} />
            <p className="text-2xl font-bold">$0</p>
            <p className="text-sm text-[var(--pf-text-muted)]">Total Earnings</p>
          </div>
          <div className="pf-card p-6">
            <Music className="text-purple-400 mb-2" size={24} />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-[var(--pf-text-muted)]">Tracks</p>
          </div>
          <div className="pf-card p-6">
            <Package className="text-[var(--pf-orange)] mb-2" size={24} />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-[var(--pf-text-muted)]">Products</p>
          </div>
          <div className="pf-card p-6">
            <Users className="text-blue-400 mb-2" size={24} />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-[var(--pf-text-muted)]">Supporters</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/upload" className="pf-card p-6 hover:border-[var(--pf-orange)]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Music className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Upload Music</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Add your tracks, set prices</p>
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
                <p className="text-sm text-[var(--pf-text-muted)]">Sell products, earn 80%</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}