'use client'

import Link from 'next/link'

interface ArtistLinkProps {
  artist: string
  className?: string
  children?: React.ReactNode
}

export function ArtistLink({ artist, className = '', children }: ArtistLinkProps) {
  const slug = artist.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <Link 
      href={`/artist/${slug}`}
      className={`hover:text-[var(--pf-orange)] transition-colors ${className}`}
    >
      {children || artist}
    </Link>
  )
}