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
  image?: string; // Allow image as alias for cover_url
  plays?: number;
  price?: number;
}

interface AudioContext {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isPreview: boolean;
  previewTimeRemaining: number;
  isSupporter: boolean;
  isCountingDown: boolean;
  countdownSeconds: number;
  nextTrack: Track | null;
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
  upgradeToFull: () => void;
  skipCountdown: () => void;
}

// Preview duration in seconds (1 minute)
const PREVIEW_DURATION = 60;
// Countdown duration between tracks
const COUNTDOWN_DURATION = 7;

const AudioCtx = createContext<AudioContext | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPreview, setIsPreview] = useState(true);
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(PREVIEW_DURATION);
  const [isSupporter, setIsSupporter] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(COUNTDOWN_DURATION);
  const [nextTrack, setNextTrack] = useState<Track | null>(null);
  
  // Use refs for values that need to be current in event handlers
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSupporterRef = useRef(false);
  const isPreviewRef = useRef(true);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    isSupporterRef.current = isSupporter;
    isPreviewRef.current = isPreview;
  }, [isSupporter, isPreview]);

  // Start countdown before next track
  const startCountdown = useCallback((track: Track) => {
    setNextTrack(track);
    setIsCountingDown(true);
    setCountdownSeconds(COUNTDOWN_DURATION);
    setIsPlaying(false);
    
    countdownRef.current = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          // Countdown finished, play next track
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          setIsCountingDown(false);
          setNextTrack(null);
          
          // Actually play the track
          if (audioRef.current && track.audio_url) {
            setCurrentTrack(track);
            setProgress(0);
            setIsPreview(!isSupporterRef.current);
            setPreviewTimeRemaining(PREVIEW_DURATION);
            audioRef.current.src = track.audio_url;
            audioRef.current.play().catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Skip countdown and play immediately
  const skipCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setIsCountingDown(false);
    if (nextTrack && audioRef.current && nextTrack.audio_url) {
      setCurrentTrack(nextTrack);
      setProgress(0);
      setIsPreview(!isSupporterRef.current);
      setPreviewTimeRemaining(PREVIEW_DURATION);
      audioRef.current.src = nextTrack.audio_url;
      audioRef.current.play().catch(() => {});
    }
    setNextTrack(null);
  }, [nextTrack]);

  // Create audio element on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;
      audio.volume = volume / 100;

      const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(isNaN(pct) ? 0 : pct);

          // Track preview time remaining - use refs for current values
          if (isPreviewRef.current && !isSupporterRef.current) {
            const timeRemaining = PREVIEW_DURATION - audioRef.current.currentTime;
            setPreviewTimeRemaining(Math.max(0, timeRemaining));
            
            // Stop playback after preview duration
            if (audioRef.current.currentTime >= PREVIEW_DURATION) {
              audioRef.current.pause();
              setIsPlaying(false);
              setIsPreview(false);
            }
          }
        }
      };

      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
          setPreviewTimeRemaining(Math.min(PREVIEW_DURATION, audioRef.current.duration));
        }
      };

      const handleEnded = () => {
        // For supporters, just go to next track
        if (isSupporterRef.current) {
          // Play next immediately
          setQueue(currentQueue => {
            if (currentQueue.length === 0) return currentQueue;
            setCurrentIndex(currentIdx => {
              const nextIdx = (currentIdx + 1) % currentQueue.length;
              const track = currentQueue[nextIdx];
              if (track && audioRef.current && track.audio_url) {
                setCurrentTrack(track);
                setProgress(0);
                audioRef.current.src = track.audio_url;
                audioRef.current.play().catch(() => {});
              }
              return nextIdx;
            });
            return currentQueue;
          });
        } else {
          // Non-supporters: start countdown before next track
          setQueue(currentQueue => {
            if (currentQueue.length === 0) return currentQueue;
            setCurrentIndex(currentIdx => {
              const nextIdx = (currentIdx + 1) % currentQueue.length;
              const track = currentQueue[nextIdx];
              if (track) {
                startCountdown(track);
              }
              return nextIdx;
            });
            return currentQueue;
          });
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
        audioRef.current = null;
      };
    }
  }, [startCountdown]);

  const playTrack = useCallback((track: Track) => {
    // Cancel any pending countdown
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setIsCountingDown(false);
    setNextTrack(null);
    
    setCurrentTrack(track);
    const idx = queue.findIndex(t => t.id === track.id);
    if (idx >= 0) setCurrentIndex(idx);
    setProgress(0);
    setIsPreview(!isSupporterRef.current);
    setPreviewTimeRemaining(PREVIEW_DURATION);

    if (audioRef.current && track.audio_url) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(e => {
        console.log('Playback failed:', e);
        setIsPlaying(false);
      });
    }
  }, [queue]);

  const togglePlay = useCallback(() => {
    if (isCountingDown) return; // Can't toggle during countdown
    
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src && currentTrack.audio_url) {
        audioRef.current.src = currentTrack.audio_url;
      }
      audioRef.current.play().catch(e => {
        console.log('Playback failed:', e);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, currentTrack, isCountingDown]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    
    // If counting down, skip to next
    if (isCountingDown && nextTrack) {
      skipCountdown();
      return;
    }
    
    const nextIdx = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIdx);
    const track = queue[nextIdx];
    
    if (isSupporterRef.current) {
      // Supporters play immediately
      if (track) {
        setCurrentTrack(track);
        setProgress(0);
        setIsPreview(false);
        setPreviewTimeRemaining(PREVIEW_DURATION);
        
        if (audioRef.current && track.audio_url) {
          audioRef.current.src = track.audio_url;
          audioRef.current.play().catch(() => {});
        }
      }
    } else {
      // Non-supporters: start countdown
      if (track) {
        startCountdown(track);
      }
    }
  }, [queue, currentIndex, isCountingDown, nextTrack, skipCountdown, startCountdown]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    
    // Cancel countdown if active
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setIsCountingDown(false);
    setNextTrack(null);
    
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIdx);
    const track = queue[prevIdx];
    if (track) {
      setCurrentTrack(track);
      setProgress(0);
      setIsPreview(!isSupporterRef.current);
      setPreviewTimeRemaining(PREVIEW_DURATION);
      
      if (audioRef.current && track.audio_url) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [queue, currentIndex]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
  }, []);

  const seek = useCallback((p: number) => {
    if (!audioRef.current || !duration) return;
    
    // Non-supporters can only seek within preview range
    if (isPreviewRef.current && !isSupporterRef.current) {
      const previewProgress = (PREVIEW_DURATION / duration) * 100;
      const maxSeek = Math.min(p, previewProgress);
      audioRef.current.currentTime = (maxSeek / 100) * duration;
      setProgress(maxSeek);
      setPreviewTimeRemaining(PREVIEW_DURATION - audioRef.current.currentTime);
    } else {
      audioRef.current.currentTime = (p / 100) * duration;
      setProgress(p);
    }
  }, [duration]);

  const upgradeToFull = useCallback(() => {
    setIsSupporter(true);
    setIsPreview(false);
    isSupporterRef.current = true;
    isPreviewRef.current = false;
  }, []);

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
      isPreview,
      previewTimeRemaining,
      isSupporter,
      isCountingDown,
      countdownSeconds,
      nextTrack,
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
      upgradeToFull,
      skipCountdown,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
}