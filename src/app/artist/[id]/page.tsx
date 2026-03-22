'use client';

import { useState } from 'react';
import { useAudio } from '@/lib/audio-context';
import { TRACKS, ALBUMS } from '@/lib/data';
import Link from 'next/link';
import { Play, Pause, Heart, Share2, Music, Package, Users, DollarSign, ChevronDown, ChevronUp, Youtube, ListPlus } from 'lucide-react';

// Music Videos from YouTube
const MUSIC_VIDEOS = [
  { title: 'Breathe (Official Video)', album: 'From Feast to Famine', youtubeId: '5vFE92yYRzU', views: '2.2K' },
  { title: 'GOD IS GOOD Cypher Pt. 2', album: 'God Is Good', youtubeId: 'BysK2asswvI', views: '379' },
  { title: 'Amen', album: 'God Is Good', youtubeId: 'juD-wfcw5Tw', views: '362' },
  { title: 'Get Involved (Official Video)', album: 'One Day', youtubeId: 'FPLtdIN9zbM', views: '1.2K' },
  { title: 'My Hustle (Snippet)', album: 'Singles', youtubeId: 'x_Ws5P9mH7w', views: '210' },
  { title: 'Untold Story', album: 'God Is Good', youtubeId: 'PfHh1TCIB3s', views: '293' },
  { title: 'Mike Tyson (Official Video)', album: 'One Day', youtubeId: '5523eYZ48GU', views: '554' },
  { title: 'Street Love', album: 'One Day', youtubeId: 'oMEfjmdE2ls', views: '455' },
  { title: 'Jai Jai - As If', album: 'Streets Thought I Left', youtubeId: 'sqxPRE3EiNI', views: '3.1K' },
  { title: '82 FAM TTD', album: 'Levi', youtubeId: 'rieh1ku8oXw', views: '6.3K' },
];

// Album order - newest first
const ALBUM_ORDER = [
  'Singles',
  'Ambiguous',
  'Roxannity', 
  'One Day',
  'From Feast to Famine',
  'God Is Good',
];

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
  { name: 'Chris M.', handle: '@chrism_audio', date: '2024-03-17', amount: 20 },
  { name: 'Taylor N.', handle: '@taylorn_beats', date: '2024-03-17', amount: 45 },
  { name: 'Jordan P.', handle: '@jordanp_music', date: '2024-03-16', amount: 60 },
  { name: 'Alicia B.', handle: '@aliciab_sings', date: '2024-03-16', amount: 35 },
];

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudio();
  const [activeTab, setActiveTab] = useState<'music' | 'videos' | 'about'>('music');
  const [following, setFollowing] = useState(false);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({ Singles: true });

  const artist = {
    name: 'O D Porter',
    bio: `Independent artist and founder of Porterful. Born in Miami, raised between New Orleans and St. Louis — most known from the STL. I've seen firsthand how the music industry exploits artists—taking the majority of profits while leaving creators with scraps.`,
    shortBio: 'Independent artist and founder of Porterful. Born in Miami, raised in New Orleans & St. Louis — STL stand up. Building a platform where artists keep 80% of every sale.',
    genre: 'Hip-Hop, R&B, Soul',
    location: 'St. Louis, MO',
    verified: true,
    earnings: 45000,
    supporters: 12500,
    products: 12,
  };

  // Group tracks by album in proper order
  const albums = groupTracksByAlbum(TRACKS);
  const orderedAlbums = ALBUM_ORDER.filter(album => albums[album]?.length > 0);

  const toggleAlbum = (albumName: string) => {
    setExpandedAlbums(prev => ({ ...prev, [albumName]: !prev[albumName] }));
  };

  const playAlbum = (albumName: string) => {
    const albumTracks = albums[albumName] || [];
    if (albumTracks.length > 0) {
      setQueue(albumTracks.map(t => ({
        ...t,
        duration: typeof t.duration === 'string' ? parseInt(t.duration.split(':').reduce((acc: number, t: string) => (60 * acc) + parseInt(t), 0)) : t.duration || 180
      })));
      playTrack({
        ...albumTracks[0],
        duration: typeof albumTracks[0].duration === 'string' ? parseInt(albumTracks[0].duration.split(':').reduce((acc: number, t: string) => (60 * acc) + parseInt(t), 0)) : albumTracks[0].duration || 180
      } as any);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Hero */}
        <div className="relative mb-8">
          <div className="h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-[var(--pf-orange)]/30 to-purple-600/30">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--pf-bg)] via-transparent to-transparent" />
          </div>
        </div>

        {/* Artist Info */}
        <div className="relative -mt-24 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-[var(--pf-bg)] shadow-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center">
              <span className="text-5xl">🎤</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{artist.name}</h1>
                {artist.verified && <span className="bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] px-2 py-0.5 rounded text-sm font-medium">✓ Verified Artist</span>}
              </div>
              <p className="text-[var(--pf-text-secondary)] mb-4">{artist.genre} • {artist.location}</p>
              <p className="text-[var(--pf-text-muted)] max-w-xl">{artist.shortBio}</p>
              <div className="flex items-center gap-6 mt-4">
                <div><p className="text-2xl font-bold text-[var(--pf-orange)]">${artist.earnings.toLocaleString()}</p><p className="text-sm text-[var(--pf-text-muted)]">Earned</p></div>
                <div className="w-px h-8 bg-[var(--pf-border)]" />
                <div><p className="text-2xl font-bold">{artist.supporters.toLocaleString()}</p><p className="text-sm text-[var(--pf-text-muted)]">Supporters</p></div>
                <div className="w-px h-8 bg-[var(--pf-border)]" />
                <div><p className="text-2xl font-bold">{TRACKS.length}</p><p className="text-sm text-[var(--pf-text-muted)]">Tracks</p></div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => setFollowing(!following)} className={`pf-btn ${following ? 'pf-btn-primary' : 'pf-btn-secondary'}`}>
                  <Heart size={18} className={`inline mr-2 ${following ? 'fill-white' : ''}`} />
                  {following ? 'Following' : 'Follow'}
                </button>
                <Link href="/radio" className="pf-btn pf-btn-primary"><Play size={18} className="inline mr-2" />Play All</Link>
                <button className="pf-btn pf-btn-secondary"><Share2 size={18} className="inline mr-2" />Share</button>
              </div>
            </div>
          </div>
        </div>

        {/* Supporter Wall */}
        <div className="pf-card p-6 mb-8 bg-gradient-to-r from-[var(--pf-orange)]/5 to-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">✊</span>Supporter Wall</h2>
            <span className="text-sm text-[var(--pf-text-muted)]">{artist.supporters.toLocaleString()} supporters</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SAMPLE_SUPPORTERS.slice(0, 10).map((supporter, i) => (
              <div key={i} className="bg-[var(--pf-surface)] rounded-lg p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">{supporter.name[0]}</div>
                <p className="font-medium text-sm truncate">{supporter.name}</p>
                <p className="text-xs text-[var(--pf-orange)]">{supporter.handle}</p>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">${supporter.amount}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-[var(--pf-text-muted)]">Be the first to support! <span className="text-[var(--pf-orange)]">Your name here</span> with a contribution.</p>
            <Link href="/support" className="pf-btn pf-btn-primary mt-2 inline-block">Support This Artist</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--pf-border)] mb-8">
          <div className="flex gap-8">
            {(['music', 'videos', 'about'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 font-semibold transition-colors capitalize ${activeTab === tab ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]' : 'text-[var(--pf-text-muted)] hover:text-white'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'music' && (
          <div>
            {/* Featured Singles at top */}
            {albums['Singles'] && albums['Singles'].length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">⭐</span> Singles & New Releases
                  </h2>
                  <span className="text-sm text-[var(--pf-orange)]">Latest tracks</span>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {albums['Singles'].map((track) => (
                    <div key={track.id} className={`pf-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--pf-surface-hover)] ${currentTrack?.id === track.id ? 'ring-2 ring-[var(--pf-orange)]' : ''}`} onClick={() => playTrack({ ...track, duration: typeof track.duration === 'string' ? 180 : track.duration || 180 } as any)}>
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center shrink-0">
                        {track.image ? <img src={track.image} alt={track.title} className="w-full h-full object-cover" /> : <span className="text-xl">🎵</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.duration}</p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center shrink-0">
                        {currentTrack?.id === track.id && isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            <div className="space-y-4">
              {orderedAlbums.filter(a => a !== 'Singles').map(albumName => {
                const albumTracks = albums[albumName];
                if (!albumTracks || albumTracks.length === 0) return null;
                const isExpanded = expandedAlbums[albumName];
                const albumInfo = Object.values(ALBUMS).find(a => a.name === albumName);
                
                return (
                  <div key={albumName} className="pf-card overflow-hidden">
                    <button onClick={() => toggleAlbum(albumName)} className="w-full flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors text-left">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center shrink-0">
                        {albumInfo?.image ? <img src={albumInfo.image} alt={albumName} className="w-full h-full object-cover" /> : <span className="text-xl">🎵</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{albumName}</h3>
                        <p className="text-sm text-[var(--pf-text-muted)]">{albumTracks.length} tracks • {albumInfo?.year || '2024'}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); playAlbum(albumName); }} className="p-2 rounded-full bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange)]/80 transition-colors shrink-0">
                        <Play size={18} className="ml-0.5" />
                      </button>
                      <div className="text-[var(--pf-text-muted)] shrink-0">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[var(--pf-border)]">
                        {albumTracks.map((track, i) => (
                          <div key={track.id} className={`flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors ${currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/5' : ''}`}>
                            <span className="w-6 text-center text-[var(--pf-text-muted)] text-sm">{i + 1}</span>
                            <button onClick={() => playTrack({ ...track, duration: typeof track.duration === 'string' ? 180 : track.duration || 180 } as any)} className="w-8 h-8 rounded-full bg-[var(--pf-surface)] flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors shrink-0">
                              {currentTrack?.id === track.id && isPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate text-sm ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                            </div>
                            <span className="text-sm text-[var(--pf-text-muted)]">{track.duration}</span>
                            <span className="text-sm font-medium">${track.price || 1}</span>
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

        {activeTab === 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Music Videos</h2>
              <a href="https://youtube.com/@odporter" target="_blank" rel="noopener" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1"><Youtube size={18} /> YouTube Channel</a>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {MUSIC_VIDEOS.map((video, i) => (
                <div key={i} className="pf-card overflow-hidden">
                  <div className="aspect-video bg-[var(--pf-surface)]">
                    <iframe src={`https://www.youtube.com/embed/${video.youtubeId}`} title={video.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-[var(--pf-text-muted)]">{video.album} • {video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl">
            <div className="pf-card p-8">
              <h2 className="text-xl font-bold mb-6">About {artist.name}</h2>
              <p className="text-[var(--pf-text-secondary)] mb-6">{artist.bio}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-[var(--pf-border)]">
                <div className="flex items-center gap-3"><Music className="text-purple-400" size={24} /><div><p className="text-xl font-bold">{TRACKS.length}</p><p className="text-sm text-[var(--pf-text-muted)]">Tracks</p></div></div>
                <div className="flex items-center gap-3"><Users className="text-blue-400" size={24} /><div><p className="text-xl font-bold">{artist.supporters.toLocaleString()}</p><p className="text-sm text-[var(--pf-text-muted)]">Supporters</p></div></div>
                <div className="flex items-center gap-3"><DollarSign className="text-green-400" size={24} /><div><p className="text-xl font-bold">${artist.earnings.toLocaleString()}</p><p className="text-sm text-[var(--pf-text-muted)]">Earned</p></div></div>
                <div className="flex items-center gap-3"><Package className="text-[var(--pf-orange)]" size={24} /><div><p className="text-xl font-bold">{artist.products}</p><p className="text-sm text-[var(--pf-text-muted)]">Products</p></div></div>
              </div>
              <div className="mt-8 pt-8 border-t border-[var(--pf-border)]">
                <h3 className="font-semibold mb-4">Founder's Mission</h3>
                <blockquote className="border-l-4 border-[var(--pf-orange)] pl-4 italic text-[var(--pf-text-secondary)]">"I built Porterful because I was tired of watching artists get pennies while platforms got rich. Every purchase here puts real money in artists' pockets—80% goes directly to them."</blockquote>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}