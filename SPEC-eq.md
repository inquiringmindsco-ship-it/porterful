# SPEC: Porterful EQ v1 (3-Band + Vocal Boost)

**Status:** BACKLOG — Phase 3, pending Phase 2 visualizer completion  
**Feature Flag Prefix:** `EQ_`  
**Primary Owner:** Codex (implementation)  
**Spec Authors:** ChatGPT (UX/design), Sentinel (architecture)  
**Approved By:** [pending user sign-off]

---

## 1. Overview

Simple 3-band equalizer with vocal boost control. Classic tone-stack feel, not studio-grade parametric.

**Not:** 10-band graphic EQ for v1. Not per-track EQ memory yet. Not artist-recommended curves.

---

## 2. Controls

| Control | Range | Default | Center Freq | Q | Purpose |
|---------|-------|---------|-------------|---|---------|
| **Bass** | -12dB to +12dB | 0dB | 100Hz | 1.0 | Low shelf boost/cut |
| **Mid** | -12dB to +12dB | 0dB | 1000Hz | 1.0 | Peaking boost/cut |
| **Treble** | -12dB to +12dB | 0dB | 10000Hz | 1.0 | High shelf boost/cut |
| **Vocal Boost** | 0dB to +6dB | 0dB | 2500Hz | 2.0 | Narrow peaking boost for voice clarity |
| **Reset** | Button | — | — | — | All sliders to default |

### 2.1 Presets (Phase 1)

| Preset | Bass | Mid | Treble | Vocal |
|--------|------|-----|--------|-------|
| **Flat** | 0 | 0 | 0 | 0 |
| **Bass Boost** | +8 | 0 | -2 | 0 |
| **Clear Vocals** | -2 | +4 | +2 | +4 |
| **Night Mode** | +6 | -4 | -6 | 0 |
| **Car Mode** | +4 | +2 | +4 | +2 |

---

## 3. Audio Graph

```
MediaElementAudioSourceNode
    ↓
[Bass: BiquadFilterNode — lowshelf, 100Hz]
    ↓
[Mid: BiquadFilterNode — peaking, 1000Hz]
    ↓
[Treble: BiquadFilterNode — highshelf, 10000Hz]
    ↓
[Vocal: BiquadFilterNode — peaking, 2500Hz]
    ↓
AnalyserNode (for visualizer)
    ↓
AudioContext.destination
```

**Note:** EQ chain sits BEFORE AnalyserNode so visualizer shows post-EQ spectrum.

---

## 4. Files to Create/Modify

| File | Action | Lines (est) |
|------|--------|-------------|
| `src/lib/features.ts` | Add EQ flags | +10 |
| `src/lib/audio-context.tsx` | Add EQ filter nodes, `setEqBand()` | +60 |
| `src/components/eq/EqualizerPanel.tsx` | Slide-up panel with 4 sliders | ~180 |
| `src/components/eq/EQSlider.tsx` | Individual slider with dB label | ~80 |
| `src/components/eq/EQPresets.tsx` | Preset buttons | ~60 |
| `src/hooks/useEQ.ts` | EQ state + localStorage persistence | ~100 |
| `src/hooks/useAudioContext.ts` | Expose EQ controls | +20 |

**Total new code:** ~600 lines

---

## 5. UI/UX

### 5.1 Trigger

- Expanded player: `Sliders` icon (new) opens EQ panel
- Fullscreen visualizer: `Sliders` icon in bottom controls
- Mobile: swipe up on "EQ" tab in expanded player

### 5.2 Panel Layout

```
┌─────────────────────────────────────┐
│  EQ              [Reset] [Close]    │
│                                     │
│    ○        ○        ○        ○    │
│    │        │        │        │     │
│    │        │        │        │     │
│ ───┼────────┼────────┼────────┼───│  ← 0dB line
│    │        │        │        │     │
│    │        │        │        │     │
│   Bass     Mid    Treble   Vocal   │
│   -12..+12 -12..+12 -12..+12 0..+6 │
│                                     │
│  [Flat] [Bass] [Vocals] [Night] [Car] │
└─────────────────────────────────────┘
```

### 5.3 Interaction

- Drag slider vertically (mobile: drag up/down on slider area)
- Slider snaps to 0dB with haptic feedback (if supported)
- Changes apply immediately (no "Apply" button)
- Reset button: animated return to defaults over 200ms
- Preset selection: instant apply, highlight active preset

---

## 6. Technical Constraints

1. **No EQ on preview tracks** — `playback_mode === 'preview'` disables EQ to prevent abuse
2. **EQ resets on track change** — unless "Lock EQ" toggle enabled (Phase 2)
3. **CPU limit** — if filter processing causes audio glitches, auto-disable EQ and show warning
4. **Mobile:** simplified to Bass/Mid/Treble only, no Vocal Boost (screen space)

---

## 7. Acceptance Criteria

- [ ] All 4 sliders affect audio in real-time
- [ ] Flat preset returns all to 0dB
- [ ] EQ state persists in localStorage
- [ ] EQ disabled for preview tracks
- [ ] Mobile shows only 3 sliders (Bass/Mid/Treble)
- [ ] No audio glitches when adjusting sliders
- [ ] Visualizer reflects EQ changes (post-EQ spectrum)
- [ ] Reset button works with smooth animation

---

**Sign-off:**
- [ ] ChatGPT (UX/design)
- [ ] Sentinel (architecture)
- [ ] User (priority/scope)
