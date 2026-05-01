#!/bin/bash
# Porterful Lyric Visualizer v0.1 — 16:9 Landscape Template (1920x1080)
# YouTube, web players, desktop
# Uses Python/Pillow for text rendering

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_FRAME="${OUTPUT_FILE%.mp4}.frame.jpg"

python3 "$SCRIPT_DIR/generate-frame.py" \
  "$SCRIPT_DIR/test-config.json" \
  "$TEMP_FRAME"

$FFMPEG -y \
  -loop 1 -i "$TEMP_FRAME" \
  -i "$AUDIO" \
  -vf "fps=30,format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -tune stillimage \
  -c:a aac -b:a 192k -ar 44100 \
  -movflags +faststart \
  -shortest "$OUTPUT_FILE"

rm -f "$TEMP_FRAME"

echo "Generated: $OUTPUT_FILE (${WIDTH}x${HEIGHT})"
