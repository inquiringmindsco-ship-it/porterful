#!/usr/bin/env python3
"""
Porterful Lyric Visualizer v0.1 — Synced Video Generator
Renders frame-by-frame lyrics synced to audio timestamps.
Uses Pillow for text rendering (avoids FFmpeg drawtext/ass dependency issues).

Templates:
  - classic-lyric: Dark overlay, gold artist, white lyrics
  - cover-pulse: Full-bleed cover, bottom overlay
  - minimal-wave: Clean, minimal text
  - release-promo: Includes "OUT NOW" badge
  - support-this-artist: Includes support CTA
"""

import sys
import json
import math
import os
import tempfile
import subprocess
from PIL import Image, ImageDraw, ImageFont

try:
    from lib.lyrics_parser import parse_lyrics, LyricLine
except ImportError:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from lib.lyrics_parser import parse_lyrics, LyricLine

def load_font(size: int, preferred_font: str = ""):
    font_paths = []
    if preferred_font:
        font_paths.append(preferred_font)
    font_paths.extend([
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/HelveticaNeue.ttc',
        '/System/Library/Fonts/Avenir.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ])
    for fp in font_paths:
        if fp and os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                continue
    return ImageFont.load_default()

def get_active_lyric(lyrics: list, current_time: float) -> str:
    for line in lyrics:
        if line.start_time <= current_time < line.end_time:
            return line.text
    return ""

def render_frame(cover_img: Image.Image, width: int, height: int,
                 lyrics: list, current_time: float,
                 artist: str, title: str, template: str,
                 font_artist, font_title, font_lyric, font_cta) -> Image.Image:
    # Resize cover to fill frame
    cover_ratio = cover_img.width / cover_img.height
    frame_ratio = width / height
    if cover_ratio > frame_ratio:
        new_width = int(cover_img.height * frame_ratio)
        left = (cover_img.width - new_width) // 2
        cover = cover_img.crop((left, 0, left + new_width, cover_img.height))
    else:
        new_height = int(cover_img.width / frame_ratio)
        top = (cover_img.height - new_height) // 2
        cover = cover_img.crop((0, top, cover_img.width, top + new_height))
    cover = cover.resize((width, height), Image.LANCZOS)
    frame = cover.convert('RGBA')
    draw = ImageDraw.Draw(frame)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    if template == 'cover-pulse':
        # Full bleed, bottom overlay
        overlay_draw.rectangle([0, int(height * 0.60), width, height], fill=(0, 0, 0, 190))
        # Small top overlay for artist
        overlay_draw.rectangle([0, 0, width, int(height * 0.12)], fill=(0, 0, 0, 100))
        frame = Image.alpha_composite(frame, overlay)
        draw = ImageDraw.Draw(frame)
        # Artist (gold)
        bbox = draw.textbbox((0, 0), artist, font=font_artist)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.04)), artist, fill='#C6A75E', font=font_artist)
        # Title (white)
        bbox = draw.textbbox((0, 0), title, font=font_title)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.07)), title, fill='white', font=font_title)
        # Lyrics (white, bottom)
        active_text = get_active_lyric(lyrics, current_time)
        if active_text:
            bbox = draw.textbbox((0, 0), active_text, font=font_lyric)
            text_w = bbox[2] - bbox[0]
            draw.text(((width - text_w) // 2, int(height * 0.72)), active_text, fill='white', font=font_lyric)

    elif template == 'minimal-wave':
        # Small top overlay
        overlay_draw.rectangle([0, 0, width, int(height * 0.18)], fill=(0, 0, 0, 110))
        # No bottom overlay — lyrics float
        frame = Image.alpha_composite(frame, overlay)
        draw = ImageDraw.Draw(frame)
        # Artist (gold)
        bbox = draw.textbbox((0, 0), artist, font=font_artist)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.05)), artist, fill='#C6A75E', font=font_artist)
        # Title (white)
        bbox = draw.textbbox((0, 0), title, font=font_title)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.10)), title, fill='white', font=font_title)
        # Lyrics (white, lower third)
        active_text = get_active_lyric(lyrics, current_time)
        if active_text:
            bbox = draw.textbbox((0, 0), active_text, font=font_lyric)
            text_w = bbox[2] - bbox[0]
            draw.text(((width - text_w) // 2, int(height * 0.75)), active_text, fill='white', font=font_lyric)

    elif template == 'release-promo':
        # Classic + "OUT NOW" badge
        overlay_draw.rectangle([0, 0, width, int(height * 0.18)], fill=(0, 0, 0, 120))
        overlay_draw.rectangle([0, int(height * 0.55), width, height], fill=(0, 0, 0, 180))
        frame = Image.alpha_composite(frame, overlay)
        draw = ImageDraw.Draw(frame)
        # Artist
        bbox = draw.textbbox((0, 0), artist, font=font_artist)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.06)), artist, fill='#C6A75E', font=font_artist)
        # Title
        bbox = draw.textbbox((0, 0), title, font=font_title)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.11)), title, fill='white', font=font_title)
        # Lyrics
        active_text = get_active_lyric(lyrics, current_time)
        if active_text:
            bbox = draw.textbbox((0, 0), active_text, font=font_lyric)
            text_w = bbox[2] - bbox[0]
            draw.text(((width - text_w) // 2, int(height * 0.70)), active_text, fill='white', font=font_lyric)
        # "OUT NOW" badge
        cta_text = "OUT NOW"
        bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        pad = 20
        draw.rounded_rectangle(
            [((width - text_w) // 2 - pad, int(height * 0.85) - pad),
             ((width + text_w) // 2 + pad, int(height * 0.85) + text_h + pad)],
            radius=12, fill='#C6A75E'
        )
        draw.text(((width - text_w) // 2, int(height * 0.85)), cta_text, fill='#08080B', font=font_cta)

    elif template == 'support-this-artist':
        # Classic + "Support This Artist"
        overlay_draw.rectangle([0, 0, width, int(height * 0.18)], fill=(0, 0, 0, 120))
        overlay_draw.rectangle([0, int(height * 0.55), width, height], fill=(0, 0, 0, 180))
        frame = Image.alpha_composite(frame, overlay)
        draw = ImageDraw.Draw(frame)
        # Artist
        bbox = draw.textbbox((0, 0), artist, font=font_artist)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.06)), artist, fill='#C6A75E', font=font_artist)
        # Title
        bbox = draw.textbbox((0, 0), title, font=font_title)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.11)), title, fill='white', font=font_title)
        # Lyrics
        active_text = get_active_lyric(lyrics, current_time)
        if active_text:
            bbox = draw.textbbox((0, 0), active_text, font=font_lyric)
            text_w = bbox[2] - bbox[0]
            draw.text(((width - text_w) // 2, int(height * 0.68)), active_text, fill='white', font=font_lyric)
        # CTA
        cta_text = "Support This Artist"
        bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.82)), cta_text, fill='#C6A75E', font=font_cta)

    else:
        # classic-lyric (default)
        overlay_draw.rectangle([0, 0, width, int(height * 0.18)], fill=(0, 0, 0, 120))
        overlay_draw.rectangle([0, int(height * 0.55), width, height], fill=(0, 0, 0, 180))
        frame = Image.alpha_composite(frame, overlay)
        draw = ImageDraw.Draw(frame)
        # Artist (gold)
        bbox = draw.textbbox((0, 0), artist, font=font_artist)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.06)), artist, fill='#C6A75E', font=font_artist)
        # Title (white)
        bbox = draw.textbbox((0, 0), title, font=font_title)
        text_w = bbox[2] - bbox[0]
        draw.text(((width - text_w) // 2, int(height * 0.11)), title, fill='white', font=font_title)
        # Lyrics (white, large)
        active_text = get_active_lyric(lyrics, current_time)
        if active_text:
            bbox = draw.textbbox((0, 0), active_text, font=font_lyric)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            draw.text(((width - text_w) // 2, int(height * 0.72) - text_h // 2), active_text, fill='white', font=font_lyric)

    return frame.convert('RGB')

def generate_synced_video(config_path: str, output_path: str, fps: int = 30) -> None:
    with open(config_path, 'r') as f:
        cfg = json.load(f)

    config_dir = os.path.dirname(os.path.abspath(config_path))
    def resolve_path(p: str) -> str:
        return p if os.path.isabs(p) else os.path.join(config_dir, p)

    audio_path = resolve_path(cfg['audio'])
    cover_path = resolve_path(cfg['cover'])
    lyrics_path = resolve_path(cfg.get('lyrics', ''))
    artist = cfg.get('artist', 'Unknown Artist')
    title = cfg.get('title', 'Untitled')
    fmt = cfg.get('outputFormat', '9x16')
    template = os.environ.get('LYRIC_TEMPLATE', cfg.get('template', 'classic-lyric'))

    if fmt == '16x9':
        width, height = 1920, 1080
    elif fmt == '9x16':
        width, height = 1080, 1920
    elif fmt == '1x1':
        width, height = 1080, 1080
    else:
        width, height = 1920, 1080

    # Get audio duration
    ffprobe_cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', audio_path]
    result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
    if result.returncode == 0:
        duration = float(json.loads(result.stdout)['format'].get('duration', 0))
    else:
        duration = 180.0

    # Load assets
    cover_img = Image.open(cover_path).convert('RGB')
    if lyrics_path and os.path.exists(lyrics_path):
        lyrics = parse_lyrics(lyrics_path, duration)
    else:
        lyrics = []

    # Fonts
    font_artist = load_font(44)
    font_title = load_font(56)
    font_lyric = load_font(52)
    font_cta = load_font(40)

    total_frames = int(duration * fps)
    print(f"Audio: {duration:.2f}s | {total_frames} frames @ {fps}fps | {width}x{height} | template={template}")

    with tempfile.TemporaryDirectory() as tmpdir:
        for frame_num in range(total_frames):
            current_time = frame_num / fps
            frame = render_frame(
                cover_img, width, height, lyrics, current_time,
                artist, title, template,
                font_artist, font_title, font_lyric, font_cta
            )
            frame.save(os.path.join(tmpdir, f'frame_{frame_num:06d}.jpg'), 'JPEG', quality=90)
            if frame_num % max(1, total_frames // 5) == 0:
                print(f"  Progress: {(frame_num/total_frames)*100:.0f}%")

        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-framerate', str(fps),
            '-i', os.path.join(tmpdir, 'frame_%06d.jpg'),
            '-i', audio_path,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-tune', 'stillimage',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
            '-movflags', '+faststart',
            '-shortest', output_path
        ]
        print(f"Encoding: {output_path}")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"FFmpeg error: {result.stderr}")
            sys.exit(1)
        size = os.path.getsize(output_path)
        print(f"Generated: {output_path} ({size/1024:.0f}KB)")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 generate-synced-video.py <config.json> <output.mp4> [fps]")
        sys.exit(1)
    generate_synced_video(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 30)
