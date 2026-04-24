#!/bin/bash
# Porterful Music Archive Script
# Run AFTER sending files to this computer

INPUT_DIR="$HOME/Documents/Porterful/music-archive/incoming"
OPTIMIZED_DIR="$HOME/Documents/Porterful/music-archive/optimized"
BACKUP_DIR="$HOME/Documents/Porterful/music-archive/master-backup"
ARCHIVE_LOG="$HOME/Documents/Porterful/music-archive/archive-log.txt"

echo "=== PORTERFUL MUSIC ARCHIVE ==="
echo "Input: $INPUT_DIR"
echo "Output: $OPTIMIZED_DIR"
echo "Backup: $BACKUP_DIR"
echo ""

# Check for incoming files
INCOMING=$(ls -1 "$INPUT_DIR" 2>/dev/null | wc -l | tr -d ' ')
echo "Files in incoming: $INCOMING"

if [ "$INCOMING" -eq 0 ]; then
  echo "No files found in incoming folder."
  echo "Drop your audio files into: $INPUT_DIR"
  echo "Then run this script again."
  exit 1
fi

echo ""
echo "=== PROCESSING FILES ==="

# Process each audio file
for f in "$INPUT_DIR"/*; do
  [ -f "$f" ] || continue
  
  FILENAME=$(basename "$f")
  BASENAME="${FILENAME%.*}"
  EXT="${FILENAME##*.}"
  LOWEREXT=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
  
  echo ""
  echo "Processing: $FILENAME"
  
  # Determine output format
  if [ "$LOWEREXT" = "wav" ] || [ "$LOWEREXT" = "aiff" ] || [ "$LOWEREXT" = "aif" ]; then
    # Lossless source — compress to MP3 256kbps
    OUTPUT="$OPTIMIZED_DIR/${BASENAME}.mp3"
    echo "  Converting to MP3 256kbps..."
    ffmpeg -y -i "$f" -codec:a libmp3lame -q:a 0 -map_metadata 0 "$OUTPUT" 2>/dev/null
    
    if [ $? -eq 0 ]; then
      ORIG_SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
      NEW_SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
      ORIG_MB=$(echo "scale=2; $ORIG_SIZE / 1024 / 1024" | bc)
      NEW_MB=$(echo "scale=2; $NEW_SIZE / 1024 / 1024" | bc)
      RATIO=$(echo "scale=1; $ORIG_SIZE / $NEW_SIZE" | bc)
      echo "  ✅ $ORIG_MB MB → ${NEW_MB} MB (${RATIO}x smaller)"
      
      # Backup original
      cp "$f" "$BACKUP_DIR/${FILENAME}"
      echo "  ✅ Backed up original to master-backup/"
    else
      echo "  ❌ FFmpeg failed for $FILENAME"
    fi
    
  elif [ "$LOWEREXT" = "mp3" ]; then
    # Already MP3 — just optimize (re-encode at 256kbps to normalize)
    OUTPUT="$OPTIMIZED_DIR/${BASENAME}.mp3"
    echo "  Normalizing MP3 at 256kbps..."
    ffmpeg -y -i "$f" -codec:a libmp3lame -q:a 0 -map_metadata 0 "$OUTPUT" 2>/dev/null
    
    if [ $? -eq 0 ]; then
      ORIG_SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
      NEW_SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
      ORIG_MB=$(echo "scale=2; $ORIG_SIZE / 1024 / 1024" | bc)
      NEW_MB=$(echo "scale=2; $NEW_SIZE / 1024 / 1024" | bc)
      echo "  ✅ $ORIG_MB MB → ${NEW_MB} MB"
      
      # Backup original
      cp "$f" "$BACKUP_DIR/${FILENAME}"
      echo "  ✅ Backed up original to master-backup/"
    else
      echo "  ❌ FFmpeg failed for $FILENAME"
    fi
    
  elif [ "$LOWEREXT" = "m4a" ] || [ "$LOWEREXT" = "aac" ] || [ "$LOWEREXT" = "flac" ]; then
    # Other formats — convert to MP3 256kbps
    OUTPUT="$OPTIMIZED_DIR/${BASENAME}.mp3"
    echo "  Converting to MP3 256kbps..."
    ffmpeg -y -i "$f" -codec:a libmp3lame -q:a 0 -map_metadata 0 "$OUTPUT" 2>/dev/null
    
    if [ $? -eq 0 ]; then
      ORIG_SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
      NEW_SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
      ORIG_MB=$(echo "scale=2; $ORIG_SIZE / 1024 / 1024" | bc)
      NEW_MB=$(echo "scale=2; $NEW_SIZE / 1024 / 1024" | bc)
      echo "  ✅ $ORIG_MB MB → ${NEW_MB} MB"
      
      # Backup original
      cp "$f" "$BACKUP_DIR/${FILENAME}"
      echo "  ✅ Backed up original to master-backup/"
    else
      echo "  ❌ FFmpeg failed for $FILENAME"
    fi
    
  else
    echo "  ⚠️  Skipping $FILENAME — unknown format ($EXT)"
  fi
done

echo ""
echo "=== SUMMARY ==="
OPTIMIZED_COUNT=$(ls -1 "$OPTIMIZED_DIR" 2>/dev/null | wc -l | tr -d ' ')
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l | tr -d ' ')
echo "Files optimized: $OPTIMIZED_COUNT"
echo "Files backed up: $BACKUP_COUNT"
echo ""
echo "Optimized files ready in: $OPTIMIZED_DIR"
echo "Originals backed up in: $BACKUP_DIR"

# Log it
echo "=== $(date) ===" >> "$ARCHIVE_LOG"
echo "Processed: $OPTIMIZED_COUNT files" >> "$ARCHIVE_LOG"
ls "$OPTIMIZED_DIR" >> "$ARCHIVE_LOG" 2>/dev/null
echo "" >> "$ARCHIVE_LOG"
