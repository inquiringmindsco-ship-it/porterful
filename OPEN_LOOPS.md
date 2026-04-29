# OPEN_LOOPS.md — Porterful Ecosystem

**Last updated: 2026-04-29 18:28 CDT**

---

## Resolved Incidents

### ✅ INCIDENT-001: Device Kernel Panic
- **Status:** CLOSED
- **Declared:** 2026-04-29 15:58 CDT
- **Closed:** 2026-04-29 16:15 CDT
- **Cause:** Hardware memory parity error (AMCC1 PLANE1 DIR_PAR_ERR)
- **Impact:** NONE — all production systems operational
- **Files:** `INCIDENT_SYSTEM_SHUTDOWN_2026-04-29.md`, `MAC_MINI_DEVICE_INCIDENT_REPORT_2026-04-29.md`

---

## Active Open Loops

### 🟡 Album-Order Navigation
- **Status:** OPEN
- **Issue:** Route exists at `/dashboard/artist/album-order` but no link on dashboard
- **Fix:** Add "Edit Public View" button to artist dashboard header
- **Assigned:** Sentinel (awaiting Od's go-ahead)

### 🟡 Track Preview Controls UX
- **Status:** OPEN
- **Issue:** Playback Access controls present but minimally labeled
- **Fix:** Add helper text, tooltips, section description
- **Assigned:** Sentinel (awaiting Od's go-ahead)

### 🟡 Artist Dashboard Route Cleanup
- **Status:** OPEN
- **Issue:** `/dashboard/dashboard/artist` duplicate route exists
- **Fix:** Remove or redirect legacy route
- **Assigned:** Sentinel (awaiting Od's go-ahead)

### 🟡 Deck Mode / Visualizer / EQ Foundation
- **Status:** DOCUMENTED — foundation in progress
- **Issue:** Porterful needs a real audio-reactive deck stage on top of the existing GlobalPlayer/audio-context system
- **Scope:** Audio graph exposure, analyser-backed bars/circular/waveform modes, artwork fallback, browser fullscreen deck mode, and future EQ/loudness normalization backlogs
- **Dock Mode concept:** Sideways phone + Bluetooth, tablet counter display, car-style music screen, retired phone dock, merch booth / event display
- **Guardrails:** No fake waveform data, no heavy WebGL default on mobile, respect prefers-reduced-motion, keep playback stable before expanding EQ or experimental visuals
- **Backlog:** EQ v1 presets, 10-band EQ, and loudness normalization / EBU R128 / ffmpeg-normalize workflow

---

## Paused Work

- ⏸️ Porterful rights declaration gate — ON HOLD (Od testing)
- ⏸️ New feature development — ON HOLD (awaiting Od's signal)
- ⏸️ UX fixes (album-order, preview controls) — ON HOLD (awaiting Od's signal)

---

## Priority Feature Backlog (Documented, Awaiting Go-Ahead)

### 🎵 Lyric Visual Mode™ — Player Evolution
- **Status:** DOCUMENTED — P1 Priority
- **Spec:** `LYRIC_VISUAL_MODE_SPEC.md`
- **Concept:** Full-screen/expanded player evolves into premium artist visual stage — three mutually exclusive modes per track: Artwork Mode, Lyrics Mode, Lyric Visual Mode
- **Blocked by:** Mobile player bug fixes (swipe collapse, mini player visibility, progress bar touch)
- **DO NOT BUILD until:** current mobile player bugs are resolved + Od gives explicit go-ahead
- **Key positioning:** "Every track can become a visual performance, not just an audio file"
- **Competitive moat:** Spotify has Canvas (short loop) — Porterful has full lyric video + visualizer; Apple Music has lyrics — Porterful has artist-uploaded visuals + synced scroll; YouTube Music has videos — Porterful has music-first, artist-controlled stage

---

## Ready to Resume (when Od gives go-ahead)

1. Add "Edit Public View" / "Reorder Albums" button to artist dashboard
2. Add Playback Access helper text and tooltips
3. Clean up duplicate dashboard routes
4. Porterful rights declaration gate (when Od finishes testing)
5. **Lyric Visual Mode™ implementation** (post-mobile-player-bug-fix)

---

## Monitoring

- **Mac mini hardware:** Watch for recurrence of kernel panics
- **Action if recurrence:** Run Apple Diagnostics (Restart + hold D)
