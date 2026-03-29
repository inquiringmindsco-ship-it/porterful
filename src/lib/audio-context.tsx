'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration?: number;
  audio_url?: string;
  cover_url?: string;
  image?: string;
  plays?: number;
  price?: number;
}

interface AudioContext {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (v: number) => void;
  seek: (p: number) => void;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  currentIndex: number;
  isRadio: boolean;
  setIsRadio: (v: boolean) => void;
  purchasedTracks: Set<string>;
  addPurchased: (trackId: string) => void;
  hasPurchased: (trackId: string) => boolean;
}

const AudioCtx = createContext<AudioContext | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isRadio, setIsRadio] = useState(false);
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
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;
      audioRef.current.volume = volume / 100;
      audio.preload = 'auto';

      let previewTimer: ReturnType<typeof setTimeout> | null = null;

      const clearPreviewTimer = () => {
        if (previewTimer) {
          clearTimeout(previewTimer);
          previewTimer = null;
        }
      };

      const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(isNaN(pct) ? 0 : pct);

          // Preview lock: if not purchased and past 90 seconds, skip to next track
          const current = currentTrackRef.current;
          if (current && !purchasedTracksRef.current.has(current.id) && audioRef.current.currentTime >= 99) {
            // Auto-skip to next track
            const currentQueue = queueRef.current;
            const currentIdx = currentIndexRef.current;
            if (currentQueue.length > 0) {
              const nextIdx = (currentIdx + 1) % currentQueue.length;
              const nextTrack = currentQueue[nextIdx];
              if (nextTrack) {
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
        }
      };

      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };

      const handleEnded = () => {
        clearPreviewTimer();
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
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      const startPreviewTimer = (trackDuration: number) => {
        clearPreviewTimer();
        // Radio mode: stop after 60 seconds and skip to next
        if (isRadio) {
          previewTimer = setTimeout(() => {
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
          }, 60000); // 60 seconds
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      // Handle canplay — auto-play when ready
      audio.addEventListener('canplay', () => {
        clearPreviewTimer();
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        // Start radio preview timer after play begins
        if (audioRef.current) {
          startPreviewTimer(audioRef.current.duration);
        }
      });

      return () => {
        clearPreviewTimer();
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audioRef.current = null;
      };
    }
  }, [isRadio]);

  // Update volume when it changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.audio_url) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.load(); // <-- was missing!
    }
  }, [currentTrack]);

  // Update Media Session (lock screen / control center) when track or state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
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
    }
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist, currentTrack?.album, currentTrack?.image]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    const idx = queue.findIndex(t => t.id === track.id);
    if (idx >= 0) setCurrentIndex(idx);
    setProgress(0);

    if (audioRef.current && track.audio_url) {
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [queue]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;

    const currentIdx = currentIndexRef.current;
    const nextIdx = (currentIdx + 1) % currentQueue.length;
    const track = currentQueue[nextIdx];

    if (track) {
      setCurrentIndex(nextIdx);
      setCurrentTrack(track);
      setProgress(0);

      if (audioRef.current && track.audio_url) {
        audioRef.current.src = track.audio_url;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
  }, []);

  const playPrev = useCallback(() => {
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
      setCurrentIndex(prevIdx);
      setCurrentTrack(track);
      setProgress(0);

      if (audioRef.current && track.audio_url) {
        audioRef.current.src = track.audio_url;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
  }, []);

  const seek = useCallback((p: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (p / 100) * duration;
    setProgress(p);
  }, [duration]);

  const addPurchased = useCallback((trackId: string) => {
    setPurchasedTracks(prev => {
      const next = new Set<string>();
      prev.forEach(v => next.add(v));
      next.add(trackId);
      return next;
    });
  }, []);

  const hasPurchased = useCallback((trackId: string) => {
    return purchasedTracks.has(trackId);
  }, [purchasedTracks]);

  // Helper to check if track is locked (not purchased)
  const isTrackLocked = useCallback((trackId: string) => {
    return !purchasedTracks.has(trackId);
  }, [purchasedTracks]);

  // Initialize queue
  useEffect(() => {
    if (queue.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      if (!currentTrack) setCurrentTrack(queue[0]);
    }
  }, [queue, currentIndex, currentTrack]);

  return (
    <AudioCtx.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      progress,
      duration,
      playTrack,
      togglePlay,
      pause,
      playNext,
      playPrev,
      setVolume,
      seek,
      queue,
      setQueue,
      currentIndex,
      isRadio,
      setIsRadio,
      purchasedTracks,
      addPurchased,
      hasPurchased,
    }}>
      <MediaSessionHandlers togglePlay={togglePlay} playPrev={playPrev} playNext={playNext} />
      {children}
    </AudioCtx.Provider>
  );
}

// Media Session action handlers — lock screen / control center
function MediaSessionHandlers({ togglePlay, playPrev, playNext }: { togglePlay: () => void; playPrev: () => void; playNext: () => void }) {
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
  }, [togglePlay, playPrev, playNext]);
  return null;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
}