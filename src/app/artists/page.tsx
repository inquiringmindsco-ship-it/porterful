'use client'

import Link from 'next/link'
import { Music, MapPin, Clock, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

// Extended artist type with database fields
interface ArtistProfile {
  id: string
  username: string | null
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio?: string
  genre?: string
  location?: string
  verified?: boolean
  tracks?: number
  status?: string
}

// Hardcoded artists with full profiles (for artists with complete info)
const PLATFORM_ARTISTS: ArtistProfile[] = [
  {
    id: 'od-porter',
    username: 'odporter',
    full_name: 'O D Porter',
    email: 'iamodmusic@gmail.com',
    avatar_url: null,
    bio: 'St. Louis artist blending hip-hop, R&B, and soul. Born in Miami, raised in NOLA & STL. Building Porterful to help artists own everything.',
    genre: 'Hip-Hop / R&B / Soul',
    location: 'St. Louis, MO',
    verified: true,
    tracks: 21,
    status: 'live',
  },
  {
    id: 'atm-trap',
    username: 'atm-trap',
    full_name: 'ATM Trap',
    email: null,
    avatar_url: null,
    bio: 'St. Louis trap with raw energy. ATM = All The Money.',
    genre: 'Trap / Hip-Hop',
    location: 'St. Louis, MO',
    verified: false,
    tracks: 0,
    status: 'coming-soon',
  },
  {
    id: 'rob-soule',
    username: 'rob-soule',
    full_name: 'Rob Soule',
    email: null,
    avatar_url: null,
    bio: 'Soulful melodies meet hard-hitting bars. St. Louis native.',
    genre: 'Hip-Hop / Soul',
    location: 'St. Louis, MO',
    verified: false,
    tracks: 0,
    status: 'coming-soon',
  },
  {
    id: 'ttd-dex',
    username: 'ttd-dex',
    full_name: 'TTD Dex',
    email: null,
    avatar_url: null,
    bio: 'Part of the TTD collective. Coming hard with new sounds.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: false,
    tracks: 0,
    status: 'coming-soon',
  },
  {
    id: 'nick9',
    username: 'nick9',
    full_name: 'Nick9',
    email: null,
    avatar_url: null,
    bio: 'Fresh out the lab. New sound loading.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: false,
    tracks: 0,
    status: 'coming-soon',
  },
  {
    id: 'gune',
    username: 'gune',
    full_name: 'Gune',
    email: null,
    avatar_url: null,
    bio: 'Coming soon.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: false,
    tracks: 0,
    status: 'coming-soon',
  },
]

export default function ArtistsPage() {
  const [dbArtists, setDbArtists] = useState<ArtistProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch artists from database
  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch('/api/artists')
        if (res.ok) {
          const data = await res.json()
          setDbArtists(data.artists || [])
        }
      } catch (e) {
        console.error('Failed to fetch artists:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchArtists()
  }, [])

  // Combine platform artists with database artists
  // Database artists who aren't in platform artists get "Coming Soon" status
  const allArtists = [...PLATFORM_ARTISTS]

  // Add database artists that aren't hardcoded
  dbArtists.forEach(dbArtist => {
    const username = dbArtist.username || dbArtist.email?.split('@')[0] || 'unknown'
    const isLive = PLATFORM_ARTISTS.some(a => 
      a.username === username || (dbArtist.email && a.email === dbArtist.email)
    )
    if (!isLive) {
      allArtists.push({
        ...dbArtist,
        id: dbArtist.username || dbArtist.email?.split('@')[0] || dbArtist.id,
        username: username,
        full_name: dbArtist.full_name || username,
        email: dbArtist.email,
        avatar_url: dbArtist.avatar_url,
        bio: dbArtist.bio || `${username} is joining Porterful. Stay tuned for new music.`,
        genre: dbArtist.genre || 'Coming Soon',
        location: dbArtist.location || 'TBA',
        verified: dbArtist.verified || false,
        tracks: dbArtist.tracks || 0,
        status: 'coming-soon',
      })
    }
  })

  const liveArtists = allArtists.filter(a => a.status === 'live')
  const comingSoonArtists = allArtists.filter(a => a.status === 'coming-soon')

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-[var(--pf-orange)]/10 via-purple-500/5 to-[var(--pf-bg)]">
        <div className="pf-container">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-[var(--pf-orange)]">Artists</span> on Porterful
            </h1>
            <p className="text-lg text-[var(--pf-text-secondary)]">
              Discover independent artists selling music and merch directly to fans. 
              No labels, no middlemen — just artists and their community.
            </p>
            <Link 
              href="/signup?role=artist" 
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              <Music size={18} />
              Join as Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Live Artists */}
      {liveArtists.length > 0 && (
        <section className="py-12">
          <div className="pf-container">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="bg-[var(--pf-surface)] rounded-2xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-all group"
                >
                  <ArtistCard artist={artist} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Artists */}
      {comingSoonArtists.length > 0 && (
        <section className="py-12 bg-[var(--pf-bg)]">
          <div className="pf-container">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[var(--pf-orange)]" />
              Coming Soon
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href="/coming-soon"
                  className="bg-[var(--pf-surface)] rounded-2xl p-6 border border-dashed border-[var(--pf-orange)]/50 hover:border-[var(--pf-orange)] transition-all group"
                >
                  <ArtistCard artist={artist} isComingSoon />
                </Link>
              ))}
            </div>

            {/* Waitlist CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">Get notified when they drop</h3>
                  <p className="text-sm text-[var(--pf-text-secondary)]">
                    Follow artists to get alerts when they release new music or merch.
                  </p>
                </div>
                <Link 
                  href="/signup?role=supporter" 
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors text-sm"
                >
                  <Bell size={16} />
                  Join Waitlist
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {allArtists.length === 0 && !loading && (
        <section className="py-12">
          <div className="pf-container text-center">
            <p className="text-[var(--pf-text-muted)]">No artists yet. Be the first to join!</p>
            <Link 
              href="/signup?role=artist" 
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              <Music size={18} />
              Join as Artist
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

function ArtistCard({ artist, isComingSoon = false }: { artist: any; isComingSoon?: boolean }) {
  const initials = artist.full_name 
    ? artist.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (artist.username || 'AR').slice(0, 2).toUpperCase()

  return (
    <>
      {/* Artist Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold truncate group-hover:text-[var(--pf-orange)] transition-colors">
              {artist.full_name || artist.username || 'New Artist'}
            </h3>
            {artist.verified && (
              <span className="bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] px-2 py-0.5 rounded text-xs font-medium shrink-0">
                ✓
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--pf-text-secondary)]">{artist.genre}</p>
          <p className="text-xs text-[var(--pf-text-muted)] flex items-center gap-1 mt-1">
            <MapPin size={10} /> {artist.location}
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-[var(--pf-text-secondary)] mb-4 line-clamp-2">
        {artist.bio}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-[var(--pf-text-muted)]">
          <Music size={14} />
          <span>{artist.tracks || 0} tracks</span>
        </div>
        {isComingSoon && (
          <span className="flex items-center gap-1 text-[var(--pf-orange)] text-xs font-medium">
            <Clock size={12} /> Coming Soon
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-[var(--pf-border)]">
        <span className="text-sm text-[var(--pf-orange)] font-medium group-hover:underline">
          {isComingSoon ? 'Notify Me When They Drop →' : 'View Artist Store →'}
        </span>
      </div>
    </>
  )
}
