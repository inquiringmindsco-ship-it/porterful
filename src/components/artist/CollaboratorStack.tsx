'use client'

import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import type { ArtistCredit } from '@/lib/artist-credits'

interface CollaboratorStackProps {
  artists: ArtistCredit[]
  size?: 'xs' | 'sm' | 'md'
  maxVisible?: number
  className?: string
}

const SIZE_MAP: Record<NonNullable<CollaboratorStackProps['size']>, 'xs' | 'sm' | 'md'> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
}

function getTitle(artist: ArtistCredit) {
  const role = artist.role && artist.role !== 'collaborator'
    ? artist.role.replace(/_/g, ' ')
    : 'collaborator'
  return `${artist.name} · ${role}`
}

export function CollaboratorStack({
  artists,
  size = 'xs',
  maxVisible = 3,
  className = '',
}: CollaboratorStackProps) {
  const filtered = artists.filter(Boolean)
  if (filtered.length === 0) return null

  const visible = filtered.slice(0, maxVisible)
  const overflow = Math.max(filtered.length - visible.length, 0)

  return (
    <div
      className={`flex items-center ${className}`.trim()}
      aria-label={filtered.map((artist) => artist.name).join(', ')}
      title={filtered.map((artist) => artist.name).join(' · ')}
    >
      {visible.map((artist, index) => (
        <div
          key={`${artist.id || artist.name}-${index}`}
          className={index === 0 ? 'relative' : '-ml-2 relative'}
          title={getTitle(artist)}
        >
          <ArtistAvatar
            src={artist.image}
            alt={artist.name}
            name={artist.name}
            size={SIZE_MAP[size]}
            className="ring-2 ring-[var(--pf-bg)]"
          />
        </div>
      ))}

      {overflow > 0 && (
        <div
          className="-ml-2 flex items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[10px] font-semibold text-[var(--pf-text-secondary)] ring-2 ring-[var(--pf-bg)]"
          style={{ width: size === 'md' ? 40 : size === 'sm' ? 32 : 24, height: size === 'md' ? 40 : size === 'sm' ? 32 : 24 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
