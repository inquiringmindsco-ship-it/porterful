#!/usr/bin/env python3
"""
Lyrics Parser for Porterful Lyric Visualizer v0.1
Supports: LRC (.lrc), SRT (.srt), Plain Text (.txt)
"""

import re
import os
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class LyricLine:
    start_time: float  # seconds
    end_time: float    # seconds
    text: str

def parse_lrc(filepath: str) -> List[LyricLine]:
    """Parse LRC format: [mm:ss.xx] Lyric text"""
    lines = []
    pattern = re.compile(r'\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)')
    
    with open(filepath, 'r', encoding='utf-8') as f:
        raw_lines = f.readlines()
    
    timestamps = []
    for line in raw_lines:
        line = line.strip()
        if not line:
            continue
        match = pattern.match(line)
        if match:
            minutes = int(match.group(1))
            seconds = int(match.group(2))
            ms = int(match.group(3).ljust(3, '0'))
            text = match.group(4).strip()
            total_seconds = minutes * 60 + seconds + ms / 1000
            timestamps.append((total_seconds, text))
    
    # Sort by timestamp
    timestamps.sort(key=lambda x: x[0])
    
    # Build LyricLine objects with end times
    for i in range(len(timestamps)):
        start = timestamps[i][0]
        text = timestamps[i][1]
        # End time is the next line's start time, or start + 3s if last
        if i + 1 < len(timestamps):
            end = timestamps[i + 1][0]
        else:
            end = start + 3.0
        lines.append(LyricLine(start, end, text))
    
    return lines

def parse_srt(filepath: str) -> List[LyricLine]:
    """Parse SRT format:
    1
    00:00:01,000 --> 00:00:04,000
    Lyric line text
    """
    lines = []
    pattern = re.compile(
        r'(\d{2}):(\d{2}):(\d{2}),(\d{3})\s+-->\s+'
        r'(\d{2}):(\d{2}):(\d{2}),(\d{3})'
    )
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by double newline to get blocks
    blocks = content.strip().split('\n\n')
    
    for block in blocks:
        block_lines = block.strip().split('\n')
        if len(block_lines) < 3:
            continue
        
        # Find the timing line (skip index number)
        timing_line = None
        for bl in block_lines:
            if '-->' in bl:
                timing_line = bl
                break
        
        if not timing_line:
            continue
        
        match = pattern.match(timing_line.strip())
        if not match:
            continue
        
        # Parse start time
        start = (
            int(match.group(1)) * 3600 +
            int(match.group(2)) * 60 +
            int(match.group(3)) +
            int(match.group(4)) / 1000
        )
        
        # Parse end time
        end = (
            int(match.group(5)) * 3600 +
            int(match.group(6)) * 60 +
            int(match.group(7)) +
            int(match.group(8)) / 1000
        )
        
        # Text is everything after the timing line
        timing_idx = block_lines.index(timing_line)
        text = '\n'.join(block_lines[timing_idx + 1:]).strip()
        
        if text:
            lines.append(LyricLine(start, end, text))
    
    return lines

def parse_plain_text(filepath: str, duration: float) -> List[LyricLine]:
    """Parse plain text and divide evenly across song duration.
    Each line gets equal time."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines_raw = [l.strip() for l in f.readlines() if l.strip()]
    
    if not lines_raw:
        return []
    
    # Filter out very short lines (likely artifacts)
    lines_raw = [l for l in lines_raw if len(l) > 2]
    
    if not lines_raw:
        return []
    
    num_lines = len(lines_raw)
    time_per_line = duration / num_lines
    
    result = []
    for i, text in enumerate(lines_raw):
        start = i * time_per_line
        end = (i + 1) * time_per_line
        result.append(LyricLine(start, end, text))
    
    return result

def parse_lyrics(filepath: str, duration: float) -> List[LyricLine]:
    """Auto-detect format and parse."""
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext == '.lrc':
        return parse_lrc(filepath)
    elif ext == '.srt':
        return parse_srt(filepath)
    else:
        return parse_plain_text(filepath, duration)

def export_ass(lyrics: List[LyricLine], output_path: str, 
               width: int = 1080, height: int = 1920,
               font_name: str = "Helvetica", font_size: int = 48) -> None:
    """Export lyrics to ASS subtitle format for FFmpeg overlay.
    ASS supports precise positioning and styling."""
    
    # ASS header
    ass_content = f"""[Script Info]
Title: Porterful Lyric Visualizer
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,100,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    def format_time(seconds: float) -> str:
        """Format seconds to ASS time: H:MM:SS.cc"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centis = int((seconds % 1) * 100)
        return f"{hours}:{minutes:02d}:{secs:02d}.{centis:02d}"
    
    for line in lyrics:
        start = format_time(line.start_time)
        end = format_time(line.end_time)
        # Escape special ASS characters
        text = line.text.replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
        ass_content += f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ass_content)

def export_srt(lyrics: List[LyricLine], output_path: str) -> None:
    """Export lyrics to SRT format."""
    def format_time(seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, line in enumerate(lyrics):
            f.write(f"{i + 1}\n")
            f.write(f"{format_time(line.start_time)} --> {format_time(line.end_time)}\n")
            f.write(f"{line.text}\n\n")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python3 lyrics_parser.py <lyrics file> [duration]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    duration = float(sys.argv[2]) if len(sys.argv) > 2 else 180.0
    
    lyrics = parse_lyrics(filepath, duration)
    
    print(f"Parsed {len(lyrics)} lines from {filepath}")
    for line in lyrics[:5]:
        print(f"  [{line.start_time:.2f}s - {line.end_time:.2f}s] {line.text}")
    if len(lyrics) > 5:
        print(f"  ... and {len(lyrics) - 5} more lines")
