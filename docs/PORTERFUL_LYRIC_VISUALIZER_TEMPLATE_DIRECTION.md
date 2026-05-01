# Porterful Lyric Visualizer — Template Direction

**Status:** Approved direction. Design/copy spec only — no implementation.
**Owner:** O D Porter / Porterful
**Date:** 2026-04-30

---

## 1. Premium Porterful visual style

- **Palette:** deep black, warm off-white, brushed gold, oxblood, soft amber. One accent per template, never two.
- **Type pairing:** a tall serif for emphasis (lyric hooks, titles) + a tight sans for credits/handles. Keep weights heavy or hairline — avoid mid-weights.
- **Texture:** subtle film grain, paper noise, soft halation around lights. Never glossy, never neon.
- **Composition:** generous negative space, lyric blocks anchored to the lower third or hard left margin. Treat the frame like a magazine spread, not a karaoke screen.
- **Restraint rule:** one visual idea per template. If the type moves, the background is still. If the background moves, the type sits.

---

## 2. O D / Porterful promo feel

- Feels like a release rollout, not a lyric tool — closer to a label teaser or a Tiny Desk pull-quote than a YouTube AMV.
- Cover art is treated as artwork, not wallpaper: framed, matted, given air.
- Artist name and track title are always legible at thumbnail size.
- Porterful watermark sits quiet — bottom corner, low opacity, never animated.

---

## 3. Template names

- Classic Lyric
- Cover Pulse
- Streetlight
- Gold Room
- Pain & Healing
- Minimal Wave
- Release Promo
- Support This Artist

---

## 4. Lyric text styles

- **Classic Lyric** — large serif, line-by-line, centered. Hook line scales up 1.3×.
- **Cover Pulse** — sans caps, tight tracking, sits under cover art. One line at a time.
- **Streetlight** — handwritten serif, lowercase, left-aligned, flickers in sync with a lamp glow.
- **Gold Room** — gold-foil serif on black, small caps for ad-libs, uppercase for the hook.
- **Pain & Healing** — split screen: sober sans for "pain" lines, soft serif for "healing" lines. Color shifts with the turn.
- **Minimal Wave** — single line, dead-center, Helvetica-style, no effects. Lyric is the entire design.
- **Release Promo** — short lyric pulls (4–8 words), oversized, one per cut. Built for 15-second teases.
- **Support This Artist** — lyric runs small at top; CTA block ("Stream / Tip / Follow") owns the lower half.

---

## 5. Motion ideas

- **Classic Lyric** — soft fade between lines, gentle vertical drift on the cover.
- **Cover Pulse** — cover art breathes 2–3% on the kick; lyrics snap on the snare.
- **Streetlight** — slow horizontal pan as if walking past a window; lamp flicker on consonants.
- **Gold Room** — gold dust particles, slow zoom-in, type catches a light sweep on the hook.
- **Pain & Healing** — frame splits on the pivot lyric; halves drift apart, then rejoin at the bridge.
- **Minimal Wave** — type fades; a single horizontal line scrubs across to mark the beat.
- **Release Promo** — hard cuts on the bar, shutter-style transitions, countdown stamp ("Out Friday") locked top-right.
- **Support This Artist** — CTA pulses once per chorus; QR or link slides up from the bottom safe area.

---

## 6. Mobile / social formats

Every template ships in three crops:

- **9:16** — Reels, TikTok, Shorts, IG Stories. Lyric anchored above the caption safe zone (bottom ~22%).
- **1:1** — IG feed, X. Cover-led layouts (Cover Pulse, Gold Room) shine here.
- **16:9** — YouTube, landing pages. Reserved for full-track visualizers and Release Promo.

Rules:

- Type stays inside an 8% safe margin on all sides.
- Captions/handles never overlap the lyric block.
- Loudness-matched: motion intensity scales with track BPM, not video length.

---

## 7. Artist template picker UX

A simple picker — preview tile, name, one-line description, vibe tag.

| Template | One-liner | Vibe tag |
|---|---|---|
| Classic Lyric | Clean, magazine-style lyric video. Lets the song lead. | Timeless |
| Cover Pulse | Your cover art, breathing with the beat. | Release-day |
| Streetlight | Late-night, handwritten, walking-home energy. | Moody |
| Gold Room | Foiled type, slow zoom — feels like a luxury rollout. | Premium |
| Pain & Healing | Split-screen contrast for songs with a turn. | Emotional |
| Minimal Wave | One lyric, one line, no noise. | Editorial |
| Release Promo | 15-second teaser cuts with countdown. | Promo |
| Support This Artist | Lyric + tip / stream / follow CTA built in. | Fan-funded |

Each tile shows:

- A 3-second preview loop
- Recommended track type ("ballad," "anthem," "intro," "teaser")
- Available crops (9:16 / 1:1 / 16:9) as small icons

---

## 8. V0.1 simplification note

For v0.1, only build templates that can be rendered safely with **static cover art, simple text animation, basic waveform/line movement, and FFmpeg/Remotion-style rendering**.

### V0.1 templates (ship)

- Classic Lyric
- Cover Pulse
- Minimal Wave
- Release Promo
- Support This Artist

### Defer advanced motion (post-v0.1)

- **Ocean Deck** — warm nostalgic wood-panel glow, dolphin animation, spectrum analyzer (requires canvas audio-reactive scene)
- **Streetlight** — lamp flicker
- **Gold Room** — particles / light sweep
- **Pain & Healing** — split-screen choreography
- Any complex audio-reactive effects beyond basic waveform / beat-line movement

The deferred templates remain in the design system and picker roadmap — they are not cut, only sequenced after the v0.1 render pipeline proves out.
