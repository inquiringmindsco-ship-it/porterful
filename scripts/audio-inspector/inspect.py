#!/usr/bin/env python3
"""
Porterful Audio Inspector v0.1
Local FFmpeg-based audio/video file scanner for Porterful music catalog.
"""

import os
import sys
import json
import hashlib
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Configuration
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.aac', '.flac', '.mov', '.mp4'}
SCAN_DIRS = [
    Path("/Users/sentinel/Documents/porterful/Porterful Artist/O D Porter Music"),
    Path("/Users/sentinel/Documents/porterful/music-archive/master-backup"),
]
OUTPUT_DIR = Path("/Users/sentinel/Documents/porterful/audit-reports")


def run_ffprobe(filepath: Path) -> Optional[Dict]:
    """Extract audio metadata using ffprobe."""
    try:
        result = subprocess.run(
            [
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration,bit_rate,size',
                '-show_entries', 'stream=codec_name,sample_rate,channels',
                '-of', 'json',
                str(filepath)
            ],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            return None
        return json.loads(result.stdout)
    except (subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
        return None


def format_duration(seconds: float) -> str:
    """Convert seconds to M:SS or H:MM:SS format."""
    if not seconds or seconds <= 0:
        return "0:00"
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    if mins >= 60:
        hours = mins // 60
        mins = mins % 60
        return f"{hours}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"


def calculate_file_hash(filepath: Path, chunk_size: int = 8192) -> Optional[str]:
    """Calculate MD5 hash of file for duplicate detection."""
    try:
        hasher = hashlib.md5()
        with open(filepath, 'rb') as f:
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return None


def parse_filename_info(filename: str) -> Tuple[Optional[str], Optional[str], Optional[int]]:
    """Extract likely album, title, and track number from filename."""
    # Remove extension
    name = Path(filename).stem
    
    # Try to extract track number (patterns: "01 Title", "01 - Title", "01_Title")
    track_num = None
    title = name
    
    # Common patterns
    import re
    patterns = [
        r'^(\d{1,2})\s*[-_]?\s*(.+)$',  # "01 Title" or "01-Title"
        r'^(\d{1,2})\s*[-_]\s*(.+)$',     # "01 - Title"
    ]
    
    for pattern in patterns:
        match = re.match(pattern, name)
        if match:
            track_num = int(match.group(1))
            title = match.group(2).strip()
            break
    
    # Clean up title (remove common suffixes)
    title = re.sub(r'\s*[-_]\s*(SD|HD|480p|720p|1080p).*$', '', title, flags=re.I)
    title = title.replace('_', ' ').replace('-', ' ').strip()
    
    return None, title, track_num


def scan_file(filepath: Path, parent_folder: Path) -> Dict:
    """Scan a single audio file and return metadata."""
    result = {
        "filepath": str(filepath),
        "filename": filepath.name,
        "folder": str(parent_folder),
        "size_bytes": 0,
        "size_human": "0 B",
        "duration_seconds": 0,
        "duration": "0:00",
        "codec": None,
        "bitrate": None,
        "sample_rate": None,
        "channels": None,
        "hash": None,
        "likely_album": parent_folder.name,
        "likely_title": None,
        "likely_track_number": None,
        "status": "NEEDS_REVIEW"
    }
    
    # Get file size
    try:
        size = filepath.stat().st_size
        result["size_bytes"] = size
        result["size_human"] = format_file_size(size)
    except Exception:
        pass
    
    # Check for empty file
    if result["size_bytes"] == 0:
        result["status"] = "EMPTY"
        return result
    
    # Parse filename for metadata
    _, title, track_num = parse_filename_info(filepath.name)
    result["likely_title"] = title
    result["likely_track_number"] = track_num
    
    # Calculate hash (for duplicates)
    result["hash"] = calculate_file_hash(filepath)
    
    # Run ffprobe
    probe_data = run_ffprobe(filepath)
    if probe_data:
        # Extract format info
        fmt = probe_data.get('format', {})
        if 'duration' in fmt:
            result["duration_seconds"] = float(fmt['duration'])
            result["duration"] = format_duration(result["duration_seconds"])
        if 'bit_rate' in fmt:
            result["bitrate"] = f"{int(fmt['bit_rate']) // 1000}kbps"
        
        # Extract stream info
        streams = probe_data.get('streams', [])
        for stream in streams:
            if stream.get('codec_type') == 'audio':
                result["codec"] = stream.get('codec_name', 'unknown')
                if 'sample_rate' in stream:
                    result["sample_rate"] = f"{stream['sample_rate']}Hz"
                if 'channels' in stream:
                    result["channels"] = stream['channels']
                break
        
        # Valid audio detected
        result["status"] = "OK"
    else:
        # ffprobe failed - likely corrupt
        result["status"] = "BROKEN"
    
    return result


def format_file_size(size_bytes: int) -> str:
    """Convert bytes to human readable format."""
    if size_bytes == 0:
        return "0 B"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def find_duplicates(files: List[Dict]) -> List[List[Dict]]:
    """Group files by hash to find duplicates."""
    hash_groups: Dict[str, List[Dict]] = {}
    for file in files:
        h = file.get('hash')
        if h:
            if h not in hash_groups:
                hash_groups[h] = []
            hash_groups[h].append(file)
    
    # Return only groups with 2+ files
    return [group for group in hash_groups.values() if len(group) > 1]


def generate_json_report(files: List[Dict], output_path: Path) -> None:
    """Generate JSON audit report."""
    report = {
        "scan_date": datetime.utcnow().isoformat() + "Z",
        "total_files": len(files),
        "ok_count": sum(1 for f in files if f["status"] == "OK"),
        "broken_count": sum(1 for f in files if f["status"] == "BROKEN"),
        "empty_count": sum(1 for f in files if f["status"] == "EMPTY"),
        "duplicate_count": 0,  # Calculated below
        "needs_review_count": sum(1 for f in files if f["status"] == "NEEDS_REVIEW"),
        "files": files
    }
    
    # Add duplicate info
    duplicates = find_duplicates(files)
    report["duplicate_count"] = sum(len(group) for group in duplicates)
    report["duplicate_groups"] = duplicates
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)


def generate_markdown_report(files: List[Dict], output_path: Path) -> None:
    """Generate Markdown audit report."""
    ok_files = [f for f in files if f["status"] == "OK"]
    broken_files = [f for f in files if f["status"] == "BROKEN"]
    empty_files = [f for f in files if f["status"] == "EMPTY"]
    review_files = [f for f in files if f["status"] == "NEEDS_REVIEW"]
    duplicates = find_duplicates(files)
    
    lines = [
        "# Porterful Audio Inspector Report",
        "",
        f"**Scan Date:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Total Files Scanned:** {len(files)}",
        "",
        "## Summary",
        "",
        f"| Status | Count |",
        f"|--------|-------|",
        f"| ✅ OK | {len(ok_files)} |",
        f"| ❌ Broken | {len(broken_files)} |",
        f"| ⚠️ Empty | {len(empty_files)} |",
        f"| 🔍 Needs Review | {len(review_files)} |",
        f"| 📦 Duplicates | {sum(len(g) for g in duplicates)} |",
        "",
    ]
    
    # Broken files section
    if broken_files:
        lines.extend([
            "## Broken Files",
            "",
            "These files could not be read by FFmpeg and may be corrupt:",
            "",
        ])
        for f in broken_files:
            lines.append(f"- `{f['filename']}` ({f['size_human']}) — {f['filepath']}")
        lines.append("")
    
    # Empty files section
    if empty_files:
        lines.extend([
            "## Empty Files",
            "",
            "These files have zero bytes:",
            "",
        ])
        for f in empty_files:
            lines.append(f"- `{f['filename']}` — {f['filepath']}")
        lines.append("")
    
    # Duplicates section
    if duplicates:
        lines.extend([
            "## Duplicate Files",
            "",
            "These files have identical content (by hash):",
            "",
        ])
        for i, group in enumerate(duplicates, 1):
            lines.append(f"### Duplicate Group {i}")
            for f in group:
                lines.append(f"- `{f['filename']}` — {f['filepath']}")
            lines.append("")
    
    # Album summary
    lines.extend([
        "## Album Summary",
        "",
    ])
    
    albums: Dict[str, List[Dict]] = {}
    for f in ok_files:
        album = f.get("likely_album", "Unknown")
        if album not in albums:
            albums[album] = []
        albums[album].append(f)
    
    for album, tracks in sorted(albums.items()):
        total_duration = sum(t.get("duration_seconds", 0) for t in tracks)
        lines.extend([
            f"### {album}",
            "",
            f"- **Tracks:** {len(tracks)}",
            f"- **Total Duration:** {format_duration(total_duration)}",
            "",
        ])
        for t in sorted(tracks, key=lambda x: x.get("likely_track_number") or 999):
            track_num = t.get("likely_track_number", "?")
            title = t.get("likely_title", t["filename"])
            duration = t.get("duration", "0:00")
            lines.append(f"- Track {track_num}: **{title}** ({duration})")
        lines.append("")
    
    # Next actions
    lines.extend([
        "## Suggested Next Actions",
        "",
    ])
    
    if broken_files:
        lines.append("1. **Review broken files** — Consider re-ripping or replacing corrupt audio")
    if empty_files:
        lines.append("2. **Delete empty files** — Zero-byte files can be safely removed")
    if duplicates:
        lines.append("3. **Resolve duplicates** — Keep one copy, archive or delete duplicates")
    
    lines.extend([
        "",
        "---",
        "",
        "*Report generated by Porterful Audio Inspector v0.1*",
    ])
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(lines))


def main():
    """Main entry point."""
    print("🔍 Porterful Audio Inspector v0.1")
    print("=" * 50)
    
    # Check FFmpeg
    try:
        subprocess.run(['ffprobe', '-version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: FFmpeg/ffprobe not found. Install with: brew install ffmpeg")
        sys.exit(1)
    
    print("✅ FFmpeg detected")
    print()
    
    # Find all audio files
    all_files: List[Dict] = []
    
    for scan_dir in SCAN_DIRS:
        if not scan_dir.exists():
            print(f"⚠️  Directory not found: {scan_dir}")
            continue
        
        print(f"📁 Scanning: {scan_dir}")
        
        for ext in AUDIO_EXTENSIONS:
            for filepath in scan_dir.rglob(f"*{ext}"):
                if filepath.is_file():
                    print(f"   Analyzing: {filepath.name}...", end=' ', flush=True)
                    result = scan_file(filepath, filepath.parent)
                    all_files.append(result)
                    print(result["status"])
    
    if not all_files:
        print("\n❌ No audio files found in scan directories")
        sys.exit(1)
    
    print()
    print(f"✅ Scanned {len(all_files)} files")
    
    # Generate reports
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    json_path = OUTPUT_DIR / "audio_audit_report.json"
    md_path = OUTPUT_DIR / "audio_audit_report.md"
    
    print(f"📝 Generating JSON report: {json_path}")
    generate_json_report(all_files, json_path)
    
    print(f"📝 Generating Markdown report: {md_path}")
    generate_markdown_report(all_files, md_path)
    
    print()
    print("=" * 50)
    print("✅ Audio inspection complete!")
    print()
    print("Reports generated:")
    print(f"  📊 JSON: {json_path}")
    print(f"  📄 Markdown: {md_path}")
    print()
    
    # Summary stats
    ok = sum(1 for f in all_files if f["status"] == "OK")
    broken = sum(1 for f in all_files if f["status"] == "BROKEN")
    empty = sum(1 for f in all_files if f["status"] == "EMPTY")
    
    print(f"Summary: {ok} OK | {broken} Broken | {empty} Empty | {len(all_files)} Total")


if __name__ == "__main__":
    main()
