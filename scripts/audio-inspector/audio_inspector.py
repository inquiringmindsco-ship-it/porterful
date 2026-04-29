#!/usr/bin/env python3
"""
Porterful Audio Inspector v0.1
Local read-only audio file scanner for Porterful music catalog.
"""

import os
import sys
import json
import hashlib
import subprocess
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# Audio file extensions to scan
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.aac', '.flac', '.mov', '.mp4'}

# Folders to scan
SCAN_FOLDERS = [
    "/Users/sentinel/Documents/porterful/Porterful Artist/O D Porter Music/",
    "/Users/sentinel/Documents/porterful/music-archive/master-backup/"
]

OUTPUT_DIR = "/Users/sentinel/Documents/porterful/audit-reports/"


class AudioInspector:
    def __init__(self):
        self.files: List[Dict[str, Any]] = []
        self.hashes: Dict[str, List[str]] = {}
        self.duplicate_groups: List[List[Dict]] = []
        
    def calculate_hash(self, filepath: str) -> Optional[str]:
        """Calculate MD5 hash of file (first 8KB for speed)."""
        try:
            hash_md5 = hashlib.md5()
            with open(filepath, "rb") as f:
                hash_md5.update(f.read(8192))
            return hash_md5.hexdigest()
        except Exception:
            return None
    
    def run_ffprobe(self, filepath: str) -> Optional[Dict]:
        """Run ffprobe to get audio metadata."""
        try:
            result = subprocess.run(
                [
                    "ffprobe", "-v", "error", "-show_entries",
                    "format=duration,bit_rate:stream=codec_name,sample_rate",
                    "-of", "json", filepath
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                return json.loads(result.stdout)
        except Exception:
            pass
        return None
    
    def parse_filename(self, filename: str) -> Dict[str, Any]:
        """Extract likely metadata from filename."""
        # Remove extension
        name_without_ext = os.path.splitext(filename)[0]
        
        # Try to extract track number (e.g., "01 Title", "1. Title", "01_Title")
        track_number = None
        title = name_without_ext
        
        # Pattern: number at start
        match = re.match(r'^(\d{1,3})[\.\-_\s]*(.+)$', name_without_ext)
        if match:
            track_number = int(match.group(1))
            title = match.group(2).strip()
        
        # Clean up title
        title = title.replace('_', ' ').replace('-', ' - ').strip()
        
        return {
            "likely_track_number": track_number,
            "likely_title": title
        }
    
    def inspect_file(self, filepath: str) -> Dict[str, Any]:
        """Inspect a single audio file."""
        filename = os.path.basename(filepath)
        extension = os.path.splitext(filename)[1].lower()
        folder = os.path.dirname(filepath)
        
        # Get file size
        try:
            size_bytes = os.path.getsize(filepath)
        except Exception:
            size_bytes = 0
        
        # Check if empty
        is_empty = size_bytes == 0
        
        # Get ffprobe data
        ffprobe_data = self.run_ffprobe(filepath) if not is_empty else None
        
        # Extract duration
        duration_seconds = None
        duration = None
        if ffprobe_data and 'format' in ffprobe_data:
            try:
                duration_seconds = float(ffprobe_data['format'].get('duration', 0))
                minutes = int(duration_seconds // 60)
                seconds = int(duration_seconds % 60)
                duration = f"{minutes}:{seconds:02d}"
            except Exception:
                pass
        
        # Extract codec
        codec = None
        if ffprobe_data and 'streams' in ffprobe_data and ffprobe_data['streams']:
            codec = ffprobe_data['streams'][0].get('codec_name')
        
        # Extract bitrate
        bitrate = None
        if ffprobe_data and 'format' in ffprobe_data:
            br = ffprobe_data['format'].get('bit_rate')
            if br:
                try:
                    bitrate = f"{int(br) // 1000}kbps"
                except Exception:
                    pass
        
        # Extract sample rate
        sample_rate = None
        if ffprobe_data and 'streams' in ffprobe_data and ffprobe_data['streams']:
            sr = ffprobe_data['streams'][0].get('sample_rate')
            if sr:
                sample_rate = sr
        
        # Calculate hash
        file_hash = self.calculate_hash(filepath) if not is_empty else None
        
        # Determine likely album from folder
        likely_album = None
        folder_parts = folder.split('/')
        if folder_parts:
            likely_album = folder_parts[-1] if folder_parts[-1] not in ['', 'O D Porter Music'] else None
        
        # Parse filename
        parsed = self.parse_filename(filename)
        
        # Determine status
        if is_empty:
            status = "EMPTY"
        elif ffprobe_data is None and not is_empty:
            status = "BROKEN"
        else:
            status = "OK"
        
        return {
            "filepath": filepath,
            "filename": filename,
            "extension": extension,
            "folder": folder,
            "size_bytes": size_bytes,
            "size_human": self.human_readable_size(size_bytes),
            "duration_seconds": duration_seconds,
            "duration": duration,
            "codec": codec,
            "bitrate": bitrate,
            "sample_rate": sample_rate,
            "hash": file_hash,
            "likely_album": likely_album,
            "likely_title": parsed["likely_title"],
            "likely_track_number": parsed["likely_track_number"],
            "status": status,
            "ffprobe_readable": ffprobe_data is not None
        }
    
    def human_readable_size(self, size_bytes: int) -> str:
        """Convert bytes to human readable format."""
        if size_bytes == 0:
            return "0 B"
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} TB"
    
    def scan_folder(self, folder: str) -> List[Dict]:
        """Scan a folder for audio files."""
        files = []
        if not os.path.exists(folder):
            print(f"  Skipping: {folder} (not found)")
            return files
            
        print(f"  Scanning: {folder}")
        
        for root, dirs, filenames in os.walk(folder):
            for filename in filenames:
                ext = os.path.splitext(filename)[1].lower()
                if ext in AUDIO_EXTENSIONS:
                    filepath = os.path.join(root, filename)
                    try:
                        file_info = self.inspect_file(filepath)
                        files.append(file_info)
                        
                        # Track hashes for duplicate detection
                        if file_info["hash"]:
                            if file_info["hash"] not in self.hashes:
                                self.hashes[file_info["hash"]] = []
                            self.hashes[file_info["hash"]].append(filepath)
                            
                    except Exception as e:
                        print(f"    Error inspecting {filepath}: {e}")
        
        print(f"    Found {len(files)} audio files")
        return files
    
    def find_duplicates(self):
        """Identify duplicate file groups."""
        for file_hash, paths in self.hashes.items():
            if len(paths) > 1:
                group = []
                for path in paths:
                    for file_info in self.files:
                        if file_info["filepath"] == path:
                            group.append(file_info)
                            break
                if group:
                    self.duplicate_groups.append(group)
                    # Mark files as duplicates
                    for file_info in self.files:
                        if file_info["filepath"] in paths:
                            file_info["status"] = "DUPLICATE"
    
    def generate_json_report(self) -> str:
        """Generate JSON report."""
        report = {
            "scan_date": datetime.utcnow().isoformat() + "Z",
            "total_files": len(self.files),
            "ok_count": sum(1 for f in self.files if f["status"] == "OK"),
            "broken_count": sum(1 for f in self.files if f["status"] == "BROKEN"),
            "empty_count": sum(1 for f in self.files if f["status"] == "EMPTY"),
            "duplicate_count": sum(1 for f in self.files if f["status"] == "DUPLICATE"),
            "needs_review_count": sum(1 for f in self.files if f["status"] == "NEEDS_REVIEW"),
            "files": self.files,
            "duplicate_groups": self.duplicate_groups
        }
        
        filepath = os.path.join(OUTPUT_DIR, "audio_audit_report.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        return filepath
    
    def generate_markdown_report(self) -> str:
        """Generate Markdown report."""
        lines = [
            "# Porterful Audio Inspector Report",
            "",
            f"**Scan Date:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC",
            f"**Total Files Scanned:** {len(self.files)}",
            "",
            "## Summary",
            "",
            "| Status | Count |",
            "|--------|-------|",
            f"| ✅ OK | {sum(1 for f in self.files if f['status'] == 'OK')} |",
            f"| ❌ Broken | {sum(1 for f in self.files if f['status'] == 'BROKEN')} |",
            f"| ⚠️ Empty | {sum(1 for f in self.files if f['status'] == 'EMPTY')} |",
            f"| 🔍 Needs Review | {sum(1 for f in self.files if f['status'] == 'NEEDS_REVIEW')} |",
            f"| 📦 Duplicates | {sum(1 for f in self.files if f['status'] == 'DUPLICATE')} |",
            ""
        ]
        
        # Broken files section
        broken = [f for f in self.files if f["status"] == "BROKEN"]
        if broken:
            lines.extend([
                "## Broken Files",
                "",
                "Files that could not be read by ffprobe:",
                ""
            ])
            for f in broken:
                lines.append(f"- `{f['filepath']}`")
            lines.append("")
        
        # Empty files section
        empty = [f for f in self.files if f["status"] == "EMPTY"]
        if empty:
            lines.extend([
                "## Empty Files",
                "",
                "Zero-byte files:",
                ""
            ])
            for f in empty:
                lines.append(f"- `{f['filepath']}`")
            lines.append("")
        
        # Duplicate groups section
        if self.duplicate_groups:
            lines.extend([
                "## Duplicate Files",
                "",
                "These files have identical content (by hash):",
                ""
            ])
            for i, group in enumerate(self.duplicate_groups, 1):
                lines.append(f"### Duplicate Group {i}")
                for f in group:
                    lines.append(f"- `{f['filename']}` — {f['filepath']}")
                lines.append("")
        
        # Album summary section
        lines.extend([
            "## Album Summary",
            ""
        ])
        
        # Group by album
        albums: Dict[str, List[Dict]] = {}
        for f in self.files:
            album = f.get("likely_album") or "Unknown"
            if album not in albums:
                albums[album] = []
            albums[album].append(f)
        
        for album, tracks in sorted(albums.items()):
            total_duration = sum(t["duration_seconds"] or 0 for t in tracks)
            duration_str = f"{int(total_duration // 60)}:{int(total_duration % 60):02d}"
            
            lines.extend([
                f"### {album}",
                "",
                f"- **Tracks:** {len(tracks)}",
                f"- **Total Duration:** {duration_str}",
                ""
            ])
            
            # Sort by track number if available
            sorted_tracks = sorted(tracks, key=lambda x: (x["likely_track_number"] or 999, x["filename"]))
            for t in sorted_tracks:
                track_num = f"Track {t['likely_track_number']}:" if t['likely_track_number'] else "Track None:"
                duration = f" ({t['duration']})" if t['duration'] else ""
                lines.append(f"- {track_num} **{t['likely_title']}**{duration}")
            lines.append("")
        
        # Suggested next actions
        lines.extend([
            "## Suggested Next Actions",
            "",
            "1. **Review broken files** — Re-encode or replace files that fail ffprobe",
            "2. **Remove empty files** — Delete zero-byte files",
            "3. **Resolve duplicates** — Keep one copy, archive or delete duplicates",
            "4. **Update metadata** — Add proper tags to files missing track numbers",
            "",
            "---",
            "",
            "*Report generated by Porterful Audio Inspector v0.1*"
        ])
        
        filepath = os.path.join(OUTPUT_DIR, "audio_audit_report.md")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        return filepath
    
    def run(self):
        """Run the full inspection."""
        print("=" * 60)
        print("Porterful Audio Inspector v0.1")
        print("=" * 60)
        print()
        
        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Scan folders
        print("Scanning folders...")
        for folder in SCAN_FOLDERS:
            files = self.scan_folder(folder)
            self.files.extend(files)
        
        if not self.files:
            print("\nNo audio files found!")
            return False
        
        print(f"\nTotal files found: {len(self.files)}")
        
        # Find duplicates
        print("\nDetecting duplicates...")
        self.find_duplicates()
        print(f"Found {len(self.duplicate_groups)} duplicate groups")
        
        # Generate reports
        print("\nGenerating reports...")
        json_path = self.generate_json_report()
        md_path = self.generate_markdown_report()
        
        print(f"  JSON: {json_path}")
        print(f"  Markdown: {md_path}")
        
        # Summary
        print("\n" + "=" * 60)
        print("SCAN COMPLETE")
        print("=" * 60)
        print(f"Total files: {len(self.files)}")
        print(f"OK: {sum(1 for f in self.files if f['status'] == 'OK')}")
        print(f"Broken: {sum(1 for f in self.files if f['status'] == 'BROKEN')}")
        print(f"Empty: {sum(1 for f in self.files if f['status'] == 'EMPTY')}")
        print(f"Duplicates: {sum(1 for f in self.files if f['status'] == 'DUPLICATE')}")
        print(f"Needs Review: {sum(1 for f in self.files if f['status'] == 'NEEDS_REVIEW')}")
        
        return True


def main():
    inspector = AudioInspector()
    success = inspector.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
