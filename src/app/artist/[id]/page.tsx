'use client';

import { useState } from 'react';
import { useAudio } from '@/lib/audio-context';
import { TRACKS, ALBUMS, PRODUCTS } from '@/lib/data';
import Link from 'next/link';
import { Play, Pause, Heart, Share2, Music, Package, Users, DollarSign, ChevronDown, ChevronUp, Youtube, ShoppingCart, ExternalLink } from 'lucide-react';

// Music Videos from YouTube
const MUSIC_VIDEOS = [
  { title: 'Breathe (Official Video)', album: 'From Feast to Famine', youtubeId: '5vFE92yYRzU', views: '2.2K' },
  { title: 'GOD IS GOOD Cypher Pt. 2', album: 'God Is Good', youtubeId: 'BysK2asswvI', views: '379' },
  { title: 'Amen', album: 'God Is Good', youtubeId: 'juD-wfcw5Tw', views: '362' },
  { title: 'Get Involved (Official Video)', album: 'One Day', youtubeId: 'FPLtdIN9zbM', views: '1.2K' },
  { title: 'My Hustle (Snippet)', album: 'Singles', youtubeId: 'x_Ws5P9mH7w', views: '210' },
];

// Album order - newest first
const ALBUM_ORDER = ['Singles', 'Ambiguous', 'Roxannity', 'One Day', 'From Feast to Famine', 'God Is Good'];

// Group tracks by album
function groupTracksByAlbum(tracks: typeof TRACKS) {
  const groups: Record<string, typeof TRACKS> = {};
  tracks.forEach(track => {
    const album = track.album || 'Singles';
    if (!groups[album]) groups[album] = [];
    groups[album].push(track);
  });
  return groups;
}

// Sample supporters for the wall
const SAMPLE_SUPPORTERS = [
  { name: 'Mike J.', handle: '@mikej_music', date: '2024-03-20', amount: 25 },
  { name: 'Sarah T.', handle: '@saraht_beats', date: '2024-03-20', amount: 50 },
  { name: 'Marcus L.', handle: '@marcuslouis', date: '2024-03-19', amount: 10 },
  { name: 'Jenny K.', handle: '@jennyk_prod', date: '2024-03-19', amount: 100 },
  { name: 'David R.', handle: '@davidraphael', date: '2024-03-18', amount: 15 },
  { name: 'Amber W.', handle: '@amberwave', date: '2024-03-18', amount: 30 },
];

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const { currentTrack, isPlaying, playTrack, setQueue } = useAudio();
  const [activeTab, setActiveTab] = useState<'music' | 'store' | 'videos' | 'about'>('music');
  const [following, setFollowing] = useState(false);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({ Singles: true });

  const artist = {
    name: 'O D Porter',
    bio: `Independent artist and founder of Porterful. Born in Miami, raised between New Orleans and St. Louis — most known from the STL. I've seen firsthand how the music industry exploits artists—taking the majority of profits while leaving creators with scraps.`,
    shortBio: 'Independent artist and founder of Porterful. Born in Miami, raised in New Orleans & St. Louis.',
    genre: 'Hip-Hop, R&B, Soul',
    location: 'St. Louis, MO',
    verified: true,
    earnings: 45000,
    supporters: 12500,
    products: 12,
  };

  const albums = groupTracksByAlbum(TRACKS);
  const orderedAlbums = ALBUM_ORDER.filter(album => albums[album]?.length > 0);
  
  // Featured merch for artist store
  const artistMerch = PRODUCTS.filter(p => p.category === 'merch').slice(0, 6);

  const toggleAlbum = (albumName: string) => {
    setExpandedAlbums(prev => ({ ...prev, [albumName]: !prev[albumName] }));
  };

  const playAlbum = (albumName: string) => {
    const albumTracks = albums[albumName];
    if (albumTracks && albumTracks.length > 0) {
      setQueue(albumTracks.map(t => ({
        ...t,
        duration: typeof t.duration === 'string' ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : t.duration || 180
      })));
      playTrack({
        ...albumTracks[0],
        duration: typeof albumTracks[0].duration === 'string' ? albumTracks[0].duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : albumTracks[0].duration || 180
      } as any);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="pf-container">
        {/* Hero */}
        <div className="relative mb-8">
          <div className="h-32 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-[var(--pf-orange)] to-purple-600">
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        {/* Artist Info */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-[var(--pf-bg)] shadow-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-4xl md:text-5xl">🎤</span>
            </div>
            <div className="flex-1 pt-4 md:pt-8">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{artist.name}</h1>
                {artist.verified && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-2">{artist.genre} • {artist.location}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-[var(--pf-orange)]">${artist.earnings.toLocaleString()}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{artist.supporters.toLocaleString()}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Supporters</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{TRACKS.length}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Tracks</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFollowing(!following)} 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    following 
                      ? 'bg-[var(--pf-orange)] text-white' 
                      : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                  }`}
                >
                  <Heart size={16} className={`inline mr-1 ${following ? 'fill-white' : ''}`} />
                  {following ? 'Following' : 'Follow'}
                </button>
                <Link href="/digital" className="px-4 py-2 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors">
                  <Play size={16} className="inline mr-1" />
                  Play Music
                </Link>
                <button className="px-4 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
                  <Share2 size={16} className="inline mr-1" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
          {(['music', 'store', 'videos', 'about'] as const).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors capitalize ${
                activeTab === tab 
                  ? 'bg-[var(--pf-orange)] text-white' 
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Music Tab */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            {/* Singles */}
            {albums['Singles'] && albums['Singles'].length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>⭐</span> Singles & New Releases
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {albums['Singles'].slice(0, 6).map((track) => (
                    <div 
                      key={track.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        currentTrack?.id === track.id 
                          ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]' 
                          : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                      onClick={() => playTrack({
                        ...track,
                        duration: typeof track.duration === 'string' ? 180 : track.duration || 180
                      } as any)}
                    >
                      <img src={track.image} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-[var(--pf-text-muted)]">{track.duration}</p>
                      </div>
                      <button className="w-8 h-8 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                        {currentTrack?.id === track.id && isPlaying ? 
                          <Pause size={14} className="text-white" /> : 
                          <Play size={14} className="text-white ml-0.5" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Albums</h2>
              {orderedAlbums.filter(a => a !== 'Singles').map(albumName => {
                const albumTracks = albums[albumName];
                if (!albumTracks || albumTracks.length === 0) return null;
                const isExpanded = expandedAlbums[albumName];
                const albumInfo = Object.values(ALBUMS).find(a => a.name === albumName);
                
                return (
                  <div key={albumName} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)]">
                    <button 
                      onClick={() => toggleAlbum(albumName)} 
                      className="w-full flex items-center gap-4 p-4 hover:bg-[var(--pf-bg)] transition-colors text-left"
                    >
                      <img 
                        src={albumInfo?.image || '/album-art/default.jpg'} 
                        alt={albumName} 
                        className="w-14 h-14 rounded-lg object-cover" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold">{albumName}</h3>
                        <p className="text-sm text-[var(--pf-text-muted)]">{albumTracks.length} tracks</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); playAlbum(albumName); }} 
                        className="p-2 rounded-full bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)] transition-colors"
                      >
                        <Play size={16} className="ml-0.5" />
                      </button>
                      <div className="text-[var(--pf-text-muted)]">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[var(--pf-border)]">
                        {albumTracks.map((track, i) => (
                          <div 
                            key={track.id} 
                            className={`flex items-center gap-4 p-3 hover:bg-[var(--pf-bg)] transition-colors ${
                              currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/5' : ''
                            }`}
                          >
                            <span className="w-6 text-center text-[var(--pf-text-muted)] text-sm">{i + 1}</span>
                            <button 
                              onClick={() => playTrack({
                                ...track,
                                duration: typeof track.duration === 'string' ? 180 : track.duration || 180
                              } as any)} 
                              className="w-8 h-8 rounded-full bg-[var(--pf-bg)] flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors"
                            >
                              {currentTrack?.id === track.id && isPlaying ? 
                                <Pause size={14} className="text-white" /> : 
                                <Play size={14} className="text-white ml-0.5" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>
                                {track.title}
                              </p>
                            </div>
                            <span className="text-sm text-[var(--pf-text-muted)]">{track.duration}</span>
                            <span className="text-sm font-medium text-[var(--pf-orange)]">${track.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Artist Store</h2>
              <Link href="/marketplace" className="text-[var(--pf-orange)] hover:underline text-sm flex items-center gap-1">
                View All Products <ExternalLink size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {artistMerch.map((product) => (
                <Link 
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors group"
                >
                  <div className="aspect-square relative">
                    <img 
                      src={product.image || '/product-placeholder.jpg'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-[var(--pf-orange)] text-white px-2 py-1 rounded text-sm font-medium">
                      ${(product.salePrice || product.basePrice * 1.3).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-sm text-[var(--pf-text-muted)]">{product.type}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm">{product.rating?.toFixed(1)}</span>
                      <span className="text-xs text-[var(--pf-text-muted)]">({product.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Submit Merch CTA */}
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 border border-[var(--pf-orange)]/20">
              <h3 className="font-bold mb-2">Want to sell your own merch?</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                Artists can submit designs for print-on-demand products. No inventory needed.
              </p>
              <Link href="/dashboard/upload?type=product" className="pf-btn pf-btn-primary inline-flex items-center gap-2">
                <Package size={18} />
                Submit Design
              </Link>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Music Videos</h2>
              <a href="https://youtube.com/@odporter" target="_blank" rel="noopener" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1">
                <Youtube size={18} /> YouTube Channel
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {MUSIC_VIDEOS.map((video, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[var(--pf-border)]">
                  <div className="aspect-video bg-[var(--pf-surface)]">
                    <iframe 
                      src={`https://www.youtube.com/embed/${video.youtubeId}`} 
                      title={video.title} 
                      className="w-full h-full" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                    />
                  </div>
                  <div className="p-4 bg-[var(--pf-surface)]">
                    <h3 className="font-medium">{video.title}</h3>
                    <p className="text-sm text-[var(--pf-text-muted)]">{video.album} • {video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
              <h2 className="text-xl font-bold mb-4">About {artist.name}</h2>
              <p className="text-[var(--pf-text-secondary)] mb-6">{artist.bio}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--pf-border)]">
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Music className="text-purple-400 mx-auto mb-2" size={24} />
                  <p className="text-xl font-bold">{TRACKS.length}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Tracks</p>
                </div>
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Users className="text-blue-400 mx-auto mb-2" size={24} />
                  <p className="text-xl font-bold">{artist.supporters.toLocaleString()}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Supporters</p>
                </div>
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <DollarSign className="text-green-400 mx-auto mb-2" size={24} />
                  <p className="text-xl font-bold">${artist.earnings.toLocaleString()}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Earned</p>
                </div>
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Package className="text-[var(--pf-orange)] mx-auto mb-2" size={24} />
                  <p className="text-xl font-bold">{artist.products}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Products</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--pf-border)]">
                <h3 className="font-semibold mb-2">Founder's Mission</h3>
                <blockquote className="border-l-4 border-[var(--pf-orange)] pl-4 italic text-[var(--pf-text-secondary)]">
                  "I built Porterful because I was tired of watching artists get pennies while platforms got rich. Every purchase here puts real money in artists' pockets—80% goes directly to them."
                </blockquote>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}