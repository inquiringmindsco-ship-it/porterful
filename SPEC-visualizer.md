# SPEC: Visual Deck™ (Porterful Visualizer)

**Status:** BACKLOG — Phase 2, pending Phase 1 player stabilization  
**Feature Flag Prefix:** `VISUALIZER_`  
**Primary Owner:** Codex (implementation)  
**Spec Authors:** ChatGPT (UX/design), Sentinel (architecture)  
**Approved By:** [pending user sign-off]

---

## 1. Overview

Full-screen music visualizer for Porterful. Multiple visual modes, classic Kenwood/Winamp aesthetic, mobile-safe fallbacks.

**Not:** a second audio engine. Not a replacement for the existing player. Not autoplaying without user gesture.

---

## 2. Visual Modes

| Mode | Tech | Default? | Mobile? | Description |
|------|------|----------|---------|-------------|
| **Classic Bars** | Canvas 2D | ✅ Yes | ✅ Yes | 32 vertical spectrum bars, orange on black, peak hold, smooth falloff |
| **Waveform** | Canvas 2D | No | ✅ Yes | Oscilloscope trace, center-line, green-on-black |
| **Circular** | Canvas 2D | No | ✅ Yes | Radial bars around center circle |
| **Butterchurn** | WebGL | No | ❌ No | MilkDrop presets, desktop-only, behind `VISUALIZER_BUTTERCHURN` |
| **Artwork** | DOM/CSS | Fallback | ✅ Yes | Large spinning/album art when visualizer unavailable |

### 2.1 Classic Bars Specification

```
Bar count: 32 (configurable via --viz-bar-count)
Bar gap: 2px (--viz-bar-gap)
Bar color: var(--pf-orange) with intensity-based alpha
Peak hold: 500ms
Falloff factor: 0.85 per frame
Smoothing: 0.3 (lerp between frames)
Background: var(--pf-bg) with 0.95 opacity
Height scale: 80% of canvas
```

### 2.2 Butterchurn Specification

- Use `butterchurn` npm package
- Use `butterchurn-presets` for preset library
- Desktop-only: detect via `navigator.userAgent` + screen width
- Randomize preset every 30s or every track change
- Fallback to Classic Bars if WebGL unavailable

---

## 3. Architecture

### 3.1 Audio Graph

```
Existing <audio> element (from audio-context.tsx)
    ↓
MediaElementAudioSourceNode [SINGLETON]
    ↓
[Optional: EQ Chain — Phase 3]
    ↓
AnalyserNode (fftSize: 2048, smoothingTimeConstant: 0.8)
    ↓
AudioContext.destination
```

**CRITICAL:** Single `AudioContext` per page lifetime. Safari limit = 4 contexts.

### 3.2 Web Worker Pattern

```typescript
// audio-visualizer.worker.ts
self.onmessage = (e) => {
  const { frequencyData, mode, canvasWidth, canvasHeight } = e.data;
  
  // Process raw frequency data into renderable geometry
  const bars = processBars(frequencyData, canvasWidth, canvasHeight);
  const waveform = processWaveform(frequencyData, canvasWidth, canvasHeight);
  
  // Post back geometry, not raw bytes
  self.postMessage({ bars, waveform }, [bars.buffer, waveform.buffer]);
};
```

Main thread receives pre-computed geometry, renders to Canvas 2D only.

### 3.3 Files to Create/Modify

| File | Action | Lines (est) |
|------|--------|-------------|
| `src/lib/features.ts` | Add visualizer flags | +20 |
| `src/lib/audio-context.tsx` | Add AudioContext singleton, AnalyserNode | +80 |
| `src/components/visualizer/VisualizerContainer.tsx` | Main visualizer shell, mode switcher | ~200 |
| `src/components/visualizer/ClassicBarsVisualizer.tsx` | Canvas 2D bars | ~150 |
| `src/components/visualizer/WaveformVisualizer.tsx` | Oscilloscope | ~120 |
| `src/components/visualizer/CircularVisualizer.tsx` | Radial spectrum | ~130 |
| `src/components/visualizer/ButterchurnVisualizer.tsx` | WebGL wrapper | ~180 |
| `src/components/visualizer/ArtworkFallback.tsx` | Static artwork mode | ~80 |
| `src/workers/audio-visualizer.worker.ts` | Geometry computation | ~200 |
| `src/hooks/useAudioAnalyser.ts` | AnalyserNode + Worker bridge | ~100 |
| `src/hooks/useVisualizerMode.ts` | Mode cycling + persistence | ~60 |

**Total new code:** ~1,500 lines

---

## 4. UI/UX Flow

### 4.1 Trigger Points

1. **Mini player** — `Maximize2` icon opens expanded player
2. **Expanded player** — `Maximize2` icon opens fullscreen visualizer
3. **Keyboard** — `V` key toggles visualizer when player focused
4. **Mobile** — Double-tap album art toggles visualizer

### 4.2 Fullscreen Visualizer Layout

```
┌─────────────────────────────────────┐
│  Track Title - Artist               │  ← Top overlay, fades after 3s
│  [Visualizer Canvas]                │  ← Full viewport
│                                     │
│  ▶️  ⏭️  [Mode: Bars ▼]  [Exit]    │  ← Bottom controls, hover to show
└─────────────────────────────────────┘
```

### 4.3 Mode Cycling

- Tap/click visualizer area cycles: Bars → Waveform → Circular → [Butterchurn if enabled] → Artwork → Bars
- Selected mode persists in `localStorage` per device

---

## 5. Performance Budget

| Metric | Target | Test Device |
|--------|--------|-------------|
| Canvas render time | <4ms/frame | iPhone 12 |
| Worker message overhead | <1ms | iPhone 12 |
| Memory overhead | <20MB | All |
| Track transition jank | 0 dropped frames | iPhone 12 |
| Battery impact | <5% additional drain/hr | iPhone 12 |

**Desktop only for Butterchurn:** WebGL preset compilation causes 200-500ms freeze on mobile.

---

## 6. Mobile Safeguards

1. **No Butterchurn** on mobile — `VISUALIZER_BUTTERCHURN` auto-false if `window.innerWidth < 768`
2. **Reduced bar count** — 16 bars on mobile vs 32 on desktop
3. **Lower frame rate** — 30fps cap on mobile vs 60fps desktop
4. **Pause on background** — `document.visibilitychange` pauses analyser when tab hidden
5. **Respect `prefers-reduced-motion`** — static artwork mode if user prefers reduced motion

---

## 7. Error Handling

| Scenario | Fallback |
|----------|----------|
| `AudioContext` creation fails | Artwork mode |
| CORS blocks audio element | Artwork mode + show "Visualizer unavailable for this track" |
| WebGL unavailable (Butterchurn) | Auto-switch to Classic Bars |
| Worker fails to load | Main-thread fallback (simplified bars) |
| Low battery mode detected | Auto-pause visualizer, show static artwork |

---

## 8. Design Tokens

All visualizer colors read from CSS custom properties:

```css
/* src/styles/visualizer-tokens.css */
:root {
  --viz-bg: var(--pf-bg);
  --viz-bar-color: var(--pf-orange);
  --viz-bar-peak-color: rgba(255, 255, 255, 0.8);
  --viz-waveform-color: #4ade80; /* green oscilloscope */
  --viz-circular-color: var(--pf-orange);
  --viz-text-overlay: var(--pf-text);
  --viz-bar-count: 32;
  --viz-bar-count-mobile: 16;
  --viz-bar-gap: 2px;
  --viz-peak-hold: 500ms;
  --viz-falloff: 0.85;
  --viz-smooth-factor: 0.3;
}
```

---

## 9. Open Questions

1. Should visualizer mode be per-track or global? (recommend: global)
2. Should visualizer auto-start on play or require explicit toggle? (recommend: explicit)
3. Should we add "Lyric Visual Mode" later with synced lyrics? (backlog for Phase 6)
4. Artist-provided visualizer presets? (backlog)

---

## 10. Acceptance Criteria

- [ ] Classic Bars mode renders at 60fps on iPhone 12
- [ ] All modes cycle correctly via tap/click
- [ ] Visualizer pauses when audio pauses
- [ ] Visualizer closes when track ends (unless queue advances)
- [ ] Mobile: no Butterchurn, 30fps cap, 16 bars
- [ ] Desktop: all modes available, 60fps, 32 bars
- [ ] CORS-blocked tracks show artwork fallback gracefully
- [ ] No audio glitches when visualizer opens/closes
- [ ] Feature flags work: `?feat_visualizer_classic_bars=1` enables only that mode

---

**Sign-off:**
- [ ] ChatGPT (UX/design)
- [ ] Sentinel (architecture)
- [ ] User (priority/scope)
