'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

// Demo tracks
const DEMO_TRACKS = [
  { id: '1', title: 'Oddysee', artist: 'O D Porter', duration: '3:42' },
  { id: '2', title: 'Midnight Drive', artist: 'O D Porter', duration: '4:15' },
  { id: '3', title: 'Movement', artist: 'O D Porter', duration: '3:58' },
];

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const track = DEMO_TRACKS[currentTrack];

  const playNext = () => {
    setCurrentTrack((prev) => (prev + 1) % DEMO_TRACKS.length);
    setProgress(0);
  };

  const playPrev = () => {
    setCurrentTrack((prev) => (prev - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setProgress(0);
  };

  // Simulate progress
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          playNext();
          return 0;
        }
        return prev + 0.5;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--pf-bg)] border-t border-[var(--pf-border)] py-3 px-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-xl shrink-0">
            🎵
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{track.title}</p>
            <Link href={`/artist/${track.artist.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-[var(--pf-text-muted)] truncate hover:text-[var(--pf-orange)] transition-colors">
              {track.artist}
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={playPrev}
            className="p-2 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            aria-label="Previous track"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange-light)] transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
          </button>
          <button
            onClick={playNext}
            className="p-2 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            aria-label="Next track"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex-1 hidden md:block">
          <div className="h-1 bg-[var(--pf-surface)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--pf-orange)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-20 h-1 bg-[var(--pf-surface)] rounded-full appearance-none cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}