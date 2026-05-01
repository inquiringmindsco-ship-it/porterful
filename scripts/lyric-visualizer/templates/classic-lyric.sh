#!/bin/bash
# Porterful Lyric Visualizer v0.1 — Classic Lyric Template
# Dark overlay, gold artist name, white title + lyrics centered
# Default template. Clean and readable.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$SCRIPT_DIR/generate-synced-video.py" \
  "$SCRIPT_DIR/config.json" \
  "$OUTPUT_FILE" \
  30

echo "Generated Classic Lyric: $OUTPUT_FILE"
