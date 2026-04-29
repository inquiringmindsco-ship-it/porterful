# Porterful Audio Experience — Current State & Backlog

**Last Updated:** 2026-04-29  
**Status:** Phase 1 in progress (player stabilization)  
**Next Review:** After Phase 1 complete

---

## Phase 1: Stabilize Player 🔧 ACTIVE

### Must Fix Before Any New Features

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Track order incorrect in queue | 🔴 High | Open | Queue shuffle logic |
| Duplicate tracks in queue | 🔴 High | Open | Set deduplication |
| Missing audio (silent playback) | 🔴 High | Open | URL validation + error handling |
| Mobile full-screen controls broken | 🔴 High | Open | Touch events, safe areas |
| Global player state sync | 🟡 Medium | Open | Cross-tab, background |
| Current queue behavior | 🟡 Medium | Open | Auto-advance, preview mode |

### Phase 1 Acceptance
- [ ] No duplicate tracks in queue after any user action
- [ ] Track order matches UI indication
- [ ] Silent playback shows error + recovery
- [ ] Mobile expanded player fully usable
- [ ] Player state survives tab switch

---

## Phase 2: Visual Deck™ (Visualizer) 🎨 BACKLOG

**Status:** SPEC written, awaiting Phase 1 completion  
**SPEC:** `SPEC-visualizer.md`  
**Feature Flags:** `VISUALIZER_*`

### Modes
| Mode | Tech | Mobile | Desktop | Priority |
|------|------|--------|---------|----------|
| Classic Bars | Canvas 2D | ✅ | ✅ | P0 |
| Waveform | Canvas 2D | ✅ | ✅ | P1 |
| Circular | Canvas 2D | ✅ | ✅ | P1 |
| Artwork Fallback | DOM/CSS | ✅ | ✅ | P0 (fallback) |
| Butterchurn | WebGL | ❌ | ✅ Experimental | P2 |

### Key Decisions
- Single `AudioContext` singleton (Safari limit)
- Web Worker for frequency data processing
- 30fps cap on mobile
- `prefers-reduced-motion` support

---

## Phase 3: EQ v1 🎚️ BACKLOG

**Status:** SPEC written, awaiting Phase 2 completion  
**SPEC:** `SPEC-eq.md`  
**Feature Flags:** `EQ_*`

### Controls
- Bass (100Hz, ±12dB)
- Mid (1kHz, ±12dB)
- Treble (10kHz, ±12dB)
- Vocal Boost (2.5kHz, 0-6dB)
- Reset button
- Presets: Flat, Bass Boost, Clear Vocals, Night Mode, Car Mode

### Key Decisions
- EQ before AnalyserNode (visualizer shows post-EQ)
- No EQ on preview tracks
- localStorage persistence
- Mobile: 3 sliders only (no Vocal Boost)

---

## Phase 4: Loudness Normalization 📊 BACKLOG

**Status:** Architecture defined, awaiting Phase 3 completion  
**No SPEC yet**

### Approach
- Server-side at upload time
- EBU R128 standard
- ffmpeg-normalize or R128GAIN
- Store loudness metadata separately
- Preserve original master file

### Fields
```
loudness_lufs
loudness_true_peak_db
normalization_gain_db
audio_quality_tier
source_format
processed_audio_url
```

---

## Phase 5: Lossless / Hi-Fi Tier 🎧 BACKLOG

**Status:** Concept only  
**No SPEC yet**

### Approach
- FLAC/WAV upload support (artist option)
- Processed fallback: MP3-320 for incompatible browsers
- "Hi-Fi" badge on tracks with lossless source
- Possible premium listener tier

---

## Cross-Cutting Concerns

| Concern | Applies To | Owner |
|---------|-----------|-------|
| Feature flags | All phases | Sentinel |
| Performance budget | Phase 2+ | Sentinel |
| Mobile testing | All phases | Codex |
| Safari AudioContext limit | Phase 2+ | Sentinel |
| CORS fallback | Phase 2+ | Codex |
| Battery drain | Phase 2+ | Sentinel |

---

## File Registry

| File | Purpose | Phase |
|------|---------|-------|
| `SPEC-visualizer.md` | Visualizer specification | 2 |
| `SPEC-eq.md` | EQ specification | 3 |
| `src/lib/features.ts` | Feature flags | All |
| `src/lib/audio-context.tsx` | Audio engine | 1+ |
| `src/components/GlobalPlayer.tsx` | Player UI | 1+ |
| `src/components/visualizer/*` | Visualizer components | 2 |
| `src/components/eq/*` | EQ components | 3 |
| `src/workers/audio-visualizer.worker.ts` | Analyser offloading | 2 |
| `src/hooks/useAudioAnalyser.ts` | Analyser bridge | 2 |
| `src/hooks/useEQ.ts` | EQ state management | 3 |
| `src/styles/visualizer-tokens.css` | Visualizer theming | 2 |

---

## Decision Log

| Date | Decision | By | Context |
|------|----------|-----|---------|
| 2026-04-29 | 5-phase rollout approved | User | Stability first |
| 2026-04-29 | Butterchurn = experimental, desktop-only | Sentinel | Mobile performance |
| 2026-04-29 | 3-band EQ for v1, 10-band later | ChatGPT + User | UX simplicity |
| 2026-04-29 | Loudness = server-side, not client | ChatGPT + Sentinel | Performance + accuracy |
| 2026-04-29 | Lossless = premium tier, not default | ChatGPT + User | Bandwidth/cost |
| 2026-04-29 | Single AudioContext singleton | Sentinel | Safari limit |
| 2026-04-29 | Web Worker for analyser | Sentinel | Main thread perf |

---

## Action Items

| Item | Owner | Due | Priority |
|------|-------|-----|----------|
| Fix mobile player bugs | Codex | ASAP | P0 |
| Review SPEC-visualizer.md | User | After Phase 1 | P1 |
| Review SPEC-eq.md | User | After Phase 1 | P2 |
| Implement feature flags | Sentinel | Done ✅ | P0 |
| Create SPEC-loudness.md | ChatGPT | After Phase 2 | P3 |
| Create SPEC-lossless.md | ChatGPT | After Phase 3 | P4 |

---

**Updated by:** Sentinel  
**Review cadence:** After each phase completion
