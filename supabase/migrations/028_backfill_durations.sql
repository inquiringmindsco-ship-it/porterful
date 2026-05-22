-- Backfill track durations from audio files
-- Run this after uploading tracks to extract real durations
-- Requires: ffprobe installed locally

-- Tracks that needed backfill (May 22, 2026):
-- Wacked Out: 157s
-- Heart of a Lion: 149s
-- Thought We Was Bruddaz: 197s
-- Coming Home: 260s

-- UPDATE tracks SET duration = 157 WHERE id = 'fbc759df-5ff1-429e-8589-abacd8577e12';
-- UPDATE tracks SET duration = 149 WHERE id = 'd8fc8bfb-b74b-4549-8c19-ea1caff1b1aa';
-- UPDATE tracks SET duration = 197 WHERE id = '88b68d46-3548-4fe4-a8c3-02064e918209';
-- UPDATE tracks SET duration = 260 WHERE id = '6958eb85-1ea3-4022-9814-41e705637353';

-- Deleted: Browser Test Track (d6c34992-5f62-447d-b968-43587e984ec7)
-- Fixed: Frankie Lymon duplicate + artist name (iamodmusic → O D Porter)

-- All tracks now have duration as of May 22, 2026.
