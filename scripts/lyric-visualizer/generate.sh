#!/bin/bash
# Porterful Lyric Visualizer v0.1 — Local Prototype
# Usage: ./scripts/lyric-visualizer/generate.sh scripts/lyric-visualizer/example-config.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FFMPEG="${FFMPEG:-$(which ffmpeg 2>/dev/null || echo 'ffmpeg')}"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <config.json>"
  echo "Example: $0 input/config.json"
  exit 1
fi

CONFIG_FILE="$1"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Config file not found: $CONFIG_FILE"
  exit 1
fi

# Resolve config path relative to script dir if needed
if [[ ! "$CONFIG_FILE" = /* ]]; then
  CONFIG_FILE="$PWD/$CONFIG_FILE"
fi

# Parse config
AUDIO=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('audio',''))")
COVER=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('cover',''))")
LYRICS=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('lyrics',''))")
LYRICS_FORMAT=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('lyricsFormat','txt'))")
ARTIST=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('artist','Unknown Artist'))")
TITLE=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('title','Untitled'))")
OUTPUT_FORMAT=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('outputFormat','16x9'))")
OUTPUT_FILE=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('outputFile','output/video.mp4'))")
TEMPLATE=$(python3 -c "import json,sys; print(json.load(open('$CONFIG_FILE')).get('template','classic-lyric'))")

# Resolve paths relative to config file's directory
CONFIG_DIR=$(dirname "$CONFIG_FILE")
resolve_path() {
  local p="$1"
  if [ -z "$p" ]; then echo ""; return; fi
  if [[ "$p" = /* ]]; then echo "$p"; else echo "$CONFIG_DIR/$p"; fi
}

AUDIO=$(resolve_path "$AUDIO")
COVER=$(resolve_path "$COVER")
LYRICS=$(resolve_path "$LYRICS")
OUTPUT_FILE=$(resolve_path "$OUTPUT_FILE")

# Validate inputs
if [ ! -f "$AUDIO" ]; then
  echo "Error: Audio file not found: $AUDIO"
  exit 1
fi
if [ ! -f "$COVER" ]; then
  echo "Error: Cover image not found: $COVER"
  exit 1
fi
if [ ! -f "$LYRICS" ]; then
  echo "Error: Lyrics file not found: $LYRICS"
  exit 1
fi

# Get audio duration
DURATION_RAW=$($FFMPEG -i "$AUDIO" 2>&1 | grep "Duration" | awk '{print $2}' | tr -d , | tr '\n' ' ')
# Parse HH:MM:SS.ms format
DURATION=$(echo "$DURATION_RAW" | awk -F: '{print ($1*3600)+($2*60)+$3}')
if [ -z "$DURATION" ] || [ "$DURATION" = "0" ] || [ "$DURATION" = "0.00" ]; then
  DURATION=30
fi
DURATION_INT=$(python3 -c "import math; print(math.floor(float('$DURATION')))")

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Resolve template script
TEMPLATE_SCRIPT="$SCRIPT_DIR/templates/${OUTPUT_FORMAT}.sh"
if [ ! -f "$TEMPLATE_SCRIPT" ]; then
  echo "Error: Template not found: $TEMPLATE_SCRIPT"
  exit 1
fi

# Set template-specific dimensions
case "$OUTPUT_FORMAT" in
  16x9)
    WIDTH=1920
    HEIGHT=1080
    ;;
  9x16)
    WIDTH=1080
    HEIGHT=1920
    ;;
  1x1)
    WIDTH=1080
    HEIGHT=1080
    ;;
  *)
    WIDTH=1920
    HEIGHT=1080
    ;;
esac

# Export for template script
export FFMPEG AUDIO COVER LYRICS LYRICS_FORMAT ARTIST TITLE OUTPUT_FILE WIDTH HEIGHT DURATION_INT TEMPLATE SCRIPT_DIR

# Run template (source it to keep env vars)
echo "=== Porterful Lyric Visualizer v0.1 ==="
echo "Artist: $ARTIST"
echo "Title: $TITLE"
echo "Format: $OUTPUT_FORMAT (${WIDTH}x${HEIGHT})"
echo "Template: $TEMPLATE"
echo "Audio: $AUDIO"
echo "Cover: $COVER"
echo "Lyrics: $LYRICS"
echo "Output: $OUTPUT_FILE"
echo "Duration: ${DURATION_INT}s"
echo ""

source "$TEMPLATE_SCRIPT"

# Generate thumbnail
THUMB_FILE="${OUTPUT_FILE%.mp4}.jpg"
echo "=== Generating thumbnail ==="
$FFMPEG -y -i "$OUTPUT_FILE" -ss 00:00:01 -vframes 1 -q:v 2 "$THUMB_FILE" 2>/dev/null || true

# Generate metadata JSON
META_FILE="${OUTPUT_FILE%.mp4}.json"
echo "=== Generating metadata ==="
cat > "$META_FILE" <<EOF
{
  "version": "0.1",
  "artist": "$ARTIST",
  "title": "$TITLE",
  "format": "$OUTPUT_FORMAT",
  "template": "$TEMPLATE",
  "duration": $DURATION_INT,
  "width": $WIDTH,
  "height": $HEIGHT,
  "input": {
    "audio": "$AUDIO",
    "cover": "$COVER",
    "lyrics": "$LYRICS",
    "lyricsFormat": "$LYRICS_FORMAT"
  },
  "output": {
    "video": "$OUTPUT_FILE",
    "thumbnail": "$THUMB_FILE",
    "metadata": "$META_FILE"
  },
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo ""
echo "=== Done ==="
echo "Video: $OUTPUT_FILE"
echo "Thumbnail: $THUMB_FILE"
echo "Metadata: $META_FILE"
