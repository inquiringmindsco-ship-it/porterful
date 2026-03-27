'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Music, Users, TrendingUp, Heart, ChevronRight, Search } from 'lucide-react'
import { ARTISTS } from '@/lib/artists'

const GENRES = ['All', 'Hip-Hop', 'R&B', 'Indie Pop', 'Electronic', 'Alternative', 'Lo-Fi', 'Latin', 'Rock', 'Jazz']

export default function ArtistsPage() {
  const [activeGenre, setActiveGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [artists, setArtists] = useState(ARTISTS)
  
  // Filter artists by genre and search
  const filteredArtists = artists.filter(artist => {
    const matchesGenre = activeGenre === 'All' || artist.genre?.toLowerCase().includes(activeGenre.toLowerCase())
    const matchesSearch = !searchQuery || 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGenre && matchesSearch
  })
  
  // Featured artist (first in list, usually O D Porter)
  const featuredArtist = artists[0]

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover <span className="text-[var(--pf-orange)]">Artists</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Support independent artists. Every purchase helps them keep creating.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists..."
              className="w-full py-3 pl-12 pr-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl text-[var(--pf-text)] placeholder-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)]"
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeGenre === genre
                  ? 'bg-[var(--pf-orange)] text-white'
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface-hover)]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Featured Artist */}
        {featuredArtist && (
          <div className="mb-12">
            <div className="pf-card p-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-transparent relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(255,107,0,0.1)_0%,transparent_70%)]" />
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] rounded-full text-sm font-medium mb-4">
                    <TrendingUp size={16} />
                    Featured Artist
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{featuredArtist.name}</h2>
                  <p className="text-[var(--pf-text-secondary)] mb-4">{featuredArtist.genre}</p>
                  <div className="flex gap-3">
                    <Link href={`/artist/${featuredArtist.slug || featuredArtist.id}`} className="pf-btn pf-btn-primary">
                      View Profile <ChevronRight className="inline ml-1" size={16} />
                    </Link>
                    <button className="pf-btn pf-btn-secondary flex items-center gap-2">
                      <Heart size={18} />
                      Follow
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Link href={`/artist/${featuredArtist.slug || featuredArtist.id}`} className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-orange-dark)] flex items-center justify-center text-8xl shadow-2xl shadow-[var(--pf-orange)]/30 overflow-hidden">
                    {featuredArtist.image ? (
                      <img src={featuredArtist.image} alt={featuredArtist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{featuredArtist.name.charAt(0)}</span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artists Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <Link 
                key={artist.id} 
                href={`/artist/${artist.slug || artist.id}`}
                className="pf-card group overflow-hidden hover:border-[var(--pf-orange)] transition-colors"
              >
                <div className="aspect-square bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg-secondary)] flex items-center justify-center text-7xl relative overflow-hidden">
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">{artist.name.charAt(0)}</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{artist.name}</h3>
                    {artist.followers !== undefined && (
                      <span className="text-xs text-[var(--pf-text-muted)] flex items-center gap-1">
                        <Users size={12} />
                        {artist.followers.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--pf-text-muted)] mb-4">{artist.genre}</p>
                  {artist.trackCount !== undefined && (
                    <p className="text-xs text-[var(--pf-text-muted)]">{artist.trackCount} tracks</p>
                  )}
                  <button className="w-full py-2 rounded-lg bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-sm font-medium group-hover:bg-[var(--pf-orange)] group-hover:text-white transition-colors mt-3">
                    View Profile
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--pf-text-muted)] text-lg mb-4">No artists found.</p>
            <button 
              onClick={() => { setActiveGenre('All'); setSearchQuery(''); }}
              className="pf-btn pf-btn-secondary"
            >
              View all artists
            </button>
          </div>
        )}

        {/* CTA for Artists */}
        <div className="mt-16 text-center">
          <div className="pf-card p-8 max-w-2xl mx-auto">
            <Music className="mx-auto mb-4 text-[var(--pf-orange)]" size={48} />
            <h2 className="text-2xl font-bold mb-2">Are You an Artist?</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Join Porterful and start earning from every purchase on the platform — not just your merch.
            </p>
            <Link href="/signup?role=artist" className="pf-btn pf-btn-primary">
              Apply as Artist <ChevronRight className="inline ml-1" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}