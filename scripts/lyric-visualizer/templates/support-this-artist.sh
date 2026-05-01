#!/bin/bash
# Porterful Lyric Visualizer v0.1 — Support This Artist Template
# Includes "Support This Artist" call-to-action.
# For fan engagement and donation/link promotion.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export LYRIC_TEMPLATE="support-this-artist"

python3 "$SCRIPT_DIR/generate-synced-video.py" \
  "$SCRIPT_DIR/config.json" \
  "$OUTPUT_FILE" \
  30

echo "Generated Support This Artist: $OUTPUT_FILE"
