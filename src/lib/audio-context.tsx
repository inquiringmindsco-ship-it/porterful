'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

// ─── DEBUG LOGGING ────────────────────────────────────────────────────────────
const DEBUG = false;
function log(event: string, data?: any) {
  if (DEBUG && typeof window !== 'undefined') {
    console.log('[AUDIO]', event, data);
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
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

export interface Artist {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year?: number;
  cover_url?: string;
}

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
interface AudioContextType {
  // Playback state
  currentTrack: Track | null;
  currentArtist: Artist | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0-100 percentage
  
  // Queue state
  queue: Track[];
  currentIndex: number;
  
  // Actions
  playTrack: (track: Track, artist?: Artist, album?: Album, queue?: Track[], index?: number) => void;
  loadTrack: (track: Track, artist?: Artist, album?: Album) => void;
  togglePlay: () => void;
  pause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
  
  // Volume
  volume: number;
  setVolume: (v: number) => void;
  
  // Queue management
  setQueue: (tracks: Track[]) => void;
  
  // Purchase check (stub)
  hasPurchased: (trackId: string) => boolean;
}

const AudioCtx = createContext<AudioContextType | null>(null);

// ─── AUDIO PROVIDER ───────────────────────────────────────────────────────────
export function AudioProvider({ children }: { children: ReactNode }) {
  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Queue state
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const [volume, setVolumeState] = useState(80);

  // Refs for sync
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    log('Creating Audio element');
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume / 100;
    audio.preload = 'auto';

    // Time update - sync currentTime and progress
    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    };

    // Metadata loaded - sync duration
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        const dur = audioRef.current.duration;
        if (dur && !isNaN(dur) && isFinite(dur)) {
          setDuration(dur);
        }
      }
    };

    // Track ended - auto play next
    const handleEnded = () => {
      log('Track ended');
      const currentQueue = queueRef.current;
      const currentIdx = currentIndexRef.current;
      
      if (currentQueue.length > 0 && currentIdx >= 0) {
        const nextIdx = (currentIdx + 1) % currentQueue.length;
        const nextTrack = currentQueue[nextIdx];
        if (nextTrack) {
          setTimeout(() => playTrack(nextTrack, undefined, undefined, currentQueue, nextIdx), 0);
        }
      }
    };

    // Play/Pause events
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    // Error handling
    const handleError = () => {
      console.error('[AUDIO] Error:', audio.error);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // ─── LOAD TRACK (without playing) ───────────────────────────────────────────
  const loadTrack = useCallback((track: Track, artist?: Artist, album?: Album) => {
    log('loadTrack', track.id);
    
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Stop current playback but don't reset time yet
    audio.pause();
    
    // Set track info
    setCurrentTrack(track);
    setCurrentArtist(artist || null);
    setCurrentAlbum(album || null);
    
    // Reset timing
    setCurrentTime(0);
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    
    // Load audio if URL exists
    if (track.audio_url) {
      audio.src = track.audio_url;
      audio.load();
    }
  }, []);
  const playTrack = useCallback((
    track: Track, 
    artist?: Artist, 
    album?: Album, 
    newQueue?: Track[], 
    index?: number
  ) => {
    log('playTrack', { track: track.id, artist: artist?.name, album: album?.title });
    
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Stop current playback
    audio.pause();
    audio.currentTime = 0;
    
    // Reset state
    setCurrentTime(0);
    setProgress(0);
    setDuration(0); // Will be set by loadedmetadata
    
    // Set new track
    setCurrentTrack(track);
    setCurrentArtist(artist || null);
    setCurrentAlbum(album || null);
    
    // Update queue if provided
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
      
      const idx = index !== undefined ? index : newQueue.findIndex(t => t.id === track.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      currentIndexRef.current = idx >= 0 ? idx : 0;
    } else {
      // If no queue provided, create single-track queue
      setQueue([track]);
      queueRef.current = [track];
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
    
    // Validate and load audio
    if (!track.audio_url) {
      console.error('[AUDIO] No audio_url for track', track.id);
      return;
    }
    
    audio.src = track.audio_url;
    audio.load();
    
    // Play
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((err) => {
        console.error('[AUDIO] Play failed:', err.name, err.message);
        setIsPlaying(false);
      });
    }
  }, []);

  // ─── TOGGLE PLAY ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying, currentTrack]);

  // ─── PAUSE ─────────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  // ─── PLAY NEXT ─────────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;
    
    const currentIdx = currentIndexRef.current;
    const nextIdx = (currentIdx + 1) % currentQueue.length;
    const track = currentQueue[nextIdx];
    
    if (track) {
      playTrack(track, currentArtist, currentAlbum, currentQueue, nextIdx);
    }
  }, [playTrack, currentArtist, currentAlbum]);

  // ─── PLAY PREV ─────────────────────────────────────────────────────────────
  const playPrev = useCallback(() => {
    if (!audioRef.current) return;
    
    // If more than 3 seconds in, restart track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }
    
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;
    
    const currentIdx = currentIndexRef.current;
    const prevIdx = (currentIdx - 1 + currentQueue.length) % currentQueue.length;
    const track = currentQueue[prevIdx];
    
    if (track) {
      playTrack(track, currentArtist, currentAlbum, currentQueue, prevIdx);
    }
  }, [playTrack, currentArtist, currentAlbum]);

  // ─── SEEK TO ─────────────────────────────────────────────────────────────────
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current || !duration) return;
    
    const clampedTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
    setProgress((clampedTime / duration) * 100);
  }, [duration]);

  // ─── SET VOLUME ─────────────────────────────────────────────────────────────
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
  }, []);

  return (
    <AudioCtx.Provider value={{
      currentTrack,
      currentArtist,
      currentAlbum,
      isPlaying,
      currentTime,
      duration,
      progress,
      queue,
      currentIndex,
      volume,
      playTrack,
      loadTrack,
      togglePlay,
      pause,
      playNext,
      playPrev,
      seekTo,
      setVolume,
      setQueue,
      hasPurchased: () => false,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
}
