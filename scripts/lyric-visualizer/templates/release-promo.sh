#!/bin/bash
# Porterful Lyric Visualizer v0.1 — Release Promo Template
# Includes release date / "OUT NOW" badge style.
# For promotional clips announcing new drops.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export LYRIC_TEMPLATE="release-promo"

python3 "$SCRIPT_DIR/generate-synced-video.py" \
  "$SCRIPT_DIR/config.json" \
  "$OUTPUT_FILE" \
  30

echo "Generated Release Promo: $OUTPUT_FILE"
