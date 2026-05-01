#!/bin/bash
# Porterful Lyric Visualizer v0.1 — Cover Pulse Template
# Full-bleed cover art, text overlay at bottom third
# Emphasizes the artwork while keeping lyrics readable.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Use the same Python script but pass template variant via env
export LYRIC_TEMPLATE="cover-pulse"

python3 "$SCRIPT_DIR/generate-synced-video.py" \
  "$SCRIPT_DIR/config.json" \
  "$OUTPUT_FILE" \
  30

echo "Generated Cover Pulse: $OUTPUT_FILE"
