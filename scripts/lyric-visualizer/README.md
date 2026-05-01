# Porterful Lyric Visualizer v0.1

**Local-only lyric video generator with synced lyrics support.**

Now includes **Visualizer Studio** — a browser-based creator UI at `http://127.0.0.1:8765`.

## Features

- ✅ **Audio plays in the rendered MP4** — full song audio preserved
- ✅ **Timed lyrics sync** — SRT and LRC formats with precise timestamps
- ✅ **Plain text fallback** — evenly divides lines across song duration
- ✅ **Three output formats** — 16:9 (YouTube), 9:16 (Shorts/Reels/TikTok), 1:1 (Instagram)
- ✅ **Frame-by-frame rendering** — each frame shows the correct lyric at the right time
- ✅ **No cloud services** — 100% local processing
- ✅ **No cloud AI** — no cloud transcription, no generation, no external APIs
- ✅ **No FFmpeg drawtext** — works with Homebrew FFmpeg (uses Pillow for text rendering)

## Requirements

- macOS or Linux
- FFmpeg 5.0+ (`brew install ffmpeg`)
- Python 3.9+ with Pillow (`pip3 install Pillow` or `python3 -m pip install Pillow`)

## Quick Start

```bash
cd scripts/lyric-visualizer

# 1. Place your files in input/
cp ~/Music/your-song.mp3 input/audio.mp3
cp ~/Pictures/your-cover.jpg input/cover.jpg

# 2. Create lyrics file (choose one format)
# Option A: Plain text (evenly spaced)
cp ~/Documents/your-lyrics.txt input/lyrics.txt

# Option B: SRT (precise timing)
cp ~/Documents/your-lyrics.srt input/lyrics.srt

# Option C: LRC (precise timing)
cp ~/Documents/your-lyrics.lrc input/lyrics.lrc

# 3. Edit example-config.json
#    Set audio, cover, lyrics paths
#    Choose outputFormat: 16x9, 9x16, or 1x1

# 4. Generate synced lyric video
python3 generate-synced-video.py example-config.json output/generated-videos/my-video.mp4

# 5. Find output in output/generated-videos/
#    .mp4 — The lyric video
#    .jpg — Thumbnail (extract manually if needed)
```

## Supported Lyric Formats

### Plain Text (.txt)
One line per display. Lines are evenly divided across the song duration.

```
This is verse one line one
This is verse one line two
This is the chorus line
This is verse two line one
```

### SRT (.srt)
Standard SubRip format with precise timestamps.

```
1
00:00:01,000 --> 00:00:04,000
This is the first line

2
00:00:04,000 --> 00:00:07,500
This is the second line
```

### LRC (.lrc)
Standard LRC format with millisecond precision.

```
[00:00.000]This is the first line
[00:03.500]This is the second line
[00:07.000]This is the third line
```

## Output Formats

| Format | Resolution | Use Case |
|--------|-----------|----------|
| **16x9** | 1920x1080 | YouTube, web players, desktop |
| **9x16** | 1080x1920 | Shorts, Reels, TikTok |
| **1x1** | 1080x1080 | Instagram, Twitter/X |

## Templates

| Template | Description |
|----------|-------------|
| **classic-lyric** | Dark overlay, gold artist name, white lyrics |

## Sync Behavior

### v0.1 (Current)
- ✅ Audio plays in the rendered MP4
- ✅ SRT/LRC timestamps display lyrics at correct times
- ✅ Plain text evenly divides lines across song duration
- ✅ Static frame changes on lyric transitions

### v0.2 (Planned)
- Beat-aware motion (BPM detection)
- Animated transitions between lines
- Waveform visualization
- Gradient/particle backgrounds

### v0.3+ (Future)
- Auto lyric timing from audio (deferred; local-only review required)
- AI-generated visuals (deferred; local-only review required)
- Production dashboard integration

## File Structure

```
scripts/lyric-visualizer/
├── generate.sh                    # Simple template-based generator
├── generate-synced-video.py       # Frame-by-frame synced lyrics (RECOMMENDED)
├── generate-frame.py              # Pillow frame renderer
├── lib/
│   └── lyrics_parser.py           # LRC/SRT/TXT parser
├── templates/
│   ├── 16x9.sh                    # YouTube landscape
│   ├── 9x16.sh                    # Shorts/Reels/TikTok
│   └── 1x1.sh                     # Instagram square
├── input/                         # Source files (audio, cover, lyrics)
│   └── README.md
├── output/
│   └── generated-videos/          # Output MP4 files
│       └── README.md
├── example-config.json            # Reference configuration
├── test-config.json               # Test configuration (gitignored)
├── test-synced-config.json        # Test with SRT lyrics
├── test-lrc-config.json           # Test with LRC lyrics
├── test-txt-config.json           # Test with plain text lyrics
└── README.md
```

## Config Format

```json
{
  "version": "0.1",
  "artist": "Artist Name",
  "title": "Track Title",
  "audio": "input/audio.mp3",
  "cover": "input/cover.jpg",
  "lyrics": "input/lyrics.srt",
  "lyricsFormat": "srt",
  "outputFormat": "9x16",
  "outputFile": "output/generated-videos/video.mp4"
}
```

## How It Works

1. **Parse lyrics** — `lyrics_parser.py` reads SRT/LRC/TXT and converts to timed `LyricLine` objects
2. **Render frames** — `generate-synced-video.py` renders each frame with Pillow, showing the active lyric line
3. **Encode video** — FFmpeg stitches frames + audio into a single MP4
4. **Output** — MP4 file with synced lyrics, full audio, cover art background

## Performance

- Frame generation: ~0.3s per frame (Pillow)
- 3-minute song at 30fps: ~270s (4.5 min) for 5400 frames
- Encoding: ~5-10s
- **Total: ~5 min for a 3-minute song**

## Safety Rules

- Use only audio/images you own or have rights to
- No copyrighted third-party visuals
- No auto-upload to platforms
- No AI-generated video
- No production integration
- Local-only processing
- SRT/LRC files can be created with free tools (e.g., Aegisub, Subtitle Edit)

## Known Limitations

- Static background only (no animation)
- No waveform or beat detection (v0.2)
- No auto-lyric-timing (v0.3)
- Font rendering depends on system fonts
- Frame-by-frame rendering is CPU-intensive for long songs

## License

Internal Porterful tool. Not for redistribution.
