'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CalendarDays, Plus, Video } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import { ArtistVideoLibrary } from '@/components/artist/ArtistVideoLibrary'
import { EmptyState, GuidanceRoadmap } from '@/components/guidance/GuidedExperience'
import { normalizeArtistVideoCategory, type ArtistVideoRecord } from '@/lib/artist-videos'

type ArtistProgression = {
  artist_id: string
  artist_name: string
  level_label: string
  level_title: string
  next_required_step: string
  effective_limits: {
    videoSlotLimit: number | null
    featuredVideoLimit: number | null
  }
  can_upload_videos: boolean
  can_feature_video: boolean
  metrics: {
    visibleVideos: number
    featuredVideos: number
  }
}

function formatLimit(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Unlimited'
  return `${value}`
}

export default function ArtistMediaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedArtistId = searchParams.get('artist_id')?.trim() || ''
  const { user, supabase, loading: authLoading } = useSupabase()

  const [role, setRole] = useState<'artist' | 'admin' | 'founder' | null>(null)
  const [targetArtistId, setTargetArtistId] = useState('')
  const [artist, setArtist] = useState<any>(null)
  const [videos, setVideos] = useState<ArtistVideoRecord[]>([])
  const [progression, setProgression] = useState<ArtistProgression | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [category, setCategory] = useState<'music_video' | 'interview' | 'live_performance' | 'featured'>('music_video')
  const [notes, setNotes] = useState('')

  const isPrivileged = role === 'admin' || role === 'founder'
  const resolveTargetArtistId = useCallback(() => {
    if (isPrivileged) {
      return requestedArtistId || targetArtistId || user?.id || ''
    }

    return user?.id || ''
  }, [isPrivileged, requestedArtistId, targetArtistId, user?.id])

  const reloadMedia = useCallback(async (artistId?: string) => {
    if (!supabase || !user) return

    const { data: { session } } = await supabase.auth.getSession()
    const resolvedTargetArtistId = artistId || resolveTargetArtistId()

    const response = await fetch(`/api/artist-videos?artist_id=${encodeURIComponent(resolvedTargetArtistId)}`, {
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load artist videos')
    }

    setTargetArtistId(data.targetArtistId || resolvedTargetArtistId)
    setArtist(data.artist || null)
    setVideos(Array.isArray(data.videos) ? data.videos : [])
    setProgression(data.progression || null)
    setLoading(false)
  }, [resolveTargetArtistId, supabase, user])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    let mounted = true

    async function load() {
      if (!supabase || !user) return

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, username')
          .eq('id', user.id)
          .single()

        if (!profile || !['artist', 'admin', 'founder'].includes(profile.role)) {
          router.push('/dashboard')
          return
        }

        setRole(profile.role as 'artist' | 'admin' | 'founder')
        if (!mounted) return
        await reloadMedia(profile.role === 'admin' || profile.role === 'founder' ? (requestedArtistId || user.id) : user.id)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message || 'Failed to load media settings')
        setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [authLoading, reloadMedia, requestedArtistId, router, supabase, user])

  const videoSummary = useMemo(() => ({
    visible: videos.filter((video) => video.visibility_status === 'visible').length,
    hidden: videos.filter((video) => video.visibility_status === 'hidden').length,
    archived: videos.filter((video) => video.visibility_status === 'archived').length,
    featured: videos.filter((video) => video.visibility_status === 'visible' && normalizeArtistVideoCategory(video.video_category) === 'featured').length,
  }), [videos])

  const limitLabel = formatLimit(progression?.effective_limits.videoSlotLimit ?? null)
  const featuredLimitLabel = formatLimit(progression?.effective_limits.featuredVideoLimit ?? null)

  async function getAuthHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (!supabase) return headers

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }

    return headers
  }

  async function handleCreateVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!youtubeUrl.trim() || !supabase || !user || saving) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/artist-videos', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          artist_id: resolveTargetArtistId(),
          youtube_url: youtubeUrl,
          video_category: category,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import video')
      }

      setYoutubeUrl('')
      setNotes('')
      setCategory('music_video')
      setNotice('Video imported from YouTube.')
      window.setTimeout(() => setNotice(''), 2500)
      await reloadMedia(resolveTargetArtistId())
    } catch (err: any) {
      setError(err.message || 'Failed to import video')
    } finally {
      setSaving(false)
    }
  }

  async function updateVideoVisibility(video: ArtistVideoRecord, nextVisibility: 'visible' | 'hidden') {
    if (!supabase || !user) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/artist-videos/${video.video_id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          visibility_status: nextVisibility,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update video')
      }

      setNotice(`Updated ${video.title}.`)
      window.setTimeout(() => setNotice(''), 2200)
      await reloadMedia(resolveTargetArtistId())
    } catch (err: any) {
      setError(err.message || 'Failed to update video')
    } finally {
      setSaving(false)
    }
  }

  async function archiveVideo(video: ArtistVideoRecord) {
    if (!supabase || !user) return

    const confirmed = window.confirm(`Remove "${video.title}" from the profile?`)
    if (!confirmed) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/artist-videos/${video.video_id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove video')
      }

      setNotice(`Removed ${video.title}.`)
      window.setTimeout(() => setNotice(''), 2200)
      await reloadMedia(resolveTargetArtistId())
    } catch (err: any) {
      setError(err.message || 'Failed to remove video')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="pf-container max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-[var(--pf-surface)]" />
            <div className="h-64 rounded-3xl bg-[var(--pf-surface)]" />
          </div>
        </div>
      </div>
    )
  }

  if (!artist && isPrivileged && !requestedArtistId) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="pf-container max-w-4xl">
          <div className="rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">Founder access</p>
            <h1 className="mt-3 text-3xl font-bold text-[var(--pf-text)]">Pick an artist to manage media.</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--pf-text-secondary)]">
              Open this page with an artist ID from the founder roster to import videos, hide clips, or review slot limits.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard/founder/artists" className="rounded-xl bg-[var(--pf-orange)] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)]">
                Open founder roster
              </Link>
              <Link href="/dashboard/founder" className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-2.5 font-semibold text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]">
                Back to founder dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24">
      <div className="pf-container max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/artist" className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-2 transition-colors hover:border-[var(--pf-orange)]">
            <ArrowLeft size={18} className="text-[var(--pf-text-secondary)]" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">Artist dashboard</p>
            <h1 className="text-3xl font-bold text-[var(--pf-text)]">Media</h1>
            <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">
              Add YouTube videos, manage visibility, and keep artist media clean.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-orange)]">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--pf-text)]">Import from YouTube</h2>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Paste a YouTube link and Porterful will pull the title, thumbnail, channel, and publish date when available.
                </p>
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleCreateVideo}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--pf-text)]">YouTube URL</span>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=xxxx"
                  className="w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 text-sm text-[var(--pf-text)] outline-none transition-colors focus:border-[var(--pf-orange)]"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[var(--pf-text)]">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 text-sm text-[var(--pf-text)] outline-none transition-colors focus:border-[var(--pf-orange)]"
                  >
                    <option value="music_video">Music Video</option>
                    <option value="interview">Interview</option>
                    <option value="live_performance">Live Performance</option>
                    <option value="featured">Featured Video</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[var(--pf-text)]">Notes</span>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional internal note"
                    className="w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 text-sm text-[var(--pf-text)] outline-none transition-colors focus:border-[var(--pf-orange)]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving || !youtubeUrl.trim()}
                  className="rounded-xl bg-[var(--pf-orange)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Importing…' : 'Import video'}
                </button>
                <p className="text-xs text-[var(--pf-text-muted)]">
                  Only YouTube URLs are accepted. New artists start with 3 video slots and 1 featured video.
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <GuidanceRoadmap
              eyebrow="Media progress"
              title={artist?.name || 'Artist media'}
              description="Keep the profile clean and build out the media section one import at a time."
              currentStage={progression?.level_title || 'Starter'}
              nextStep={progression?.next_required_step || 'Add your first YouTube video.'}
              signals={[
                {
                  label: 'Visible videos',
                  value: `${videoSummary.visible}`,
                  tone: videoSummary.visible > 0 ? 'success' : 'neutral',
                },
                {
                  label: 'Video slots',
                  value: progression ? `${videoSummary.visible} / ${limitLabel}` : limitLabel,
                  tone: progression?.can_upload_videos ? 'success' : 'warning',
                },
                {
                  label: 'Featured slots',
                  value: progression ? `${videoSummary.featured} / ${featuredLimitLabel}` : featuredLimitLabel,
                  tone: progression?.can_feature_video ? 'success' : 'warning',
                },
              ]}
            />

            <div className="rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">Current artist</p>
              <div className="mt-3 flex items-center gap-4">
                <ArtistAvatar
                  src={artist?.avatar_url || artist?.cover_url || null}
                  alt={artist?.name || 'Artist'}
                  name={artist?.name || 'Artist'}
                  size="lg"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-[var(--pf-text)]">
                    {artist?.name || 'No artist selected'}
                  </h3>
                  <p className="truncate text-sm text-[var(--pf-text-secondary)]">
                    {artist?.genre || 'Artist profile'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
                  {artist?.slug || targetArtistId || 'unknown artist'}
                </span>
                <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
                  {videoSummary.hidden} hidden
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
                  <CalendarDays size={11} />
                  {videoSummary.archived} archived
                </span>
              </div>
            </div>
          </aside>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--pf-text)]">Video library</h2>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Visible clips stay public. Hidden or archived clips stay in the dashboard only.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
              {videos.length} total
            </p>
          </div>

          <ArtistVideoLibrary
            videos={videos}
            emptyTitle="No videos yet"
            emptyBody="Paste a YouTube URL to create the first video card for this artist."
            manageMode
            onToggleVisibility={updateVideoVisibility}
            onArchive={archiveVideo}
          />
        </section>
      </div>
    </div>
  )
}
