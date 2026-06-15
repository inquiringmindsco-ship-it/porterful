'use client'

import { Archive, CalendarDays, ExternalLink, EyeOff, Play, Youtube } from 'lucide-react'
import {
  groupArtistVideosByCategory,
  normalizeArtistVideoCategory,
  normalizeArtistVideoVisibility,
  type ArtistVideoRecord,
} from '@/lib/artist-videos'

interface ArtistVideoLibraryProps {
  videos: ArtistVideoRecord[]
  emptyTitle: string
  emptyBody: string
  className?: string
  manageMode?: boolean
  onToggleVisibility?: (video: ArtistVideoRecord, nextVisibility: 'visible' | 'hidden') => void
  onArchive?: (video: ArtistVideoRecord) => void
  onWatch?: (video: ArtistVideoRecord) => void
}

function formatPublishedDate(value?: string | null) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function visibilityTone(value: ArtistVideoRecord['visibility_status']) {
  const visibility = normalizeArtistVideoVisibility(value)
  if (visibility === 'hidden') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
  }
  if (visibility === 'archived') {
    return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
  }
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
}

function categoryTone(category: ArtistVideoRecord['video_category']) {
  const normalized = normalizeArtistVideoCategory(category)
  if (normalized === 'featured') return 'border-[var(--pf-orange)]/20 bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]'
  if (normalized === 'interview') return 'border-blue-500/20 bg-blue-500/10 text-blue-300'
  if (normalized === 'live_performance') return 'border-violet-500/20 bg-violet-500/10 text-violet-300'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

export function ArtistVideoLibrary({
  videos,
  emptyTitle,
  emptyBody,
  className = '',
  manageMode = false,
  onToggleVisibility,
  onArchive,
  onWatch,
}: ArtistVideoLibraryProps) {
  const visibleVideos = videos.filter(Boolean)
  const groups = groupArtistVideosByCategory(visibleVideos)

  if (visibleVideos.length === 0) {
    return (
      <div className={`rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-8 text-center ${className}`.trim()}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text-muted)]">
          <Youtube size={22} />
        </div>
        <p className="mt-4 text-lg font-semibold text-[var(--pf-text)]">{emptyTitle}</p>
        <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{emptyBody}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`.trim()}>
      {groups.map((group) => (
        <section key={group.category} className="space-y-3">
          <div className="flex items-center gap-2">
            <Youtube size={14} className="text-[var(--pf-orange)]" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--pf-text-secondary)]">
              {group.label}
            </h3>
            <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
              {group.videos.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.videos.map((video) => {
              const publishedDate = formatPublishedDate(video.published_at)
              const visibility = normalizeArtistVideoVisibility(video.visibility_status)
              const categoryLabel = normalizeArtistVideoCategory(video.video_category)
              const watchHref = video.source_url || video.embed_url

              return (
                <article
                  key={video.video_id}
                  className={`overflow-hidden rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-sm transition ${
                    visibility === 'archived' ? 'opacity-70' : 'hover:border-[var(--pf-orange)]/35'
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.25))]">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--pf-bg)] text-[var(--pf-text-muted)]">
                        <Play size={28} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.5))]" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${categoryTone(categoryLabel)}`}>
                        {group.label.replace(' Videos', '')}
                      </span>
                      {manageMode && (
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${visibilityTone(video.visibility_status)}`}>
                          {visibility}
                        </span>
                      )}
                    </div>
                    <a
                      href={watchHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onWatch?.(video)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label={`Watch ${video.title}`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                        <Play size={22} className="ml-1" />
                      </span>
                    </a>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="space-y-1">
                      <h4 className="line-clamp-2 text-base font-semibold text-[var(--pf-text)]">
                        {video.title}
                      </h4>
                      <p className="text-sm text-[var(--pf-text-secondary)]">
                        {video.channel_name || 'YouTube'}
                        {publishedDate ? ` · ${publishedDate}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
                        {categoryLabel.replace(/_/g, ' ')}
                      </span>
                      <a
                        href={watchHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
                      >
                        Watch
                        <ExternalLink size={10} />
                      </a>
                    </div>

                    {manageMode && (
                      <div className="flex flex-wrap items-center gap-2">
                        {visibility !== 'archived' && onToggleVisibility && (
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(video, visibility === 'hidden' ? 'visible' : 'hidden')}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
                          >
                            <EyeOff size={12} />
                            {visibility === 'hidden' ? 'Show' : 'Hide'}
                          </button>
                        )}

                        {onArchive && visibility !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => onArchive(video)}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--pf-text-secondary)] transition-colors hover:border-red-400/50 hover:text-red-300"
                          >
                            <Archive size={12} />
                            Remove
                          </button>
                        )}

                        {visibility === 'archived' && onToggleVisibility && (
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(video, 'visible')}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
                          >
                            Show again
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
