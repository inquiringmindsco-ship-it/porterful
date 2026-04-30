'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Download, Mail, Music, ArrowRight, Play, Loader2 } from 'lucide-react';
import { useAudio } from '@/lib/audio-context';
import { TRACKS } from '@/lib/data'
import { loadPlaybackSnapshot, clearPlaybackSnapshot } from '@/lib/playback-persistence';

interface PurchasedTrack {
  id: string;
  name: string;
  artist: string;
  audioUrl: string;
  image?: string;
  album?: string | null;
  downloadUrl?: string;
  storagePath?: string;
}

interface OrderDetails {
  orderId: string;
  customerEmail: string;
  paymentStatus: string;
  tracks: PurchasedTrack[];
}

function resolvePurchasedTrack(track: PurchasedTrack): PurchasedTrack {
  const existingAudioUrl = track.audioUrl || (track as any).audio_url;
  if (existingAudioUrl?.trim()) {
    return {
      ...track,
      audioUrl: existingAudioUrl,
    };
  }

  const catalogTrack = TRACKS.find((candidate) => (
    candidate.id === track.id
    || (candidate.title === track.name && candidate.artist === track.artist)
  ))

  if (!catalogTrack?.audio_url) return track;

  return {
    ...track,
    audioUrl: catalogTrack.audio_url,
  };
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const audio = useAudio();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoredPlayback, setRestoredPlayback] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Restore playback state on mount
  useEffect(() => {
    const snapshot = loadPlaybackSnapshot();
    if (snapshot?.currentTrack && !restoredPlayback) {
      const resolvedQueue = snapshot.queue.map((track) => resolvePurchasedTrack({
        id: track.id,
        name: track.title,
        artist: track.artist,
        audioUrl: track.audioUrl,
        image: track.image,
      })).filter((track) => track.audioUrl?.trim());

      const resolvedCurrentTrack = resolvePurchasedTrack({
        id: snapshot.currentTrack.id,
        name: snapshot.currentTrack.title,
        artist: snapshot.currentTrack.artist,
        audioUrl: snapshot.currentTrack.audioUrl,
        image: snapshot.currentTrack.image,
        album: snapshot.currentTrack.album,
      });

      if (!resolvedCurrentTrack.audioUrl?.trim()) {
        clearPlaybackSnapshot();
        setRestoredPlayback(true);
        return;
      }

      // Restore queue first
      if (resolvedQueue.length > 0) {
        audio.setQueue(resolvedQueue.map(t => ({
          id: t.id,
          title: t.name,
          artist: t.artist,
          audio_url: t.audioUrl || '',
          image: t.image,
        })));
      }
      
      // Restore current track without auto-playing
      audio.loadTrack({
        id: resolvedCurrentTrack.id,
        title: resolvedCurrentTrack.name,
        artist: resolvedCurrentTrack.artist,
        audio_url: resolvedCurrentTrack.audioUrl || '',
        image: resolvedCurrentTrack.image,
        album: resolvedCurrentTrack.album,
      });
      
      // Restore volume
      audio.setVolume(snapshot.volume);
      
      // Seek to saved position (seconds)
      if (snapshot.currentTime > 0) {
        setTimeout(() => {
          audio.seek(snapshot.currentTime);
        }, 100);
      }
      
      setRestoredPlayback(true);
    }
  }, [audio, restoredPlayback]);

  // Fetch order details
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const demo = searchParams.get('demo');

    if (demo) {
      setOrder({
        orderId: `ORD-${Date.now().toString(36).toUpperCase().slice(0, 8)}`,
        customerEmail: 'demo@porterful.com',
        paymentStatus: 'paid',
        tracks: [{
          id: 'demo-track',
          name: 'Demo Track',
          artist: 'O D Porter',
          audioUrl: '',
        }],
      });
      setLoading(false);
      return;
    }

    if (!sessionId) {
      router.push('/');
      return;
    }

    // Fetch session metadata from our API
    fetch(`/api/session/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        const tracks: PurchasedTrack[] = [];
        
        if (Array.isArray(data.items) && data.items.length > 0) {
          tracks.push(...data.items.map((item: any) => ({
            id: item.id || `track-${Date.now()}`,
            name: item.name || item.title || 'Unknown Track',
            artist: item.artist || 'Unknown Artist',
            audioUrl: item.audioUrl || item.audio_url || '',
            downloadUrl: item.downloadUrl,
            storagePath: item.storagePath,
          })));
        } else if (data.item?.name) {
          tracks.push({
            id: data.item.id || `track-${Date.now()}`,
            name: data.item.name || data.item.title,
            artist: data.item.artist || 'Unknown Artist',
            audioUrl: data.item.audioUrl || data.item.audio_url || '',
            downloadUrl: data.item.downloadUrl,
            storagePath: data.item.storagePath,
          });
        }

        setOrder({
          orderId: sessionId.slice(-12).toUpperCase(), // Truncated for mobile
          customerEmail: data.customerEmail || '',
          paymentStatus: data.paymentStatus || 'paid',
          tracks,
        });
        setLoading(false);
        
        // Clear playback snapshot after successful load
        clearPlaybackSnapshot();
      })
      .catch(() => {
        setLoadError('We confirmed your payment. Your music is ready.');
        setLoading(false);
      });
  }, [searchParams, router]);

  const handlePlayTrack = useCallback((track: PurchasedTrack) => {
    if (!track.audioUrl) return;
    
    audio.playTrack({
      id: track.id,
      title: track.name,
      artist: track.artist,
      audio_url: track.audioUrl,
      image: '',
    });
    setIsResuming(true);
    setTimeout(() => setIsResuming(false), 500);
  }, [audio]);

  const handleResumePlayback = useCallback(() => {
    if (audio.currentTrack && !audio.isPlaying) {
      audio.togglePlay();
      setIsResuming(true);
      setTimeout(() => setIsResuming(false), 500);
    }
  }, [audio]);

  const handleDownload = useCallback(async (track: PurchasedTrack) => {
    if (!track.storagePath && !track.downloadUrl) return;
    
    setDownloadingId(track.id);
    try {
      // If we have a storage path, fetch signed URL from API
      if (track.storagePath) {
        const res = await fetch(`/api/music/download?path=${encodeURIComponent(track.storagePath)}`);
        const data = await res.json();
        if (data.url) {
          // Trigger download
          const a = document.createElement('a');
          a.href = data.url;
          a.download = `${track.artist} - ${track.name}.mp3`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else if (track.downloadUrl) {
        // Direct download URL
        const a = document.createElement('a');
        a.href = track.downloadUrl;
        a.download = `${track.artist} - ${track.name}.mp3`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Download failed:', e);
    }
    setDownloadingId(null);
  }, []);

  const handleEmailAccess = useCallback(async () => {
    if (!order?.customerEmail) return;
    
    try {
      await fetch('/api/music/email-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.customerEmail,
          orderId: order.orderId,
        }),
      });
      setEmailSent(true);
    } catch (e) {
      console.error('Failed to send email:', e);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-8 border border-[var(--pf-border)]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[var(--pf-bg)] mb-4" />
              <div className="h-6 bg-[var(--pf-bg)] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[var(--pf-bg)] rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const truncatedOrderId = order?.orderId 
    ? `${order.orderId.slice(0, 8)}...${order.orderId.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Success Card */}
        <div className="bg-[var(--pf-surface)] rounded-2xl p-6 border border-[var(--pf-border)]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="text-green-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-1">Payment Successful!</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">
              Thank you for supporting independent artists.
            </p>
            {order?.orderId && (
              <p className="text-xs text-[var(--pf-text-muted)] mt-2 font-mono">
                Order: {truncatedOrderId}
              </p>
            )}
          </div>

          {/* Purchased Tracks */}
          {order?.tracks && order.tracks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[var(--pf-text-muted)] uppercase tracking-wider mb-3">
                Your Music
              </h2>
              <div className="space-y-3">
                {order.tracks.map((track) => (
                  <div 
                    key={track.id}
                    className="bg-[var(--pf-bg)] rounded-xl p-3 flex items-center gap-3"
                  >
                    {/* Track Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center shrink-0">
                      <Music size={20} className="text-white" />
                    </div>
                    
                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-[var(--pf-text-muted)] truncate">{track.artist}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="p-2 rounded-lg bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/30 transition-colors"
                        aria-label="Play track"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>

                      {/* Download Button */}
                      {(track.storagePath || track.downloadUrl) && (
                        <button
                          onClick={() => handleDownload(track)}
                          disabled={downloadingId === track.id}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          aria-label="Download MP3"
                        >
                          {downloadingId === track.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Playback Button (if was playing) */}
          {restoredPlayback && audio.currentTrack && !audio.isPlaying && (
            <button
              onClick={handleResumePlayback}
              disabled={isResuming}
              className="w-full mb-4 py-3 rounded-xl bg-[var(--pf-orange)] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              {isResuming ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  Resume Playback
                </>
              )}
            </button>
          )}

          {/* Email Access */}
          {order?.customerEmail && (
            <div className="mb-6">
              <button
                onClick={handleEmailAccess}
                disabled={emailSent}
                className="w-full py-3 rounded-xl border border-[var(--pf-border)] font-medium flex items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors disabled:opacity-50"
              >
                <Mail size={18} />
                {emailSent ? 'Access Link Sent!' : 'Access by Email'}
              </button>
              <p className="text-xs text-[var(--pf-text-muted)] text-center mt-2">
                {order.customerEmail}
              </p>
            </div>
          )}

          {/* Error State */}
          {loadError && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-sm text-yellow-400">{loadError}</p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                Your purchase is confirmed. Check your email for download links.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Link 
              href="/music" 
              className="w-full py-3 rounded-xl bg-[var(--pf-orange)] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              <Music size={18} />
              Browse More Music
            </Link>
            <Link 
              href="/store" 
              className="w-full py-3 rounded-xl border border-[var(--pf-border)] font-medium flex items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors"
            >
              Shop Artists
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-8 border border-[var(--pf-border)]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[var(--pf-bg)] mb-4" />
              <div className="h-6 bg-[var(--pf-bg)] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[var(--pf-bg)] rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
