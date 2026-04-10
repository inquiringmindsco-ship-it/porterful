'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

// ─── DEBUG LOGGING ────────────────────────────────────────────────────────────
const DEBUG = false;
function log(event: string, data?: any) {
  if (DEBUG || typeof window !== 'undefined') {
    const tag = '%c[AUDIO]';
    const style = 'background:#FF6B2B;color:white;padding:2px 6px;border-radius:3px';
    if (data !== undefined) {
      console.log(tag, event, data, style);
    } else {
      console.log(tag, event, style);
    }
  }
}

function logError(context: string, error: any, extra?: any) {
  const msg = error?.message || String(error);
  console.error(`[AUDIO ERROR] ${context}:`, msg, extra || '');
  if (typeof window !== 'undefined') {
    // Surface to window for external monitoring
    (window as any).__audioErrors = (window as any).__audioErrors || [];
    (window as any).__audioErrors.push({ context, error: msg, time: Date.now(), extra });
  }
}

// ─── TRACK TYPE ───────────────────────────────────────────────────────────────
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration?: string | number;
  audio_url?: string;
  cover_url?: string;
  image?: string;
  plays?: number;
  price?: number;
}

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
interface AudioContext {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  mode: 'track' | 'radio' | 'artist';
  setMode: (mode: 'track' | 'radio' | 'artist') => void;
  playTrack: (track: Track) => void;
  loadTrack: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (v: number) => void;
  seek: (p: number) => void;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  currentIndex: number;
  purchasedTracks: Set<string>;
  addPurchased: (trackId: string) => void;
  hasPurchased: (trackId: string) => boolean;
}

const AudioCtx = createContext<AudioContext | null>(null);

// ─── AUDIO PROVIDER ───────────────────────────────────────────────────────────
export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [mode, setMode] = useState<'track' | 'radio' | 'artist'>('track');
  const [purchasedTracks, setPurchasedTracks] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const currentTrackRef = useRef<Track | null>(null);
  const purchasedTracksRef = useRef<Set<string>>(new Set());

  // Keep refs in sync
  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
  }, [queue, currentIndex]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    purchasedTracksRef.current = purchasedTracks;
  }, [purchasedTracks]);

  // Create audio element on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    log('Creating Audio element');
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume / 100;
    audio.preload = 'auto';

    let previewTimer: ReturnType<typeof setTimeout> | null = null;

    const clearPreviewTimer = () => {
      if (previewTimer) {
        clearTimeout(previewTimer);
        previewTimer = null;
      }
    };

    // ─── EVENT: timeupdate ───────────────────────────────────────────────────
    const handleTimeUpdate = () => {
      try {
        if (!audioRef.current || !audio.duration) return;
        const pct = (audioRef.current.currentTime / audio.duration) * 100;
        setProgress(isNaN(pct) ? 0 : pct);

        const current = currentTrackRef.current;
        if (current && !purchasedTracksRef.current.has(current.id) && audioRef.current.currentTime >= 99) {
          const currentQueue = queueRef.current;
          const currentIdx = currentIndexRef.current;
          if (currentQueue.length > 0) {
            const nextIdx = (currentIdx + 1) % currentQueue.length;
            const nextTrack = currentQueue[nextIdx];
            if (nextTrack) {
              log('Auto-skipping unplayed track', nextTrack.id);
              setCurrentIndex(nextIdx);
              setCurrentTrack(nextTrack);
              setProgress(0);
              audioRef.current.src = nextTrack.audio_url || '';
              audioRef.current.load();
              audioRef.current.play().catch(() => {});
            }
          } else {
            audioRef.current.pause();
          }
        }
      } catch (err) {
        logError('timeupdate', err);
      }
    };

    // ─── EVENT: loadedmetadata ────────────────────────────────────────────────
    const handleLoadedMetadata = () => {
      try {
        log('loadedmetadata', audio.duration);
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      } catch (err) {
        logError('loadedmetadata', err);
      }
    };

    // ─── EVENT: error ───────────────────────────────────────────────────────
    const handleAudioError = () => {
      try {
        const err = audioRef.current?.error;
        logError('audio.error', err, {
          currentTrack: currentTrackRef.current?.id,
          src: audioRef.current?.src,
        });
      } catch (err) {
        logError('handleAudioError', err);
      }
    };

    // ─── EVENT: ended ───────────────────────────────────────────────────────
    const handleEnded = () => {
      try {
        log('track.ended');
        clearPreviewTimer();
        const currentQueue = queueRef.current;
        const currentIdx = currentIndexRef.current;
        if (currentQueue.length > 0) {
          const nextIdx = (currentIdx + 1) % currentQueue.length;
          const nextTrackItem = currentQueue[nextIdx];
          if (nextTrackItem) {
            log('Playing next track', nextTrackItem.id);
            setCurrentIndex(nextIdx);
            setCurrentTrack(nextTrackItem);
            setProgress(0);
            if (audioRef.current && nextTrackItem.audio_url) {
              audioRef.current.src = nextTrackItem.audio_url;
              audioRef.current.load();
              audioRef.current.play().catch(() => {});
            }
          }
        }
      } catch (err) {
        logError('ended', err);
      }
    };

    // ─── EVENT: play ────────────────────────────────────────────────────────
    const handlePlay = () => {
      try {
        setIsPlaying(true);
      } catch (err) {
        logError('play', err);
      }
    };

    // ─── EVENT: pause ───────────────────────────────────────────────────────
    const handlePause = () => {
      try {
        setIsPlaying(false);
      } catch (err) {
        logError('pause', err);
      }
    };

    // ─── EVENT: canplay ─────────────────────────────────────────────────────
    const handleCanPlay = () => {
      try {
        if (!audioRef.current) return;
        const current = currentTrackRef.current;
        if (!current || !current.audio_url) return;

        log('canplay', current.id);

        // Normalize URLs for comparison
        const expectedAudioUrl = current.audio_url.startsWith('http')
          ? current.audio_url
          : `${window.location.origin}${current.audio_url}`;

        const currentSrc = audioRef.current.src;
        const currentSrcNormalized = currentSrc.startsWith('http')
          ? currentSrc
          : `${window.location.origin}${currentSrc}`;

        const srcMatches =
          currentSrcNormalized === expectedAudioUrl
          || currentSrcNormalized.endsWith(current.audio_url)
          || (current.audio_url.split('/').pop() &&
              currentSrcNormalized.endsWith(current.audio_url.split('/').pop()!));

        if (!srcMatches) {
          log('canplay blocked — src mismatch', {
            currentSrc: audioRef.current.src,
            expected: expectedAudioUrl,
            trackId: current.id,
          });
          return;
        }

        clearPreviewTimer();
        audioRef.current.play().catch((err: any) => {
          logError('play().catch', err, { trackId: current.id });
        });
        startPreviewTimer(audioRef.current.duration);
      } catch (err) {
        logError('canplay', err);
      }
    };

    // ─── PREVIEW TIMER ──────────────────────────────────────────────────────
    const startPreviewTimer = (trackDuration: number) => {
      clearPreviewTimer();
      if (mode !== 'radio') return;
      previewTimer = setTimeout(() => {
        try {
          log('Radio preview timer expired');
          const currentQueue = queueRef.current;
          const currentIdx = currentIndexRef.current;
          if (currentQueue.length > 0) {
            const nextIdx = (currentIdx + 1) % currentQueue.length;
            const nextTrackItem = currentQueue[nextIdx];
            if (nextTrackItem) {
              setCurrentIndex(nextIdx);
              setCurrentTrack(nextTrackItem);
              setProgress(0);
              if (audioRef.current && nextTrackItem.audio_url) {
                audioRef.current.src = nextTrackItem.audio_url;
                audioRef.current.load();
                audioRef.current.play().catch(() => {});
              }
            }
          }
        } catch (err) {
          logError('previewTimer', err);
        }
      }, 60000);
    };

    // ─── ATTACH LISTENERS ───────────────────────────────────────────────────
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);

    log('Audio listeners attached');

    // ─── CLEANUP ────────────────────────────────────────────────────────────
    return () => {
      log('Audio cleanup');
      clearPreviewTimer();
      try { audio.pause(); } catch {}
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
      audioRef.current = null;
    };
  }, [mode]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Update audio source when track changes (fallback for manual play)
  useEffect(() => {
    if (audioRef.current && currentTrack?.audio_url) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.load();
    }
  }, [currentTrack]);

  // ─── MEDIA SESSION ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    // KILL SWITCH: skip mediaSession metadata for ATM Trap tracks
    // (ATM Trap avatar MPO format crashes Safari media session API)
    if (currentTrack.artist === 'ATM Trap') return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Unknown Track',
        artist: currentTrack.artist || 'Unknown Artist',
        album: currentTrack.album || 'Porterful',
        artwork: [
          {
            src: currentTrack.image || currentTrack.cover_url || '/album-art/default.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });
    } catch (err) {
      logError('mediaSession.metadata', err, { trackId: currentTrack.id, image: currentTrack.image });
    }
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist, currentTrack?.album, currentTrack?.image]);

  // ─── PLAYBACK CONTROLS ─────────────────────────────────────────────────────
  const playTrack = useCallback((track: Track) => {
    log('playTrack called', track.id);
    try {
      setCurrentTrack(track);
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx >= 0) setCurrentIndex(idx);
      setProgress(0);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = track.audio_url || '';
        audioRef.current.load();
        audioRef.current.play().catch((err: any) => {
          logError('playTrack.play().catch', err, { trackId: track.id });
        });
      }
    } catch (err) {
      logError('playTrack', err, { trackId: track.id });
    }
  }, [queue]);

  const loadTrack = useCallback((track: Track) => {
    log('loadTrack called', track.id);
    try {
      setCurrentTrack(track);
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx >= 0) setCurrentIndex(idx);
      setProgress(0);

      if (audioRef.current && track.audio_url) {
        audioRef.current.src = track.audio_url;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    } catch (err) {
      logError('loadTrack', err, { trackId: track.id });
    }
  }, [queue]);

  const togglePlay = useCallback(() => {
    try {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err: any) => {
          logError('togglePlay.play().catch', err);
        });
      }
    } catch (err) {
      logError('togglePlay', err);
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    try {
      audioRef.current?.pause();
    } catch (err) {
      logError('pause', err);
    }
  }, []);

  const playNext = useCallback(() => {
    try {
      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) return;
      const currentIdx = currentIndexRef.current;
      const nextIdx = (currentIdx + 1) % currentQueue.length;
      const track = currentQueue[nextIdx];
      if (track) {
        log('playNext', track.id);
        setCurrentIndex(nextIdx);
        setCurrentTrack(track);
        setProgress(0);
        if (audioRef.current && track.audio_url) {
          audioRef.current.src = track.audio_url;
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      logError('playNext', err);
    }
  }, []);

  const playPrev = useCallback(() => {
    try {
      if (audioRef.current && audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
        setProgress(0);
        return;
      }
      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) return;
      const currentIdx = currentIndexRef.current;
      const prevIdx = (currentIdx - 1 + currentQueue.length) % currentQueue.length;
      const track = currentQueue[prevIdx];
      if (track) {
        log('playPrev', track.id);
        setCurrentIndex(prevIdx);
        setCurrentTrack(track);
        setProgress(0);
        if (audioRef.current && track.audio_url) {
          audioRef.current.src = track.audio_url;
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      logError('playPrev', err);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    try {
      setVolumeState(v);
      if (audioRef.current) audioRef.current.volume = v / 100;
    } catch (err) {
      logError('setVolume', err);
    }
  }, []);

  const seek = useCallback((p: number) => {
    try {
      if (!audioRef.current || !duration) return;
      audioRef.current.currentTime = (p / 100) * duration;
      setProgress(p);
    } catch (err) {
      logError('seek', err);
    }
  }, [duration]);

  const addPurchased = useCallback((trackId: string) => {
    setPurchasedTracks(prev => {
      const next = new Set<string>();
      prev.forEach(v => next.add(v));
      next.add(trackId);
      return next;
    });
  }, []);

  const hasPurchased = useCallback((trackId: string) => purchasedTracks.has(trackId), [purchasedTracks]);

  // Initialize queue
  useEffect(() => {
    if (queue.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      if (!currentTrack) setCurrentTrack(queue[0]);
    }
  }, [queue, currentIndex, currentTrack]);

  return (
    <AudioCtx.Provider value={{
      currentTrack, isPlaying, volume, progress, duration, mode, setMode,
      playTrack, loadTrack, togglePlay, pause, playNext, playPrev,
      setVolume, seek, queue, setQueue, currentIndex, purchasedTracks,
      addPurchased, hasPurchased,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) return {
    currentTrack: null, isPlaying: false, volume: 80, progress: 0, duration: 0,
    mode: 'track' as const, setMode: () => {},
    playTrack: () => {}, loadTrack: () => {}, togglePlay: () => {}, pause: () => {},
    playNext: () => {}, playPrev: () => {}, setVolume: () => {}, seek: () => {},
    queue: [], setQueue: () => {}, currentIndex: -1, purchasedTracks: new Set<string>(),
    addPurchased: () => {}, hasPurchased: () => false,
  };
  return ctx;
}
