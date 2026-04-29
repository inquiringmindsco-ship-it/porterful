# LYRIC VISUAL MODE™ — Porterful Player Backlog Add-On

> **Status:** PRIORITY FEATURE — DO NOT BUILD until current mobile player bugs are resolved.  
> **Priority:** P1 (post-bug-fix)  
> **Owner:** O D Porter  
> **Date:** 2026-04-29

---

## 1. Concept

The current full-screen / expanded player evolves into a **Lyric Visual Mode** — not merely a larger Now Playing screen, but a **premium artist visual stage** where every track can become a visual performance, not just an audio file.

**Tagline:** *"Every track can become a visual performance, not just an audio file."*

---

## 2. User Experience

### 2.1 Entry Points

| State | Entry | Action |
|-------|-------|--------|
| Mini player (bottom bar) | Tap artwork **or** tap visual/lyrics button | Opens full-screen player |
| Full-screen player | Swipe down **or** tap down chevron | Collapses back to mini player |

### 2.2 Three Full-Screen Modes

The full-screen player supports **one of three mutually exclusive states** per track:

#### Mode A — Artwork Mode (Default)
- Large album artwork centered
- Track title + artist below
- Standard playback controls (previous, play/pause, next, progress bar)
- **Shown when:** track has no lyrics and no lyric video

#### Mode B — Lyrics Mode
- Clean, readable lyrics display
- Auto-scroll synchronized to playback position (if synced lyrics available)
- Current line highlighted; previous/next lines dimmed
- **Shown when:** track has `lyrics_text` or `synced_lyrics_lrc`
- **Button:** "Lyrics" toggle visible in controls

#### Mode C — Lyric Visual Mode
- Lyric-video style graphics
- Motion backgrounds (subtle ambient animation or uploaded visual asset)
- Timed lyric lines overlaid on visual
- **Shown when:** track has `lyric_video_url` **or** `visualizer_enabled = true`
- **Button:** "Visual" toggle visible in controls

### 2.3 Mobile Requirements

| Requirement | Detail |
|-------------|--------|
| Collapse gesture | Swipe down anywhere collapses to mini player |
| Collapse button | Down chevron in top-left (always visible) |
| Volume slider | **No mobile volume slider** — use system volume |
| Scrolling | **Do not force page scrolling** unless lyrics exceed viewport height |
| Controls | Minimal: previous, play/pause, next, progress bar only |
| Feel | Premium artist visual stage — dark, immersive, no chrome |

---

## 3. Future Data Fields (Schema Additions)

Add to `tracks` table (or `track_metadata` extension table):

```sql
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyrics_text TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS synced_lyrics_lrc TEXT;      -- LRC format
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyric_video_url TEXT;         -- MP4 / WebM
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS visualizer_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS visualizer_theme TEXT;        -- e.g. 'aura', 'particles', 'waveform'
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyric_mode_enabled BOOLEAN DEFAULT FALSE;
```

**Notes:**
- `synced_lyrics_lrc` stores standard LRC timestamped lyrics (`[00:12.34] Line text`)
- `lyric_video_url` can be an artist-uploaded MP4 or auto-generated visual
- `visualizer_theme` allows preset visual styles; artist can override

---

## 4. Artist Dashboard — Upload / Edit

Future `/dashboard/tracks/[id]/lyrics` route:

### 4.1 Lyrics Tab
- **Plain lyrics** — textarea for raw lyrics text
- **Synced lyrics** — optional LRC upload or inline editor with timestamp insertion
- **Preview** — side-by-side playback preview with live scroll

### 4.2 Visual Tab
- **Lyric video upload** — drag-drop MP4/WebM (max 50MB, 1080p recommended)
- **Visualizer toggle** — enable auto-generated visual for this track
- **Visualizer theme picker** — choose from preset themes (if visualizer enabled)
- **Default mode** — artist selects which mode opens by default for this track:
  - `artwork` | `lyrics` | `visual`

### 4.3 Validation Rules
- If no lyrics and no lyric video → only Artwork Mode available
- If lyrics exist → Lyrics button shown
- If lyric video exists → Visual button shown
- **Never show fake / placeholder lyric mode** — if data missing, fall back to Artwork Mode

---

## 5. UI Behavior Rules

```
IF track.lyric_video_url EXISTS:
    → Show "Visual" button
    → Default mode = visual (artist override respected)
ELSE IF track.lyrics_text OR track.synced_lyrics_lrc EXISTS:
    → Show "Lyrics" button
    → Default mode = lyrics (artist override respected)
ELSE:
    → No mode toggle buttons
    → Default mode = artwork
```

**Toggle buttons** (when multiple modes available):
- Segmented control or icon trio: 🖼️ Artwork | 📝 Lyrics | ✨ Visual
- Active state highlighted in accent color (`--pf-orange`)
- Persist user preference per session (optional)

---

## 6. Technical Architecture Notes

### 6.1 Full-Screen Player State Machine

```
[Mini Player] --tap artwork--> [Full Screen]
[Full Screen] --swipe down / chevron--> [Mini Player]

[Full Screen] --tap mode button--> cycle Artwork → Lyrics → Visual (if available)
```

### 6.2 Performance
- Lyric video: preload first 2s, stream remainder
- Visualizer: Canvas 2D or WebGL, 30fps cap on mobile
- Lyrics scroll: `requestAnimationFrame` + Intersection Observer for line highlighting
- Memory: dispose video texture / canvas context on mode switch

### 6.3 Accessibility
- Mode buttons: `aria-pressed` for toggle state
- Lyric scroll: `role="log"` + `aria-live="polite"` for screen readers
- Reduced motion: respect `prefers-reduced-motion` (disable visualizer, instant lyric scroll)

---

## 7. Standout Feature Positioning

**"Every track can become a visual performance, not just an audio file."**

This positions Porterful as:
- **Not just** another Bandcamp clone
- **Not just** a streaming widget
- **A platform** where artists control the visual dimension of their music

Competitive moat:
- Spotify has Canvas (short loop) — we have full lyric video + visualizer
- Apple Music has lyrics — we have artist-uploaded visuals + synced scroll
- YouTube Music has videos — we have music-first, artist-controlled stage

---

## 8. Dependencies & Blockers

| Dependency | Status | Notes |
|------------|--------|-------|
| Mobile player bug fixes | **BLOCKING** — must complete first | Swipe collapse, mini player visibility, progress bar touch |
| Track metadata schema | Ready | Add columns via migration |
| LRC parser | TBD | Small util: `parseLRC(lrcText) → [{ time, line }]` |
| Video player component | TBD | HTML5 `<video>` with custom controls, or existing lib |
| Visualizer presets | TBD | Start with 2–3 Canvas 2D themes |

---

## 9. Open Questions (for Od)

1. **Auto-generated visualizer** — should we offer AI/motion-generated visuals for tracks without artist-uploaded video? (e.g. waveform + color extraction from artwork)
2. **LRC creation tool** — should synced lyrics be artist-uploaded only, or should we offer a "tap-to-sync" tool in dashboard?
3. **Visual mode exclusivity** — should visual mode be a Porterful Premium / paid artist feature?
4. **Social sharing** — should visual mode clips be shareable as 15s videos to IG/TikTok?

---

## 10. Related Files

| File | Purpose |
|------|---------|
| `src/components/GlobalPlayer.tsx` | Current player shell — will house mode toggle |
| `src/lib/audio-context.tsx` | Audio state — may need `lyricMode` flag |
| `src/lib/player.tsx` | Player hooks — extend with `lyricVideoUrl`, `visualizerTheme` |
| `supabase/migrations/0XX_lyric_visual_mode.sql` | Schema migration (pending) |
| `src/app/dashboard/tracks/[id]/lyrics/page.tsx` | Artist dashboard lyrics editor (future) |
| `src/app/dashboard/tracks/[id]/visual/page.tsx` | Artist dashboard visual editor (future) |

---

## 11. Acceptance Criteria (for build)

- [ ] Mini player unchanged — simple, no mode buttons
- [ ] Full-screen player supports 3 modes with smooth transitions
- [ ] Swipe down / chevron collapses reliably on mobile
- [ ] No volume slider on mobile
- [ ] No forced scrolling unless lyrics overflow
- [ ] If no lyrics/video → clean Artwork Mode, no fake placeholders
- [ ] Artist dashboard can upload lyrics + lyric video
- [ ] Artist can set default mode per track
- [ ] Visualizer respects `prefers-reduced-motion`
- [ ] All modes keyboard + screen-reader accessible

---

**Next Action:** Return to this spec after mobile player bugs are resolved. Do not begin implementation until Od gives explicit go-ahead.
