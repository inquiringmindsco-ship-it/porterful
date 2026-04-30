'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { getTrackArtwork } from '@/lib/artwork';
import { dedupeQueueTracks, filterPlayableTracks, hasPlayableAudio } from '@/lib/track-dedupe';

// ─── DEBUG LOGGING ────────────────────────────────────────────────────────────
const DEBUG = false;
function log(event: string, data?: any) {
  if (DEBUG && typeof window !== 'undefined') {
    console.log('[AUDIO]', event, data);
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
  proud_to_pay_min?: number;
  track_number?: number;
  playback_mode?: 'full' | 'preview' | 'locked';
  preview_duration_seconds?: number;
  unlock_required?: boolean;
}

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
interface AudioContextValue {
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
  hasPurchased: (trackId: string) => boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

// ─── AUDIO PROVIDER ───────────────────────────────────────────────────────────
export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queueState, setQueueState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [mode, setMode] = useState<'track' | 'radio' | 'artist'>('track');
  const [purchasedTracks] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const currentTrackRef = useRef<Track | null>(null);
  const playTrackRef = useRef<(track: Track) => void>(() => {});

  const setQueue = useCallback((tracks: Track[]) => {
    const normalizedQueue = dedupeQueueTracks(filterPlayableTracks(tracks));
    queueRef.current = normalizedQueue;
    setQueueState(normalizedQueue);
  }, []);

  const findPlayableTrack = useCallback((startIndex: number, direction: 1 | -1) => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return null;

    const baseIndex = direction === 1 ? startIndex : (startIndex >= 0 ? startIndex : 0);

    for (let offset = 1; offset <= currentQueue.length; offset += 1) {
      const nextIndex = direction === 1
        ? (baseIndex + offset) % currentQueue.length
        : (baseIndex - offset + currentQueue.length) % currentQueue.length;
      const candidate = currentQueue[nextIndex];
      if (candidate && hasPlayableAudio(candidate)) {
        return { track: candidate, index: nextIndex };
      }
    }

    return null;
  }, []);

  // Keep refs in sync
  useEffect(() => {
    queueRef.current = queueState;
    currentIndexRef.current = currentIndex;
  }, [queueState, currentIndex]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Create audio element on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    log('Creating Audio element');
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = 0.8;
    audio.preload = 'auto';

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const currentTime = audioRef.current.currentTime || 0;
      setProgress(currentTime);

      const track = currentTrackRef.current;
      if (track && (track as any).playback_mode === 'preview') {
        const previewDuration = (track as any).preview_duration_seconds || 60;
        if (currentTime >= previewDuration) {
          log('Preview ended for track:', track.title);
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleAudioError = () => {
      console.error('[AUDIO] Error:', audio.error);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      log('Track ended');
      const nextPlayable = findPlayableTrack(currentIndexRef.current, 1);
      if (nextPlayable) {
        setTimeout(() => playTrackRef.current(nextPlayable.track), 0);
      } else {
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [findPlayableTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // ─── PLAY TRACK ────────────────────────────────────────────────────────────
  const playTrack = useCallback((track: Track) => {
    log('playTrack', track.id);

    if (!audioRef.current) return;
    if (!hasPlayableAudio(track)) {
      console.error('[AUDIO] No playable audio_url for track', track.id);
      return;
    }

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;

    setCurrentTrack(track);
    const idx = queueRef.current.findIndex((queuedTrack) => queuedTrack.id === track.id);
    setCurrentIndex(idx >= 0 ? idx : -1);
    setProgress(0);
    setDuration(0);

    audio.src = track.audio_url.trim();
    audio.load();

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((err) => {
        console.error('[AUDIO] Play failed:', err.name, err.message);
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);

  const loadTrack = useCallback((track: Track) => {
    if (!hasPlayableAudio(track)) {
      console.error('[AUDIO] No playable audio_url for track', track.id);
      return;
    }

    setCurrentTrack(track);
    const idx = queueRef.current.findIndex((queuedTrack) => queuedTrack.id === track.id);
    setCurrentIndex(idx >= 0 ? idx : -1);

    if (audioRef.current) {
      audioRef.current.src = track.audio_url.trim();
      audioRef.current.load();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else if (hasPlayableAudio(currentTrack)) {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const playNext = useCallback(() => {
    const nextPlayable = findPlayableTrack(currentIndexRef.current, 1);
    if (nextPlayable) {
      playTrack(nextPlayable.track);
      return;
    }

    audioRef.current?.pause();
    setIsPlaying(false);
  }, [findPlayableTrack, playTrack]);

  const playPrev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }

    const prevPlayable = findPlayableTrack(currentIndexRef.current, -1);
    if (prevPlayable) {
      playTrack(prevPlayable.track);
    }
  }, [findPlayableTrack, playTrack]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }, []);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current || !duration) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    audioRef.current.currentTime = clamped;
    setProgress(clamped);
  }, [duration]);

  const hasPurchased = useCallback(
    (trackId: string) => purchasedTracks.has(trackId),
    [purchasedTracks]
  );

  // Keep currentIndex aligned with the active queue/current track.
  useEffect(() => {
    if (queueState.length === 0) {
      if (currentIndex !== -1) {
        setCurrentIndex(-1);
      }
      return;
    }

    if (!currentTrack) {
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      if (queueState[0]) {
        setCurrentTrack(queueState[0]);
      }
      return;
    }

    const nextIndex = queueState.findIndex((track) => track.id === currentTrack.id);
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  }, [queueState, currentIndex, currentTrack]);

  // ─── MEDIA SESSION (iOS / Android lock screen) ───────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    if (!currentTrack) {
      ms.metadata = null;
      return;
    }

    const artworkUrl = getTrackArtwork(currentTrack);
    ms.metadata = new MediaMetadata({
      title: currentTrack.title || '',
      artist: currentTrack.artist || '',
      album: currentTrack.album || '',
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
      ],
    });

    try {
      ms.setActionHandler('play', () => {
        audioRef.current?.play().catch(() => {});
      });
      ms.setActionHandler('pause', () => audioRef.current?.pause());
      ms.setActionHandler('previoustrack', () => playPrev());
      ms.setActionHandler('nexttrack', () => playNext());
      ms.setActionHandler('seekto', (details: any) => {
        if (audioRef.current && typeof details.seekTime === 'number') {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    } catch {
      // Older browsers may not support every action — ignore.
    }
  }, [currentTrack, playPrev, playNext]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  return (
    <AudioCtx.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      progress,
      duration,
      mode,
      setMode,
      playTrack,
      loadTrack,
      togglePlay,
      pause,
      playNext,
      playPrev,
      setVolume,
      seek,
      queue: queueState,
      setQueue,
      currentIndex,
      hasPurchased,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) return {
    currentTrack: null,
    isPlaying: false,
    volume: 80,
    progress: 0,
    duration: 0,
    mode: 'track' as const,
    setMode: () => {},
    playTrack: () => {},
    loadTrack: () => {},
    togglePlay: () => {},
    pause: () => {},
    playNext: () => {},
    playPrev: () => {},
    setVolume: () => {},
    seek: () => {},
    queue: [],
    setQueue: () => {},
    currentIndex: -1,
    hasPurchased: () => false,
  };
  return ctx;
}
