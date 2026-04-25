'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

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
  const [purchasedTracks] = useState<Set<string>>(new Set()); // Stub for now

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const currentTrackRef = useRef<Track | null>(null);

  // Keep refs in sync
  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
  }, [queue, currentIndex]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Create audio element on mount - NO ANIMATIONS, NO FADES
  useEffect(() => {
    if (typeof window === 'undefined') return;

    log('Creating Audio element');
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume / 100;
    audio.preload = 'auto';

    // ─── EVENT: timeupdate ───────────────────────────────────────────────────
    const handleTimeUpdate = () => {
      if (!audioRef.current || !audio.duration) return;
      const pct = (audioRef.current.currentTime / audio.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    };

    // ─── EVENT: loadedmetadata ────────────────────────────────────────────────
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    // ─── EVENT: error ───────────────────────────────────────────────────────
    const handleAudioError = () => {
      console.error('[AUDIO] Error:', audio.error);
      setIsPlaying(false);
    };

    // ─── EVENT: ended ───────────────────────────────────────────────────────
    const handleEnded = () => {
      log('Track ended');
      const currentQueue = queueRef.current;
      const currentIdx = currentIndexRef.current;
      
      if (currentQueue.length > 0) {
        const nextIdx = (currentIdx + 1) % currentQueue.length;
        const nextTrack = currentQueue[nextIdx];
        if (nextTrack) {
          // Call playTrack to use the same logic as manual click
          // Defer to avoid state update during event handler
          setTimeout(() => playTrack(nextTrack), 0);
        }
      }
    };

    // ─── EVENT: play ────────────────────────────────────────────────────────
    const handlePlay = () => setIsPlaying(true);

    // ─── EVENT: pause ───────────────────────────────────────────────────────
    const handlePause = () => setIsPlaying(false);

    // Attach listeners
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
      audioRef.current = null;
    };
  }, []);

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
    
    const audio = audioRef.current;
    
    // Reset audio element completely
    audio.pause();
    audio.currentTime = 0;
    
    // Update state
    setCurrentTrack(track);
    const idx = queue.findIndex(t => t.id === track.id);
    if (idx >= 0) setCurrentIndex(idx);
    setProgress(0);
    setDuration(0);
    
    // Validate audio URL
    if (!track.audio_url) {
      console.error('[AUDIO] No audio_url for track', track.id);
      return;
    }
    
    // Set src and load
    audio.src = track.audio_url;
    audio.load();
    
    // Play immediately - no fade, no delay
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((err) => {
        console.error('[AUDIO] Play failed:', err.name, err.message);
        setIsPlaying(false);
      });
    }
  }, [queue]);

  const loadTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    const idx = queue.findIndex(t => t.id === track.id);
    if (idx >= 0) setCurrentIndex(idx);
    
    if (audioRef.current && track.audio_url) {
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
    }
  }, [queue]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else if (currentTrack?.audio_url) {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;
    
    const currentIdx = currentIndexRef.current;
    const nextIdx = (currentIdx + 1) % currentQueue.length;
    const track = currentQueue[nextIdx];
    
    if (track) {
      playTrack(track);
    }
  }, [playTrack]);

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
      playTrack(track);
    }
  }, [playTrack]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }, []);

  const seek = useCallback((p: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (p / 100) * duration;
    setProgress(p);
  }, [duration]);

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
      setVolume, seek, queue, setQueue, currentIndex, hasPurchased,
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
    queue: [], setQueue: () => {}, currentIndex: -1, hasPurchased: () => false,
  };
  return ctx;
}
