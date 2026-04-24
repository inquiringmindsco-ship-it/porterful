# MUSIC BACKUP SYSTEM

## What This Does

When you send music files to this computer, they go into:
```
~/Documents/Porterful/music-archive/incoming/
```

Run `archive.sh` and it will:
1. Convert all audio to MP3 256kbps (web-ready)
2. Backup originals to `master-backup/`
3. Log everything

## Folders

| Folder | Purpose |
|--------|---------|
| `incoming/` | Drop new audio files here before running archive.sh |
| `optimized/` | MP3 256kbps files — upload these to Supabase |
| `master-backup/` | Original files — never delete, always keep |

## How To Use

1. **Send files** to this computer (AirDrop, File Transfer, etc.)
2. Drop them into `~/Documents/Porterful/music-archive/incoming/`
3. Run: `~/Documents/Porterful/music-archive/archive.sh`
4. Upload optimized files from `optimized/` to Supabase
5. Update `data.ts` with correct Supabase paths

## Backup Rules

- **Keep originals** — always in `master-backup/`
- **Backup to external** — copy `master-backup/` to external drive weekly
- **Never delete originals** — even if optimized versions exist

## Why This Matters

- Originals are lossless (WAV, AIFF, FLAC)
- Optimized MP3 plays fast on web (256kbps, ~1MB per song)
- Master backup survives any upload crash
- Files are named and organized properly

---

*System created: 2026-04-24*