'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';
import { useAudio } from '@/lib/audio-context';
import { TRACKS, ALBUMS, PRODUCTS } from '@/lib/data';
import { getArtistById } from '@/lib/artists';
import { 
  Play, Pause, Share2, Music, Package, ChevronDown, ChevronUp, 
  Youtube, ExternalLink, Bell, Check, Edit3, MapPin, Globe, 
  Instagram, Twitter, Star, Users, Plus
} from 'lucide-react';

// Music Videos from YouTube
const MUSIC_VIDEOS = [
  { title: 'Jai Jai - Peace Up Arch Down', album: 'Streets Thought I Left', youtubeId: 'qVUPQMo080Y', views: '' },
  { title: 'Dex', album: 'Streets Thought I Left', youtubeId: 'T-Q0zVOAYC8', views: '' },
  { title: 'I Got - Jai Jai x TTD Dex', album: 'Streets Thought I Left', youtubeId: '1AlI1ymOrhg', views: '' },
  { title: '82 FAM TTD', album: 'Streets Thought I Left', youtubeId: 'rieh1ku8oXw', views: '' },
  { title: "Jai'Jai As If", album: 'Levi', youtubeId: 'sqxPRE3EiNI', views: '' },
  { title: 'Street Love by O D Music', album: 'One Day', youtubeId: 'oMEfjmdE2ls', views: '' },
  { title: 'Mike Tyson By O D Music (Official Music Video)', album: 'One Day', youtubeId: '5523eYZ48GU', views: '' },
];

const ALBUM_ORDER = ['Ambiguous', 'Roxannity', 'One Day', 'Levi', 'Streets Thought I Left', 'From Feast to Famine', 'God Is Good'];

const SINGLES = [
  TRACKS.find(t => t.id === 'amb-06')!,
  TRACKS.find(t => t.id === 'amb-01')!,
  TRACKS.find(t => t.id === 'od-07')!,
  TRACKS.find(t => t.id === 'od-16')!,
  TRACKS.find(t => t.id === 'stl-01')!,
  TRACKS.find(t => t.id === 'gig-04')!,
  TRACKS.find(t => t.id === 'fff-02')!,
  TRACKS.find(t => t.id === 'lev-02')!,
].filter(Boolean);

function groupTracksByAlbum(tracks: typeof TRACKS) {
  const groups: Record<string, typeof TRACKS> = {};
  tracks.forEach(track => {
    const album = track.album || 'Singles';
    if (!groups[album]) groups[album] = [];
    groups[album].push(track);
  });
  return groups;
}

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, supabase } = useSupabase();
  const { currentTrack, isPlaying, playTrack, setQueue } = useAudio();

  const [activeTab, setActiveTab] = useState<'music' | 'store' | 'videos' | 'about'>('music');
  const [notify, setNotify] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({ Singles: true });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Real artist data from DB (with static fallback)
  const [artistData, setArtistData] = useState<any>(null);
  const staticArtist = getArtistById(params.id);

  useEffect(() => {
    async function loadArtistData() {
      try {
        const res = await fetch(`/api/artists/${params.id}`);
        const data = await res.json();
        if (data.profile) {
          setArtistData({
            name: data.profile.full_name || data.profile.name || staticArtist?.name,
            bio: data.profile.bio || staticArtist?.bio || '',
            shortBio: data.profile.short_bio || staticArtist?.shortBio || '',
            genre: data.profile.genre || staticArtist?.genre || '',
            location: data.profile.location || staticArtist?.location || '',
            verified: data.profile.verified || staticArtist?.verified || false,
            avatar_url: data.profile.avatar_url || staticArtist?.image || null,
            cover_url: data.profile.cover_url || null,
            website: data.profile.website || null,
            youtube_url: data.profile.youtube_url || staticArtist?.social?.youtube || null,
            instagram_url: data.profile.instagram_url || staticArtist?.social?.instagram || null,
            twitter_url: data.profile.twitter_url || staticArtist?.social?.twitter || null,
          });
          // Check if current user owns this profile
          if (user && data.profile.id === user.id) {
            setIsOwner(true);
          }
        } else if (staticArtist) {
          setArtistData(staticArtist);
        }
      } catch (err) {
        if (staticArtist) setArtistData(staticArtist);
      } finally {
        setLoading(false);
      }
    }
    loadArtistData();
  }, [params.id, user]);

  useEffect(() => {
    async function checkNotifyStatus() {
      if (!artistData) return;
      const email = localStorage.getItem('notify_email');
      if (!email) return;
      try {
        const res = await fetch(`/api/notifications?artistId=${params.id}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.subscribed) setNotify(true);
      } catch (e) {}
    }
    checkNotifyStatus();
  }, [params.id, artistData]);

  const handleNotify = async () => {
    let email = localStorage.getItem('notify_email');
    if (!email) {
      email = prompt('Enter your email to get notified when this artist drops new music:');
      if (!email) return;
      localStorage.setItem('notify_email', email);
    }
    setNotifyLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId: params.id, email, action: notify ? 'unsubscribe' : 'subscribe' })
      });
      setNotify(!notify);
    } catch (e) {}
    setNotifyLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="pf-container">
          <div className="animate-pulse">
            <div className="h-48 md:h-64 rounded-2xl bg-[var(--pf-surface)] mb-8" />
            <div className="flex gap-4 items-end -mt-12">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-[var(--pf-surface)]" />
              <div className="h-8 bg-[var(--pf-surface)] w-48 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="pf-container text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Artist Not Found</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">We couldn't find an artist with that ID.</p>
          <Link href="/artists" className="pf-btn pf-btn-primary">Browse Artists</Link>
        </div>
      </div>
    );
  }

  const displayTracks = TRACKS;
  const albums = groupTracksByAlbum(displayTracks);
  const orderedAlbums = ALBUM_ORDER.filter(album => albums[album]?.length > 0);
  const artistMerch = PRODUCTS.filter(p => p.category === 'merch').slice(0, 6);

  // Default gradient if no cover image
  const coverStyle = artistData.cover_url
    ? { backgroundImage: `url(${artistData.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, var(--pf-orange) 0%, #7c3aed 100%)` };

  // Avatar initials fallback
  const initials = artistData.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?';

  const playSingles = () => {
    if (!SINGLES.length) return;
    setQueue(SINGLES.map(t => ({
      ...t,
      duration: typeof t.duration === 'string'
        ? t.duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
        : t.duration || 180
    })));
    playTrack({ ...SINGLES[0], duration: typeof SINGLES[0].duration === 'string'
      ? SINGLES[0].duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
      : SINGLES[0].duration || 180
    } as any);
  };

  const playAlbum = (albumName: string) => {
    const albumTracks = albums[albumName];
    if (!albumTracks?.length) return;
    setQueue(albumTracks.map(t => ({
      ...t,
      duration: typeof t.duration === 'string'
        ? t.duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
        : t.duration || 180
    })));
    playTrack({ ...albumTracks[0], duration: typeof albumTracks[0].duration === 'string'
      ? albumTracks[0].duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
      : albumTracks[0].duration || 180
    } as any);
  };

  const playAllArtistTracks = () => {
    if (!displayTracks.length) return;
    setQueue(displayTracks.map(t => ({
      ...t,
      duration: typeof t.duration === 'string'
        ? t.duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
        : t.duration || 180
    })));
    playTrack({ ...displayTracks[0], duration: typeof displayTracks[0].duration === 'string'
      ? displayTracks[0].duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
      : displayTracks[0].duration || 180
    } as any);
  };

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="pf-container">

        {/* HERO BANNER */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div 
            className="h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden relative"
            style={coverStyle}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {/* Owner edit banner button */}
            {isOwner && (
              <Link
                href="/dashboard/artist/edit"
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-black/70 transition-colors z-10"
              >
                <Edit3 size={14} />
                Edit Cover
              </Link>
            )}
          </div>

          {/* Artist Info Card - overlapping banner */}
          <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-end">
            {/* Avatar */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-[var(--pf-bg)] shadow-2xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 shrink-0">
              {artistData.avatar_url ? (
                <Image src={artistData.avatar_url} alt={artistData.name} fill sizes="144px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                  {initials}
                </div>
              )}
              {isOwner && (
                <Link
                  href="/dashboard/artist/edit"
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Edit3 size={20} className="text-white" />
                </Link>
              )}
            </div>

            {/* Name + Meta */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-4xl font-bold">{artistData.name}</h1>
                {artistData.verified && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--pf-text-secondary)] mb-3">
                {artistData.genre && <span className="flex items-center gap-1"><Music size={13} /> {artistData.genre}</span>}
                {artistData.location && <span className="flex items-center gap-1"><MapPin size={13} /> {artistData.location}</span>}
              </div>
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{displayTracks.length}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Tracks</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{orderedAlbums.length}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Albums</p>
                </div>
                {artistData.supporters != null && (
                  <div className="text-center">
                    <p className="text-xl font-bold">{artistData.supporters}</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">Supporters</p>
                  </div>
                )}
              </div>
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button onClick={handleNotify} disabled={notifyLoading} className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center gap-1.5 ${
                  notify ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                }`}>
                  {notifyLoading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Bell size={14} />}
                  {notify ? 'Notified' : 'Notify Me'}
                </button>
                <button onClick={playAllArtistTracks} className="px-4 py-2 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors text-sm flex items-center gap-1.5">
                  <Play size={14} /> Play All
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShareToast(true); setTimeout(() => setShareToast(false), 2000); }} className="px-4 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl font-medium hover:border-[var(--pf-orange)] transition-colors text-sm flex items-center gap-1.5">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>

            {/* Social links */}
            {(artistData.instagram_url || artistData.twitter_url || artistData.youtube_url || artistData.website) && (
              <div className="flex flex-wrap gap-2 pb-2">
                {artistData.youtube_url && (
                  <a href={artistData.youtube_url} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-red-500 transition-colors">
                    <Youtube size={16} className="text-red-500" />
                  </a>
                )}
                {artistData.instagram_url && (
                  <a href={artistData.instagram_url} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-pink-500 transition-colors">
                    <Instagram size={16} className="text-pink-400" />
                  </a>
                )}
                {artistData.twitter_url && (
                  <a href={artistData.twitter_url} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-blue-500 transition-colors">
                    <Twitter size={16} className="text-blue-400" />
                  </a>
                )}
                {artistData.website && (
                  <a href={artistData.website} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-[var(--pf-orange)] transition-colors">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Share Toast */}
        {shareToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-green-500 text-white rounded-xl shadow-xl text-sm font-medium animate-pulse">
            ✓ Link copied!
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['music', 'store', 'videos', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-[var(--pf-orange)] text-white' : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white border border-[var(--pf-border)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Albums */}
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><Music size={18} className="text-[var(--pf-orange)]" /> Albums</h2>
              {orderedAlbums.map(albumName => {
                const albumTracks = albums[albumName];
                if (!albumTracks?.length) return null;
                const isExpanded = expandedAlbums[albumName];
                const albumInfo = Object.values(ALBUMS).find((a: any) => a.name === albumName);

                return (
                  <div key={albumName} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)]">
                    <button
                      onClick={() => setExpandedAlbums(prev => ({ ...prev, [albumName]: !prev[albumName] }))}
                      className="w-full flex items-center gap-4 p-4 hover:bg-[var(--pf-bg)] transition-colors text-left"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                        <Image src={albumInfo?.image || '/album-art/default.jpg'} alt={albumName} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold">{albumName}</h3>
                        <p className="text-sm text-[var(--pf-text-muted)]">{albumTracks.length} tracks</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); playAlbum(albumName); }} className="p-2 rounded-full bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)] transition-colors shrink-0">
                        <Play size={14} className="ml-0.5" />
                      </button>
                      <ChevronDown size={18} className={`text-[var(--pf-text-muted)] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[var(--pf-border)]">
                        {albumTracks.map((track: any, i: number) => (
                          <div key={track.id} className={`flex items-center gap-3 p-3 hover:bg-[var(--pf-bg)] transition-colors ${currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/5' : ''}`}>
                            <span className="w-5 text-center text-[var(--pf-text-muted)] text-sm">{i + 1}</span>
                            <button onClick={() => playTrack({ ...track, duration: typeof track.duration === 'string' ? track.duration.split(':').reduce((a: number, p: string) => (60 * a) + parseInt(p), 0) : track.duration || 180 } as any)} className="w-7 h-7 rounded-full bg-[var(--pf-bg)] flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors shrink-0">
                              {currentTrack?.id === track.id && isPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white ml-0.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                            </div>
                            <span className="text-xs text-[var(--pf-text-muted)] shrink-0">{track.duration}</span>
                            <span className="text-xs font-medium text-[var(--pf-orange)] shrink-0">${track.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Singles sidebar */}
            <div className="lg:w-80 space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><Star size={16} className="text-[var(--pf-orange)]" /> Singles</h2>
              <div className="space-y-2">
                {SINGLES.map((track: any) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack({ ...track, duration: typeof track.duration === 'string' ? track.duration.split(':').reduce((a: number, p: string) => (60 * a) + parseInt(p), 0) : track.duration || 180 } as any)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]' : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden relative shrink-0">
                      <Image src={track.image} alt={track.title} fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{track.album}</p>
                    </div>
                    <button className="w-7 h-7 rounded-full bg-[var(--pf-orange)] flex items-center justify-center shrink-0">
                      {currentTrack?.id === track.id && isPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white ml-0.5" />}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={playSingles} className="w-full py-2.5 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors text-sm flex items-center justify-center gap-2">
                <Play size={14} /> Play All Singles
              </button>
            </div>
          </div>
        )}

        {/* STORE TAB */}
        {activeTab === 'store' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Package size={20} className="text-[var(--pf-orange)]" /> Artist Store</h2>
              <Link href="/marketplace" className="text-[var(--pf-orange)] hover:underline text-sm flex items-center gap-1">
                View All <ExternalLink size={12} />
              </Link>
            </div>
            {artistMerch.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {artistMerch.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors group">
                    <div className="aspect-square relative">
                      <Image src={product.image || '/product-placeholder.jpg'} alt={product.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-2 right-2 bg-[var(--pf-orange)] text-white px-2 py-1 rounded-lg text-sm font-medium">${((product as any).price || 9.99).toFixed(2)}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-[var(--pf-text-muted)]">{(product as any).type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
                <Package size={40} className="mx-auto mb-3 text-[var(--pf-text-muted)]" />
                <p className="text-[var(--pf-text-secondary)]">No products yet</p>
              </div>
            )}
            {isOwner && (
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 border border-[var(--pf-orange)]/20">
                <h3 className="font-bold mb-2">Sell Your Own Merch</h3>
                <p className="text-[var(--pf-text-secondary)] text-sm mb-4">Add your own products to the store. Print-on-demand — no inventory needed.</p>
                <Link href="/dashboard/add-product" className="pf-btn pf-btn-primary inline-flex items-center gap-2 text-sm">
                  <Plus size={16} /> Add Product
                </Link>
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Music Videos</h2>
              {artistData.youtube_url && (
                <a href={artistData.youtube_url} target="_blank" rel="noopener" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm">
                  <Youtube size={16} /> YouTube Channel
                </a>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {MUSIC_VIDEOS.map((video, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[var(--pf-border)]">
                  <div className="aspect-video bg-[var(--pf-surface)]">
                    <iframe src={`https://www.youtube.com/embed/${video.youtubeId}`} title={video.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                  <div className="p-4 bg-[var(--pf-surface)]">
                    <h3 className="font-medium text-sm">{video.title}</h3>
                    <p className="text-xs text-[var(--pf-text-muted)]">{video.album}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-6">
            {artistData.bio && (
              <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                <h2 className="text-xl font-bold mb-4">About {artistData.name}</h2>
                <p className="text-[var(--pf-text-secondary)] leading-relaxed">{artistData.bio}</p>
                {artistData.website && (
                  <a href={artistData.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 mt-4 text-[var(--pf-orange)] hover:underline text-sm">
                    <Globe size={14} /> {artistData.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Music size={20} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-xl font-bold">{displayTracks.length}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Tracks</p>
                </div>
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Package size={20} className="text-[var(--pf-orange)] mx-auto mb-1" />
                  <p className="text-xl font-bold">{orderedAlbums.length}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Albums</p>
                </div>
                <div className="text-center p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Users size={20} className="text-blue-400 mx-auto mb-1" />
                  <p className="text-xl font-bold">{artistData.supporters || '—'}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Supporters</p>
                </div>
              </div>
            </div>

            {/* Mission (Porterful founder specific) */}
            {params.id === 'od-porter' && (
              <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-xl p-6 border border-[var(--pf-orange)]/20">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Star size={16} className="text-[var(--pf-orange)]" /> Founder's Mission
                </h3>
                <blockquote className="border-l-4 border-[var(--pf-orange)] pl-4 italic text-[var(--pf-text-secondary)]">
                  "I built Porterful because I was tired of watching artists get pennies while platforms got rich. Every purchase here puts real money in artists' pockets — 80% goes directly to them."
                </blockquote>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
