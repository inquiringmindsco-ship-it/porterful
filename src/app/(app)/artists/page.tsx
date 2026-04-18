'use client'

import Link from 'next/link'
import { Music, MapPin, Clock, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LikenessVerifiedBadge } from '@/components/LikenessVerifiedBadge'

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
  // likeness_verified: DB-backed boolean — only true when DB columns exist AND profile has it set
  likeness_verified?: boolean
  // data_source: 'db' = from Supabase, 'static' = from PLATFORM_ARTISTS fallback
  data_source?: 'db' | 'static'
  tracks?: number
  status?: string
  youtube_url?: string
  instagram_url?: string
  twitter_url?: string
}

// STATIC FALLBACK DATA — transitional only, NOT the durable truth source.
// These exist to provide artist content when DB queries fail.
// IMPORTANT: likeness_verified here is NOT DB-backed verification.
// When DB columns exist, O D Porter's profile must be updated in Supabase directly.
// Static likeness_verified flags are placeholders until real DB records exist.
const PLATFORM_ARTISTS: ArtistProfile[] = [
  {
    id: 'od-porter',
    username: 'odporter',
    full_name: 'O D Porter',
    email: 'iamodmusic@gmail.com',
    avatar_url: '/artist-images/od-porter/od-porter.jpg',
    bio: 'Artist. Architect of Porterful. Born Miami, raised New Orleans & St. Louis. Building the retirement plan for artists — one platform at a time.',
    genre: 'Hip-Hop / R&B / Soul',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: true, // NOTE: placeholder — needs DB confirmation when columns exist
    data_source: 'static',
    tracks: 21,
    status: 'live',
    youtube_url: 'https://youtube.com/@odporter',
    instagram_url: 'https://instagram.com/odporter',
    twitter_url: 'https://twitter.com/odporter',
  },
  {
    id: 'gune',
    username: 'gune',
    full_name: 'Gune',
    email: null,
    avatar_url: '/artist-images/gune/ISIMG-1050533.JPG',
    bio: 'St. Louis rapper with a raw sound. Bringing authentic hip-hop to Porterful.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false, // no account linked — James Chapple needs auth account first
    data_source: 'static',
    tracks: 3,
    status: 'live',
  },
  {
    id: 'nikee-turbo',
    username: 'nikee-turbo',
    full_name: 'Nikee Turbo',
    email: null,
    avatar_url: '/artist-images/nikee-turbo/ab6761610000e5ebfddbec3845c421474dc2d779.jpeg',
    bio: 'St. Louis rapper known for rhythm and flow. Featured in Riverfront Times for his dance craze.',
    genre: 'Hip-Hop / Trap',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false, // no account linked — Douglas Robert needs auth account first
    data_source: 'static',
    tracks: 3,
    status: 'live',
  },
  {
    id: 'atm-trap',
    username: 'atm-trap',
    full_name: 'ATM Trap',
    email: null,
    avatar_url: '/artist-images/atm-trap/images/avatar.jpg',
    bio: 'St. Louis hip-hop artist bringing authentic street sound to Porterful.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false, // no account linked — needs auth account first
    data_source: 'static',
    tracks: 0,
    status: 'live',
  },
  {
    id: 'rob-soule',
    username: 'rob-soule',
    full_name: 'Rob Soule',
    email: null,
    avatar_url: '/artist-images/rob-soule/hq720.jpg',
    bio: 'St. Louis hip-hop and R&B artist who weaves the blues into a soulful sound all his own. Rooted in the Lou\'s rich musical legacy — the soul, the struggle, the stories — translated into something new.',
    genre: 'Hip-Hop / R&B / Blues',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false, // no account linked
    data_source: 'static',
    tracks: 3,
    status: 'live',
  },
]

export default function ArtistsPage() {
  const [dbArtists, setDbArtists] = useState<ArtistProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dbColumnsExist, setDbColumnsExist] = useState(false)

  // Fetch artists from database
  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch('/api/artists')
        if (res.ok) {
          const data = await res.json()
          setDbArtists(data.artists || [])
          // Check if DB returned likeness_verified field (indicates columns exist)
          if (data.artists && data.artists.length > 0) {
            setDbColumnsExist('likeness_verified' in data.artists[0])
          }
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
        likeness_verified: dbArtist.likeness_verified || false,
        data_source: 'db',
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

      {/* Data source indicator — dev/transition only */}
      {!dbColumnsExist && !loading && (
        <div className="pf-container py-2">
          <p className="text-xs text-[var(--pf-text-muted)]">
            Artist verification display is transitional — DB-backed verification pending migration
          </p>
        </div>
      )}

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

// ArtistCard — verified mark uses data_source to determine display authority
function ArtistCard({ artist, isComingSoon = false }: { artist: any; isComingSoon?: boolean }) {
  const initials = artist.full_name
    ? artist.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (artist.username || 'AR').slice(0, 2).toUpperCase()

  // Badge display: only show if likeness_verified is true AND data_source is 'db'
  // OR if static with explicit true (transitional — only O D Porter should qualify)
  // Real production: badge should only come from DB-backed truth
  const showLikenessBadge = artist.likeness_verified === true && (
    artist.data_source === 'db' || 
    (artist.data_source === 'static' && artist.email === 'iamodmusic@gmail.com')
  )

  return (
    <>
      {/* Artist Header */}
      <div className="flex items-start gap-4 mb-4">
        {artist.avatar_url ? (
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--pf-bg-secondary)] shrink-0">
            <img src={artist.avatar_url} alt={artist.full_name || artist.username} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
        )}
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
            {showLikenessBadge && (
              <LikenessVerifiedBadge size={16} />
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