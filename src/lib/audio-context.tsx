'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

// ─── DEBUG LOGGING ────────────────────────────────────────────────────────────
const DEBUG = true; // TEMP: Enable for track switch debugging
function log(event: string, data?: any) {
  if (typeof window !== 'undefined') {
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
  isLoading: boolean;
  error: string | null;
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
  clearError: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const preloadRef = useRef<HTMLAudioElement | null>(null);

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

    // Create a hidden preload audio element for next-track preloading
    preloadRef.current = new Audio();
    preloadRef.current.volume = 0; // silent preload
    preloadRef.current.preload = 'metadata';

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
        preloadNextTrack();
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
    // Do NOT auto-play here. Playback is initiated explicitly by playTrack
    // (and by playNext/playPrev/ended/togglePlay). Auto-playing from canplay
    // races with those callers and causes a double-tap / double-play bug.
    const handleCanPlay = () => {
      try {
        if (!audioRef.current) return;
        const current = currentTrackRef.current;
        if (!current) return;
        log('canplay', current.id);
        if (mode === 'radio') {
          startPreviewTimer(audioRef.current.duration);
        }
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
      if (preloadRef.current) {
        preloadRef.current.src = '';
        preloadRef.current = null;
      }
    };
  }, [mode]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // REMOVED: Auto-source update useEffect that was causing double-play issues
  // playTrack now handles src assignment directly within the click event path
  // This prevents race conditions where useEffect would trigger load()
  // immediately after playTrack had already set things up

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

  // ─── SAFE AUDIO RESET ──────────────────────────────────────────────────────
  const resetAudioState = useCallback(() => {
    if (!audioRef.current) return;
    
    log('resetAudioState');
    const audio = audioRef.current;
    
    // Clear any temporary handlers that might be stuck
    audio.oncanplay = null;
    audio.onerror = null;
    audio.onloadeddata = null;
    
    // Pause current playback
    try {
      audio.pause();
    } catch (e) {
      // Ignore pause errors
    }
    
    // Clear error state
    setError(null);
  }, []);

  // ─── PLAY TRACK (FIXED FOR STUCK STATE) ────────────────────────────────────
  const playTrack = useCallback((track: Track) => {
    log('playTrack called', { trackId: track.id, title: track.title, audioUrl: track.audio_url });
    
    try {
      if (!audioRef.current) {
        logError('playTrack', 'No audio element');
        setError('Audio player not initialized');
        return;
      }
      
      const audio = audioRef.current;
      
      // STEP 1: Reset everything first
      resetAudioState();
      setIsLoading(true);
      setError(null);
      
      // STEP 2: Update track state
      setCurrentTrack(track);
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx >= 0) setCurrentIndex(idx);
      setProgress(0);
      setDuration(0);
      
      // STEP 3: Validate audio URL
      if (!track.audio_url) {
        logError('playTrack', 'No audio_url for track', { trackId: track.id });
        setIsLoading(false);
        setError('No audio source available');
        return;
      }
      
      // STEP 4: Clear src first to force unload
      audio.src = '';
      
      // STEP 5: Set new src and attach one-time handlers
      let playAttempted = false;
      
      audio.oncanplay = () => {
        log('oncanplay fired', { 
          trackId: track.id, 
          readyState: audio.readyState,
          networkState: audio.networkState,
          duration: audio.duration 
        });
        setDuration(audio.duration || 0);
        
        if (!playAttempted) {
          playAttempted = true;
          log('Attempting play inside click path', { trackId: track.id });
          
          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                log('Play succeeded', { trackId: track.id });
                setIsLoading(false);
                setIsPlaying(true);
              })
              .catch((err: any) => {
                logError('Play failed', err, { 
                  trackId: track.id,
                  name: err?.name,
                  message: err?.message 
                });
                setIsLoading(false);
                setIsPlaying(false);
                
                // Safari/Chrome specific handling
                if (err?.name === 'NotAllowedError') {
                  setError('Click play again to start audio');
                } else if (err?.name === 'AbortError') {
                  // Play was aborted - new track clicked before old one loaded
                  log('Play aborted (new track clicked)', { trackId: track.id });
                } else {
                  setError('Failed to play: ' + (err?.message || 'Unknown error'));
                }
              });
          }
        }
      };
      
      audio.onerror = () => {
        const errCode = audio.error?.code;
        const errMsg = audio.error?.message || 'Unknown';
        logError('Audio error event', { code: errCode, message: errMsg }, { 
          trackId: track.id,
          src: track.audio_url 
        });
        setIsLoading(false);
        setIsPlaying(false);
        
        const errorMessages: Record<number, string> = {
          1: 'Audio loading aborted',
          2: 'Network error - check connection',
          3: 'Audio decode error - file may be corrupted',
          4: 'Audio format not supported'
        };
        setError(errorMessages[errCode || 0] || `Audio error: ${errMsg}`);
      };
      
      audio.onloadeddata = () => {
        log('loadeddata fired', { trackId: track.id, duration: audio.duration });
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };
      
      // STEP 6: Set src and call load()
      audio.src = track.audio_url;
      audio.load();
      
      log('Audio src set and load() called', { 
        trackId: track.id,
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
      
    } catch (err) {
      logError('playTrack exception', err, { trackId: track.id });
      setIsLoading(false);
      setIsPlaying(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [queue, resetAudioState]);

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
        setIsPlaying(false);
      } else if (currentTrack?.audio_url) {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err: any) => {
            logError('togglePlay.play().catch', err);
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    } catch (err) {
      logError('togglePlay', err);
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    try {
      audioRef.current?.pause();
      setIsPlaying(false);
    } catch (err) {
      logError('pause', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ─── PLAY NEXT (FIXED) ─────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    try {
      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) {
        log('playNext: empty queue');
        return;
      }
      
      const currentIdx = currentIndexRef.current;
      const nextIdx = (currentIdx + 1) % currentQueue.length;
      const track = currentQueue[nextIdx];
      
      if (track) {
        log('playNext switching', { 
          from: currentTrackRef.current?.id, 
          to: track.id,
          nextIdx 
        });
        playTrack(track);
      }
    } catch (err) {
      logError('playNext', err);
    }
  }, [playTrack]);

  // ─── PLAY PREV (FIXED) ───────────────────────────────────────────────────────
  const playPrev = useCallback(() => {
    try {
      if (audioRef.current && audioRef.current.currentTime > 3) {
        // Just restart current track if > 3s in
        audioRef.current.currentTime = 0;
        setProgress(0);
        return;
      }
      
      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) {
        log('playPrev: empty queue');
        return;
      }
      
      const currentIdx = currentIndexRef.current;
      const prevIdx = (currentIdx - 1 + currentQueue.length) % currentQueue.length;
      const track = currentQueue[prevIdx];
      
      if (track) {
        log('playPrev switching', { 
          from: currentTrackRef.current?.id, 
          to: track.id,
          prevIdx 
        });
        playTrack(track);
      }
    } catch (err) {
      logError('playPrev', err);
    }
  }, [playTrack]);

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

  // ─── SMART PRELOAD ───────────────────────────────────────────────────────
  const preloadNextTrack = useCallback(() => {
    try {
      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) return;
      const currentIdx = currentIndexRef.current;
      const nextIdx = (currentIdx + 1) % currentQueue.length;
      const nextTrack = currentQueue[nextIdx];
      if (nextTrack && nextTrack.audio_url && preloadRef.current) {
        log('preloading next track', nextTrack.id);
        preloadRef.current.src = nextTrack.audio_url;
        preloadRef.current.load();
      }
    } catch (err) {
      logError('preloadNextTrack', err);
    }
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
      currentTrack, isPlaying, isLoading, error, volume, progress, duration, mode, setMode,
      playTrack, loadTrack, togglePlay, pause, playNext, playPrev,
      setVolume, seek, clearError, queue, setQueue, currentIndex, purchasedTracks,
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
    currentTrack: null, isPlaying: false, isLoading: false, error: null, volume: 80, progress: 0, duration: 0,
    mode: 'track' as const, setMode: () => {},
    playTrack: () => {}, loadTrack: () => {}, togglePlay: () => {}, pause: () => {},
    playNext: () => {}, playPrev: () => {}, setVolume: () => {}, seek: () => {}, clearError: () => {},
    queue: [], setQueue: () => {}, currentIndex: -1, purchasedTracks: new Set<string>(),
    addPurchased: () => {}, hasPurchased: () => false,
  };
  return ctx;
}
