'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Disc, Verified, ChevronLeft } from 'lucide-react'
import { LikenessBadge } from '@/components/likeness/LikenessGate'

// Social platform icons as inline SVG components
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  )
}

interface ArtistHeroProps {
  artist: {
    name: string
    slug: string
    genre: string
    location: string
    verified: boolean
    likeness_verified?: boolean
    image: string
    coverGradient: string
    followers: number
    trackCount?: number
    social?: Record<string, string>
  }
}

export function ArtistHero({ artist }: ArtistHeroProps) {
  const socialLinks = [
    artist.social?.instagram && {
      key: 'instagram',
      href: `https://instagram.com/${artist.social.instagram}`,
      label: 'Instagram',
      icon: InstagramIcon,
      className: 'hover:text-[#E4405F] hover:border-[#E4405F]',
    },
    artist.social?.twitter && {
      key: 'twitter',
      href: `https://twitter.com/${artist.social.twitter}`,
      label: 'X (Twitter)',
      icon: XIcon,
      className: 'hover:text-white hover:bg-black hover:border-black',
    },
    artist.social?.youtube && {
      key: 'youtube',
      href: artist.social.youtube.startsWith('http') ? artist.social.youtube : `https://youtube.com/${artist.social.youtube}`,
      label: 'YouTube',
      icon: YouTubeIcon,
      className: 'hover:text-[#FF0000] hover:border-[#FF0000]',
    },
    artist.social?.tiktok && {
      key: 'tiktok',
      href: `https://tiktok.com/@${artist.social.tiktok}`,
      label: 'TikTok',
      icon: TikTokIcon,
      className: 'hover:text-white hover:bg-black hover:border-black',
    },
  ]
    .filter(Boolean)
    .slice(0, 3) as Array<{
      key: string
      href: string
      label: string
      icon: (props: { size?: number }) => JSX.Element
      className: string
    }>

  return (
    <section className="relative bg-gradient-to-b from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-[var(--pf-bg)]">
      {/* Back nav */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link
          href="/music"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors"
        >
          <ChevronLeft size={16} />
          All Artists
        </Link>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">

          {/* Avatar */}
          <div className="relative w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-[var(--pf-orange)]/30 shadow-2xl shadow-[var(--pf-orange)]/10 bg-[var(--pf-surface)]">
            {artist.image ? (
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="192px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-600/20">
                <span className="text-5xl font-bold text-[var(--pf-orange)]">
                  {artist.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info + Controls */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              {artist.verified && (
                <Verified size={18} className="text-[var(--pf-orange)]" />
              )}
              {artist.likeness_verified && <LikenessBadge compact />}
              <span className="text-sm text-[var(--pf-text-muted)] uppercase tracking-widest">
                Artist
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 break-words">{artist.name}</h1>

            <p className="text-[var(--pf-text-secondary)] mb-6">
              {artist.genre} · {artist.location}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[var(--pf-text-secondary)]">
                <Disc size={16} />
                <span className="text-sm font-mono">{artist.trackCount || 0} tracks</span>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-6">
                {socialLinks.map(({ key, href, label, icon: Icon, className }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full bg-[var(--pf-bg)] border border-[var(--pf-border)] flex items-center justify-center text-[var(--pf-text-secondary)] transition-colors ${className}`}
                    aria-label={label}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
