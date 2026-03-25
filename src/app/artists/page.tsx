import Link from 'next/link'
import { Music, Users, TrendingUp, Heart, ChevronRight, ExternalLink } from 'lucide-react'

// Demo artists
const ARTISTS = [
  { id: 'od', name: 'O D Music', genre: 'Hip-Hop / R&B', followers: 2847, goal: 2500, current: 1847, image: '🎤' },
  { id: 'alex', name: 'Alex Rivers', genre: 'Indie Pop', followers: 1205, goal: 1500, current: 890, image: '🎸' },
  { id: 'maya', name: 'Maya Sol', genre: 'Electronic', followers: 983, goal: 1000, current: 672, image: '🎹' },
  { id: 'jordan', name: 'Jordan Blake', genre: 'Alternative', followers: 756, goal: 800, current: 534, image: '🎷' },
  { id: 'luna', name: 'Luna Wave', genre: 'Lo-Fi', followers: 1562, goal: 2000, current: 1456, image: '🎧' },
  { id: 'cruz', name: 'Cruz Martinez', genre: 'Latin', followers: 2104, goal: 3000, current: 2100, image: '🎺' },
]

const GENRES = ['All', 'Hip-Hop / R&B', 'Indie Pop', 'Electronic', 'Alternative', 'Lo-Fi', 'Latin', 'Rock', 'Jazz']

export default function ArtistsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Support <span className="text-[var(--pf-orange)]">Independent Artists</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Every artist has a story. Every purchase helps them keep telling it.
          </p>
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                genre === 'All'
                  ? 'bg-[var(--pf-orange)] text-white'
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface-hover)]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Featured Artist */}
        <div className="mb-12">
          <div className="pf-card p-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(255,107,0,0.1)_0%,transparent_70%)]" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] rounded-full text-sm font-medium mb-4">
                  <TrendingUp size={16} />
                  Featured Artist
                </div>
                <h2 className="text-3xl font-bold mb-2">O D Music</h2>
                <p className="text-[var(--pf-text-secondary)] mb-4">Hip-Hop / R&B • 2,847 followers</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--pf-text-muted)]">March Goal</span>
                    <span className="font-bold">$1,847 / $2,500</span>
                  </div>
                  <div className="h-3 bg-[var(--pf-border)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-[var(--pf-orange-light)] rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/artist/od-porter" className="pf-btn pf-btn-primary">
                    Visit Store <ChevronRight className="inline ml-1" size={16} />
                  </Link>
                  <button className="pf-btn pf-btn-secondary flex items-center gap-2">
                    <Heart size={18} />
                    Follow
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-orange-dark)] flex items-center justify-center text-8xl shadow-2xl shadow-[var(--pf-orange)]/30">
                  🎤
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTISTS.filter(a => a.id !== 'od').map((artist) => (
            <Link key={artist.id} href={`/artist/${artist.id}`} className="pf-card group overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg-secondary)] flex items-center justify-center text-7xl relative">
                {artist.image}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--pf-bg)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{artist.name}</h3>
                  <span className="text-xs text-[var(--pf-text-muted)] flex items-center gap-1">
                    <Users size={12} />
                    {artist.followers.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">{artist.genre}</p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--pf-text-muted)]">Goal</span>
                    <span>${artist.current.toLocaleString()} / ${artist.goal.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[var(--pf-border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--pf-orange)] rounded-full"
                      style={{ width: `${(artist.current / artist.goal) * 100}%` }}
                    />
                  </div>
                </div>
                <button className="w-full py-2 rounded-lg bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-sm font-medium group-hover:bg-[var(--pf-orange)] group-hover:text-white transition-colors">
                  Support {artist.name.split(' ')[0]}
                </button>
              </div>
            </Link>
          ))}
        </div>

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