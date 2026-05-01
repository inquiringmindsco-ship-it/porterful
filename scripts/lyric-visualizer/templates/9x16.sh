#!/bin/bash
# Porterful Lyric Visualizer v0.1 — 9:16 Vertical Template (1080x1920)
# Shorts, Reels, TikTok
# Uses Python/Pillow for text rendering (avoids FFmpeg drawtext dependency)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Use Python/Pillow to generate the frame with text overlay
TEMP_FRAME="${OUTPUT_FILE%.mp4}.frame.jpg"

python3 "$SCRIPT_DIR/generate-frame.py" \
  "$SCRIPT_DIR/test-config.json" \
  "$TEMP_FRAME"

# Generate video: static frame + audio
$FFMPEG -y \
  -loop 1 -i "$TEMP_FRAME" \
  -i "$AUDIO" \
  -vf "fps=30,format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -tune stillimage \
  -c:a aac -b:a 192k -ar 44100 \
  -movflags +faststart \
  -shortest "$OUTPUT_FILE"

# Clean up temp frame
rm -f "$TEMP_FRAME"

echo "Generated: $OUTPUT_FILE (${WIDTH}x${HEIGHT})"
