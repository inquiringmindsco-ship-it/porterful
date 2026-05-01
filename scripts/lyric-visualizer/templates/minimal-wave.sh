#!/bin/bash
# Porterful Lyric Visualizer v0.1 — Minimal Wave Template
# Clean, minimal layout. Subtle background.
# Low visual noise. Lyrics are the focus.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export LYRIC_TEMPLATE="minimal-wave"

python3 "$SCRIPT_DIR/generate-synced-video.py" \
  "$SCRIPT_DIR/config.json" \
  "$OUTPUT_FILE" \
  30

echo "Generated Minimal Wave: $OUTPUT_FILE"
