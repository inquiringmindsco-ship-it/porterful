'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';
import { useAudio } from '@/lib/audio-context';
import { TRACKS } from '@/lib/data';
import { PRODUCTS } from '@/lib/products';
import { getArtistById } from '@/lib/artists';
import {
  Play, Pause, Share2, Music, Package, ChevronDown, ChevronUp,
  Youtube, ExternalLink, Bell, Check, Edit3, MapPin, Globe,
  Instagram, Twitter, Star, Users, Plus, Music2 as TikTokIcon, Crown, Heart
} from 'lucide-react';

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
  const [coverSlideIndex, setCoverSlideIndex] = useState(0);
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
          // Clean up bad DB data — prefer staticArtist data when DB is incomplete/wrong
          const dbGenre = data.profile.genre || ''
          const dbBio = data.profile.bio || ''
          const dbLocation = data.profile.location || ''

          // Fix genre if stored as JSON array string like ["Hip-Hop","R&B"]
          let cleanGenre = dbGenre
          if (dbGenre.startsWith('[')) {
            try {
              const parsed = JSON.parse(dbGenre)
              cleanGenre = Array.isArray(parsed) ? parsed.join(', ') : dbGenre
            } catch {
              cleanGenre = dbGenre.replace(/[\[\]"]/g, '')
            }
          }

          // If bio or location is too short/incomplete, use staticArtist
          const fullBio = staticArtist?.bio || ''
          const useBio = dbBio.length < fullBio.length ? (fullBio || dbBio) : dbBio
          const useLocation = dbLocation.length < (staticArtist?.location?.length || 0) ? (staticArtist?.location || dbLocation) : dbLocation

          // Build social URLs from static data or raw DB data
            const instagramHandle = data.profile.instagram_url || staticArtist?.social?.instagram || ''
            const twitterHandle = data.profile.twitter_url || staticArtist?.social?.twitter || ''
            const youtubeHandle = data.profile.youtube_url || staticArtist?.social?.youtube || ''
            const tiktokHandle = staticArtist?.social?.tiktok || ''

            setArtistData({
              name: data.profile.full_name || data.profile.name || staticArtist?.name,
              bio: useBio,
              shortBio: data.profile.short_bio || staticArtist?.shortBio || '',
              genre: cleanGenre || staticArtist?.genre || '',
              location: useLocation || staticArtist?.location || '',
              verified: data.profile.verified || staticArtist?.verified || false,
              avatar_url: data.profile.avatar_url || staticArtist?.image || null,
              cover_url: data.profile.cover_url || null,
              website: data.profile.website || staticArtist?.social?.website || null,
              social: {
                instagram: instagramHandle ? (instagramHandle.startsWith('http') ? instagramHandle : `https://instagram.com/${instagramHandle}`) : null,
                twitter: twitterHandle ? (twitterHandle.startsWith('http') ? twitterHandle : `https://twitter.com/${twitterHandle}`) : null,
                youtube: youtubeHandle ? (youtubeHandle.startsWith('http') ? youtubeHandle : `https://youtube.com/${youtubeHandle.replace('@', '')}`) : null,
                tiktok: tiktokHandle ? `https://tiktok.com/@${tiktokHandle.replace('@', '')}` : null,
                website: data.profile.website || staticArtist?.social?.website || null,
              },
              // Preserve staticArtist coverSlides if DB doesn't have them
              coverSlides: data.profile.coverSlides || staticArtist?.coverSlides || null,
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

  // Auto-advance cover slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCoverSlideIndex(i => (i + 1) % 2)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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

  const displayTracks = TRACKS.filter(t => t.artist === artistData.name);
  const albums = groupTracksByAlbum(displayTracks);
  const albumNames = Object.keys(albums);
  const artistMerch = PRODUCTS.filter(p => p.artist === artistData.name).slice(0, 6);

  // Default gradient if no cover image
  const coverStyle = artistData.cover_url
    ? { backgroundImage: `url(${artistData.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, var(--pf-orange) 0%, #7c3aed 100%)` };

  // Avatar initials fallback
  const initials = artistData.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?';

  const playSingles = () => {
    const singles = displayTracks.filter(t => t.album === 'Singles');
    if (!singles.length) return;
    setQueue(singles.map(t => ({
      ...t,
      duration: typeof t.duration === 'string'
        ? t.duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
        : t.duration || 180
    })));
    playTrack({ ...singles[0], duration: typeof singles[0].duration === 'string'
      ? singles[0].duration.split(':').reduce((acc: number, p: string) => (60 * acc) + parseInt(p), 0)
      : singles[0].duration || 180
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
          {/* Fading Slideshow Cover */}
          <div className="h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden relative">
            {/* Artist-specific cover slides, or gradient fallback */}
            {artistData.coverSlides ? (
              artistData.coverSlides.map((slide: { src: string; alt: string; isVideo?: boolean }, i: number) => (
                <div
                  key={slide.src}
                  className="absolute inset-0"
                  style={{ opacity: coverSlideIndex === i ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
                >
                  {slide.isVideo ? (
                    <video
                      src={slide.src.replace('.mp4', '.gif')}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="object-cover w-full h-full"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      sizes="100vw"
                      className={`object-cover ${params.id === 'gune' ? 'animate-ken-burns' : ''}`}
                      priority={i === 0}
                    />
                  )}
                </div>
              ))
            ) : (
              /* Gradient banner for artists without custom cover */
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--pf-orange) 0%, #7c3aed 100%)` }} />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {/* Slide indicators - only show when multiple slides */}
            {artistData.coverSlides && artistData.coverSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {artistData.coverSlides.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCoverSlideIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${coverSlideIndex === i ? 'bg-white w-6' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
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
                {/* Social icons next to name */}
                <div className="flex items-center gap-1.5 ml-1">
                  {artistData.social?.instagram && (
                    <a href={`https://instagram.com/${artistData.social.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors" title="Instagram">
                      <Instagram size={16} className="text-pink-400" />
                    </a>
                  )}
                  {artistData.social?.twitter && (
                    <a href={`https://twitter.com/${artistData.social.twitter.replace('@', '')}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors" title="Twitter/X">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {artistData.social?.youtube && (
                    <a href={`https://youtube.com/${artistData.social.youtube.replace('@', '')}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors" title="YouTube">
                      <Youtube size={16} className="text-red-500" />
                    </a>
                  )}
                  {artistData.social?.tiktok && (
                    <a href={`https://tiktok.com/@${artistData.social.tiktok.replace('@', '')}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors" title="TikTok">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.26 8.26 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1-.09z"/></svg>
                    </a>
                  )}
                </div>
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
                {albumNames.filter(n => n !== 'Singles').length > 0 && (
                  <div className="text-center">
                    <p className="text-xl font-bold">{albumNames.filter(n => n !== 'Singles').length}</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">Albums</p>
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
              {/* Unlock full access banner */}
              <Link href="/unlock" className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors">
                <Heart size={11} className="text-[var(--pf-orange-dark)]" />
                <span>Experience Porterful to the fullest — <span className="underline">Contribute</span></span>
              </Link>
            </div>

            {/* Social links */}
            {(artistData.social?.instagram || artistData.social?.twitter || artistData.social?.youtube || artistData.social?.tiktok || artistData.social?.website) && (
              <div className="flex flex-wrap gap-2 pb-2">
                {artistData.social?.youtube && (
                  <a href={`https://youtube.com/${artistData.social.youtube.replace('@', '')}`} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-red-500 transition-colors">
                    <Youtube size={16} className="text-red-500" />
                  </a>
                )}
                {artistData.social?.instagram && (
                  <a href={`https://instagram.com/${artistData.social.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-pink-500 transition-colors">
                    <Instagram size={16} className="text-pink-400" />
                  </a>
                )}
                {artistData.social?.twitter && (
                  <a href={`https://twitter.com/${artistData.social.twitter.replace('@', '')}`} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-blue-500 transition-colors">
                    <Twitter size={16} className="text-blue-400" />
                  </a>
                )}
                {artistData.social?.tiktok && (
                  <a href={`https://tiktok.com/@${artistData.social.tiktok.replace('@', '')}`} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-pink-600 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.26 8.26 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1-.09z"/></svg>
                  </a>
                )}
                {artistData.social?.website && (
                  <a href={artistData.social?.website} target="_blank" rel="noopener" className="p-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-[var(--pf-orange)] transition-colors">
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
          <div>
            {/* Featured Singles — show FIRST */}
            {displayTracks.filter(t => t.album === 'Singles').length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><Star size={16} className="text-[var(--pf-orange)]" /> Featured Singles</h2>
                <div className="space-y-2">
                  {displayTracks.filter(t => t.album === 'Singles').map((track: any) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack({ ...track, duration: typeof track.duration === 'string' ? track.duration.split(':').reduce((a: number, p: string) => (60 * a) + parseInt(p), 0) : track.duration || 180 } as any)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]' : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden relative shrink-0">
                        <Image src={track.image || artistData.image} alt={track.title} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                        <p className="text-xs text-[var(--pf-text-muted)]">{track.album !== 'Singles' ? track.album : artistData.name}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-medium text-[var(--pf-orange)]">${track.price}</span>
                        <button className="w-7 h-7 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                          {currentTrack?.id === track.id && isPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={playSingles} className="mt-4 w-full py-3 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors text-sm flex items-center justify-center gap-2">
                  <Play size={14} /> Play All Tracks
                </button>
              </div>
            )}

            {/* Albums — show AFTER Singles */}
            {albumNames.filter(n => n !== 'Singles').length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2"><Music size={18} className="text-[var(--pf-orange)]" /> Albums</h2>
                {albumNames.filter(n => n !== 'Singles').map(albumName => {
                  const albumTracks = albums[albumName];
                  if (!albumTracks?.length) return null;
                  const isExpanded = expandedAlbums[albumName];
                  const albumArt = albumTracks[0]?.image || artistData.image;

                  return (
                    <div key={albumName} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)]">
                      <button
                        onClick={() => setExpandedAlbums(prev => ({ ...prev, [albumName]: !prev[albumName] }))}
                        className="w-full flex items-center gap-4 p-4 hover:bg-[var(--pf-bg)] transition-colors text-left"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                          <Image src={albumArt} alt={albumName} fill sizes="56px" className="object-cover" />
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
            ) : null}
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
              {artistData.social?.youtube && (
                <a href={`https://youtube.com/${artistData.social.youtube.replace('@', '')}`} target="_blank" rel="noopener" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm">
                  <Youtube size={16} /> YouTube Channel
                </a>
              )}
            </div>
            {artistData.videos && artistData.videos.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {artistData.videos.map((video: { youtubeId: string; title: string; album?: string }, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-[var(--pf-border)]">
                    <div className="aspect-video bg-[var(--pf-surface)]">
                      <iframe src={`https://www.youtube.com/embed/${video.youtubeId}`} title={video.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                    <div className="p-4 bg-[var(--pf-surface)]">
                      <h3 className="font-medium text-sm">{video.title}</h3>
                      {video.album && <p className="text-xs text-[var(--pf-text-muted)]">{video.album}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
                <Youtube size={40} className="mx-auto mb-3 text-[var(--pf-text-muted)]" />
                <p className="text-[var(--pf-text-secondary)]">No videos yet</p>
              </div>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-6">
            {artistData.bio && (
              <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                <h2 className="text-xl font-bold mb-4">About {artistData.name}</h2>
                <p className="text-[var(--pf-text-secondary)] leading-relaxed">{artistData.bio}</p>
                {artistData.social?.website && (
                  <a href={artistData.social?.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 mt-4 text-[var(--pf-orange)] hover:underline text-sm">
                    <Globe size={14} /> {artistData.social?.website.replace(/^https?:\/\//, '')}
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
